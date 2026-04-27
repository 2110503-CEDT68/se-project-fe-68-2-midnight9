'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/libs/api'

const initialForm = {
  name: '',
  price: '',
  picture: '',
  address: '',
  district: '',
  province: '',
  region: '',
  tel: '',
  postalcode: '',
}

export default function CreateCampgroundForm() {
  const router = useRouter()
  const { data: session } = useSession()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const update =
    (field: keyof typeof initialForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedForm = {
      name: form.name.trim(),
      price: form.price.trim(),
      picture: form.picture.trim(),
      address: form.address.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
      region: form.region.trim(),
      tel: form.tel.trim(),
      postalcode: form.postalcode.trim(),
    }

    const isFormIncomplete = Object.values(trimmedForm).some((value) => value === '')
    if (isFormIncomplete) {
      setError('Please fill in all fields.')
      return
    }

    const priceValue = parseFloat(trimmedForm.price)
    if (isNaN(priceValue) || priceValue < 0) {
      setError('Please enter a valid price (0 or more).')
      return
    }

    const thaiPhoneRegex = /^0\d{9}$/
    if (!thaiPhoneRegex.test(trimmedForm.tel)) {
      setError('Please enter a valid Thai phone number.')
      return
    }

    const postalCodeRegex = /^\d{5}$/
    if (!postalCodeRegex.test(trimmedForm.postalcode)) {
      setError('Please enter a valid postal code.')
      return
    }

    if (!session?.user?.token) {
      setError('You must be logged in as admin.')
      return
    }

    setLoading(true)

    try {
      const data = await apiFetch('/campgrounds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({ ...trimmedForm, price: parseFloat(trimmedForm.price) }),
      })

      console.log('create success:', data)
      setSuccess('Campground created successfully.')

      setTimeout(() => {
        router.push('/campgrounds')
        router.refresh()
      }, 1000)
    } catch (err: any) {
      console.error('create failed:', err)
      setError(err.message || 'Failed to create campground.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mt-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-3">
        Campground Details
      </h2>

      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="bg-green-50 border border-green-200 rounded-md p-3 mb-5 text-sm text-green-700"
          role="status"
        >
          {success}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="form-label">Campground Name</label>
          <input
            id="name"
            name="name"
            className="form-input"
            value={form.name}
            onChange={update('name')}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="price" className="form-label">Price per Night (฿)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="50"
            inputMode="numeric"
            className="form-input"
            value={form.price}
            onChange={update('price')}
            placeholder="e.g. 500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="picture" className="form-label">Picture URL</label>
          <input
            id="picture"
            name="picture"
            type="url"
            className="form-input"
            value={form.picture}
            onChange={update('picture')}
            placeholder="https://"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            id="address"
            name="address"
            className="form-input"
            value={form.address}
            onChange={update('address')}
          />
        </div>

        <div>
          <label htmlFor="district" className="form-label">District</label>
          <input
            id="district"
            name="district"
            className="form-input"
            value={form.district}
            onChange={update('district')}
          />
        </div>

        <div>
          <label htmlFor="province" className="form-label">Province</label>
          <input
            id="province"
            name="province"
            className="form-input"
            value={form.province}
            onChange={update('province')}
          />
        </div>

        <div>
          <label htmlFor="region" className="form-label">Region</label>
          <input
            id="region"
            name="region"
            className="form-input"
            value={form.region}
            onChange={update('region')}
          />
        </div>

        <div>
          <label htmlFor="postalcode" className="form-label">Postal Code</label>
          <input
            id="postalcode"
            name="postalcode"
            inputMode="numeric"
            className="form-input"
            value={form.postalcode}
            onChange={update('postalcode')}
          />
        </div>

        <div>
          <label htmlFor="tel" className="form-label">Phone Number</label>
          <input
            id="tel"
            name="tel"
            type="tel"
            inputMode="tel"
            className="form-input"
            value={form.tel}
            onChange={update('tel')}
            placeholder="0812345678"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:items-end mt-2 sm:mt-0">
          <Link
            href="/campgrounds"
            className="btn-secondary h-[42px] px-6 flex items-center justify-center shrink-0"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-[42px] px-8 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  )
}
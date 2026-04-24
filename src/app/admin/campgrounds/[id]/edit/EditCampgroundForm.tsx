'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { updateCampground } from '@/libs'

const buildInitialForm = (campground: any) => ({
  name: campground.name ?? '',
  price: campground.price?.toString() ?? '',
  picture: campground.picture ?? '',
  address: campground.address ?? '',
  district: campground.district ?? '',
  province: campground.province ?? '',
  region: campground.region ?? '',
  tel: campground.tel ?? '',
  postalcode: campground.postalcode ?? '',
})

export default function EditCampgroundForm({ campground }: { campground: any }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState(() => buildInitialForm(campground))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const update =
    (field: keyof ReturnType<typeof buildInitialForm>) =>
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
      await updateCampground(
        campground._id,
        { ...trimmedForm, price: priceValue },
        session.user.token
      )

      setSuccess('Campground updated successfully.')
      setTimeout(() => {
        router.push(`/campgrounds/${campground._id}`)
        router.refresh()
      }, 800)
    } catch (err: any) {
      setError(err.message || 'Failed to update campground.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 border-b border-gray-100 pb-3">
        <h2 className="text-lg font-semibold text-gray-800">Edit Campground</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update the campground information shown to users before saving changes.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
          {success}
        </div>
      )}

      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="form-label">Campground Name</label>
          <input id="name" name="name" className="form-input" value={form.name} onChange={update('name')} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="price" className="form-label">Price per Night (฿)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            className="form-input"
            value={form.price}
            onChange={update('price')}
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
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="form-label">Address</label>
          <input id="address" name="address" className="form-input" value={form.address} onChange={update('address')} />
        </div>

        <div>
          <label htmlFor="district" className="form-label">District</label>
          <input id="district" name="district" className="form-input" value={form.district} onChange={update('district')} />
        </div>

        <div>
          <label htmlFor="province" className="form-label">Province</label>
          <input id="province" name="province" className="form-input" value={form.province} onChange={update('province')} />
        </div>

        <div>
          <label htmlFor="region" className="form-label">Region</label>
          <input id="region" name="region" className="form-input" value={form.region} onChange={update('region')} />
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
          />
        </div>

        <div className="mt-2 flex flex-col-reverse justify-end gap-3 sm:mt-0 sm:flex-row sm:items-end">
          <Link
            href={`/campgrounds/${campground._id}`}
            className="flex h-[42px] shrink-0 items-center justify-center rounded-md border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex h-[42px] shrink-0 items-center justify-center rounded-md bg-green-700 px-8 py-2 font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}

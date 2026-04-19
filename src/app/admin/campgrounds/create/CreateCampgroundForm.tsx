'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/libs/api'

// const initialForm = {
//   name: 'Sunset Tent Camp',
//   picture: 'https://drive.google.com/uc?export=view&id=1gCupMAwL4zGZV6JYyusz9FEeCR1CImNP',
//   address: 'Ban Luang',
//   district: 'Chom Thong',
//   province: 'Chiang Mai',
//   region: 'Northern',
//   tel: '053286728',
//   postalcode: '50160',
// }

const initialForm = {
  name: '',
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

    console.log('submit clicked')
    console.log('form =', form)
    console.log('session =', session)

    setError('')
    setSuccess('')

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
        body: JSON.stringify(form),
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
      className="bg-white border border-gray-200 rounded-[40px] px-8 sm:px-20 py-10 sm:py-12"
    >
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-x-14 gap-y-5">
        <div>
          <label className="form-label">Campground Name</label>
          <input className="form-input bg-gray-50" value={form.name} onChange={update('name')} />
        </div>

        <div>
          <label className="form-label">Picture URL</label>
          <input className="form-input bg-gray-50" value={form.picture} onChange={update('picture')} />
        </div>

        <div>
          <label className="form-label">Address</label>
          <input className="form-input bg-gray-50" value={form.address} onChange={update('address')} />
        </div>

        <div>
          <label className="form-label">District</label>
          <input className="form-input bg-gray-50" value={form.district} onChange={update('district')} />
        </div>

        <div>
          <label className="form-label">Province</label>
          <input className="form-input bg-gray-50" value={form.province} onChange={update('province')} />
        </div>

        <div>
          <label className="form-label">Region</label>
          <input className="form-input bg-gray-50" value={form.region} onChange={update('region')} />
        </div>

        <div>
          <label className="form-label">Phone number</label>
          <input className="form-input bg-gray-50" value={form.tel} onChange={update('tel')} />
        </div>

        <div>
          <label className="form-label">Postal code</label>
          <input className="form-input bg-gray-50" value={form.postalcode} onChange={update('postalcode')} />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
        <button type="submit" disabled={loading} className="btn-primary px-8 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create'}
        </button>

        <Link
          href="/campgrounds"
          className="btn-secondary bg-gray-200 border-gray-200 text-green-700 px-8 text-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
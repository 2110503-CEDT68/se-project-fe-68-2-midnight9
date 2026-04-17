'use client'

import Link from 'next/link'
import { useState } from 'react'

const initialForm = {
  name: 'Pine Valley Camp',
  picture: 'www.example.com',
  address: 'Ban Luang',
  district: 'Chom Thong',
  province: 'Chiang Mai',
  region: 'Northern',
  tel: '053286728',
  postalcode: '50160',
}

export default function CreateCampgroundForm() {
  const [form, setForm] = useState(initialForm)

  const update =
    (field: keyof typeof initialForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: e.target.value }))
    }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-[40px] px-8 sm:px-20 py-10 sm:py-12">
      <div className="grid md:grid-cols-2 gap-x-14 gap-y-5">
        <div>
          <label className="form-label">Campground Name</label>
          <input className="form-input bg-gray-50" value={form.name} onChange={update('name')} />
        </div>

        <div>
          <label className="form-label">Link Photo</label>
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
          <label className="form-label">Phone</label>
          <input className="form-input bg-gray-50" value={form.tel} onChange={update('tel')} />
        </div>

        <div>
          <label className="form-label">Postal code</label>
          <input className="form-input bg-gray-50" value={form.postalcode} onChange={update('postalcode')} />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
        <button type="submit" className="btn-primary px-8">
          Create
        </button>
        <Link href="/campgrounds" className="btn-secondary bg-gray-200 border-gray-200 text-green-700 px-8 text-center">
          Cancel
        </Link>
      </div>
    </form>
  )
}
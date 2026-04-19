'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/libs/api'

const initialForm = {
  name: 'Misty Pine Camp',
  picture: 'https://drive.google.com/uc?export=view&id=1xkY68NCJoSxqOKRhhwGxQZddIeYt8SkN',
  address: 'Ban Khun Klang',
  district: 'Chom Thong',
  province: 'Chiang Mai',
  region: 'Northern',
  tel: '0658745321',
  postalcode: '70900',
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

    // ตรวจสอบว่ามีช่องไหนที่ยังไม่ได้กรอก หรือกรอกแค่เคาะสเปซบาร์ทิ้งไว้
    const isFormIncomplete = Object.values(form).some((value) => value.trim() === '')
    
    if (isFormIncomplete) {
      setError('Please fill in all fields.')
      return // หยุดการทำงาน ไม่ส่งไป API และโชว์กรอบสีแดง
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
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mt-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-3">
        Campground Details
      </h2>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-5 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* เอา mb-8 ออกจาก Grid เพื่อไม่ให้ขอบล่างกว้างเกินไป */}
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="form-label">Campground Name</label>
          <input 
            className="form-input" 
            value={form.name} 
            onChange={update('name')} 
          />
        </div>

        {/* Picture URL */}
        <div className="sm:col-span-2">
          <label className="form-label">Picture URL</label>
          <input 
            type="url"
            className="form-input" 
            value={form.picture} 
            onChange={update('picture')} 
            placeholder="https://"
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="form-label">Address</label>
          <input 
            className="form-input" 
            value={form.address} 
            onChange={update('address')} 
          />
        </div>

        {/* District */}
        <div>
          <label className="form-label">District</label>
          <input 
            className="form-input" 
            value={form.district} 
            onChange={update('district')} 
          />
        </div>

        {/* Province */}
        <div>
          <label className="form-label">Province</label>
          <input 
            className="form-input" 
            value={form.province} 
            onChange={update('province')} 
          />
        </div>

        {/* Region */}
        <div>
          <label className="form-label">Region</label>
          <input 
            className="form-input" 
            value={form.region} 
            onChange={update('region')} 
          />
        </div>

        {/* Postal code */}
        <div>
          <label className="form-label">Postal Code</label>
          <input 
            className="form-input" 
            value={form.postalcode} 
            onChange={update('postalcode')} 
          />
        </div>

        {/* Phone number */}
        <div>
          <label className="form-label">Phone Number</label>
          <input 
            type="tel"
            className="form-input" 
            value={form.tel} 
            onChange={update('tel')} 
            placeholder="0X-XXX-XXX or 0XX-XXX-XXXX"
          />
        </div>

        {/* Action Buttons */}
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
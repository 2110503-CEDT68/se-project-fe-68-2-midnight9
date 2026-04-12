'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking } from '@/libs'

export default function BookingForm({
  campgroundId,
  campgroundName,
  token,
  userTel,
}: {
  campgroundId: string
  campgroundName: string
  token: string
  userTel: string
}) {
  const router = useRouter()
  const [checkIn, setCheckIn]   = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [tel, setTel]           = useState(userTel)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const nights =
    checkIn && checkOut
      ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
      : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!checkIn || !checkOut) { setError('Please fill in all required fields.'); return }
    if (nights <= 0)           { setError('Check-out must be after check-in.'); return }
    if (nights > 3)            { setError(`Booking failed: max duration cannot exceed 3 nights.`); return }

    setLoading(true)
    try {
      await createBooking(campgroundId, { checkInDate: checkIn, checkOutDate: checkOut }, token)
      router.push('/bookings')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Error banner — matches design page 08 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
        {/* Campground — read-only */}
        <div>
          <label className="form-label">Campground</label>
          <input className="form-input bg-gray-50" value={campgroundName} disabled/>
        </div>

        {/* Check-in */}
        <div>
          <label className="form-label">Check-In Date</label>
          <input
            type="date"
            className="form-input"
            value={checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>

        {/* Number of nights — auto-calculated */}
        <div>
          <label className="form-label">Number of Nights</label>
          <input
            className={`form-input bg-gray-50 ${error && nights > 3 ? 'border-red-400' : ''}`}
            value={nights > 0 ? nights : ''}
            placeholder="Auto-calculated"
            disabled
          />
          {nights > 3 && (
            <p className="text-xs text-red-500 mt-1">Max is 3 nights</p>
          )}
        </div>

        {/* Check-out */}
        <div>
          <label className="form-label">Check-Out Date</label>
          <input
            type="date"
            className="form-input"
            value={checkOut}
            min={checkIn || new Date().toISOString().split('T')[0]}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        {/* Contact phone */}
        <div>
          <label className="form-label">Contact Phone</label>
          <input
            type="tel"
            className="form-input"
            value={tel}
            placeholder="081-234-5678"
            onChange={(e) => setTel(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
        <a href={`/campgrounds/${campgroundId}`} className="btn-secondary">
          Back to Detail
        </a>
      </div>
    </form>
  )
}

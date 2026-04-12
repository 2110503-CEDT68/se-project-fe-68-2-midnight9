'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateBooking } from '@/libs'

export default function EditBookingForm({
  bookingId,
  token,
  campgroundName,
  initialCheckIn,
  initialCheckOut,
  tel,
  userEmail,
}: {
  bookingId: string
  token: string
  campgroundName: string
  initialCheckIn: string
  initialCheckOut: string
  tel: string
  userEmail: string
}) {
  const router = useRouter()
  const [checkIn, setCheckIn]   = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const nights =
    checkIn && checkOut
      ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
      : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!checkIn || !checkOut) { setError('Please fill in all fields.'); return }
    if (nights <= 0) { setError('Check-out must be after check-in.'); return }
    if (nights > 3)  { setError('Max 3 nights per booking.'); return }

    setLoading(true)
    try {
      await updateBooking(bookingId, { checkInDate: checkIn, checkOutDate: checkOut }, token)
      router.push('/bookings')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
        <div>
          <label className="form-label">User Email</label>
          <input className="form-input bg-gray-50 text-gray-500" value={userEmail} disabled/>
        </div>
        <div>
          <label className="form-label">Campground</label>
          <input className="form-input bg-gray-50 text-gray-500" value={campgroundName} disabled/>
        </div>
        <div>
          <label className="form-label">Check-In Date</label>
          <input
            type="date"
            className="form-input"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Check-Out Date</label>
          <input
            type="date"
            className="form-input"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Number of Nights</label>
          <input
            className="form-input bg-gray-50"
            value={nights > 0 ? nights : ''}
            placeholder="Auto-calculated"
            disabled
          />
        </div>
        <div>
          <label className="form-label">Contact Phone</label>
          <input className="form-input bg-gray-50 text-gray-500" value={tel} disabled/>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <a href="/bookings" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}

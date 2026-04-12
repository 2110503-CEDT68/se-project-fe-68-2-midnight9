'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteBooking } from '@/libs'
import dayjs from 'dayjs'

function calcNights(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export default function BookingsTable({
  initialBookings,
  token,
}: {
  initialBookings: any[]
  token: string
}) {
  const router = useRouter()
  const [bookings, setBookings]   = useState(initialBookings)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [deleting, setDeleting]   = useState(false)
  const [toast, setToast]         = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteBooking(deleteId, token)
      setBookings((prev) => prev.filter((b) => b._id !== deleteId))
      showToast('Booking deleted successfully.')
    } catch (e: any) {
      showToast(e.message ?? 'Delete failed.')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="mb-4">You have no bookings yet.</p>
        <Link href="/campgrounds" className="btn-primary text-sm">
          Browse Campgrounds
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-700 text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-3 pr-4">Booking ID</th>
              <th className="pb-3 pr-4">Campground</th>
              <th className="pb-3 pr-4">Check-In</th>
              <th className="pb-3 pr-4">Nights</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const nights = calcNights(b.checkInDate, b.checkOutDate)
              const isUpcoming = new Date(b.checkInDate) >= new Date()
              return (
                <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                    BK-{b._id.slice(-4).toUpperCase()}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-800">
                    {b.campground?.name ?? 'Unknown'}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {b.checkInDate?.slice(0, 10)}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{nights}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        isUpcoming
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isUpcoming ? 'Continue' : 'Past'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDeleteId(b._id)
                          setDeleteName(b.campground?.name ?? 'this booking')
                        }}
                        className="btn-danger text-xs py-1 px-3"
                      >
                        Delete
                      </button>
                      <Link
                        href={`/bookings/${b._id}/edit`}
                        className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation popup — matches design */}
      {deleteId && (
        <div className="mt-6 border border-gray-200 rounded-lg p-5 max-w-sm bg-white shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-1">Delete confirmation</p>
          <p className="text-xs text-gray-500 mb-4">
            Are you sure you want to delete booking for{' '}
            <span className="font-medium text-gray-700">{deleteName}</span>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="btn-danger text-sm disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

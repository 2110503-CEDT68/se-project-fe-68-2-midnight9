import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { getBookings } from '@/libs'
import BookingsTable from './BookingsTable'

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  let bookings: any[] = []
  try {
    const data = await getBookings(session.user.token)
    bookings = data.data ?? []
  } catch {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="page-title">My Bookings</h1>
      <p className="page-sub">View, edit, and delete from your bookings.</p>

      <BookingsTable
        initialBookings={bookings}
        token={session.user.token}
      />

      {/* <p className="text-xs text-gray-400 mt-6">
        Actions: Edit → /bookings/:id/edit · Delete → DELETE /api/v1/bookings/:id ·{' '}
        To Book → /campgrounds
      </p> */}
    </div>
  )
}

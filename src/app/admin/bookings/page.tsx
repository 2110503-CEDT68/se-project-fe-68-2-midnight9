import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { getBookings, deleteBooking } from '@/libs'
import AdminBookingsTable from './AdminBookingsTable'

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/')

  let bookings: any[] = []
  try {
    const data = await getBookings(session.user.token)
    bookings = data.data ?? []
  } catch {}

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">
        You can view, edit, and delete any booking in the system.
      </p>

      <AdminBookingsTable
        initialBookings={bookings}
        token={session.user.token}
      />

      {/* Admin controls note */}
      {/* <div className="mt-6 border border-gray-200 rounded-md p-4 text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">Admin controls</p>
        <p>
          This booking is read only for admin to view all bookings.
        </p>
      </div> */}

      {/* <p className="text-xs text-gray-400 mt-4">
        Interaction: Edit → /admin/bookings/:id/edit · Delete → DELETE /api/v1/bookings/:id
      </p> */}
    </div>
  )
}

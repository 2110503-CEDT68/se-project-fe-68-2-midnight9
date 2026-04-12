import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { getBooking } from '@/libs'
import AdminEditForm from './AdminEditForm'

export default async function AdminEditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/')

  const { id } = await params

  let booking: any = null
  try {
    const data = await getBooking(id, session.user.token)
    booking = data.data
  } catch {
    redirect('/admin/bookings')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="page-title">
        Admin edit booking BK-{id.slice(-4).toUpperCase()}
      </h1>

      <AdminEditForm
        bookingId={id}
        token={session.user.token}
        userEmail={booking.user?.email ?? ''}
        campgroundName={booking.campground?.name ?? ''}
        initialCheckIn={booking.checkInDate?.slice(0, 10) ?? ''}
        initialCheckOut={booking.checkOutDate?.slice(0, 10) ?? ''}
        phoneNumber={booking.campground?.tel ?? ''}
      />
    </div>
  )
}
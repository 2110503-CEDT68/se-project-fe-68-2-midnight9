import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import { getBooking } from '@/libs'
import EditBookingForm from './EditBookingForm'

export default async function EditBookingPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  let booking: any = null
  try {
    const data = await getBooking(params.id, session.user.token)
    booking = data.data
  } catch {
    redirect('/bookings')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="page-title">Edit booking BK-{params.id.slice(-4).toUpperCase()}</h1>

      <EditBookingForm
        bookingId={params.id}
        token={session.user.token}
        campgroundName={booking.campground?.name ?? ''}
        initialCheckIn={booking.checkInDate?.slice(0, 10) ?? ''}
        initialCheckOut={booking.checkOutDate?.slice(0, 10) ?? ''}
        tel={booking.campground?.tel ?? ''}
        userEmail={session.user.email}
      />
    </div>
  )
}

import { getCampground } from '@/libs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { redirect } from 'next/navigation'
import BookingForm from './BookingForm'

export default async function CreateBookingPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  let camp: any = null
  try {
    const data = await getCampground(params.id)
    camp = data.data
  } catch {
    redirect('/campgrounds')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="page-title">Create a new booking</h1>
      <p className="page-sub">
        Fill out the details to book a campground. Max 3 nights per user.
      </p>

      <BookingForm
        campgroundId={params.id}
        campgroundName={camp.name}
        token={session.user.token}
        userTel={session.user.tel ?? ''}
      />
    </div>
  )
}

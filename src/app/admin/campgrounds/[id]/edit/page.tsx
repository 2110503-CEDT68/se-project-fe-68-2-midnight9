import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getCampground } from '@/libs'
import EditCampgroundForm from './EditCampgroundForm'

export default async function EditCampgroundPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/campgrounds')

  let campground: any = null
  try {
    const data = await getCampground(params.id, { cache: 'no-store' })
    campground = data.data
  } catch {
    notFound()
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="page-title">Edit Campground</h1>
        <p className="page-sub">Update campground details and contact information.</p>
        <EditCampgroundForm campground={campground} token={session.user.token} />
      </div>
    </div>
  )
}

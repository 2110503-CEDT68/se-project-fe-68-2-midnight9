import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import CreateCampgroundForm from './CreateCampgroundForm'

export default async function CreateCampgroundPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/campgrounds')

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="page-title">Create Campground</h1>
        <p className="page-sub">Admin create new campground</p>
        <CreateCampgroundForm />
      </div>
    </div>
  )
}
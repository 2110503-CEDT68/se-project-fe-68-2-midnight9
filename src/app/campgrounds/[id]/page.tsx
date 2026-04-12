import { getCampground } from '@/libs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CampImage from '@/components/CampImage'

export default async function CampgroundDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  let camp: any = null
  try {
    const data = await getCampground(params.id)
    camp = data.data
  } catch {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative w-full h-[320px] rounded-lg overflow-hidden border border-gray-200 bg-green-50">
          <CampImage
            src={camp.picture || camp.image || camp.photo}
            alt={camp.name}
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{camp.name}</h1>

          <div className="space-y-1 mb-4 text-sm text-gray-600">
            {camp.address && <p>Address: {camp.address}</p>}
            {camp.district && <p>District: {camp.district}</p>}
            {camp.province && <p>Province: {camp.province}</p>}
            {camp.region && <p>Region: {camp.region}</p>}
            {camp.tel && <p>Phone: {camp.tel}</p>}
            {camp.postalcode && <p>Postal code: {camp.postalcode}</p>}
          </div>

          {camp.description && (
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {camp.description}
            </p>
          )}

          {!session && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm text-yellow-800">
              Booking requires login. Please{' '}
              <Link href="/login" className="font-semibold underline">log in</Link>{' '}
              or{' '}
              <Link href="/register" className="font-semibold underline">register</Link>{' '}
              to continue.
            </div>
          )}

          <div className="flex gap-3">
            {session ? (
              <Link href={`/campgrounds/${camp._id}/book`} className="btn-primary">
                Book Now
              </Link>
            ) : (
              <Link href="/login" className="btn-primary">
                Book Now
              </Link>
            )}
            <Link href="/campgrounds" className="btn-secondary">
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

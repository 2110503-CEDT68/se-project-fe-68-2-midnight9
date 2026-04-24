import { getCampground } from '@/libs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CampImage from '@/components/CampImage'
import CampgroundAdminActions from './CampgroundAdminActions'

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
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div className="relative h-[320px] overflow-hidden rounded-3xl border border-gray-200 bg-green-50 shadow-sm">
          <CampImage
            src={camp.picture || camp.image || camp.photo}
            alt={camp.name}
            className="object-cover"
          />
        </div>

        <div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-600">
                  Campground Details
                </p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">{camp.name}</h1>
                <p className="mt-2 text-sm text-gray-500">
                  A quick overview of location, contact details, and booking access.
                </p>
              </div>
              {camp.price !== undefined && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">Starting Price</p>
                  <p className="mt-1 text-2xl font-bold text-green-800">
                    ฿{camp.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-700">per night</p>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {camp.address && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Address</p>
                  <p className="mt-1 text-sm text-gray-700">{camp.address}</p>
                </div>
              )}
              {camp.district && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">District</p>
                  <p className="mt-1 text-sm text-gray-700">{camp.district}</p>
                </div>
              )}
              {camp.province && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Province</p>
                  <p className="mt-1 text-sm text-gray-700">{camp.province}</p>
                </div>
              )}
              {camp.region && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Region</p>
                  <p className="mt-1 text-sm text-gray-700">{camp.region}</p>
                </div>
              )}
              {camp.tel && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</p>
                  <p className="mt-1 text-sm text-gray-700">{camp.tel}</p>
                </div>
              )}
              {camp.postalcode && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Postal Code</p>
                  <p className="mt-1 text-sm text-gray-700">{camp.postalcode}</p>
                </div>
              )}
            </div>

            {camp.description && (
              <p className="mt-5 text-sm leading-relaxed text-gray-600">
                {camp.description}
              </p>
            )}

            {!session && (
              <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                Booking requires login. Please{' '}
                <Link href="/login" className="font-semibold underline">log in</Link>{' '}
                or{' '}
                <Link href="/register" className="font-semibold underline">register</Link>{' '}
                to continue.
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {session ? (
                <Link href={`/campgrounds/${camp._id}/book`} className="btn-primary text-center">
                  Book Now
                </Link>
              ) : (
                <Link href="/login" className="btn-primary text-center">
                  Book Now
                </Link>
              )}
              <Link href="/campgrounds" className="btn-secondary text-center">
                Back to List
              </Link>
            </div>
          </div>

          {session?.user?.role === 'admin' && session.user.token && (
            <CampgroundAdminActions
              campgroundId={camp._id}
              campgroundName={camp.name}
              token={session.user.token}
            />
          )}
        </div>
      </div>
    </div>
  )
}

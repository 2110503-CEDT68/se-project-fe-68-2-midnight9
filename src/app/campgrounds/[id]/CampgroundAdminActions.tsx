'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteCampground } from '@/libs'

export default function CampgroundAdminActions({
  campgroundId,
  campgroundName,
  token,
}: {
  campgroundId: string
  campgroundName: string
  token: string
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${campgroundName}"?\n\nThis campground can only be deleted when it has no active or upcoming bookings.`
    )

    if (!confirmed) return

    setError('')
    setIsDeleting(true)

    try {
      await deleteCampground(campgroundId, token)
      router.push('/campgrounds')
      router.refresh()
    } catch (err: any) {
      const message = err.message || 'Failed to delete campground.'
      setError(message)
      window.alert(message)
      setIsDeleting(false)
    }
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <Link
        href={`/admin/campgrounds/${campgroundId}/edit`}
        className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-800 transition-colors hover:bg-green-100"
      >
        Edit Campground
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center justify-center rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? 'Deleting...' : 'Delete Campground'}
      </button>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:ml-1" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

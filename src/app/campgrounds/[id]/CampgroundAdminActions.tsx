'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const confirmDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      await deleteCampground(campgroundId, token)
      router.push('/campgrounds')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to delete campground.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/campgrounds/${campgroundId}/edit`}
          className="btn-primary"
        >
          Edit Campground
        </Link>
        <button
          type="button"
          onClick={() => {
            setConfirming(true)
            setError('')
          }}
          className="btn-danger"
        >
          Delete Campground
        </button>
      </div>

      {confirming && (
        <div
          className="border border-gray-200 rounded-lg p-5 max-w-md bg-white shadow-sm"
          role="dialog"
          aria-labelledby="delete-campground-title"
        >
          <p id="delete-campground-title" className="text-sm font-semibold text-gray-800 mb-1">
            Delete confirmation
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-700">{campgroundName}</span>? Campgrounds
            with active bookings cannot be deleted.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="btn-secondary text-sm"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="btn-danger text-sm disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

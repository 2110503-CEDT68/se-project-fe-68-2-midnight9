'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updateCampground } from '@/libs'
import CampgroundFormFields from '../../CampgroundFormFields'
import {
  campgroundToForm,
  toCampgroundPayload,
  validateCampgroundForm,
  type CampgroundFormValues,
} from '../../campgroundFormValidation'

export default function EditCampgroundForm({
  campground,
  token,
}: {
  campground: any
  token: string
}) {
  const router = useRouter()
  const [form, setForm] = useState<CampgroundFormValues>(() => campgroundToForm(campground))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const update = (field: keyof CampgroundFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateCampgroundForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      await updateCampground(campground._id, toCampgroundPayload(form), token)
      setSuccess('Campground updated successfully.')

      setTimeout(() => {
        router.push(`/campgrounds/${campground._id}`)
        router.refresh()
      }, 800)
    } catch (err: any) {
      setError(err.message || 'Failed to update campground.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mt-6"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-3">
        Campground Details
      </h2>

      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="bg-green-50 border border-green-200 rounded-md p-3 mb-5 text-sm text-green-700"
          role="status"
        >
          {success}
        </div>
      )}

      <CampgroundFormFields
        form={form}
        loading={loading}
        cancelHref={`/campgrounds/${campground._id}`}
        submitLabel="Save Changes"
        loadingLabel="Saving..."
        onChange={update}
      />
    </form>
  )
}

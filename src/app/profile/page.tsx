'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { deleteProfile, getMe, updateProfile } from '@/libs'

type UserProfile = {
  name: string
  email: string
  tel: string
  birthDate: string
  province: string
  emergencyName: string
  emergencyPhone: string
  medicalConditions: string
  createdAt: string
}

const EMPTY_PROFILE: UserProfile = {
  name: '',
  email: '',
  tel: '',
  birthDate: '',
  province: '',
  emergencyName: '',
  emergencyPhone: '',
  medicalConditions: '',
  createdAt: '',
}

function toInputDate(value?: string | Date | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toDisplayDate(value?: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { timeZone: 'UTC' })
}

function normalizeProfile(data: any): UserProfile {
  return {
    name: data?.name ?? '',
    email: data?.email ?? '',
    tel: data?.tel ?? '',
    birthDate: toInputDate(data?.birthDate ?? data?.birthdate),
    province: data?.province ?? '',
    emergencyName: data?.emergencyName ?? '',
    emergencyPhone: data?.emergencyPhone ?? '',
    medicalConditions: data?.medicalConditions ?? '',
    createdAt: toInputDate(data?.createdAt),
  }
}

function profilePayload(profile: UserProfile) {
  return {
    name: profile.name.trim(),
    email: profile.email.trim(),
    tel: profile.tel.trim(),
    birthDate: profile.birthDate || null,
    province: profile.province.trim(),
    emergencyName: profile.emergencyName.trim(),
    emergencyPhone: profile.emergencyPhone.trim(),
    medicalConditions: profile.medicalConditions.trim(),
  }
}

function validateProfile(profile: UserProfile) {
  if (!profile.name.trim() || !profile.email.trim() || !profile.tel.trim()) {
    return 'Full name, email address, and phone number are required.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    return 'Please enter a valid email address.'
  }

  if (!/^\d{9,10}$/.test(profile.tel.replace(/[-\s]/g, ''))) {
    return 'Please enter a valid phone number.'
  }

  if (profile.emergencyPhone && !/^\d{9,10}$/.test(profile.emergencyPhone.replace(/[-\s]/g, ''))) {
    return 'Please enter a valid emergency phone number.'
  }

  if (profile.birthDate) {
    const selectedDate = new Date(`${profile.birthDate}T00:00:00.000Z`)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (Number.isNaN(selectedDate.getTime())) {
      return 'Please enter a valid birth date.'
    }

    if (selectedDate > today) {
      return 'Birth date cannot be in the future.'
    }
  }

  return ''
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE)
  const [form, setForm] = useState<UserProfile>(EMPTY_PROFILE)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.token) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      setLoading(true)
      setError('')

      try {
        const profileResponse = await getMe(session.user.token)
        const nextProfile = normalizeProfile(profileResponse.data)
        setProfile(nextProfile)
        setForm(nextProfile)
      } catch (err: any) {
        setError(err.message ?? 'Failed to fetch profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, session?.user?.token, status])

  const set = (field: keyof UserProfile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [field]: e.target.value }))
  }

  const startEditing = () => {
    setError('')
    setSuccess('')
    setForm(profile)
    setEditing(true)
  }

  const cancelEditing = () => {
    setError('')
    setSuccess('')
    setForm(profile)
    setEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateProfile(form)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!session?.user?.token) return

    setSaving(true)
    try {
      const response = await updateProfile(profilePayload(form), session.user.token)
      const nextProfile = normalizeProfile(response.data)
      setProfile(nextProfile)
      setForm(nextProfile)
      setEditing(false)
      setSuccess('Profile updated successfully.')
      await update({
        name: nextProfile.name,
        email: nextProfile.email,
        tel: nextProfile.tel,
      })
    } catch (err: any) {
      setError(err.message ?? 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!session?.user?.token || !deletePassword) return

    setDeleting(true)
    setDeleteError('')

    try {
      await deleteProfile(deletePassword, session.user.token)
      await signOut({ callbackUrl: '/' })
    } catch (err: any) {
      setDeleteError(err.message ?? 'Failed to delete account.')
      setDeleting(false)
    }
  }

  const fieldClass = editing
    ? 'form-input'
    : 'form-input bg-gray-50 text-gray-600'
  const deleteReady = deletePassword.length > 0

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-sm text-gray-500">
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your personal information and account settings.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
              <p className="text-xs text-gray-500 mt-1">
                Account ID {session?.user?._id ? `...${session.user._id.slice(-6)}` : ''}
              </p>
            </div>

            {!editing && (
              <button type="button" className="btn-primary w-full sm:w-auto" onClick={startEditing}>
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-5 text-sm text-green-700" role="status">
              {success}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5 mb-8">
            <div>
              <label className="form-label" htmlFor="full-name">Full Name</label>
              <input
                id="full-name"
                className={fieldClass}
                value={form.name}
                disabled={!editing || saving}
                onChange={set('name')}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="phone-number">Phone Number</label>
              <input
                id="phone-number"
                type="tel"
                className={fieldClass}
                value={form.tel}
                disabled={!editing || saving}
                onChange={set('tel')}
                autoComplete="tel"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email-address">Email Address</label>
              <input
                id="email-address"
                type="email"
                className={fieldClass}
                value={form.email}
                disabled={!editing || saving}
                onChange={set('email')}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="birth-date">Birth Date</label>
              <input
                id="birth-date"
                type={editing ? 'date' : 'text'}
                className={fieldClass}
                value={editing ? form.birthDate : toDisplayDate(form.birthDate)}
                disabled={!editing || saving}
                onChange={set('birthDate')}
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="province">Province</label>
              <input
                id="province"
                className={fieldClass}
                value={form.province}
                disabled={!editing || saving}
                onChange={set('province')}
                autoComplete="address-level1"
                placeholder="Your Province"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="member-since">Member Since</label>
              <input
                id="member-since"
                className="form-input bg-gray-50 text-gray-600"
                value={toDisplayDate(profile.createdAt)}
                disabled
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div className="sm:col-span-2 mt-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-100 pb-2">
                Emergency & Medical Information
              </h3>
            </div>

            <div>
              <label className="form-label" htmlFor="emergency-name">Emergency Contact Name</label>
              <input
                id="emergency-name"
                className={fieldClass}
                value={form.emergencyName}
                disabled={!editing || saving}
                onChange={set('emergencyName')}
                placeholder="Relative or friend's name"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="emergency-phone">Emergency Contact Phone Number</label>
              <input
                id="emergency-phone"
                type="tel"
                className={fieldClass}
                value={form.emergencyPhone}
                disabled={!editing || saving}
                onChange={set('emergencyPhone')}
                placeholder="0XX-XXX-XXXX"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="form-label" htmlFor="medical-conditions">Medical Conditions / Allergies</label>
              <textarea
                id="medical-conditions"
                className={`${fieldClass} min-h-24 resize-y`}
                value={form.medicalConditions}
                disabled={!editing || saving}
                onChange={set('medicalConditions')}
                placeholder="List any medical conditions or allergies..."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row">
              {editing ? (
                <>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </button>
                </>
              ) : null}
            </div>

            <button
              type="button"
              className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50 focus:!ring-red-500"
              onClick={() => {
                setShowDeleteConfirm(true)
                setDeletePassword('')
                setDeleteError('')
                setError('')
              }}
              disabled={saving || deleting}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-profile-title"
          >
            <h2 id="delete-profile-title" className="text-lg font-semibold text-gray-900">
              Delete Profile
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This will permanently delete your account and remove your campground bookings. Enter your password to continue.
            </p>

            <label className="form-label mt-5" htmlFor="delete-password">
              Password
            </label>
            <input
              id="delete-password"
              type="password"
              className="form-input"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleting}
              autoComplete="current-password"
            />

            {deleteError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteError('')
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger disabled:opacity-50"
                onClick={handleDelete}
                disabled={!deleteReady || deleting}
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

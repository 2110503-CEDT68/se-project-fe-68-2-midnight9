'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getMe } from '@/libs'

type UserProfile = {
  name?: string
  email?: string
  tel?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserProfile>({})

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.token) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const profile = await getMe(session.user.token)
        setUser({
          name: profile.name ?? '',
          email: profile.email ?? '',
          tel: profile.tel ?? '',
        })
      } catch (error) {
        console.error('Failed to fetch profile', error)
        router.push('/login')
      }
    }

    loadProfile()
  }, [router, session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Loading profile…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
        <p className="text-lg text-slate-700 mb-4">You must sign in to view your profile.</p>
        <Link
          href="/login"
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Go to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Account</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">My Profile</h1>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-sm font-medium text-slate-600">Personal information</div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Full name</label>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900">
                {user.name || session?.user?.name || '—'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Phone number</label>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900">
                {user.tel || session?.user?.tel || '—'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900">
                {user.email || session?.user?.email || '—'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Birth date</label>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900">31/04/07</div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-800 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 sm:w-auto"
            >
              Edit
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full border border-red-500 bg-white px-8 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


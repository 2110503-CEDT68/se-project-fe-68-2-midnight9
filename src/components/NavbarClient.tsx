'use client'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import ActiveLink from './ActiveLink'

export default function NavbarClient({ session }: { session: any }) {
  const pathname = usePathname()
  const isAdmin  = session?.user?.role === 'admin'
  const [showConfirm, setShowConfirm] = useState(false)

  if (session) {
    return (
      <>
        <div className="flex items-center gap-3 p-3">
          <ActiveLink href="/profile" className="nav-link text-sm text-green-700 hidden sm:block font-bold p-3">
            {session.user?.name}
          </ActiveLink>
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm nav-link font-medium"
          >
            Logout
          </button>
        </div>

        {/* Confirm Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-800">Confirm Logout</h2>
              <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center gap-3 font-medium p-3">
      <Link
        href="/login"
        className={`nav-link text-sm p-3 ${pathname === '/login' ? 'font-bold text-green-800' : 'text-gray-600'}`}
      >
        Login
      </Link>
      <Link
        href="/register"
        className={`nav-link text-sm ${pathname === '/register' ? 'font-bold text-green-800' : 'text-gray-600'}`}
      >
        Register
      </Link>
    </div>
  )
}
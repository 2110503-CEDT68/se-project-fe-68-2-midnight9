'use client'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function NavbarClient({ session }: { session: any }) {
  const pathname = usePathname()
  const isAdmin  = session?.user?.role === 'admin'

  if (session) {
    return (
      <div className="flex items-center gap-3 p-3">
        <span className="text-sm text-green-700 hidden sm:block font-bold p-3">
          {session.user?.name}
        </span>
        {/* Remove Profile link — My Bookings is already in the nav for users
            Admin does not get Profile either since they use the Admin tab */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm nav-link font-medium"
        >
          Logout
        </button>
      </div>
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
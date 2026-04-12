import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import NavbarClient from './NavbarClient'
import ActiveLink from './ActiveLink'

export default async function Navbar() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'admin'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-green-700 text-lg tracking-tight">
          Campground Booking
        </Link>

        <div className="hidden md:flex items-center gap-6 font-medium">
          <ActiveLink href="/campgrounds" className="nav-link">Campgrounds</ActiveLink>

          {/* User: show My Bookings — Admin: show only Admin */}
          {session && !isAdmin && (
            <ActiveLink href="/bookings" className="nav-link">My Bookings</ActiveLink>
          )}
          {isAdmin && (
            <ActiveLink href="/admin/bookings" className="nav-link">
              Admin Dashboard
            </ActiveLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          <NavbarClient session={session} />
          <img src="/img/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
      </div>
    </nav>
  )
}
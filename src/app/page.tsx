'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getBookings, getCampgrounds } from '@/libs'
import CampgroundCard from '@/components/CampgroundCard'
import Link from 'next/link'

export default function HomePage() {
  const { data: session } = useSession()
  const [campgrounds, setCampgrounds] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    getCampgrounds()
      .then((data) => setCampgrounds(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (session?.user?.token) {
      getBookings(session.user.token)
        .then((data) => {
          setBookings(data.data ?? [])
        })
        .catch((err) => console.log(err))
    }
  }, [session])

  const filtered = campgrounds.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name?.toLowerCase().includes(q) ||
      c.province?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    )
  })

  const displayed = filtered.slice(0, 6)

  return (
    <>
      {/* ── HERO BANNER ─────────────────────────────── */}
      <div className="relative w-full h-[50vh] min-h-[320px] bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center overflow-hidden">

        {/* Background texture */}
        <div className="absolute inset-0 opacity-20"
             style={{backgroundImage:'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px),radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',backgroundSize:'60px 60px'}}/>

        {/* Decorative circles */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-600 opacity-20"/>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-green-500 opacity-20"/>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow">
            {session ? `Welcome back, ${session.user.name}` : 'Find Your Next Stay in Nature'}
          </h1>
          <p className="text-green-200 text-base md:text-lg mb-8">
            {session
              ? 'Find your perfect campground and start booking directly.'
              : 'Browse campgrounds, compare highlights, and book your perfect escape.'}
          </p>

          {/* Search bar inside banner */}
          <div className="flex gap-2 max-w-xl mx-auto">
            <input
              className="flex-1 px-4 py-3 rounded-md text-sm text-gray-800 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
              placeholder="Search campground name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-3 rounded-md transition-colors shadow text-sm"
              onClick={() => {}}
            >
              Search
            </button>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"/>
      </div>

      {/* ── CONTENT BELOW BANNER ────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats row for logged-in users */}
        {session && (
          <div className="flex gap-4 mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center min-w-[120px]">
              <p className="text-xs text-gray-500 mb-1">Campgrounds</p>
              <p className="text-2xl font-bold text-gray-900">{campgrounds.length}</p>
            </div>
            {session.user.role === 'admin' ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center min-w-[120px]">
                <p className="text-xs text-gray-500 mb-1">All Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center min-w-[120px]">
                <p className="text-xs text-gray-500 mb-1">My Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {session.user.role === 'admin' ? (
                <Link href="/admin/bookings" className="btn-primary text-sm">
                  All Bookings
                </Link>
              ) : (
                <Link href="/bookings" className="btn-primary text-sm">
                  My Bookings
                </Link>
              )}
              <Link href="/campgrounds" className="btn-secondary text-sm">Browse All</Link>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white bg-green-700 px-3 py-1 rounded-full">
              {search ? `Results for "${search}"` : 'Popular'}
            </span>
            {!loading && (
              <span className="text-xs text-gray-400">
                {displayed.length} campground{displayed.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {!session && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <Link href="/login" className="text-green-700 hover:underline">Log in</Link>
              <span>·</span>
              <Link href="/register" className="text-green-700 hover:underline">Register</Link>
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-36 bg-gray-100"/>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4"/>
                  <div className="h-3 bg-gray-100 rounded w-1/2"/>
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((c, i) => (
              <CampgroundCard key={c._id} camp={c} index={i}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No campgrounds found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {/* Show more link */}
        {!loading && filtered.length > 6 && (
          <div className="text-center mt-8">
            <Link href="/campgrounds" className="btn-secondary text-sm">
              View all {campgrounds.length} campgrounds →
            </Link>
          </div>
        )}

        {/* Guest info */}
        {!session && !loading && (
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: '✓', title: 'Easy online booking', desc: 'Reserve your spot in seconds' },
              { icon: '✓', title: 'Verified listings',   desc: 'Trusted campground information' },
              { icon: '✓', title: 'Flexible management', desc: 'Edit or cancel anytime' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-green-600 font-bold mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

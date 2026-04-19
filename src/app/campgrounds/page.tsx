'use client'
import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getCampgrounds } from '@/libs'
import CampgroundCard from '@/components/CampgroundCard'

const REGIONS = ['All', 'Central', 'Northern', 'Northeastern', 'Eastern', 'Southern', 'Western']

export default function CampgroundsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const [campgrounds, setCampgrounds] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)

  // Search & filter state
  const [search, setSearch]         = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filterRegion, setFilterRegion]     = useState('All')
  const [filterProvince, setFilterProvince] = useState('')

  useEffect(() => {
    getCampgrounds()
      .then((data) => setCampgrounds(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Unique provinces from data
  const provinces = useMemo(() => {
    const set = new Set<string>(campgrounds.map((c) => c.province).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [campgrounds])

  // Apply search + filters
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return campgrounds.filter((c) => {
      const matchSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.province?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.district?.toLowerCase().includes(q) ||
        c.region?.toLowerCase().includes(q)

      const matchRegion =
        filterRegion === 'All' || c.region?.toLowerCase() === filterRegion.toLowerCase()

      const matchProvince =
        !filterProvince || filterProvince === 'All' || c.province === filterProvince

      return matchSearch && matchRegion && matchProvince
    })
  }, [campgrounds, search, filterRegion, filterProvince])

  const hasActiveFilter = filterRegion !== 'All' || filterProvince !== ''

  const clearFilters = () => {
    setFilterRegion('All')
    setFilterProvince('')
    setSearch('')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ── Header Section & Create Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="page-title !mb-1">Campgrounds</h1>
          <p className="page-sub">
            {session
              ? 'Browse, search, and book your perfect campground.'
              : 'Browse campgrounds. Log in to make a booking.'}
          </p>
        </div>

        {isAdmin && (
          <Link 
            href="/admin/campgrounds/create" 
            className="btn-primary inline-flex items-center text-sm px-6 py-2 shrink-0 mt-1 sm:mt-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Campground
          </Link>
        )}
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex gap-2 max-w-xl mb-3">
        <input
          className="form-input flex-1"
          placeholder="Search by name, province, region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => setShowFilter((v) => !v)}
          className={`text-sm px-4 py-2 rounded-md border transition-colors font-medium
            ${showFilter || hasActiveFilter
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Filter{hasActiveFilter ? ' ●' : ''}
        </button>
        {(search || hasActiveFilter) && (
          <button
            onClick={clearFilters}
            className="text-sm px-3 py-2 rounded-md text-gray-500 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {showFilter && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-w-xl">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Region */}
            <div>
              <label className="form-label">Region</label>
              <select
                className="form-input"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <label className="form-label">Province</label>
              <select
                className="form-input"
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
              >
                {provinces.map((p) => (
                  <option key={p} value={p === 'All' ? '' : p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowFilter(false)}
              className="text-xs text-gray-500 hover:text-gray-800 underline"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Results header ── */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-semibold text-white bg-green-700 px-3 py-1 rounded-full">
          {search || hasActiveFilter ? `Results` : 'All'}
        </span>
        {!loading && (
          <span className="text-xs text-gray-400">
            {filtered.length} campground{filtered.length !== 1 ? 's' : ''}
            {campgrounds.length !== filtered.length && ` of ${campgrounds.length}`}
          </span>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-36 bg-gray-100"/>
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4"/>
                <div className="h-3 bg-gray-100 rounded w-1/2"/>
                <div className="h-6 bg-gray-100 rounded mt-3"/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">
            No campgrounds found{search ? ` for "${search}"` : ''}.
          </p>
          {(search || hasActiveFilter) && (
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear search & filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((c, i) => (
            <CampgroundCard key={c._id} camp={c} index={i}/>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-8">
        {campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''} total
        {session ? ` · ${session.user.email}` : ''}
      </p>
    </div>
  )
}
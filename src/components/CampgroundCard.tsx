import Link from 'next/link'
import CampImage from './CampImage'

export default function CampgroundCard({ camp }: { camp: any; index?: number }) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="h-36 relative overflow-hidden bg-green-50">
        <CampImage
          src={camp.picture || camp.image || camp.photo}
          alt={camp.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{camp.name}</h3>
        {camp.province && (
          <p className="text-xs text-gray-500 mb-1">{camp.province}</p>
        )}
        {camp.address && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">{camp.address}</p>
        )}
        {camp.price !== undefined && (
          <p className="text-xs font-semibold text-green-700 mb-3">฿{camp.price.toLocaleString()} / night</p>
        )}
        <Link
          href={`/campgrounds/${camp._id}`}
          className="block text-center btn-primary text-xs py-1.5 px-3"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
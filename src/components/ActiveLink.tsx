'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ActiveLink({ href, children, className = '' }: { href: string, children: React.ReactNode, className?: string }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link 
      href={href} 
      className={`${className} ${isActive ? 'font-bold text-green-800' : ''}`}
    >
      {children}
    </Link>
  )
}
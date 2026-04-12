import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import NextAuthProvider from '@/providers/NextAuthProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/authOptions'

export const metadata: Metadata = {
  title: 'Campground Booking',
  description: 'Book campgrounds across Thailand',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body>
        <NextAuthProvider session={session}>
          <Navbar />
          <main>{children}</main>
        </NextAuthProvider>
      </body>
    </html>
  )
}

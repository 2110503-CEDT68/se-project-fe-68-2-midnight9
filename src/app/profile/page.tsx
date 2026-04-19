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
  province?: string
  emergencyName?: string
  emergencyPhone?: string
  medicalConditions?: string
  birthDate?: string
  createdAt?: string
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
        const profileResponse = await getMe(session.user.token)
        const userData = profileResponse.data 

        const formatDate = (dateString?: string) => {
          if (!dateString) return ''
          return new Date(dateString).toLocaleDateString('en-GB')
        }

        setUser({
          name: userData.name ?? '',
          email: userData.email ?? '',
          tel: userData.tel ?? '',
          province: userData.province ?? '',
          emergencyName: userData.emergencyName ?? '',
          emergencyPhone: userData.emergencyPhone ?? '',
          medicalConditions: userData.medicalConditions ?? '',
          birthDate: formatDate(userData.birthDate), 
          createdAt: formatDate(userData.createdAt),
        })
      } catch (error) {
        console.error('Failed to fetch profile', error)
        router.push('/login')
      }
    }

    loadProfile()
  }, [router, session, status])

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your personal information and account settings.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-100 pb-3">
            Personal Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5 mb-8">
            
            <div>
              <label className="form-label" htmlFor="full-name">Full Name</label>
              <input 
                id="full-name"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.name || session?.user?.name || ''} 
                disabled 
              />
            </div>

            <div>
              <label className="form-label" htmlFor="phone-number">Phone Number</label>
              <input 
                id="phone-number"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.tel || session?.user?.tel || ''} 
                disabled 
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email-address">Email Address</label>
              <input 
                id="email-address"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.email || session?.user?.email || ''} 
                disabled 
              />
            </div>

            <div>
              <label className="form-label" htmlFor="birth-date">Birth Date</label>
              <input 
                id="birth-date"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.birthDate || ''} 
                disabled
                placeholder="dd/mm/yyyy"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="province">Province</label>
              <input 
                id="province"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.province || ''} 
                disabled 
                placeholder="Your Province"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="member-since">Member Since</label>
              <input 
                id="member-since"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.createdAt || ''} 
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
                className="form-input bg-gray-50 text-gray-600" 
                value={user.emergencyName || ''} 
                disabled 
                placeholder="Relative or Friend's Name"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="emergency-phone">Emergency Contact Phone Number</label>
              <input 
                id="emergency-phone"
                className="form-input bg-gray-50 text-gray-600" 
                value={user.emergencyPhone || ''} 
                disabled 
                placeholder="0XX-XXX-XXXX"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="form-label" htmlFor="medical-conditions">Medical Conditions / Allergies</label>
              <textarea
                id="medical-conditions"
                className="form-input bg-gray-50 text-gray-600 resize-none" 
                value={user.medicalConditions || ''} 
                disabled
                rows={1}
                placeholder="List any medical conditions or allergies..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" className="btn-primary">Edit Profile</button>
            <button type="button" className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50 focus:!ring-red-500">
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
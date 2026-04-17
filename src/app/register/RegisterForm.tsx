'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/libs'

export default function RegisterForm() {
  const router = useRouter()

  const [form, setForm] = useState({
  name: '', tel: '', email: '', password: '', confirm: '',
  acceptTerms: false,
})

  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
const [scrolledToBottom, setScrolledToBottom] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [field]: value }))

    // validate realtime
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    let message = ''

    if (!value) {
      message = 'This field is required'
    } else {
      if (field === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
        message = 'Invalid email format'
      }

      if (field === 'tel' && !/^[0-9]{9,10}$/.test(value.replace(/-/g, ''))) {
        message = 'Invalid phone number'
      }

      if (field === 'password' && value.length < 6) {
        message = 'Password must be at least 6 characters'
      }

      if (field === 'confirm' && value !== form.password) {
        message = 'Passwords do not match'
      }
    }

    setErrors((e: any) => ({ ...e, [field]: message }))
  }

  const validateAll = () => {
    const newErrors: any = {}

    Object.entries(form).forEach(([key, value]) => {
      if (!value) newErrors[key] = `You must enter your ${key}`
    })

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (form.tel && !/^[0-9]{9,10}$/.test(form.tel.replace(/-/g, ''))) {
      newErrors.tel = 'Invalid phone number'
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = 'Password too short'
    }

    if (form.confirm !== form.password) {
      newErrors.confirm = 'Passwords do not match'
    }

    if (!form.acceptTerms) {
      newErrors.acceptTerms = 'You must accept Terms of Service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAll()) return

    setLoading(true)
    try {
      const { name, tel, email, password } = form
      await registerUser(name, email, tel, password)
      await signIn('credentials', { redirect: false, email, password })
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setErrors({ general: err.message ?? 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }
  const setCheckbox = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((f) => ({ ...f, [field]: e.target.checked }))

  const inputClass = (field: string) =>
    `form-input ${errors[field] ? 'border-red-500' : ''}`

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div className="text-red-600 mb-4">{errors.general}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label>Full Name</label>
          <input
            className={inputClass('name')}
            value={form.name}
            onChange={set('name')}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label>Phone</label>
          <input
            className={inputClass('tel')}
            value={form.tel}
            onChange={set('tel')}
          />
          {errors.tel && <p className="text-red-500 text-sm">{errors.tel}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label>Email</label>
        <input
          className={inputClass('email')}
          value={form.email}
          onChange={set('email')}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label>Password</label>
          <input
            type="password"
            className={inputClass('password')}
            value={form.password}
            onChange={set('password')}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        <div>
          <label>Confirm</label>
          <input
            type="password"
            className={inputClass('confirm')}
            value={form.confirm}
            onChange={set('confirm')}
          />
          {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={setCheckbox('acceptTerms')}
          />
          <span className="text-sm">
            I agree to the{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-blue-600 underline"
            >
              Terms of Service
            </button>
          </span>
        </label>

        {errors.acceptTerms && (
          <p className="text-red-500 text-sm mt-1">
            {errors.acceptTerms}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !form.acceptTerms}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>


      {showTerms && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-lg shadow-lg flex flex-col">

      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Terms of Service</h2>
        <button onClick={() => setShowTerms(false)}>✕</button>
      </div>

      {/* Content (scrollable) */}
      <div
        className="p-4 overflow-y-auto text-sm space-y-3"
        onScroll={(e) => {
          const el = e.currentTarget
          if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
            setScrolledToBottom(true)
          }
        }}
      >
        <div className="p-6 overflow-y-auto text-sm leading-relaxed text-gray-700 space-y-6">

  <div>
    <h1 className="text-2xl font-bold text-gray-900 mb-1">
      Terms of Service
    </h1>
  </div>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      1. Acceptance of Terms
    </h2>
    <p>
      By creating an account or using our service, you agree to be bound by these Terms of Service.
      If you do not agree, please do not use the service.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      2. Use of the Service
    </h2>
    <p className="mb-2">
      You agree to use the service only for lawful purposes and in accordance with these terms.
    </p>
    <ul className="list-disc pl-5 space-y-1">
      <li>Use the service for any illegal or unauthorized purpose</li>
      <li>Attempt to gain unauthorized access to the system</li>
      <li>Disrupt or interfere with the service or servers</li>
    </ul>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      3. User Accounts
    </h2>
    <p>
      You are responsible for maintaining the confidentiality of your account and password.
      You agree to provide accurate and complete information when registering.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      4. Privacy
    </h2>
    <p>
      Your use of the service is also governed by our Privacy Policy.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      5. Content and Data
    </h2>
    <p>
      You retain ownership of any content you provide. However, you grant us a limited license
      to use, store, and process that content for operating the service.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      6. Service Availability
    </h2>
    <p>
      We do not guarantee uninterrupted service and may modify or discontinue features at any time.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      7. Limitation of Liability
    </h2>
    <p>
      We are not liable for indirect or consequential damages arising from your use of the service.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      8. Termination
    </h2>
    <p>
      We may suspend or terminate your account if you violate these terms.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      9. Changes to Terms
    </h2>
    <p>
      We may update these Terms of Service at any time.
    </p>
  </section>

  <section>
    <h2 className="font-semibold text-gray-900 mb-2">
      10. Contact
    </h2>
    <p>
      Contact us at: <span className="text-blue-600">email@example.com</span>
    </p>
  </section>

</div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t flex justify-end gap-2">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => setShowTerms(false)}
        >
          Close
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={!scrolledToBottom}
          onClick={() => {
            setForm((f) => ({ ...f, acceptTerms: true }))
            setShowTerms(false)
          }}
        >
          Accept
        </button>
      </div>
    </div>
  </div>
)}
    </form>

    
  )
  
}
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/libs'

export default function RegisterForm() {
  const router = useRouter()
  
  const [form, setForm] = useState({
    name: '', tel: '', email: '', password: '', confirm: '', acceptTerms: false,
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [hasReadTerms, setHasReadTerms] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { name, tel, email, password, confirm, acceptTerms } = form
    if (!name || !tel || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!acceptTerms) {
      setError('You must accept the Terms of Service to register.')
      return
    }

    setLoading(true)
    try {
      await registerUser(name, email, tel, password)
      await signIn('credentials', { redirect: false, email, password })
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4 mb-4">
        <div>
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            id="name"
            className="form-input"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div>
          <label htmlFor="tel" className="form-label">Phone Number</label>
          <input
            id="tel"
            type="tel"
            className="form-input"
            placeholder="081-234-5678"
            value={form.tel}
            onChange={set('tel')}
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          id="email"
          type="email"
          className="form-input"
          placeholder="user@example.com"
          value={form.email}
          onChange={set('email')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4 mb-6">
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={set('password')}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="form-label">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            className="form-input"
            placeholder="Confirm password"
            value={form.confirm}
            onChange={set('confirm')}
          />
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2">
        <input
          type="checkbox"
          id="acceptTerms"
          className="mt-1 cursor-pointer accent-green-700"
          checked={form.acceptTerms}
          onChange={(e) => {
            if (e.target.checked) {
              if (hasReadTerms) {
                setForm((f) => ({ ...f, acceptTerms: true }));
              } else {
                setShowTerms(true);
              }
            } else {
              setForm((f) => ({ ...f, acceptTerms: false }));
            }
          }}
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
          I agree to the{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowTerms(true);
            }}
            className="text-green-700 font-medium hover:underline"
          >
            Terms of Service
          </button>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !form.acceptTerms}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-lg text-gray-900">Terms of Service</h2>
              <button 
                type="button"
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700 font-bold px-2"
              >✕</button>
            </div>

            <div
              className="p-6 overflow-y-auto text-sm leading-relaxed text-gray-700 space-y-6"
              onScroll={(e) => {
                const el = e.currentTarget;
                const isBottom = el.scrollHeight <= el.clientHeight || 
                                Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) <= 5;
                
                if (isBottom) {
                  setScrolledToBottom(true);
                  setHasReadTerms(true);
                }
              }}
            >
               <section>
                <h2 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
                <p>By creating an account or using our service, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">2. Use of the Service</h2>
                <p className="mb-2">You agree to use the service only for lawful purposes and in accordance with these terms.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to the system</li>
                  <li>Disrupt or interfere with the service or servers</li>
                </ul>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">3. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate and complete information when registering.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">4. Privacy</h2>
                <p>Your use of the service is also governed by our Privacy Policy.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">5. Content and Data</h2>
                <p>You retain ownership of any content you provide. However, you grant us a limited license to use, store, and process that content for operating the service.</p>
              </section>
              
              <section>
                <h2 className="font-semibold text-gray-900 mb-2">6. Service Availability</h2>
                <p>We do not guarantee uninterrupted service and may modify or discontinue features at any time.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
                <p>We are not liable for indirect or consequential damages arising from your use of the service.</p>
              </section>

              <section>
                <h2 className="font-semibold text-gray-900 mb-2">8. Termination</h2>
                <p>We may suspend or terminate your account if you violate these terms.</p>
              </section>
          
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
              <button
                type="button"
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                onClick={() => setShowTerms(false)}
              >Close</button>

              <button
                type="button"
                className={`px-5 py-2 rounded-md font-medium text-white transition ${
                  scrolledToBottom ? 'bg-green-700 hover:bg-green-800' : 'bg-green-700 opacity-50 cursor-not-allowed'
                }`}
                disabled={!scrolledToBottom}
                onClick={() => {
                  setForm((f) => ({ ...f, acceptTerms: true }))
                  setHasReadTerms(true)
                  setShowTerms(false)
                }}
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
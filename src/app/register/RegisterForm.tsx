'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/libs'

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', tel: '', email: '', password: '', confirm: '',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { name, tel, email, password, confirm } = form
    if (!name || !tel || !email || !password || !confirm) {
      setError('Please fill in all required fields.')
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

      {/* Row 1: Full Name + Phone */}
      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4 mb-4">
        <div>
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            placeholder="Your name"
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-input"
            placeholder="081-234-5678"
            value={form.tel}
            onChange={set('tel')}
          />
        </div>
      </div>

      {/* Row 2: Email (full width) */}
      <div className="mb-4">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          placeholder="user@example.com"
          value={form.email}
          onChange={set('email')}
        />
      </div>

      {/* Row 3: Password + Confirm */}
      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4 mb-6">
        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={set('password')}
          />
        </div>
        <div>
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Confirm password"
            value={form.confirm}
            onChange={set('confirm')}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}

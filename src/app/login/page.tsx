import LoginForm from './LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500">
          Log in to browse your campground bookings.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-gray-500 mt-6">
        No account yet? Go to{' '}
        <Link href="/register" className="text-green-700 font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}

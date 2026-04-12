import RegisterForm from './RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? Go to{' '}
        <Link href="/login" className="text-green-700 font-medium hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

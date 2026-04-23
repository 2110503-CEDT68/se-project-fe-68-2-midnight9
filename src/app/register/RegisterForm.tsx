'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/libs'

// ── Types ──────────────────────────────────────────────────────────────────────

type LegalSection = { title: string; body: string }

// ── Terms of Service content ────────────────────────────────────────────────────

const TERMS_SECTIONS: LegalSection[] = [
  {
    title: '1. Agreement to Terms',
    body: 'By creating an account or using Midnight9 Campground ("the Service"), you enter into a binding agreement with us. If you do not agree with any part of these Terms, you must not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.',
  },
  {
    title: '2. Eligibility & Account Registration',
    body: 'You must be at least 18 years of age to create an account. When registering, you agree to provide accurate and complete information, including your full name, email address, and phone number. You are solely responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account.',
  },
  {
    title: '3. Campground Reservations',
    body: 'A booking is confirmed only upon receiving a system-generated confirmation. You acknowledge that:\n• Cancellations made 7 or more days before the check-in date are eligible for a full refund.\n• Cancellations made fewer than 7 days before check-in may incur a fee as specified per campground.\n• The Company reserves the right to cancel reservations due to force majeure events, in which case a full refund will be issued.\n• The Company does not guarantee availability and may limit the number of concurrent bookings per account.',
  },
  {
    title: '4. Acceptable Use',
    body: 'You agree not to:\n• Use the Service for any unlawful or fraudulent purpose.\n• Impersonate another person or provide false information during registration.\n• Attempt to gain unauthorised access to any part of the Service or its infrastructure.\n• Introduce malicious code, bots, or automated scripts without prior written consent.\n• Post, transmit, or otherwise make available any content that is defamatory, harassing, or harmful to others.\n\nViolations may result in immediate account suspension or termination without notice.',
  },
  {
    title: '5. Intellectual Property',
    body: 'All content on the platform — including but not limited to text, graphics, logos, software source code, and photographs — is the intellectual property of the Company or its licensors and is protected by applicable copyright and trademark laws. You are granted a limited, non-exclusive, non-transferable licence for personal, non-commercial use only. You may not reproduce, modify, distribute, or commercially exploit any content without express written permission.',
  },
  {
    title: '6. Disclaimer of Warranties',
    body: 'The Service is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'To the fullest extent permitted by applicable law, the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or use, arising out of or in connection with your use of the Service, even if we have been advised of the possibility of such damages.',
  },
  {
    title: '8. Termination',
    body: 'We reserve the right to suspend or permanently terminate your account at our sole discretion if you breach these Terms or engage in conduct we deem harmful to the Service or other users. Upon termination, your right to use the Service ceases immediately. You may request account deletion at any time by contacting our support team.',
  },
  {
    title: '9. Governing Law',
    body: 'These Terms are governed by and construed in accordance with the laws of the Kingdom of Thailand. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Thailand.',
  },
  {
    title: '10. Changes to These Terms',
    body: 'We may update these Terms from time to time. We will notify you of any significant changes via the email address associated with your account. Your continued use of the Service after such notification constitutes acceptance of the updated Terms. We encourage you to review this document periodically.',
  },
]

// ── Privacy Policy content ──────────────────────────────────────────────────────

const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: '1. Introduction',
    body: 'Midnight9 Campground ("we", "our", or "us") is committed to protecting your personal data in accordance with the Personal Data Protection Act B.E. 2562 (PDPA) of Thailand. This Privacy Policy explains what data we collect, why we collect it, how we use it, and your rights as a data subject.',
  },
  {
    title: '2. Personal Data We Collect',
    body: 'When you register and use our Service, we collect the following categories of personal data:\n\n  Data you provide directly:\n• Full Name — to identify you and personalise communications.\n• Email Address — used as your login identifier and for system notifications.\n• Phone Number — used for identity verification and emergency contact purposes.\n• Password — stored exclusively as a bcrypt hash (salt rounds: 10). We cannot view your plaintext password.\n• Date of Birth — used for age verification and to tailor your experience.\n\n  Data generated automatically:\n• Account creation timestamp (createdAt) — recorded when your account is first created.\n• Account role (user / admin) — assigned to manage access permissions.\n• Booking history — details of campground reservations you make through the platform.',
  },
  {
    title: '3. Legal Basis for Processing (PDPA)',
    body: 'We process your personal data under the following lawful bases:\n• Contractual necessity — to create and manage your account and process your bookings.\n• Consent — for optional marketing and promotional communications. You may withdraw consent at any time.\n• Legitimate interests — to detect and prevent fraud, ensure system security, and improve service quality.\n• Legal obligation — to comply with applicable laws, regulations, and court orders.',
  },
  {
    title: '4. How We Use Your Data',
    body: 'Your personal data is used to:\n• Create, authenticate, and manage your user account.\n• Process, confirm, and manage campground reservations.\n• Send transactional communications such as booking confirmations and account updates.\n• Provide customer support and resolve technical issues.\n• Detect, investigate, and prevent fraudulent or unauthorised activity.\n• Comply with legal and regulatory obligations.',
  },
  {
    title: '5. Data Sharing & Disclosure',
    body: 'We do not sell your personal data. We may share your data only in the following limited circumstances:\n• Campground operators — only data necessary to fulfil your reservation (e.g., name and phone number).\n• Cloud infrastructure and database providers — under data processing agreements that require them to protect your data.\n• Law enforcement or government bodies — when required by a court order, subpoena, or applicable law.\n\nAll third parties who process your data on our behalf are contractually obligated to handle it in accordance with this Privacy Policy and applicable law.',
  },
  {
    title: '6. Data Security',
    body: 'We implement appropriate technical and organisational measures to protect your personal data, including:\n• Password hashing with bcrypt (10 salt rounds) — your plaintext password is never stored.\n• All data in transit is encrypted via HTTPS / TLS.\n• Authentication via signed JWT tokens with configurable expiry.\n• Role-based access control (RBAC) to restrict data access to authorised personnel only.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your personal data for as long as your account remains active. Upon account deletion, your data will be purged within 30 days, except where retention is required by law. Booking records are retained for a minimum of 5 years to satisfy accounting and legal obligations.',
  },
  {
    title: '8. Your Rights Under the PDPA',
    body: 'As a data subject under Thai PDPA, you have the following rights:\n• Right of Access — request a copy of the personal data we hold about you.\n• Right to Rectification — correct inaccurate or incomplete data via your Profile page.\n• Right to Erasure — request deletion of your account and associated personal data.\n• Right to Data Portability — receive your data in a structured, machine-readable format.\n• Right to Restriction — request that we limit the processing of your data in certain circumstances.\n• Right to Object — object to processing based on legitimate interests.\n\nTo exercise any of these rights, please contact: privacy@midnight9.com',
  },
  {
    title: '9. Cookies',
    body: 'We use HTTP-only session cookies to securely manage your authentication state. These cookies are essential for the Service to function and cannot be disabled. We do not use any third-party tracking or advertising cookies.',
  },
  {
    title: '10. Contact & Data Protection Officer',
    body: 'If you have questions, concerns, or complaints regarding this Privacy Policy or our data practices, please contact:\n\nData Protection Officer (DPO)\nEmail: privacy@midnight9.com\nMidnight9 Campground\nBangkok, Thailand',
  },
]

// ── Reusable Legal Modal ────────────────────────────────────────────────────────

function LegalModal({
  title,
  badge,
  effectiveDate,
  sections,
  onClose,
  onAccept,
}: {
  title: string
  badge: string
  effectiveDate: string
  sections: LegalSection[]
  onClose: () => void
  onAccept?: () => void
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.clientHeight - el.scrollTop <= 10) {
      setScrolledToBottom(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[88vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block bg-green-100 text-green-800 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                {badge}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Effective date: {effectiveDate} · Midnight9 Campground</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Read-to-bottom notice */}
        {onAccept && !scrolledToBottom && (
          <div className="flex items-center gap-2 bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-700">
            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Please scroll to the bottom to enable the Accept button.
          </div>
        )}

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-[13px] leading-relaxed text-gray-600"
          onScroll={handleScroll}
        >
          {sections.map((s) => (
            <section key={s.title}>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">{s.title}</h3>
              <p className="whitespace-pre-line">{s.body}</p>
            </section>
          ))}
          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-300 tracking-widest">
            END OF DOCUMENT
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              disabled={!scrolledToBottom}
              onClick={onAccept}
              className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all ${
                scrolledToBottom
                  ? 'bg-green-700 hover:bg-green-800 shadow-sm'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {scrolledToBottom ? 'I Accept' : 'Scroll to bottom to accept'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main RegisterForm ───────────────────────────────────────────────────────────

export default function RegisterForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    tel: '',
    email: '',
    password: '',
    confirm: '',
    acceptTerms: false,
    acceptPrivacy: false,
  })

  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showTerms, setShowTerms]     = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [hasReadTerms, setHasReadTerms]     = useState(false)
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleCheckbox = (field: 'acceptTerms' | 'acceptPrivacy', openModal: () => void, hasRead: boolean) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked && !hasRead) {
        openModal()
      } else {
        setForm((f) => ({ ...f, [field]: e.target.checked }))
      }
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { name, tel, email, password, confirm, acceptTerms, acceptPrivacy } = form

    if (!name || !tel || !email || !password || !confirm) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^\d{9,10}$/.test(tel.replace(/[-\s]/g, ''))) {
      setError('Please enter a valid phone number.')
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
    if (!acceptTerms || !acceptPrivacy) {
      setError('You must accept both the Terms of Service and Privacy Policy to register.')
      return
    }

    setLoading(true)
    try {
      await registerUser(name, email, tel, password)
      await signIn('credentials', { redirect: false, email, password })
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const bothAccepted = form.acceptTerms && form.acceptPrivacy

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-sm text-red-700">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Name + Phone */}
        <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4 mb-4">
          <div>
            <label htmlFor="name" className="form-label">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              className="form-input"
              placeholder="Jane Smith"
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="tel" className="form-label">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="tel"
              type="tel"
              className="form-input"
              placeholder="081-234-5678"
              value={form.tel}
              onChange={set('tel')}
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="jane@example.com"
            value={form.email}
            onChange={set('email')}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4 mb-6">
          <div>
            <label htmlFor="password" className="form-label">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="form-label">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirm"
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
            />
          </div>
        </div>

        {/* Legal consent */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Legal Agreements</p>

          {/* Terms of Service */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 cursor-pointer accent-green-700 flex-shrink-0"
              checked={form.acceptTerms}
              onChange={handleCheckbox('acceptTerms', () => setShowTerms(true), hasReadTerms)}
            />
            <span className="text-sm text-gray-700 leading-snug">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-green-700 font-medium hover:underline underline-offset-2"
              >
                Terms of Service
              </button>
              {form.acceptTerms && (
                <span className="ml-1.5 text-green-600 text-xs font-medium">✓ Accepted</span>
              )}
            </span>
          </label>

          {/* Privacy Policy */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 cursor-pointer accent-green-700 flex-shrink-0"
              checked={form.acceptPrivacy}
              onChange={handleCheckbox('acceptPrivacy', () => setShowPrivacy(true), hasReadPrivacy)}
            />
            <span className="text-sm text-gray-700 leading-snug">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="text-green-700 font-medium hover:underline underline-offset-2"
              >
                Privacy Policy
              </button>
              {' '}and consent to the collection and processing of my personal data.
              {form.acceptPrivacy && (
                <span className="ml-1.5 text-green-600 text-xs font-medium">✓ Accepted</span>
              )}
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !bothAccepted}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      {/* Terms of Service Modal */}
      {showTerms && (
        <LegalModal
          title="Terms of Service"
          badge="Legal"
          effectiveDate="23 April 2025"
          sections={TERMS_SECTIONS}
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setForm((f) => ({ ...f, acceptTerms: true }))
            setHasReadTerms(true)
            setShowTerms(false)
          }}
        />
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <LegalModal
          title="Privacy Policy"
          badge="PDPA Compliant"
          effectiveDate="23 April 2025"
          sections={PRIVACY_SECTIONS}
          onClose={() => setShowPrivacy(false)}
          onAccept={() => {
            setForm((f) => ({ ...f, acceptPrivacy: true }))
            setHasReadPrivacy(true)
            setShowPrivacy(false)
          }}
        />
      )}
    </>
  )
}
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterForm from './RegisterForm'
import { registerUser } from '@/libs'
import { signIn } from 'next-auth/react'

jest.mock('@/libs', () => ({ registerUser: jest.fn() }))
jest.mock('next-auth/react', () => ({ signIn: jest.fn() }))
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

describe('RegisterForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const acceptTermsFlow = () => {
    fireEvent.click(screen.getByRole('checkbox', { name: /terms of service/i }))

    const termsScrollArea = screen.getByText(/1. Agreement to Terms/i).closest('.overflow-y-auto') as HTMLElement
    
    if (termsScrollArea) {
      Object.defineProperty(termsScrollArea, 'scrollHeight', { value: 1000, configurable: true })
      Object.defineProperty(termsScrollArea, 'clientHeight', { value: 500, configurable: true })
      
      fireEvent.scroll(termsScrollArea, { target: { scrollTop: 500 } })
      
      const acceptBtn = screen.getByRole('button', { name: /I Accept/i })
      fireEvent.click(acceptBtn)
    }

    fireEvent.click(screen.getByRole('checkbox', { name: /privacy policy/i }))

    const privacyScrollArea = screen.getByText(/1. Introduction/i).closest('.overflow-y-auto') as HTMLElement

    if (privacyScrollArea) {
      Object.defineProperty(privacyScrollArea, 'scrollHeight', { value: 1000, configurable: true })
      Object.defineProperty(privacyScrollArea, 'clientHeight', { value: 500, configurable: true })

      fireEvent.scroll(privacyScrollArea, { target: { scrollTop: 500 } })

      const acceptBtn = screen.getByRole('button', { name: /I Accept/i })
      fireEvent.click(acceptBtn)
    }
  }

  test('TC-F01: Should show error when passwords do not match', async () => {
    render(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0812345678' } })
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '654321' } })

    acceptTermsFlow()

    const submitBtn = screen.getByRole('button', { name: /Create Account/i })
    await waitFor(() => expect(submitBtn).not.toBeDisabled())
    fireEvent.click(submitBtn)

    expect(await screen.findByText(/do not match/i)).toBeInTheDocument()
  })

  test('TC-F03: Should call registerUser with correct data when form is valid', async () => {
    (registerUser as jest.Mock).mockResolvedValue({ success: true })
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true })

    render(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0812345678' } })
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } })

    acceptTermsFlow()

    const submitBtn = screen.getByRole('button', { name: /Create Account/i })
    await waitFor(() => expect(submitBtn).not.toBeDisabled())
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(
        'John Doe',
        'john@test.com',
        '0812345678',
        'password123'
      )
    })
  })
})

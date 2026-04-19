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
    const checkbox = screen.getByRole('checkbox', { name: /agree/i })
    fireEvent.click(checkbox)

    const scrollArea = screen.getByText(/1. Acceptance/i).closest('.overflow-y-auto') as HTMLElement
    
    if (scrollArea) {
      Object.defineProperty(scrollArea, 'scrollHeight', { value: 1000, configurable: true })
      Object.defineProperty(scrollArea, 'clientHeight', { value: 500, configurable: true })
      
      fireEvent.scroll(scrollArea, { target: { scrollTop: 500 } })
      
      const acceptBtn = screen.getByRole('button', { name: /Accept Terms/i })
      fireEvent.click(acceptBtn)
    }
  }

  test('TC-F01: Should show error when passwords do not match', async () => {
    render(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } })
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0812345678' } })
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: '654321' } })

    acceptTermsFlow()

    const submitBtn = screen.getByRole('button', { name: /Register/i })
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
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } })

    acceptTermsFlow()

    const submitBtn = screen.getByRole('button', { name: /Register/i })
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
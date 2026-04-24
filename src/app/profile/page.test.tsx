import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { deleteProfile, getMe, updateProfile } from '@/libs'
import { signOut, useSession } from 'next-auth/react'

const push = jest.fn()
const updateSession = jest.fn()
const router = { push }

jest.mock('next/navigation', () => ({
  useRouter: () => router,
}))

jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}))

jest.mock('@/libs', () => ({
  deleteProfile: jest.fn(),
  getMe: jest.fn(),
  updateProfile: jest.fn(),
}))

const ProfilePage = require('./page').default

const mockedUseSession = useSession as jest.Mock
const mockedGetMe = getMe as jest.MockedFunction<typeof getMe>
const mockedUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>
const mockedDeleteProfile = deleteProfile as jest.MockedFunction<typeof deleteProfile>
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>

const profileData = {
  _id: 'user-123456',
  name: 'Test User',
  email: 'test@example.com',
  tel: '0812345678',
  birthDate: '2000-01-02T00:00:00.000Z',
  province: 'Bangkok',
  emergencyName: 'Jane Contact',
  emergencyPhone: '0899999999',
  medicalConditions: 'None',
  createdAt: '2025-01-01T00:00:00.000Z',
}

function mockAuthenticatedSession() {
  mockedUseSession.mockReturnValue({
    status: 'authenticated',
    data: {
      user: {
        _id: 'user-123456',
        name: 'Test User',
        email: 'test@example.com',
        tel: '0812345678',
        role: 'user',
        token: 'token',
      },
    },
    update: updateSession,
  })
}

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthenticatedSession()
    mockedGetMe.mockResolvedValue({ success: true, data: profileData })
  })

  test('renders persisted profile data', async () => {
    render(<ProfilePage />)

    expect(await screen.findByLabelText(/full name/i)).toHaveValue('Test User')
    expect(screen.getByLabelText(/email address/i)).toHaveValue('test@example.com')
    expect(screen.getByLabelText(/province/i)).toHaveValue('Bangkok')
  })

  test('updates profile fields after validation passes', async () => {
    mockedUpdateProfile.mockResolvedValue({
      success: true,
      data: {
        ...profileData,
        name: 'Updated User',
        tel: '0899999999',
        birthDate: '2001-03-04T00:00:00.000Z',
        province: 'Chiang Mai',
        emergencyName: 'Emergency Person',
        emergencyPhone: '0977777777',
        medicalConditions: 'Shellfish allergy',
      },
    })

    render(<ProfilePage />)

    await userEvent.click(await screen.findByRole('button', { name: /edit profile/i }))
    await userEvent.clear(screen.getByLabelText(/full name/i))
    await userEvent.type(screen.getByLabelText(/full name/i), 'Updated User')
    await userEvent.clear(screen.getByLabelText(/^phone number$/i))
    await userEvent.type(screen.getByLabelText(/^phone number$/i), '089-999-9999')
    fireEvent.change(screen.getByLabelText(/birth date/i), { target: { value: '2001-03-04' } })
    await userEvent.clear(screen.getByLabelText(/province/i))
    await userEvent.type(screen.getByLabelText(/province/i), 'Chiang Mai')
    await userEvent.clear(screen.getByLabelText(/emergency contact name/i))
    await userEvent.type(screen.getByLabelText(/emergency contact name/i), 'Emergency Person')
    await userEvent.clear(screen.getByLabelText(/emergency contact phone number/i))
    await userEvent.type(screen.getByLabelText(/emergency contact phone number/i), '097-777-7777')
    await userEvent.clear(screen.getByLabelText(/medical conditions/i))
    await userEvent.type(screen.getByLabelText(/medical conditions/i), 'Shellfish allergy')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockedUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated User',
          tel: '089-999-9999',
          birthDate: '2001-03-04',
          province: 'Chiang Mai',
          emergencyName: 'Emergency Person',
          emergencyPhone: '097-777-7777',
          medicalConditions: 'Shellfish allergy',
        }),
        'token'
      )
      expect(updateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated User',
          tel: '0899999999',
        })
      )
    })

    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument()
  })

  test('enters edit mode without submitting the form', async () => {
    render(<ProfilePage />)

    const nameInput = await screen.findByLabelText(/full name/i)
    expect(nameInput).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /edit profile/i }))

    expect(nameInput).toBeEnabled()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(mockedUpdateProfile).not.toHaveBeenCalled()
  })

  test('requires password before deleting profile', async () => {
    mockedDeleteProfile.mockResolvedValue({ success: true, data: {} })
    mockedSignOut.mockResolvedValue(undefined as any)

    render(<ProfilePage />)

    await userEvent.click(await screen.findByRole('button', { name: /delete account/i }))
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i })
    expect(confirmButton).toBeDisabled()

    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    expect(confirmButton).toBeEnabled()
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockedDeleteProfile).toHaveBeenCalledWith('password123', 'token')
      expect(mockedSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
    })
  })

  test('shows password errors inside the delete confirmation dialog', async () => {
    mockedDeleteProfile.mockRejectedValueOnce(new Error('Password incorrect'))

    render(<ProfilePage />)

    await userEvent.click(await screen.findByRole('button', { name: /delete account/i }))
    await userEvent.type(screen.getByLabelText(/^password$/i), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/password incorrect/i)
    expect(mockedSignOut).not.toHaveBeenCalled()
  })
})

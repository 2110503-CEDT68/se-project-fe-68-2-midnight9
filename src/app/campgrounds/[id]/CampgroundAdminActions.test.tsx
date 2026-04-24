import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CampgroundAdminActions from './CampgroundAdminActions'
import { deleteCampground } from '@/libs'

const push = jest.fn()
const refresh = jest.fn()

jest.mock('@/libs', () => ({
  deleteCampground: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

describe('CampgroundAdminActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
    window.alert = jest.fn()
  })

  test('shows an alert and inline error when delete is blocked by active bookings', async () => {
    ;(deleteCampground as jest.Mock).mockRejectedValue(
      new Error('This campground cannot be deleted while active or upcoming bookings exist.')
    )

    render(
      <CampgroundAdminActions
        campgroundId="camp-123"
        campgroundName="Doi View"
        token="token-123"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /delete campground/i }))

    await waitFor(() => {
      expect(deleteCampground).toHaveBeenCalledWith('camp-123', 'token-123')
    })

    expect(window.confirm).toHaveBeenCalledWith(
      'Delete "Doi View"?\n\nThis campground can only be deleted when it has no active or upcoming bookings.'
    )
    expect(window.alert).toHaveBeenCalledWith(
      'This campground cannot be deleted while active or upcoming bookings exist.'
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This campground cannot be deleted while active or upcoming bookings exist.'
    )
    expect(push).not.toHaveBeenCalled()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CampgroundAdminActions from './CampgroundAdminActions'
import { deleteCampground } from '@/libs'

const push = jest.fn()
const refresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}))

jest.mock('@/libs', () => ({
  deleteCampground: jest.fn(),
}))

const mockedDeleteCampground = deleteCampground as jest.MockedFunction<typeof deleteCampground>

describe('CampgroundAdminActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('shows delete confirmation and backend restriction errors', async () => {
    mockedDeleteCampground.mockRejectedValueOnce(new Error('Cannot delete campground with 1 active booking'))

    render(
      <CampgroundAdminActions
        campgroundId="camp-1"
        campgroundName="Forest Camp"
        token="token"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /delete campground/i }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText(/forest camp/i)).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/active booking/i)
    expect(push).not.toHaveBeenCalled()
  })

  test('deletes campground and returns to the list on success', async () => {
    mockedDeleteCampground.mockResolvedValueOnce({ success: true, data: {} })

    render(
      <CampgroundAdminActions
        campgroundId="camp-1"
        campgroundName="Forest Camp"
        token="token"
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /delete campground/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))

    await waitFor(() => {
      expect(mockedDeleteCampground).toHaveBeenCalledWith('camp-1', 'token')
      expect(push).toHaveBeenCalledWith('/campgrounds')
      expect(refresh).toHaveBeenCalled()
    })
  })
})

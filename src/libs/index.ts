import { apiFetch } from './api'

type ApiFetchOptions = RequestInit & {
  next?: { revalidate?: number }
}

export function getCampgrounds() {
  return apiFetch('/campgrounds?limit=200', { cache: 'no-store' })
}

export function getCampground(id: string, optionsOrToken?: ApiFetchOptions | string) {
  if (typeof optionsOrToken === 'string') {
    return apiFetch(`/campgrounds/${id}`, {
      headers: { authorization: `Bearer ${optionsOrToken}` },
      cache: 'no-store',
    })
  }

  return apiFetch(`/campgrounds/${id}`, optionsOrToken ?? { next: { revalidate: 60 } })
}

export function updateCampground(id: string, body: object, token: string) {
  return apiFetch(`/campgrounds/${id}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export function deleteCampground(id: string, token: string) {
  return apiFetch(`/campgrounds/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  })
}

export function getBookings(token: string) {
  return apiFetch('/bookings', { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' })
}

export function getBooking(id: string, token: string) {
  return apiFetch(`/bookings/${id}`, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' })
}

export function createBooking(campgroundId: string, body: object, token: string) {
  return apiFetch(`/campgrounds/${campgroundId}/bookings`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export function updateBooking(id: string, body: object, token: string) {
  return apiFetch(`/bookings/${id}`, {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export function deleteBooking(id: string, token: string) {
  return apiFetch(`/bookings/${id}`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
  })
}

export function registerUser(name: string, email: string, tel: string, password: string) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, tel, password }),
  })
}

export function getMe(token: string) {
  return apiFetch('/auth/me', {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
}

export function updateProfile(body: object, token: string) {
  return apiFetch('/auth/updatedetails', {
    method: 'PUT',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export function deleteProfile(password: string, token: string) {
  return apiFetch('/auth/me', {
    method: 'DELETE',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ password, currentPassword: password }),
  })
}

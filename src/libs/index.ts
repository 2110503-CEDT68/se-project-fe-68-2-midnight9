import { apiFetch } from './api'

export function getCampgrounds() {
  return apiFetch('/campgrounds', { next: { revalidate: 60 } })
}

export function getCampground(id: string) {
  return apiFetch(`/campgrounds/${id}`, { cache: 'no-store' })
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

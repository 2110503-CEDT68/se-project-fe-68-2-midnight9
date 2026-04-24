const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5003/api/v1'
const internalApiUrl = process.env.INTERNAL_API_URL ?? publicApiUrl

export const API_URL = (typeof window === 'undefined' ? internalApiUrl : publicApiUrl).replace(/\/$/, '')

export async function apiFetch(path: string, options: RequestInit = {}) {
  const { headers, ...restOptions } = options

  const res = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    if (typeof data === 'object' && data) {
      throw new Error((data as any).message ?? (data as any).msg ?? `Error ${res.status}`)
    }
    throw new Error(`Error ${res.status}`)
  }

  return data
}

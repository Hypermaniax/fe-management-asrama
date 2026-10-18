const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export type ApiError = {
  status: number
  code?: string
  message: string
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly code?: string

  constructor({ status, code, message }: ApiError) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function apiFetch<T>(
  path: string,
  { body, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    let payload: { code?: string; message?: string; error?: string } = {}
    try {
      payload = (await response.json()) as typeof payload
    } catch {
      payload = {}
    }
    if (response.status === 401 && authToken) {
      onUnauthorized?.()
    }
    throw new ApiRequestError({
      status: response.status,
      code: payload.code,
      message: payload.message ?? payload.error ?? 'Terjadi kesalahan',
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

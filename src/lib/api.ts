const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

let authToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export type ApiValidationIssue = {
  path?: Array<string | number>
  message?: string
  code?: string
  [key: string]: unknown
}

export type ApiError = {
  httpStatus: number
  message: string
  errors?: ApiValidationIssue[]
}

export class ApiRequestError extends Error {
  readonly httpStatus: number
  readonly errors?: ApiValidationIssue[]

  constructor({ httpStatus, message, errors }: ApiError) {
    super(message)
    this.name = 'ApiRequestError'
    this.httpStatus = httpStatus
    this.errors = errors
  }
}

export type ApiResponseType = 'json' | 'text' | 'blob'

export type ApiEnvelope<T> = { status: string; data: T }

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  responseType?: ApiResponseType
}

const isRawBody = (body: unknown): body is BodyInit =>
  body instanceof FormData ||
  body instanceof Blob ||
  body instanceof URLSearchParams ||
  typeof body === 'string'

type ErrorPayload = {
  status?: unknown
  message?: unknown
  error?: unknown
  errors?: unknown
}

function readErrorMessage(payload: ErrorPayload, fallback: string): string {
  const candidates = [payload.status, payload.message, payload.error]
  const found = candidates.find((value) => typeof value === 'string')
  return typeof found === 'string' ? found : fallback
}

function readValidationIssues(payload: ErrorPayload): ApiValidationIssue[] | undefined {
  return Array.isArray(payload.errors)
    ? (payload.errors as ApiValidationIssue[])
    : undefined
}

async function parseError(response: Response): Promise<{
  message: string
  errors?: ApiValidationIssue[]
}> {
  const fallback = `Permintaan gagal (${response.status})`
  const text = await response.text()
  if (!text) return { message: fallback }

  try {
    const payload = JSON.parse(text) as ErrorPayload
    return {
      message: readErrorMessage(payload, fallback),
      errors: readValidationIssues(payload),
    }
  } catch {
    return { message: text }
  }
}

async function parseSuccess<T>(
  response: Response,
  responseType: ApiResponseType,
): Promise<T> {
  if (response.status === 204) return undefined as T
  if (responseType === 'blob') return (await response.blob()) as T
  if (responseType === 'text') return (await response.text()) as T

  const text = await response.text()
  if (!text) return undefined as T

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}

export async function apiFetch<T>(
  path: string,
  { body, headers, responseType = 'json', ...init }: ApiFetchOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers)
  if (authToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`)
  }
  if (body !== undefined && !isRawBody(body) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const requestBody =
    body === undefined
      ? undefined
      : isRawBody(body)
        ? body
        : JSON.stringify(body)

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    body: requestBody,
  })

  if (!response.ok) {
    if (response.status === 401 && authToken) {
      onUnauthorized?.()
    }

    const { message, errors } = await parseError(response)
    throw new ApiRequestError({
      httpStatus: response.status,
      message,
      errors,
    })
  }

  return parseSuccess<T>(response, responseType)
}

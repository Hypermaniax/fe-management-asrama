import { ApiRequestError } from '@/lib/api'

export function isUnverifiedEmailError(error: unknown): boolean {
  if (!(error instanceof ApiRequestError)) return false
  return error.httpStatus === 403 || /verif/i.test(error.message)
}

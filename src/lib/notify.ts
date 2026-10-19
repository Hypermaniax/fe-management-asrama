import { toast } from 'sonner'

import { ApiRequestError } from '@/lib/api'

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.errors?.[0]?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan'
}

export function notifyError(title: string, error: unknown): void {
  toast.error(title, { description: getErrorMessage(error) })
}

export function notifySuccess(message: string, description?: string): void {
  toast.success(message, { description })
}

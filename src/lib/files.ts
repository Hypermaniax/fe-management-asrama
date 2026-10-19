import { apiFetch } from '@/lib/api'

export function fetchFileBlob(fileId: string) {
  return apiFetch<Blob>(`/files/${fileId}`, { responseType: 'blob' })
}

export async function downloadBlob(path: string, filename: string) {
  const blob = await apiFetch<Blob>(path, { responseType: 'blob' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export function downloadFile(fileId: string, filename = fileId) {
  return downloadBlob(`/files/${fileId}`, filename)
}

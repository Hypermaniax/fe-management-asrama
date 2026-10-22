export const MIME_OPTIONS = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/jpeg', label: 'JPG / JPEG' },
  { value: 'image/png', label: 'PNG' },
] as const

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function formatMimeList(mimeTypes: string[]) {
  return mimeTypes
    .map(
      (mime) =>
        MIME_OPTIONS.find((option) => option.value === mime)?.label ?? mime,
    )
    .join(', ')
}

export function isPreviewable(mimeType: string) {
  return mimeType === 'application/pdf' || mimeType.startsWith('image/')
}

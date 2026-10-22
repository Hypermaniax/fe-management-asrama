import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchFileBlob } from '@/lib/files'
import { getErrorMessage } from '@/lib/notify'

export function FilePreviewDialog({
  open,
  onOpenChange,
  fileId,
  title,
  description = 'Pratinjau berkas.',
  downloadName = 'berkas',
  emptyMessage = 'Tidak ada berkas untuk ditampilkan.',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string | null
  title: string
  description?: string
  downloadName?: string
  emptyMessage?: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !fileId) return
    let cancelled = false
    let objectUrl: string | null = null

    fetchFileBlob(fileId)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setMimeType(blob.type)
        setUrl(objectUrl)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(getErrorMessage(reason))
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, fileId])

  const loading = Boolean(fileId) && !url && !error
  const previewable =
    mimeType === 'application/pdf' || mimeType.startsWith('image/')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{mimeType || description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-64">
          {!fileId ? (
            <p className="py-12 text-center text-sm text-foreground/70">
              {emptyMessage}
            </p>
          ) : loading ? (
            <p className="py-12 text-center text-sm text-foreground/70">
              Memuat berkas…
            </p>
          ) : error ? (
            <p className="py-12 text-center text-sm text-danger">{error}</p>
          ) : url && previewable ? (
            mimeType.startsWith('image/') ? (
              <img
                src={url}
                alt={title}
                className="mx-auto max-h-[60vh] w-auto rounded-base border-2 border-border object-contain"
              />
            ) : (
              <iframe
                src={url}
                title={title}
                className="h-[60vh] w-full rounded-base border-2 border-border"
              />
            )
          ) : (
            <p className="py-12 text-center text-sm text-foreground/70">
              Pratinjau tidak tersedia untuk tipe berkas ini.
            </p>
          )}
        </div>

        <DialogFooter>
          {url ? (
            <a
              href={url}
              download={downloadName}
              className="inline-flex h-10 items-center gap-2 rounded-base border-2 border-border bg-secondary-background px-4 text-sm font-heading"
            >
              <Download className="size-4" />
              Unduh
            </a>
          ) : null}
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

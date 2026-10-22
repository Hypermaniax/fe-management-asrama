import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

import { isPreviewable } from '@/features/document/lib'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DocumentSubmission } from '@/features/document/api'
import { fetchFileBlob } from '@/lib/files'
import { getErrorMessage } from '@/lib/notify'

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: DocumentSubmission | null
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileId = document?.fileId ?? null
  const file = document?.file ?? null

  useEffect(() => {
    if (!fileId) return
    let cancelled = false
    let objectUrl: string | null = null

    fetchFileBlob(fileId)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
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
  }, [fileId])

  const loading = Boolean(fileId) && !url && !error
  const mimeType = file?.mimeType ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {document?.documentType?.name ?? 'Pratinjau dokumen'}
          </DialogTitle>
          <DialogDescription>
            {file ? `${file.originalName} · ${mimeType}` : undefined}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-64">
          {!fileId ? (
            <p className="py-12 text-center text-sm text-foreground/70">
              Dokumen ini belum memiliki berkas.
            </p>
          ) : loading ? (
            <p className="py-12 text-center text-sm text-foreground/70">
              Memuat berkas…
            </p>
          ) : error ? (
            <p className="py-12 text-center text-sm text-danger">{error}</p>
          ) : url && isPreviewable(mimeType) ? (
            mimeType.startsWith('image/') ? (
              <img
                src={url}
                alt={file?.originalName ?? 'Dokumen'}
                className="mx-auto max-h-[60vh] w-auto rounded-base border-2 border-border object-contain"
              />
            ) : (
              <iframe
                src={url}
                title={file?.originalName ?? 'Dokumen'}
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
              download={file?.originalName ?? 'dokumen'}
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

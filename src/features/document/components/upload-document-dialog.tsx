import { useState, type ChangeEvent } from 'react'

import { LoadingButton } from '@/components/shared/loading-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { DocumentSubmission, DocumentType } from '@/features/document/api'
import { useUploadDocument } from '@/features/document/hooks'
import { formatBytes, formatMimeList } from '@/features/document/lib'
import type { ApiEnvelope } from '@/lib/api'
import { notifyError, notifySuccess } from '@/lib/notify'

export function UploadDocumentDialog({
  open,
  onOpenChange,
  documentType,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentType?: DocumentType | null
}) {
  const upload = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setError(null)

    if (!selected || !documentType) return
    if (!documentType.allowedMimeTypes.includes(selected.type)) {
      setError(
        `Tipe berkas tidak diizinkan. Gunakan: ${formatMimeList(documentType.allowedMimeTypes)}.`,
      )
    } else if (selected.size > documentType.maxSizeBytes) {
      setError(
        `Ukuran melebihi batas ${formatBytes(documentType.maxSizeBytes)}.`,
      )
    }
  }

  const submit = () => {
    if (!documentType || !file) {
      setError('Pilih berkas terlebih dahulu.')
      return
    }
    upload.mutate(
      { documentTypeId: documentType.id, file },
      {
        onSuccess: (res: ApiEnvelope<DocumentSubmission>) => {
          notifySuccess(res.status, documentType.name)
          onOpenChange(false)
        },
        onError: (reason) => notifyError('Gagal mengunggah dokumen', reason),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unggah {documentType?.name}</DialogTitle>
          <DialogDescription>
            {documentType
              ? `Tipe: ${formatMimeList(documentType.allowedMimeTypes)} · maks ${formatBytes(documentType.maxSizeBytes)}.`
              : undefined}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            type="file"
            aria-label="Berkas dokumen"
            accept={documentType?.allowedMimeTypes.join(',')}
            onChange={onFileChange}
            className="cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:font-heading"
          />
          {file ? (
            <p className="text-sm text-foreground/70">
              {file.name} · {formatBytes(file.size)}
            </p>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>

        <DialogFooter>
          <LoadingButton
            type="button"
            loading={upload.isPending}
            disabled={!file || Boolean(error)}
            onClick={submit}
          >
            Unggah
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

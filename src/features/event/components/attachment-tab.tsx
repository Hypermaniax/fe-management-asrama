import { useState, type ChangeEvent } from 'react'
import { Eye, Paperclip, Trash2, Upload } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { FilePreviewDialog } from '@/components/shared/file-preview-dialog'
import { LoadingButton } from '@/components/shared/loading-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import type {
  AttachmentKind,
  EventAttachment,
  EventDetail,
} from '@/features/event/api'
import {
  useAddAttachment,
  useDeleteAttachment,
  useUploadEventAttachment,
} from '@/features/event/hooks'
import {
  attachmentKindLabel,
  ATTACHMENT_KIND_ITEMS,
} from '@/features/event/lib'
import { formatBytes } from '@/features/document/lib'
import { notifyError, notifySuccess } from '@/lib/notify'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_SIZE_BYTES = 10 * 1024 * 1024

function AddAttachmentDialog({
  open,
  onOpenChange,
  eventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}) {
  const upload = useUploadEventAttachment()
  const add = useAddAttachment()

  const [kind, setKind] = useState<AttachmentKind>('PROPOSAL')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const onFileChange = (change: ChangeEvent<HTMLInputElement>) => {
    const next = change.target.files?.[0] ?? null
    if (!next) {
      setFile(null)
      setFileError(null)
      return
    }
    if (!ALLOWED_MIME_TYPES.includes(next.type)) {
      setFile(null)
      setFileError('Gunakan berkas PDF, PNG, atau JPEG.')
      return
    }
    if (next.size > MAX_SIZE_BYTES) {
      setFile(null)
      setFileError(`Ukuran maksimal ${formatBytes(MAX_SIZE_BYTES)}.`)
      return
    }
    setFile(next)
    setFileError(null)
  }

  const onSubmit = async () => {
    if (!file) {
      setFileError('Berkas wajib dipilih.')
      return
    }
    try {
      const uploaded = await upload.mutateAsync(file)
      const result = await add.mutateAsync({
        eventId,
        input: {
          fileId: uploaded.data.id,
          kind,
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      })
      notifySuccess(result.status, attachmentKindLabel(kind))
      onOpenChange(false)
    } catch (error) {
      notifyError('Gagal mengunggah lampiran', error)
    }
  }

  const pending = upload.isPending || add.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unggah lampiran</DialogTitle>
          <DialogDescription>
            Proposal, notulen, LPJ, foto, atau dokumen kegiatan lainnya.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(change) => {
            change.preventDefault()
            void onSubmit()
          }}
          className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
        >
          <div className="grid gap-2">
            <Label htmlFor="attachment-kind">Jenis</Label>
            <NativeSelect
              id="attachment-kind"
              value={kind}
              onChange={(change) =>
                setKind(change.target.value as AttachmentKind)
              }
            >
              {ATTACHMENT_KIND_ITEMS.map((item) => (
                <NativeSelectOption key={item.value} value={item.value}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="attachment-file">Berkas</Label>
            <Input
              id="attachment-file"
              type="file"
              accept={ALLOWED_MIME_TYPES.join(',')}
              onChange={onFileChange}
            />
            <p className="text-xs text-foreground/60">
              PDF/PNG/JPEG maksimal {formatBytes(MAX_SIZE_BYTES)}.
            </p>
            {fileError ? (
              <p className="text-sm text-danger">{fileError}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="attachment-note">Catatan</Label>
            <Textarea
              id="attachment-note"
              placeholder="Opsional"
              value={note}
              onChange={(change) => setNote(change.target.value)}
            />
          </div>

          <DialogFooter>
            <LoadingButton type="submit" loading={pending} disabled={pending}>
              <Upload />
              Unggah lampiran
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AttachmentTab({ event }: { event: EventDetail }) {
  const remove = useDeleteAttachment()
  const [addOpen, setAddOpen] = useState(false)
  const [preview, setPreview] = useState<EventAttachment | null>(null)
  const [target, setTarget] = useState<EventAttachment | null>(null)

  const rows = [...event.attachments].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menghapus lampiran', error),
    })
  }

  const columns: Column<EventAttachment>[] = [
    {
      key: 'kind',
      header: 'Jenis',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">{attachmentKindLabel(row.kind)}</span>
          <span className="text-xs text-foreground/60">
            {row.file?.originalName ?? row.fileId}
          </span>
        </div>
      ),
    },
    {
      key: 'note',
      header: 'Catatan',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.note ?? '—',
    },
    {
      key: 'createdAt',
      header: 'Diunggah',
      cell: (row) => <DateText value={row.createdAt} withTime />,
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Pratinjau lampiran"
            onClick={() => setPreview(row)}
          >
            <Eye />
          </Button>
          <Can permission="event.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label="Hapus lampiran"
              onClick={() => setTarget(row)}
            >
              <Trash2 />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/70">
          {rows.length} lampiran tersimpan
        </p>
        <Can permission="event.UPDATE">
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Paperclip />
            Unggah lampiran
          </Button>
        </Can>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada lampiran"
          description="Proposal, notulen, LPJ, atau foto kegiatan akan tersimpan di sini."
        />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          pageSize={10}
          emptyTitle="Belum ada lampiran"
        />
      )}

      {addOpen ? (
        <AddAttachmentDialog
          open
          onOpenChange={setAddOpen}
          eventId={event.id}
        />
      ) : null}

      <FilePreviewDialog
        key={preview?.id ?? 'none'}
        open={Boolean(preview)}
        onOpenChange={(open) => {
          if (!open) setPreview(null)
        }}
        fileId={preview?.fileId ?? null}
        title={
          preview
            ? `${attachmentKindLabel(preview.kind)}${preview.file ? ` · ${preview.file.originalName}` : ''}`
            : 'Lampiran'
        }
        downloadName={preview?.file?.originalName ?? 'lampiran'}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Hapus lampiran?"
        description={
          target
            ? `${attachmentKindLabel(target.kind)} akan dilepas dari kegiatan ini.`
            : undefined
        }
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

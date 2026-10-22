import { useState } from 'react'
import { Eye, Upload } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  DocumentSubmission,
  DocumentType,
} from '@/features/document/api'
import { DocumentPreviewDialog } from '@/features/document/components/document-preview-dialog'
import { UploadDocumentDialog } from '@/features/document/components/upload-document-dialog'
import {
  useDocuments,
  useRequiredDocuments,
} from '@/features/document/hooks'
import { formatBytes, formatMimeList } from '@/features/document/lib'
import { useAuthStore } from '@/stores/auth'

export default function MyDocumentsPage() {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const required = useRequiredDocuments(Boolean(userId))
  const documents = useDocuments(userId)

  const [uploadTarget, setUploadTarget] = useState<DocumentType | null>(null)
  const [previewTarget, setPreviewTarget] =
    useState<DocumentSubmission | null>(null)

  const requiredList = required.data ?? []

  const columns: Column<DocumentSubmission>[] = [
    {
      key: 'type',
      header: 'Jenis',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-heading">
            {row.documentType?.name ?? '—'}
          </span>
          <span className="text-xs text-foreground/60">Versi {row.version}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'updatedAt',
      header: 'Diperbarui',
      cell: (row) => <DateText value={row.updatedAt} withTime />,
    },
    {
      key: 'note',
      header: 'Catatan',
      className: 'max-w-xs text-foreground/80',
      cell: (row) => row.rejectionReason ?? row.note ?? '—',
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {row.fileId ? (
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label="Pratinjau dokumen"
              onClick={() => setPreviewTarget(row)}
            >
              <Eye />
            </Button>
          ) : null}
          {row.status === 'REQUESTED' || row.status === 'REJECTED' ? (
            <Can permission="document.CREATE">
              <Button
                type="button"
                size="icon-sm"
                aria-label="Unggah dokumen"
                onClick={() =>
                  row.documentType ? setUploadTarget(row.documentType) : null
                }
                disabled={!row.documentType}
              >
                <Upload />
              </Button>
            </Can>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dokumen Saya"
        description="Lengkapi dokumen wajib dan pantau status verifikasinya."
      />

      {requiredList.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg">Dokumen wajib</h2>
            <Badge variant="neutral">{requiredList.length}</Badge>
          </div>
          <ul className="flex flex-col divide-y-2 divide-border rounded-base border-2 border-border bg-secondary-background">
            {requiredList.map((item) => (
              <li
                key={item.documentType.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-heading">{item.documentType.name}</span>
                  <span className="text-xs text-foreground/60">
                    {formatMimeList(item.documentType.allowedMimeTypes)} · maks{' '}
                    {formatBytes(item.documentType.maxSizeBytes)}
                  </span>
                </div>
                {item.submission ? (
                  <StatusBadge status={item.submission.status} />
                ) : (
                  <Badge variant="neutral">Belum diunggah</Badge>
                )}
                <Can permission="document.CREATE">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setUploadTarget(item.documentType)}
                  >
                    <Upload />
                    Unggah
                  </Button>
                </Can>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DataTable
        columns={columns}
        data={documents.data ?? []}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={documents.isLoading}
        error={documents.error ? documents.error.message : undefined}
        onRetry={() => documents.refetch()}
        emptyTitle="Belum ada dokumen"
        emptyDescription="Unggah dokumen yang diminta untuk melengkapi berkas Anda."
      />

      <UploadDocumentDialog
        key={uploadTarget?.id ?? 'none'}
        open={Boolean(uploadTarget)}
        onOpenChange={(open) => {
          if (!open) setUploadTarget(null)
        }}
        documentType={uploadTarget}
      />

      <DocumentPreviewDialog
        key={previewTarget?.id ?? 'none'}
        open={Boolean(previewTarget)}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null)
        }}
        document={previewTarget}
      />
    </div>
  )
}

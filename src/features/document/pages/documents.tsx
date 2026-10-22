import { useState } from 'react'
import { Check, Eye, FilePlus2, Settings2, X } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { BuildingSelect } from '@/components/shared/building-select'
import { Button } from '@/components/ui/button'
import type { DocumentSubmission } from '@/features/document/api'
import { DocumentPreviewDialog } from '@/features/document/components/document-preview-dialog'
import { DocumentTypesDialog } from '@/features/document/components/document-types-dialog'
import { RejectDocumentDialog } from '@/features/document/components/reject-document-dialog'
import { RequestDocumentDialog } from '@/features/document/components/request-document-dialog'
import {
  useDocuments,
  useVerifyDocument,
} from '@/features/document/hooks'
import { ResidentSelect } from '@/features/resident/components/resident-select'
import { useCan } from '@/lib/rbac'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useScopeStore } from '@/stores/scope'

export default function DocumentsPage() {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const canCreate = useCan('document.CREATE')

  const [buildingId, setBuildingId] = useState(activeBuildingId ?? '')
  const [userId, setUserId] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const [previewTarget, setPreviewTarget] =
    useState<DocumentSubmission | null>(null)
  const [rejectTarget, setRejectTarget] =
    useState<DocumentSubmission | null>(null)

  const { data, isLoading, error, refetch } = useDocuments(userId || null)
  const verify = useVerifyDocument()

  const confirmVerify = (document: DocumentSubmission) => {
    verify.mutate(document.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, document.documentType?.name)
      },
      onError: (reason) => notifyError('Gagal memverifikasi', reason),
    })
  }

  const columns: Column<DocumentSubmission>[] = [
    {
      key: 'type',
      header: 'Jenis',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-heading">
            {row.documentType?.name ?? '—'}
          </span>
          <span className="text-xs text-foreground/60">
            Versi {row.version}
          </span>
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
      header: 'Waktu',
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
          {row.status === 'UPLOADED' ? (
            <>
              <Can permission="document.VERIFY">
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label="Verifikasi dokumen"
                  onClick={() => confirmVerify(row)}
                >
                  <Check />
                </Button>
              </Can>
              <Can permission="document.VERIFY">
                <Button
                  type="button"
                  variant="neutral"
                  size="icon-sm"
                  className="text-danger"
                  aria-label="Tolak dokumen"
                  onClick={() => setRejectTarget(row)}
                >
                  <X />
                </Button>
              </Can>
            </>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Verifikasi Dokumen"
        description="Periksa dokumen penghuni, minta berkas baru, dan verifikasi."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="neutral"
            onClick={() => setTypesOpen(true)}
          >
            <Settings2 />
            Jenis dokumen
          </Button>
          {canCreate ? (
            <Button type="button" onClick={() => setRequestOpen(true)}>
              <FilePlus2 />
              Minta dokumen
            </Button>
          ) : null}
        </div>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <BuildingSelect
          value={buildingId || null}
          onValueChange={(value) => {
            setBuildingId(value)
            setUserId('')
          }}
          className="w-48"
        />
        <ResidentSelect
          buildingId={buildingId || null}
          value={userId}
          onValueChange={setUserId}
          placeholder="Pilih penghuni"
          className="w-56"
        />
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle={userId ? 'Belum ada dokumen' : 'Pilih penghuni'}
        emptyDescription={
          userId
            ? 'Penghuni ini belum memiliki dokumen apa pun.'
            : 'Pilih penghuni untuk melihat dan memverifikasi dokumennya.'
        }
      />

      <RequestDocumentDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        defaultBuildingId={buildingId}
      />

      <DocumentTypesDialog
        open={typesOpen}
        onOpenChange={setTypesOpen}
        defaultBuildingId={buildingId}
        canCreate={canCreate}
      />

      <DocumentPreviewDialog
        key={previewTarget?.id ?? 'none'}
        open={Boolean(previewTarget)}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null)
        }}
        document={previewTarget}
      />

      <RejectDocumentDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null)
        }}
        document={rejectTarget}
      />
    </div>
  )
}

import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import {
  Check,
  Eye,
  LogOut,
  Pencil,
  Send,
  X,
} from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import type { DocumentSubmission } from '@/features/document/api'
import { DocumentPreviewDialog } from '@/features/document/components/document-preview-dialog'
import { RejectDocumentDialog } from '@/features/document/components/reject-document-dialog'
import {
  useDocuments,
  useVerifyDocument,
} from '@/features/document/hooks'
import type { Occupancy } from '@/features/occupancy/api'
import {
  useCheckoutOccupancy,
  useOccupancies,
} from '@/features/occupancy/hooks'
import { RejectResidentDialog } from '@/features/resident/components/reject-resident-dialog'
import { ResidentFormDialog } from '@/features/resident/components/resident-form-dialog'
import {
  useApproveResident,
  useCheckoutResident,
  useResident,
  useSubmitResident,
} from '@/features/resident/hooks'
import { useCan } from '@/lib/rbac'
import { notifyError, notifySuccess } from '@/lib/notify'

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-heading tracking-wide text-foreground/60 uppercase">
        {label}
      </dt>
      <dd className="text-sm">{value ?? '—'}</dd>
    </div>
  )
}

export default function ResidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const resident = useResident(id)
  const buildings = useBuildings()
  const canOccupancy = useCan('occupancy.READ')
  const canDocument = useCan('document.READ')

  const occupancies = useOccupancies(canOccupancy && Boolean(id))
  const documents = useDocuments(canDocument ? id : null)

  const approve = useApproveResident()
  const submit = useSubmitResident()
  const residentCheckout = useCheckoutResident()
  const occupancyCheckout = useCheckoutOccupancy()
  const verifyDocument = useVerifyDocument()

  const [formOpen, setFormOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [occupancyTarget, setOccupancyTarget] = useState<Occupancy | null>(null)
  const [previewTarget, setPreviewTarget] =
    useState<DocumentSubmission | null>(null)
  const [rejectDocTarget, setRejectDocTarget] =
    useState<DocumentSubmission | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? [])
      map.set(building.id, building.name)
    return map
  }, [buildings.data])

  if (resident.isLoading) {
    return <p className="text-sm text-foreground/70">Memuat data penghuni…</p>
  }

  if (resident.error || !resident.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-danger">
          {resident.error?.message ?? 'Penghuni tidak ditemukan.'}
        </p>
        <Link to="/app/residents" className={buttonVariants({ variant: 'neutral' })}>
          Kembali ke daftar
        </Link>
      </div>
    )
  }

  const data = resident.data
  const residentOccupancies = (occupancies.data ?? []).filter(
    (item) => item.userId === data.id,
  )

  const onApprove = () => {
    approve.mutate(
      { id: data.id, buildingId: data.buildingId ?? undefined },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, data.name ?? data.email)
          setApproveOpen(false)
        },
        onError: (error) => notifyError('Gagal menyetujui', error),
      },
    )
  }

  const onSubmit = () => {
    submit.mutate(data.id, {
      onSuccess: (res) => notifySuccess(res.status, data.name ?? data.email),
      onError: (error) => notifyError('Gagal mengajukan', error),
    })
  }

  const onCheckout = () => {
    residentCheckout.mutate(data.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, data.name ?? data.email)
        setCheckoutOpen(false)
      },
      onError: (error) => notifyError('Gagal checkout', error),
    })
  }

  const onOccupancyCheckout = () => {
    if (!occupancyTarget) return
    occupancyCheckout.mutate(occupancyTarget.id, {
      onSuccess: (res) => {
        notifySuccess(
          res.status,
          `Kamar ${occupancyTarget.room.number}`,
        )
        setOccupancyTarget(null)
      },
      onError: (error) => notifyError('Gagal checkout', error),
    })
  }

  const onVerifyDocument = (document: DocumentSubmission) => {
    verifyDocument.mutate(document.id, {
      onSuccess: (res) =>
        notifySuccess(res.status, document.documentType?.name),
      onError: (error) => notifyError('Gagal memverifikasi', error),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={data.name ?? data.email}
        description={data.email}
      >
        <div className="flex flex-wrap gap-2">
          {!data.submittedAt && data.status !== 'ACTIVE' ? (
            <Can permission="user.UPDATE">
              <Button
                type="button"
                variant="neutral"
                onClick={onSubmit}
                disabled={submit.isPending}
              >
                <Send />
                Ajukan
              </Button>
            </Can>
          ) : null}
          {data.status === 'PENDING' ? (
            <>
              <Can permission="user.APPROVE">
                <Button type="button" onClick={() => setApproveOpen(true)}>
                  <Check />
                  Setujui
                </Button>
              </Can>
              <Can permission="user.APPROVE">
                <Button
                  type="button"
                  variant="neutral"
                  className="text-danger"
                  onClick={() => setRejectOpen(true)}
                >
                  <X />
                  Tolak
                </Button>
              </Can>
            </>
          ) : null}
          {data.status === 'ACTIVE' ? (
            <Can permission="user.UPDATE">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setCheckoutOpen(true)}
              >
                <LogOut />
                Checkout
              </Button>
            </Can>
          ) : null}
          <Can permission="user.UPDATE">
            <Button
              type="button"
              variant="neutral"
              onClick={() => setFormOpen(true)}
            >
              <Pencil />
              Ubah profil
            </Button>
          </Can>
        </div>
      </PageHeader>

      <Tabs defaultValue="profile" className="gap-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="occupancies">Penempatan</TabsTrigger>
          <TabsTrigger value="documents">Dokumen</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={data.status} />
              {data.rejectionReason ? (
                <span className="text-sm text-danger">
                  {data.rejectionReason}
                </span>
              ) : null}
            </div>

            <dl className="grid gap-5 rounded-base border-2 border-border bg-secondary-background p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Nama" value={data.name ?? '—'} />
              <Info label="Email" value={data.email} />
              <Info label="Telepon" value={data.phone ?? '—'} />
              <Info
                label="Gender"
                value={
                  data.gender === 'MALE'
                    ? 'Laki-laki'
                    : data.gender === 'FEMALE'
                      ? 'Perempuan'
                      : '—'
                }
              />
              <Info
                label="Gedung"
                value={
                  data.buildingId
                    ? (buildingNames.get(data.buildingId) ?? '—')
                    : '—'
                }
              />
              <Info label="NIK" value={data.nationalId ?? '—'} />
              <Info label="Wali" value={data.guardianName ?? '—'} />
              <Info label="Telepon wali" value={data.guardianPhone ?? '—'} />
              <Info label="Alamat" value={data.address ?? '—'} />
              <Info
                label="Submit"
                value={
                  data.submittedAt ? (
                    <DateText value={data.submittedAt} withTime />
                  ) : (
                    'Belum submit'
                  )
                }
              />
              <Info
                label="Review"
                value={
                  data.reviewedAt ? (
                    <DateText value={data.reviewedAt} withTime />
                  ) : (
                    '—'
                  )
                }
              />
              <Info
                label="Dibuat"
                value={<DateText value={data.createdAt} withTime />}
              />
            </dl>
          </div>
        </TabsContent>

        <TabsContent value="occupancies">
          {!canOccupancy ? (
            <p className="text-sm text-foreground/70">
              Anda tidak memiliki izin melihat penempatan.
            </p>
          ) : residentOccupancies.length === 0 ? (
            <p className="rounded-base border-2 border-dashed border-border p-8 text-center text-sm text-foreground/70">
              Belum ada penempatan untuk penghuni ini.
            </p>
          ) : (
            <ul className="flex flex-col divide-y-2 divide-border rounded-base border-2 border-border bg-secondary-background">
              {residentOccupancies.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-heading">
                      Kamar {item.room.number}
                      {item.bedLabel ? ` · Bed ${item.bedLabel}` : ''}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {buildingNames.get(item.room.buildingId) ?? '—'} ·{' '}
                      <DateText value={item.startDate} />
                      {item.endDate ? (
                        <>
                          {' – '}
                          <DateText value={item.endDate} />
                        </>
                      ) : null}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                  {item.status === 'ACTIVE' ? (
                    <Can permission="occupancy.UPDATE">
                      <Button
                        type="button"
                        variant="neutral"
                        size="sm"
                        onClick={() => setOccupancyTarget(item)}
                      >
                        <LogOut />
                        Checkout
                      </Button>
                    </Can>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {!canDocument ? (
            <p className="text-sm text-foreground/70">
              Anda tidak memiliki izin melihat dokumen.
            </p>
          ) : documents.isLoading ? (
            <p className="text-sm text-foreground/70">Memuat dokumen…</p>
          ) : (documents.data ?? []).length === 0 ? (
            <p className="rounded-base border-2 border-dashed border-border p-8 text-center text-sm text-foreground/70">
              Belum ada dokumen untuk penghuni ini.
            </p>
          ) : (
            <ul className="flex flex-col divide-y-2 divide-border rounded-base border-2 border-border bg-secondary-background">
              {(documents.data ?? []).map((document) => (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-heading">
                      {document.documentType?.name ?? '—'}
                    </span>
                    <span className="text-xs text-foreground/60">
                      Versi {document.version} ·{' '}
                      <DateText value={document.updatedAt} withTime />
                    </span>
                    {document.rejectionReason ? (
                      <span className="text-xs text-danger">
                        {document.rejectionReason}
                      </span>
                    ) : null}
                  </div>
                  <StatusBadge status={document.status} />
                  <div className="flex gap-2">
                    {document.fileId ? (
                      <Button
                        type="button"
                        variant="neutral"
                        size="icon-sm"
                        aria-label="Pratinjau dokumen"
                        onClick={() => setPreviewTarget(document)}
                      >
                        <Eye />
                      </Button>
                    ) : null}
                    {document.status === 'UPLOADED' ? (
                      <>
                        <Can permission="document.VERIFY">
                          <Button
                            type="button"
                            size="icon-sm"
                            aria-label="Verifikasi dokumen"
                            onClick={() => onVerifyDocument(document)}
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
                            onClick={() => setRejectDocTarget(document)}
                          >
                            <X />
                          </Button>
                        </Can>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <ResidentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        resident={data}
      />

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Setujui pendaftaran?"
        description={`${data.name ?? data.email} akan menjadi penghuni aktif dan mendapat role PENGHUNI.`}
        confirmLabel="Setujui"
        tone="default"
        loading={approve.isPending}
        onConfirm={onApprove}
      />

      <RejectResidentDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        resident={data}
      />

      <ConfirmDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        title="Checkout penghuni?"
        description={`${data.name ?? data.email} akan berstatus CHECKOUT.`}
        confirmLabel="Checkout"
        loading={residentCheckout.isPending}
        onConfirm={onCheckout}
      />

      <ConfirmDialog
        open={Boolean(occupancyTarget)}
        onOpenChange={(open) => {
          if (!open) setOccupancyTarget(null)
        }}
        title="Akhiri penempatan?"
        description={
          occupancyTarget
            ? `Penempatan di kamar ${occupancyTarget.room.number} akan diakhiri.`
            : undefined
        }
        confirmLabel="Checkout"
        loading={occupancyCheckout.isPending}
        onConfirm={onOccupancyCheckout}
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
        open={Boolean(rejectDocTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectDocTarget(null)
        }}
        document={rejectDocTarget}
      />
    </div>
  )
}

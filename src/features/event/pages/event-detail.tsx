import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import type { EventStatus } from '@/features/event/api'
import { AttachmentTab } from '@/features/event/components/attachment-tab'
import { AttendanceTab } from '@/features/event/components/attendance-tab'
import { BudgetTab } from '@/features/event/components/budget-tab'
import { CommitteeTab } from '@/features/event/components/committee-tab'
import { EventFormDialog } from '@/features/event/components/event-form-dialog'
import { SessionTab } from '@/features/event/components/session-tab'
import {
  useChangeEventStatus,
  useDeleteEvent,
  useEvent,
} from '@/features/event/hooks'
import { STATUS_ITEMS } from '@/features/event/lib'
import { useCan } from '@/lib/rbac'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const buildings = useBuildings()
  const query = useEvent(id)
  const canUpdate = useCan('event.UPDATE')
  const changeStatus = useChangeEventStatus()
  const remove = useDeleteEvent()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const event = query.data

  const confirmDelete = () => {
    if (!event) return
    remove.mutate(event.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, event.title)
        navigate('/app/events')
      },
      onError: (error) => notifyError('Gagal menghapus kegiatan', error),
    })
  }

  const handleStatus = (status: EventStatus) => {
    if (!event || status === event.status) return
    changeStatus.mutate(
      { id: event.id, status },
      {
        onSuccess: (res) => notifySuccess(res.status, event.title),
        onError: (error) => notifyError('Gagal mengubah status', error),
      },
    )
  }

  if (query.isLoading) {
    return <EmptyState title="Memuat kegiatan..." />
  }

  if (query.error || !event) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState
          message={query.error ? query.error.message : 'Kegiatan tidak ditemukan.'}
          onRetry={() => query.refetch()}
        />
        <div>
          <Link to="/app/events" className={buttonVariants({ variant: 'neutral' })}>
            <ArrowLeft />
            Kembali ke daftar
          </Link>
        </div>
      </div>
    )
  }

  const buildingName = event.buildingId
    ? (buildings.data ?? []).find((building) => building.id === event.buildingId)
        ?.name ?? null
    : null

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/app/events"
        className="inline-flex w-fit items-center gap-1 text-sm text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Daftar kegiatan
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {event.title}
            <StatusBadge status={event.status} />
          </span>
        }
        description={event.description ?? undefined}
      >
        {canUpdate ? (
          <>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="event-status"
                className="text-xs text-foreground/60"
              >
                Ubah status
              </label>
              <NativeSelect
                id="event-status"
                aria-label="Ubah status kegiatan"
                value={event.status}
                disabled={changeStatus.isPending}
                onChange={(change) =>
                  handleStatus(change.target.value as EventStatus)
                }
                className="w-44"
              >
                {STATUS_ITEMS.map((item) => (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
            <Can permission="event.UPDATE">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setEditOpen(true)}
              >
                <Pencil />
                Ubah
              </Button>
            </Can>
            <Can permission="event.DELETE">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                Hapus
              </Button>
            </Can>
          </>
        ) : null}
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <Badge
          className={
            event.category === 'BESAR'
              ? 'bg-accent-orange text-foreground'
              : 'bg-secondary-background text-foreground'
          }
        >
          {event.category === 'BESAR' ? 'Besar' : 'Rutin'}
        </Badge>
        {event.isAdHoc ? <Badge variant="neutral">Ad-hoc</Badge> : null}
        {event.isPublic ? (
          <Badge className="bg-accent-teal text-foreground">Publik</Badge>
        ) : (
          <Badge variant="neutral">Internal</Badge>
        )}
        <Badge variant="neutral">
          {event.scope === 'GEDUNG' ? (buildingName ?? 'Gedung') : 'Asrama'}
        </Badge>
        {event.recurrence !== 'NONE' ? (
          <Badge variant="neutral">
            {event.recurrence === 'WEEKLY' ? 'Mingguan' : 'Bulanan'}
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-base border-2 border-border bg-secondary-background p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Mulai</span>
          <DateText value={event.startAt} withTime className="font-heading" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Selesai</span>
          {event.endAt ? (
            <DateText value={event.endAt} withTime className="font-heading" />
          ) : (
            <span className="text-foreground/50">—</span>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Lokasi</span>
          <span>{event.location ?? '—'}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Anggaran</span>
          <span className="font-heading">
            {event.budgetAmount === null ? '—' : formatRupiah(event.budgetAmount)}
          </span>
        </div>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="sessions">Sesi</TabsTrigger>
          {canUpdate ? (
            <>
              <TabsTrigger value="committees">Panitia</TabsTrigger>
              <TabsTrigger value="attendance">Absensi</TabsTrigger>
              <TabsTrigger value="budget">Anggaran</TabsTrigger>
            </>
          ) : null}
          <TabsTrigger value="attachments">Lampiran</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="pt-4">
          <SessionTab event={event} />
        </TabsContent>

        {canUpdate ? (
          <>
            <TabsContent value="committees" className="pt-4">
              <CommitteeTab event={event} />
            </TabsContent>

            <TabsContent value="attendance" className="pt-4">
              <AttendanceTab event={event} />
            </TabsContent>

            <TabsContent value="budget" className="pt-4">
              <BudgetTab event={event} />
            </TabsContent>
          </>
        ) : null}

        <TabsContent value="attachments" className="pt-4">
          <AttachmentTab event={event} />
        </TabsContent>
      </Tabs>

      {editOpen ? (
        <EventFormDialog
          key={event.id}
          open
          onOpenChange={setEditOpen}
          event={event}
        />
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus kegiatan?"
        description={`Kegiatan ${event.title} beserta sesi, panitia, absensi, dan lampirannya akan dihapus.`}
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

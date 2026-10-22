import { useState } from 'react'
import { CalendarPlus, Plus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { Button } from '@/components/ui/button'
import type { EventDetail, EventSession } from '@/features/event/api'
import {
  AddSessionDialog,
  GenerateSessionsDialog,
} from '@/features/event/components/session-dialogs'
import { useDeleteSession } from '@/features/event/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export function SessionTab({ event }: { event: EventDetail }) {
  const remove = useDeleteSession()
  const [addOpen, setAddOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [target, setTarget] = useState<EventSession | null>(null)

  const sessions = [...event.sessions].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  )

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menghapus sesi', error),
    })
  }

  const columns: Column<EventSession>[] = [
    {
      key: 'scheduledAt',
      header: 'Jadwal',
      cell: (row) => <DateText value={row.scheduledAt} withTime />,
    },
    {
      key: 'title',
      header: 'Sesi',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">{row.title ?? 'Sesi'}</span>
          <span className="text-xs text-foreground/60">
            {row.location ?? '—'}
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
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Can permission="event.UPDATE">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Hapus sesi"
            onClick={() => setTarget(row)}
          >
            <Trash2 />
          </Button>
        </Can>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/70">
          {sessions.length} sesi terjadwal
        </p>
        <div className="flex flex-wrap gap-2">
          <Can permission="event.UPDATE">
            <Button
              type="button"
              variant="neutral"
              onClick={() => setGenerateOpen(true)}
            >
              <CalendarPlus />
              Generate sesi
            </Button>
          </Can>
          <Can permission="event.UPDATE">
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus />
              Tambah sesi
            </Button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sessions}
        getRowId={(row) => row.id}
        pageSize={10}
        emptyTitle="Belum ada sesi"
        emptyDescription="Tambahkan sesi atau generate dari daftar tanggal."
        emptyAction={
          <Can permission="event.UPDATE">
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus />
              Tambah sesi
            </Button>
          </Can>
        }
      />

      {addOpen ? (
        <AddSessionDialog
          open
          onOpenChange={setAddOpen}
          eventId={event.id}
        />
      ) : null}

      {generateOpen ? (
        <GenerateSessionsDialog
          open
          onOpenChange={setGenerateOpen}
          eventId={event.id}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Hapus sesi?"
        description="Sesi dan jadwalnya akan dihapus dari kegiatan ini."
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

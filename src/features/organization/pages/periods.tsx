import { useState } from 'react'
import { CheckCircle2, Pencil, Plus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Period } from '@/features/organization/api'
import { PeriodFormDialog } from '@/features/organization/components/period-form-dialog'
import {
  useActivatePeriod,
  usePeriods,
} from '@/features/organization/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function PeriodsPage() {
  const periods = usePeriods()
  const activate = useActivatePeriod()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Period | null>(null)
  const [target, setTarget] = useState<Period | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (period: Period) => {
    setEditing(period)
    setFormOpen(true)
  }

  const confirmActivate = () => {
    if (!target) return
    activate.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, target.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal mengaktifkan periode', error),
    })
  }

  const columns: Column<Period>[] = [
    {
      key: 'code',
      header: 'Kode',
      cell: (row) => <span className="font-heading">{row.code}</span>,
    },
    {
      key: 'name',
      header: 'Nama',
      cell: (row) => row.name,
    },
    {
      key: 'range',
      header: 'Rentang',
      cell: (row) => (
        <span className="flex flex-wrap items-center gap-1 text-sm">
          <DateText value={row.startDate} />
          <span className="text-foreground/50">—</span>
          <DateText value={row.endDate} />
        </span>
      ),
    },
    {
      key: 'decree',
      header: 'Nomor SK',
      cell: (row) => row.decreeNumber ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) =>
        row.isActive ? (
          <Badge className="bg-accent-teal text-foreground">Aktif</Badge>
        ) : (
          <Badge variant="neutral">Tidak aktif</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {!row.isActive ? (
            <Can permission="period.UPDATE">
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label={`Aktifkan ${row.name}`}
                onClick={() => setTarget(row)}
              >
                <CheckCircle2 />
              </Button>
            </Can>
          ) : null}
          <Can permission="period.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.name}`}
              onClick={() => openEdit(row)}
            >
              <Pencil />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Periode Kepengurusan"
        description="Kelola periode dan aktifkan satu periode sebagai struktur berjalan."
      >
        <Can permission="period.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Tambah periode
          </Button>
        </Can>
      </PageHeader>

      <DataTable
        columns={columns}
        data={periods.data ?? []}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={periods.isLoading}
        error={periods.error ? periods.error.message : undefined}
        onRetry={() => periods.refetch()}
        emptyTitle="Belum ada periode"
        emptyDescription="Tambahkan periode kepengurusan untuk mulai menyusun struktur."
        emptyAction={
          <Can permission="period.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah periode
            </Button>
          </Can>
        }
      />

      {formOpen ? (
        <PeriodFormDialog
          key={editing?.id ?? 'new'}
          open
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(null)
          }}
          period={editing}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Aktifkan periode ini?"
        description={
          target
            ? `Periode ${target.name} akan menjadi periode aktif. Periode lain otomatis dinonaktifkan.`
            : undefined
        }
        confirmLabel="Aktifkan"
        loading={activate.isPending}
        onConfirm={confirmActivate}
      />
    </div>
  )
}

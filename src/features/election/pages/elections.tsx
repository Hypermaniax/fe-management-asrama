import { useMemo, useState } from 'react'
import { Eye, Pencil, Play, Plus, Square, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Election } from '@/features/election/api'
import { ElectionFormDialog } from '@/features/election/components/election-form-dialog'
import {
  useDeleteElection,
  useElections,
  useElectionTransition,
} from '@/features/election/hooks'
import {
  ELECTION_STATUS_ITEMS,
  ELECTION_STATUS_LABELS,
} from '@/features/election/lib'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function ElectionsPage() {
  const elections = useElections()
  const buildings = useBuildings()
  const remove = useDeleteElection()
  const transition = useElectionTransition()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Election | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Election | null>(null)
  const [transitionTarget, setTransitionTarget] = useState<{
    election: Election
    action: 'open' | 'close'
  } | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return (elections.data ?? []).filter((election) => {
      if (statusFilter !== 'ALL' && election.status !== statusFilter) {
        return false
      }
      if (!value) return true
      return (
        election.title.toLowerCase().includes(value) ||
        election.code.toLowerCase().includes(value) ||
        (election.description ?? '').toLowerCase().includes(value)
      )
    })
  }, [elections.data, statusFilter, search])

  const confirmDelete = () => {
    if (!deleteTarget) return
    remove.mutate(deleteTarget.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, deleteTarget.title)
        setDeleteTarget(null)
      },
      onError: (error) => notifyError('Gagal menghapus pemilihan', error),
    })
  }

  const confirmTransition = () => {
    if (!transitionTarget) return
    const { election, action } = transitionTarget
    transition.mutate(
      { id: election.id, action },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, election.title)
          setTransitionTarget(null)
        },
        onError: (error) =>
          notifyError(
            action === 'open'
              ? 'Gagal membuka pemilihan'
              : 'Gagal menutup pemilihan',
            error,
          ),
      },
    )
  }

  const columns: Column<Election>[] = [
    {
      key: 'title',
      header: 'Pemilihan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">{row.title}</span>
          <span className="text-xs text-foreground/60">{row.code}</span>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Periode',
      cell: (row) => row.period?.name ?? '—',
    },
    {
      key: 'scope',
      header: 'Scope',
      cell: (row) =>
        row.buildingId ? (buildingNames.get(row.buildingId) ?? 'Gedung') : 'Asrama',
    },
    {
      key: 'schedule',
      header: 'Jadwal',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <DateText value={row.startAt} withTime />
          <span className="text-xs text-foreground/60">
            s/d <DateText value={row.endAt} withTime />
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={ELECTION_STATUS_LABELS[row.status]}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {row.status === 'DRAFT' || row.status === 'SCHEDULED' ? (
            <Can permission="election.UPDATE">
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label={`Buka ${row.title}`}
                onClick={() => setTransitionTarget({ election: row, action: 'open' })}
              >
                <Play />
              </Button>
            </Can>
          ) : null}
          {row.status === 'OPEN' ? (
            <Can permission="election.UPDATE">
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label={`Tutup ${row.title}`}
                onClick={() => setTransitionTarget({ election: row, action: 'close' })}
              >
                <Square />
              </Button>
            </Can>
          ) : null}
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label={`Detail ${row.title}`}
            onClick={() => navigate(`/app/elections/${row.id}`)}
          >
            <Eye />
          </Button>
          <Can permission="election.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.title}`}
              onClick={() => {
                setEditing(row)
                setFormOpen(true)
              }}
            >
              <Pencil />
            </Button>
          </Can>
          <Can permission="election.DELETE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Hapus ${row.title}`}
              onClick={() => setDeleteTarget(row)}
            >
              <Trash2 />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pemilihan"
        description="Pemilihan ketua: kandidat, pemilih, voting, hasil, dan finalisasi ke jabatan."
      >
        <Can permission="election.CREATE">
          <Button
            type="button"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus />
            Buat pemilihan
          </Button>
        </Can>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-44"
        >
          <NativeSelectOption value="ALL">Semua status</NativeSelectOption>
          {ELECTION_STATUS_ITEMS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari kode, judul..."
          aria-label="Cari pemilihan"
          className="w-64 bg-secondary-background"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={elections.isLoading}
        error={elections.error ? elections.error.message : undefined}
        onRetry={() => elections.refetch()}
        emptyTitle="Belum ada pemilihan"
        emptyDescription="Pemilihan yang dibuat akan muncul di sini."
        emptyAction={
          <Can permission="election.CREATE">
            <Button type="button" onClick={() => setFormOpen(true)}>
              <Plus />
              Buat pemilihan
            </Button>
          </Can>
        }
      />

      {formOpen ? (
        <ElectionFormDialog
          key={editing?.id ?? 'new'}
          open
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(null)
          }}
          election={editing}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Hapus pemilihan?"
        description={
          deleteTarget
            ? `Pemilihan ${deleteTarget.title} akan dihapus dari daftar.`
            : undefined
        }
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={Boolean(transitionTarget)}
        onOpenChange={(open) => {
          if (!open) setTransitionTarget(null)
        }}
        title={
          transitionTarget?.action === 'open'
            ? 'Buka pemilihan?'
            : 'Tutup pemilihan?'
        }
        description={
          transitionTarget?.action === 'open'
            ? 'Pemilih sesuai role akan dapat memberi suara. Maksimal satu pemilihan terbuka per scope.'
            : 'Hasil akan dihitung dan dikunci setelah ditutup.'
        }
        confirmLabel={transitionTarget?.action === 'open' ? 'Buka' : 'Tutup'}
        tone="default"
        loading={transition.isPending}
        onConfirm={confirmTransition}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Event } from '@/features/event/api'
import { EventFormDialog } from '@/features/event/components/event-form-dialog'
import { useDeleteEvent, useEvents } from '@/features/event/hooks'
import {
  CATEGORY_ITEMS,
  STATUS_ITEMS,
} from '@/features/event/lib'
import { notifyError, notifySuccess } from '@/lib/notify'
import { cn } from '@/lib/utils'

export default function EventsPage() {
  const events = useEvents()
  const buildings = useBuildings()
  const remove = useDeleteEvent()
  const navigate = useNavigate()

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [target, setTarget] = useState<Event | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return (events.data ?? []).filter((event) => {
      if (statusFilter !== 'ALL' && event.status !== statusFilter) return false
      if (categoryFilter !== 'ALL' && event.category !== categoryFilter) {
        return false
      }
      if (buildingFilter !== 'ALL') {
        const key = event.buildingId ?? 'ASRAMA'
        if (key !== buildingFilter) return false
      }
      if (!value) return true
      return (
        event.title.toLowerCase().includes(value) ||
        (event.description ?? '').toLowerCase().includes(value) ||
        (event.location ?? '').toLowerCase().includes(value)
      )
    })
  }, [events.data, statusFilter, categoryFilter, buildingFilter, search])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (event: Event) => {
    setEditing(event)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, target.title)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menghapus kegiatan', error),
    })
  }

  const columns: Column<Event>[] = [
    {
      key: 'title',
      header: 'Kegiatan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">{row.title}</span>
          <span className="text-xs text-foreground/60">
            {row.location ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge
            className={cn(
              row.category === 'BESAR'
                ? 'bg-accent-orange text-foreground'
                : 'bg-secondary-background text-foreground',
            )}
          >
            {row.category === 'BESAR' ? 'Besar' : 'Rutin'}
          </Badge>
          {row.isAdHoc ? <Badge variant="neutral">Ad-hoc</Badge> : null}
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      cell: (row) =>
        row.scope === 'GEDUNG'
          ? (buildingNames.get(row.buildingId ?? '') ?? 'Gedung')
          : 'Asrama',
    },
    {
      key: 'startAt',
      header: 'Mulai',
      cell: (row) => <DateText value={row.startAt} withTime />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'visibility',
      header: 'Warga',
      cell: (row) =>
        row.isPublic ? (
          <Badge className="bg-accent-teal text-foreground">Publik</Badge>
        ) : (
          <span className="text-foreground/50">Internal</span>
        ),
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
            aria-label={`Detail ${row.title}`}
            onClick={() => navigate(`/app/events/${row.id}`)}
          >
            <Eye />
          </Button>
          <Can permission="event.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.title}`}
              onClick={() => openEdit(row)}
            >
              <Pencil />
            </Button>
          </Can>
          <Can permission="event.DELETE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Hapus ${row.title}`}
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kegiatan"
        description="Agenda asrama, sesi, kepanitiaan, absensi, dan realisasi anggaran."
      >
        <Can permission="event.CREATE">
          <Button type="button" onClick={openCreate}>
            <Plus />
            Buat kegiatan
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
          {STATUS_ITEMS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          aria-label="Filter kategori"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="w-40"
        >
          <NativeSelectOption value="ALL">Semua kategori</NativeSelectOption>
          {CATEGORY_ITEMS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          aria-label="Filter gedung"
          value={buildingFilter}
          onChange={(event) => setBuildingFilter(event.target.value)}
          className="w-48"
        >
          <NativeSelectOption value="ALL">Semua scope</NativeSelectOption>
          <NativeSelectOption value="ASRAMA">Asrama</NativeSelectOption>
          {(buildings.data ?? []).map((building) => (
            <NativeSelectOption key={building.id} value={building.id}>
              {building.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari judul, lokasi..."
          aria-label="Cari kegiatan"
          className="w-64 bg-secondary-background"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={events.isLoading}
        error={events.error ? events.error.message : undefined}
        onRetry={() => events.refetch()}
        emptyTitle="Belum ada kegiatan"
        emptyDescription="Kegiatan yang dibuat akan muncul di sini."
        emptyAction={
          <Can permission="event.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Buat kegiatan
            </Button>
          </Can>
        }
      />

      {formOpen ? (
        <EventFormDialog
          key={editing?.id ?? 'new'}
          open
          onOpenChange={(open) => {
            setFormOpen(open)
            if (!open) setEditing(null)
          }}
          event={editing}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Hapus kegiatan?"
        description={
          target
            ? `Kegiatan ${target.title} akan dihapus dari daftar.`
            : undefined
        }
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

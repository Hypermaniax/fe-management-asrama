import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import type { AuditLog, AuditQuery } from '@/features/system/api'
import { useAuditLogs } from '@/features/system/hooks'
import { cn } from '@/lib/utils'

const ACTION_TONE: Record<string, string> = {
  CREATE: 'bg-accent-teal text-foreground',
  UPDATE: 'bg-accent-orange text-foreground',
  DELETE: 'bg-danger text-main-foreground',
}

function jsonBlock(value: unknown) {
  if (value === null || value === undefined) return null
  return (
    <pre className="max-h-64 overflow-auto rounded-base border-2 border-border bg-secondary-background p-3 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

export default function AuditPage() {
  const [entity, setEntity] = useState('')
  const [entityId, setEntityId] = useState('')
  const [action, setAction] = useState('ALL')
  const [take, setTake] = useState(100)
  const [detail, setDetail] = useState<AuditLog | null>(null)

  const query = useMemo<AuditQuery>(
    () => ({
      entity: entity.trim() || undefined,
      entityId: entityId.trim() || undefined,
      action: action === 'ALL' ? undefined : action,
      take,
    }),
    [entity, entityId, action, take],
  )

  const logs = useAuditLogs(query)

  const rows = useMemo(
    () => [...(logs.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [logs.data],
  )

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Waktu',
      cell: (row) => <DateText value={row.createdAt} withTime />,
    },
    {
      key: 'actor',
      header: 'Aktor',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">
            {row.actor?.name ?? row.actor?.email ?? row.actorId}
          </span>
          <span className="text-xs text-foreground/60">
            {row.actor?.email ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      cell: (row) => (
        <span
          className={cn(
            'inline-flex rounded-base px-2 py-0.5 text-xs font-heading',
            ACTION_TONE[row.action] ?? 'bg-secondary-background text-foreground',
          )}
        >
          {row.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entitas',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span>{row.entity}</span>
          <span className="text-xs text-foreground/60">{row.entityId}</span>
        </div>
      ),
    },
    {
      key: 'path',
      header: 'Path',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.path ?? '—',
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Button
          type="button"
          variant="neutral"
          size="icon-sm"
          aria-label="Detail jejak audit"
          onClick={() => setDetail(row)}
        >
          <Eye />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jejak Audit"
        description="Rekaman immutable aksi mutasi Super Admin/Admin Gedung, termasuk ubah role dan keuangan."
      />

      <div className="flex flex-wrap gap-3">
        <Input
          value={entity}
          onChange={(event) => setEntity(event.target.value)}
          placeholder="Entitas, mis. room"
          aria-label="Filter entitas"
          className="w-44 bg-secondary-background"
        />
        <Input
          value={entityId}
          onChange={(event) => setEntityId(event.target.value)}
          placeholder="ID entitas"
          aria-label="Filter ID entitas"
          className="w-52 bg-secondary-background"
        />
        <NativeSelect
          aria-label="Filter aksi"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          className="w-40"
        >
          <NativeSelectOption value="ALL">Semua aksi</NativeSelectOption>
          <NativeSelectOption value="CREATE">Buat</NativeSelectOption>
          <NativeSelectOption value="UPDATE">Ubah</NativeSelectOption>
          <NativeSelectOption value="DELETE">Hapus</NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          aria-label="Jumlah baris"
          value={String(take)}
          onChange={(event) => setTake(Number(event.target.value))}
          className="w-32"
        >
          <NativeSelectOption value="50">50 baris</NativeSelectOption>
          <NativeSelectOption value="100">100 baris</NativeSelectOption>
          <NativeSelectOption value="200">200 baris</NativeSelectOption>
          <NativeSelectOption value="500">500 baris</NativeSelectOption>
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={logs.isLoading}
        error={logs.error ? logs.error.message : undefined}
        onRetry={() => logs.refetch()}
        emptyTitle="Belum ada jejak audit"
        emptyDescription="Aksi mutasi yang tercatat akan muncul di sini."
      />

      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null)
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {detail
                ? `${detail.action} · ${detail.entity}`
                : 'Detail jejak audit'}
            </DialogTitle>
            <DialogDescription>
              {detail
                ? `${detail.actor?.name ?? detail.actor?.email ?? detail.actorId} · ${new Date(detail.createdAt).toLocaleString()} · ${detail.ip ?? 'tanpa IP'}`
                : undefined}
            </DialogDescription>
          </DialogHeader>

          {detail ? (
            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-foreground/60">Path</p>
                <p className="font-heading text-sm">
                  {detail.path ?? '—'}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-foreground/60">Sebelum</p>
                {jsonBlock(detail.before) ?? (
                  <p className="text-sm text-foreground/50">—</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-foreground/60">Sesudah</p>
                {jsonBlock(detail.after) ?? (
                  <p className="text-sm text-foreground/50">—</p>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

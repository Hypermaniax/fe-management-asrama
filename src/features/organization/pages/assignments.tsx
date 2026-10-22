import { useMemo, useState } from 'react'
import { Plus, UserMinus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import type { Assignment } from '@/features/organization/api'
import { AssignmentFormDialog } from '@/features/organization/components/assignment-form-dialog'
import { StructureTab } from '@/features/organization/components/structure-tab'
import {
  useAssignments,
  useEndAssignment,
} from '@/features/organization/hooks'
import { useResidentDirectory } from '@/features/resident/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function AssignmentsPage() {
  const buildings = useBuildings()
  const directory = useResidentDirectory(
    (buildings.data ?? []).map((building) => building.id),
  )
  const end = useEndAssignment()

  const [tab, setTab] = useState('penugasan')
  const [userId, setUserId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [target, setTarget] = useState<Assignment | null>(null)

  const selectedUserId = directory.some((user) => user.id === userId)
    ? userId
    : (directory[0]?.id ?? '')
  const selectedUser = directory.find((user) => user.id === selectedUserId)
  const assignments = useAssignments(selectedUserId)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const confirmEnd = () => {
    if (!target) return
    end.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, target.position.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal mengakhiri penugasan', error),
    })
  }

  const columns: Column<Assignment>[] = [
    {
      key: 'position',
      header: 'Jabatan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">{row.position.name}</span>
          <span className="text-xs text-foreground/60">
            {row.position.code}
          </span>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Periode',
      cell: (row) => row.period.name,
    },
    {
      key: 'scope',
      header: 'Scope',
      cell: (row) =>
        row.buildingId ? (buildingNames.get(row.buildingId) ?? '—') : 'Asrama',
    },
    {
      key: 'start',
      header: 'Mulai',
      cell: (row) => <DateText value={row.startDate} />,
    },
    {
      key: 'end',
      header: 'Selesai',
      cell: (row) =>
        row.endDate ? <DateText value={row.endDate} /> : '—',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) =>
        row.isActive ? (
          <Badge className="bg-accent-teal text-foreground">Aktif</Badge>
        ) : (
          <Badge variant="neutral">Berakhir</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) =>
        row.isActive ? (
          <Can permission="position.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Akhiri ${row.position.name}`}
              onClick={() => setTarget(row)}
            >
              <UserMinus />
            </Button>
          </Can>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Penugasan Pengurus"
        description="Tugaskan pengguna ke jabatan pada periode dan gedung tertentu."
      >
        {tab === 'penugasan' ? (
          <Can permission="position.CREATE">
            <Button
              type="button"
              onClick={() => setFormOpen(true)}
              disabled={!selectedUserId}
            >
              <Plus />
              Tugaskan pengurus
            </Button>
          </Can>
        ) : null}
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="penugasan">Penugasan</TabsTrigger>
          <TabsTrigger value="struktur">Struktur</TabsTrigger>
        </TabsList>

        <TabsContent value="penugasan" className="flex flex-col gap-4 pt-4">
          {directory.length === 0 ? (
            <EmptyState
              title="Belum ada pengguna"
              description="Pengguna terdaftar akan muncul di sini setelah data penghuni tersedia."
            />
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                <NativeSelect
                  aria-label="Pilih pengguna"
                  value={selectedUserId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="w-80"
                >
                  {directory.map((user) => (
                    <NativeSelectOption key={user.id} value={user.id}>
                      {user.name} · {user.email}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <DataTable
                columns={columns}
                data={assignments.data ?? []}
                getRowId={(row) => row.id}
                pageSize={10}
                isLoading={assignments.isLoading}
                error={
                  assignments.error ? assignments.error.message : undefined
                }
                onRetry={() => assignments.refetch()}
                emptyTitle="Belum ada penugasan"
                emptyDescription="Pengguna ini belum ditugaskan pada jabatan mana pun."
                emptyAction={
                  <Can permission="position.CREATE">
                    <Button type="button" onClick={() => setFormOpen(true)}>
                      <Plus />
                      Tugaskan pengurus
                    </Button>
                  </Can>
                }
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="struktur" className="pt-4">
          <StructureTab />
        </TabsContent>
      </Tabs>

      {formOpen && selectedUser ? (
        <AssignmentFormDialog
          key={`${selectedUser.id}-${selectedUser.buildingId ?? 'asrama'}`}
          open
          onOpenChange={setFormOpen}
          defaultUserId={selectedUser.id}
          defaultBuildingId={selectedUser.buildingId ?? ''}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Akhiri penugasan?"
        description={
          target
            ? `Penugasan ${target.position.name} akan diakhiri dan tidak lagi tampil sebagai pemegang jabatan aktif.`
            : undefined
        }
        confirmLabel="Akhiri"
        loading={end.isPending}
        onConfirm={confirmEnd}
      />
    </div>
  )
}

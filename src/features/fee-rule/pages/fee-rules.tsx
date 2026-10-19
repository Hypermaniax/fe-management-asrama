import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { FeeRule } from '@/features/fee-rule/api'
import { FeeRuleFormDialog } from '@/features/fee-rule/components/fee-rule-form-dialog'
import { useDeleteFeeRule, useFeeRules } from '@/features/fee-rule/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function FeeRulesPage() {
  const { data, isLoading, error, refetch } = useFeeRules()
  const buildings = useBuildings()
  const remove = useDeleteFeeRule()

  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [target, setTarget] = useState<FeeRule | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) map.set(building.id, building.name)
    return map
  }, [buildings.data])

  const rules = useMemo(() => {
    if (buildingFilter === 'ALL') return data ?? []
    return (data ?? []).filter((rule) => rule.buildingId === buildingFilter)
  }, [data, buildingFilter])

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Aturan biaya dinonaktifkan')
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menonaktifkan', error),
    })
  }

  const columns: Column<FeeRule>[] = [
    {
      key: 'building',
      header: 'Gedung',
      className: 'font-heading',
      cell: (row) => buildingNames.get(row.buildingId) ?? '—',
    },
    {
      key: 'due',
      header: 'Jatuh tempo',
      cell: (row) => `Tanggal ${row.dueDayOfMonth}`,
    },
    {
      key: 'rate',
      header: 'Tarif default',
      cell: (row) => <CurrencyText value={row.defaultMonthlyRate} />,
    },
    {
      key: 'effective',
      header: 'Berlaku dari',
      cell: (row) => <DateText value={row.effectiveFrom} />,
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Can permission="feeRule.DELETE">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Nonaktifkan aturan"
            onClick={() => setTarget(row)}
          >
            <Trash2 />
          </Button>
        </Can>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Aturan Biaya"
        description="Iuran bulanan per gedung: tanggal jatuh tempo dan tarif default."
      >
        <Can permission="feeRule.CREATE">
          <Button type="button" onClick={() => setFormOpen(true)}>
            <Plus />
            Tambah aturan
          </Button>
        </Can>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter gedung"
          value={buildingFilter}
          onChange={(event) => setBuildingFilter(event.target.value)}
          className="w-48"
        >
          <NativeSelectOption value="ALL">Semua gedung</NativeSelectOption>
          {(buildings.data ?? []).map((building) => (
            <NativeSelectOption key={building.id} value={building.id}>
              {building.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={rules}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada aturan biaya"
        emptyDescription="Tambahkan aturan iuran agar tagihan bulanan bisa di-generate."
        emptyAction={
          <Can permission="feeRule.CREATE">
            <Button type="button" onClick={() => setFormOpen(true)}>
              <Plus />
              Tambah aturan
            </Button>
          </Can>
        }
      />

      <FeeRuleFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Nonaktifkan aturan biaya?"
        description="Aturan ini tidak lagi dipakai untuk generate tagihan baru."
        confirmLabel="Nonaktifkan"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

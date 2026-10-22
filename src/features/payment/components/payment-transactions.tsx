import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import { useBuildings } from '@/features/building/hooks'
import { useCashAccounts } from '@/features/cash-account/hooks'
import type { Payment, PaymentMethod } from '@/features/payment/api'
import { PaymentDetailDialog } from '@/features/payment/components/payment-detail-dialog'
import { usePayments } from '@/features/payment/hooks'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ITEMS,
} from '@/features/payment/lib'
import { useResidentNames } from '@/features/resident/hooks'
import { cn } from '@/lib/utils'

function MethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <Badge
      className={cn(
        'font-heading tracking-wide uppercase',
        method === 'CASH' && 'bg-accent-teal text-foreground',
        method === 'TRANSFER' && 'bg-accent-orange text-foreground',
        method === 'QRIS' && 'bg-background text-foreground',
      )}
    >
      {PAYMENT_METHOD_LABELS[method]}
    </Badge>
  )
}

export function PaymentTransactions() {
  const payments = usePayments()
  const cashAccounts = useCashAccounts()
  const buildings = useBuildings()

  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Payment | null>(null)

  const cashAccountMap = useMemo(() => {
    const map = new Map(
      (cashAccounts.data ?? []).map((account) => [account.id, account]),
    )
    return map
  }, [cashAccounts.data])

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const buildingIds = useMemo(
    () =>
      Array.from(
        new Set((cashAccounts.data ?? []).map((account) => account.buildingId)),
      ).sort(),
    [cashAccounts.data],
  )
  const residentNames = useResidentNames(buildingIds)

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return (payments.data ?? []).filter((payment) => {
      const account = cashAccountMap.get(payment.cashAccountId)
      if (
        buildingFilter !== 'ALL' &&
        account?.buildingId !== buildingFilter
      ) {
        return false
      }
      if (methodFilter !== 'ALL' && payment.method !== methodFilter) {
        return false
      }
      const name = residentNames.get(payment.userId) ?? payment.userId
      if (query && !name.toLowerCase().includes(query)) return false
      return true
    })
  }, [
    payments.data,
    cashAccountMap,
    buildingFilter,
    methodFilter,
    search,
    residentNames,
  ])

  const columns: Column<Payment>[] = [
    {
      key: 'code',
      header: 'Kode',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">{row.code}</span>
          <DateText
            value={row.paidAt}
            withTime
            className="text-xs text-foreground/60"
          />
        </div>
      ),
    },
    {
      key: 'resident',
      header: 'Penghuni',
      cell: (row) => residentNames.get(row.userId) ?? row.userId,
    },
    {
      key: 'amount',
      header: 'Jumlah',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.amount} />,
    },
    {
      key: 'method',
      header: 'Metode',
      cell: (row) => <MethodBadge method={row.method} />,
    },
    {
      key: 'cashAccount',
      header: 'Akun kas',
      cell: (row) => {
        const account = cashAccountMap.get(row.cashAccountId)
        if (!account) return '—'
        return (
          <div className="flex flex-col gap-0.5">
            <span>{account.name}</span>
            <span className="text-xs text-foreground/60">
              {buildingNames.get(account.buildingId) ?? '—'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'allocations',
      header: 'Alokasi',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => row.allocations.length,
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
          aria-label={`Lihat ${row.code}`}
          onClick={() => setSelected(row)}
        >
          <Eye />
        </Button>
      ),
    },
  ]

  const loading = payments.isLoading || cashAccounts.isLoading
  const error = payments.error ?? cashAccounts.error

  return (
    <div className="flex flex-col gap-4">
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

        <NativeSelect
          aria-label="Filter metode"
          value={methodFilter}
          onChange={(event) => setMethodFilter(event.target.value)}
          className="w-40"
        >
          <NativeSelectOption value="ALL">Semua metode</NativeSelectOption>
          {PAYMENT_METHOD_ITEMS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari penghuni..."
          aria-label="Cari penghuni"
          className="w-56 bg-secondary-background"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={loading}
        error={error ? error.message : undefined}
        onRetry={() => {
          payments.refetch()
          cashAccounts.refetch()
        }}
        emptyTitle="Belum ada pembayaran"
        emptyDescription="Pembayaran yang dicatat akan muncul di sini."
      />

      <PaymentDetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        payment={selected}
        residentName={
          selected ? residentNames.get(selected.userId) : undefined
        }
      />
    </div>
  )
}

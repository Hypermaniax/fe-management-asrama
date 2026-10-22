import { useMemo, useState } from 'react'
import { Eye, Plus, Ban } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Invoice, InvoiceQuery, InvoiceStatus } from '@/features/invoice/api'
import { InvoiceDetailDialog } from '@/features/invoice/components/invoice-detail-dialog'
import { InvoiceGenerateDialog } from '@/features/invoice/components/invoice-generate-dialog'
import { useInvoices, useVoidInvoice } from '@/features/invoice/hooks'
import {
  formatPeriod,
  INVOICE_STATUS_LABELS,
  MONTH_ITEMS,
  yearItems,
} from '@/features/invoice/lib'
import { useResidentNames } from '@/features/resident/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useScopeStore } from '@/stores/scope'

const STATUS_ITEMS: { value: InvoiceStatus; label: string }[] = [
  { value: 'ISSUED', label: 'Terbit' },
  { value: 'PARTIAL', label: 'Sebagian' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'OVERDUE', label: 'Tunggakan' },
  { value: 'VOID', label: 'Dibatalkan' },
]

export default function InvoicesPage() {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const buildings = useBuildings()
  const voidMutation = useVoidInvoice()
  const years = yearItems()

  const [buildingFilter, setBuildingFilter] = useState(
    activeBuildingId ?? 'ALL',
  )
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [monthFilter, setMonthFilter] = useState('ALL')

  const [generateOpen, setGenerateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [target, setTarget] = useState<Invoice | null>(null)

  const query = useMemo<InvoiceQuery>(
    () => ({
      buildingId: buildingFilter === 'ALL' ? undefined : buildingFilter,
      status:
        statusFilter === 'ALL' ? undefined : (statusFilter as InvoiceStatus),
      year: yearFilter === 'ALL' ? undefined : Number(yearFilter),
      month: monthFilter === 'ALL' ? undefined : Number(monthFilter),
    }),
    [buildingFilter, statusFilter, yearFilter, monthFilter],
  )

  const { data, isLoading, error, refetch } = useInvoices(query)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const buildingIds = useMemo(
    () =>
      Array.from(new Set((data ?? []).map((invoice) => invoice.buildingId))).sort(),
    [data],
  )
  const residentNames = useResidentNames(buildingIds)

  const confirmVoid = () => {
    if (!target) return
    voidMutation.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, target.code)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal membatalkan tagihan', error),
    })
  }

  const columns: Column<Invoice>[] = [
    {
      key: 'code',
      header: 'Kode',
      className: 'font-mono text-xs',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">{row.code}</span>
          <DateText
            value={row.issuedAt}
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
      key: 'building',
      header: 'Gedung',
      cell: (row) => buildingNames.get(row.buildingId) ?? '—',
    },
    {
      key: 'period',
      header: 'Periode',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span>{formatPeriod(row.periodYear, row.periodMonth)}</span>
          <DateText
            value={row.dueDate}
            className="text-xs text-foreground/60"
          />
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.totalAmount} />,
    },
    {
      key: 'paid',
      header: 'Dibayar',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.paidAmount} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={INVOICE_STATUS_LABELS[row.status]}
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
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label={`Lihat ${row.code}`}
            onClick={() => setDetailId(row.id)}
          >
            <Eye />
          </Button>
          {row.status !== 'VOID' ? (
            <Can permission="invoice.UPDATE">
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label={`Batalkan ${row.code}`}
                onClick={() => setTarget(row)}
              >
                <Ban />
              </Button>
            </Can>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tagihan"
        description="Tagihan bulanan penghuni beserta status pembayarannya."
      >
        <Can permission="invoice.CREATE">
          <Button type="button" onClick={() => setGenerateOpen(true)}>
            <Plus />
            Generate tagihan
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
          aria-label="Filter tahun"
          value={yearFilter}
          onChange={(event) => setYearFilter(event.target.value)}
          className="w-36"
        >
          <NativeSelectOption value="ALL">Semua tahun</NativeSelectOption>
          {years.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          aria-label="Filter bulan"
          value={monthFilter}
          onChange={(event) => setMonthFilter(event.target.value)}
          className="w-40"
        >
          <NativeSelectOption value="ALL">Semua bulan</NativeSelectOption>
          {MONTH_ITEMS.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={isLoading}
        error={error ? error.message : undefined}
        onRetry={() => refetch()}
        emptyTitle="Belum ada tagihan"
        emptyDescription="Generate tagihan bulanan untuk penghuni aktif pada gedung dan periode tertentu."
        emptyAction={
          <Can permission="invoice.CREATE">
            <Button type="button" onClick={() => setGenerateOpen(true)}>
              <Plus />
              Generate tagihan
            </Button>
          </Can>
        }
      />

      <InvoiceGenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
      />

      <InvoiceDetailDialog
        open={Boolean(detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        invoiceId={detailId}
        residentNames={residentNames}
        buildingNames={buildingNames}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Batalkan tagihan?"
        description={
          target
            ? `Tagihan ${target.code} akan dibatalkan. Pembatalan gagal bila sudah ada pembayaran.`
            : undefined
        }
        confirmLabel="Batalkan"
        loading={voidMutation.isPending}
        onConfirm={confirmVoid}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Eye, Wallet } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import type {
  InvoiceStatus,
  MyInvoice,
  MyInvoiceQuery,
} from '@/features/invoice/api'
import { InvoiceDetailDialog } from '@/features/invoice/components/invoice-detail-dialog'
import { useMyInvoices } from '@/features/invoice/hooks'
import {
  formatPeriod,
  INVOICE_STATUS_LABELS,
  MONTH_ITEMS,
  SUBMISSION_STATUS_LABELS,
  yearItems,
} from '@/features/invoice/lib'
import { useAuthStore } from '@/stores/auth'

const STATUS_ITEMS: { value: InvoiceStatus; label: string }[] = [
  { value: 'ISSUED', label: 'Terbit' },
  { value: 'PARTIAL', label: 'Sebagian' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'OVERDUE', label: 'Tunggakan' },
  { value: 'VOID', label: 'Dibatalkan' },
]

export default function MyInvoicesPage() {
  const user = useAuthStore((state) => state.user)
  const years = yearItems()

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [monthFilter, setMonthFilter] = useState('ALL')
  const [detailId, setDetailId] = useState<string | null>(null)

  const query = useMemo<MyInvoiceQuery>(
    () => ({
      status:
        statusFilter === 'ALL' ? undefined : (statusFilter as InvoiceStatus),
      year: yearFilter === 'ALL' ? undefined : Number(yearFilter),
      month: monthFilter === 'ALL' ? undefined : Number(monthFilter),
    }),
    [statusFilter, yearFilter, monthFilter],
  )

  const { data, isLoading, error, refetch } = useMyInvoices(query)

  const residentNames = useMemo(() => {
    const map = new Map<string, string>()
    if (user) map.set(user.id, user.email)
    return map
  }, [user])

  const columns: Column<MyInvoice>[] = [
    {
      key: 'code',
      header: 'Kode',
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
      key: 'submission',
      header: 'Pengajuan',
      cell: (row) => {
        const submission = [...(row.submissions ?? [])].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        )[0]
        if (!submission) return <span className="text-foreground/50">—</span>
        return (
          <StatusBadge
            status={submission.status}
            label={SUBMISSION_STATUS_LABELS[submission.status]}
          />
        )
      },
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
          onClick={() => setDetailId(row.id)}
        >
          <Eye />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tagihan Saya"
        description="Daftar tagihan bulanan dan status pembayarannya."
      >
        <Can permission="payment.CREATE">
          <Link
            to="/app/me/payments"
            className={buttonVariants({ variant: 'neutral' })}
          >
            <Wallet />
            Ajukan pembayaran
          </Link>
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
        emptyDescription="Tagihan bulanan yang diterbitkan untuk Anda akan muncul di sini."
      />

      <InvoiceDetailDialog
        open={Boolean(detailId)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        invoiceId={detailId}
        self
        residentNames={residentNames}
      />
    </div>
  )
}

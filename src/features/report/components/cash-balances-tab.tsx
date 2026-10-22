import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import type { CashBalanceItem } from '@/features/report/api'
import { CashBalanceChart } from '@/features/report/components/report-charts'
import { ReportSummary } from '@/features/report/components/report-summary'
import { useCashBalancesReport } from '@/features/report/hooks'

export function CashBalancesTab({ buildingId }: { buildingId?: string }) {
  const report = useCashBalancesReport(buildingId)
  const items = report.data?.items ?? []

  const columns: Column<CashBalanceItem>[] = [
    {
      key: 'name',
      header: 'Akun kas',
      cell: (row) => <span className="font-heading">{row.name}</span>,
    },
    {
      key: 'type',
      header: 'Tipe',
      cell: (row) => (
        <Badge variant="neutral">
          {row.type === 'BANK' ? 'Bank' : 'Tunai'}
        </Badge>
      ),
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) => row.buildingName,
    },
    {
      key: 'opening',
      header: 'Saldo awal',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.openingBalance} />,
    },
    {
      key: 'in',
      header: 'Masuk',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.totalIn} />,
    },
    {
      key: 'out',
      header: 'Keluar',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText value={row.totalOut} className="text-danger" />
      ),
    },
    {
      key: 'balance',
      header: 'Saldo',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText value={row.balance} className="font-heading" />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <ReportSummary
        items={[
          {
            label: 'Total saldo',
            value: report.data ? (
              <CurrencyText value={report.data.totalBalance} />
            ) : (
              '—'
            ),
            tone: 'teal',
          },
          {
            label: 'Jumlah akun',
            value: report.data?.count ?? '—',
          },
        ]}
      />

      <CashBalanceChart items={items} />

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.cashAccountId}
        isLoading={report.isLoading}
        error={report.error ? report.error.message : undefined}
        onRetry={() => report.refetch()}
        emptyTitle="Belum ada akun kas"
        emptyDescription="Saldo akun kas yang dibuat akan muncul di sini."
      />
    </div>
  )
}

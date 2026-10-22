import { useState } from 'react'
import { Download } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { LoadingButton } from '@/components/shared/loading-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { IncomeExpenseItem } from '@/features/report/api'
import { exportIncomeExpenseCsv } from '@/features/report/api'
import { IncomeExpenseChart } from '@/features/report/components/report-charts'
import { ReportSummary } from '@/features/report/components/report-summary'
import { useIncomeExpenseReport } from '@/features/report/hooks'
import {
  downloadBlob,
  endOfDay,
  startOfDay,
  todayStamp,
} from '@/features/report/lib'
import { notifyError, notifySuccess } from '@/lib/notify'
import { cn } from '@/lib/utils'

export function IncomeExpenseTab({ buildingId }: { buildingId?: string }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState(false)

  const invalidRange = Boolean(from && to && from > to)
  const params = {
    buildingId,
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
  }
  const report = useIncomeExpenseReport(params, !invalidRange)
  const items = report.data?.items ?? []

  const columns: Column<IncomeExpenseItem>[] = [
    {
      key: 'category',
      header: 'Kategori',
      cell: (row) => row.categoryName,
    },
    {
      key: 'direction',
      header: 'Arah',
      cell: (row) => (
        <Badge
          className={cn(
            'font-heading tracking-wide uppercase',
            row.direction === 'IN'
              ? 'bg-accent-teal text-foreground'
              : 'bg-accent-orange text-foreground',
          )}
        >
          {row.direction === 'IN' ? 'Masuk' : 'Keluar'}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText
          value={row.total}
          className={cn(
            'font-heading',
            row.direction === 'IN' ? 'text-foreground' : 'text-danger',
          )}
        />
      ),
    },
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportIncomeExpenseCsv(params)
      downloadBlob(blob, `pemasukan-pengeluaran-${todayStamp()}.csv`)
      notifySuccess('Ekspor laporan dimulai')
    } catch (error) {
      notifyError('Gagal mengekspor laporan', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ReportSummary
        items={[
          {
            label: 'Pemasukan',
            value: report.data ? (
              <CurrencyText value={report.data.income} />
            ) : (
              '—'
            ),
            tone: 'teal',
          },
          {
            label: 'Pengeluaran',
            value: report.data ? (
              <CurrencyText value={report.data.expense} />
            ) : (
              '—'
            ),
            tone: 'orange',
          },
          {
            label: 'Selisih',
            value: report.data ? (
              <CurrencyText value={report.data.net} />
            ) : (
              '—'
            ),
          },
        ]}
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="income-from" className="text-xs text-foreground/60">
            Dari
          </label>
          <Input
            id="income-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="income-to" className="text-xs text-foreground/60">
            Sampai
          </label>
          <Input
            id="income-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-40"
          />
        </div>

        {from || to ? (
          <button
            type="button"
            className="pb-2 text-sm underline underline-offset-4"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
          >
            Reset tanggal
          </button>
        ) : null}

        <Can permission="report.EXPORT">
          <LoadingButton
            type="button"
            variant="neutral"
            className="ml-auto"
            loading={exporting}
            onClick={handleExport}
            disabled={report.isLoading || invalidRange}
          >
            <Download />
            Ekspor CSV
          </LoadingButton>
        </Can>
      </div>

      {invalidRange ? (
        <p className="text-sm text-danger">
          Tanggal "Dari" tidak boleh setelah tanggal "Sampai".
        </p>
      ) : null}

      <IncomeExpenseChart items={items} />

      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => `${row.categoryId ?? row.categoryName}-${row.direction}`}
        isLoading={report.isLoading}
        error={report.error ? report.error.message : undefined}
        onRetry={() => report.refetch()}
        emptyTitle="Belum ada mutasi"
        emptyDescription="Belum ada pemasukan atau pengeluaran pada periode ini."
      />
    </div>
  )
}

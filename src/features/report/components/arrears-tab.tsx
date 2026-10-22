import { useState } from 'react'
import { Download } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { LoadingButton } from '@/components/shared/loading-button'
import { StatusBadge } from '@/components/shared/status-badge'
import { Input } from '@/components/ui/input'
import type { ArrearsItem } from '@/features/report/api'
import { exportArrearsCsv } from '@/features/report/api'
import { ArrearsChart } from '@/features/report/components/report-charts'
import { ReportSummary } from '@/features/report/components/report-summary'
import { useArrearsReport } from '@/features/report/hooks'
import {
  downloadBlob,
  monthLabel,
  todayStamp,
} from '@/features/report/lib'
import { notifyError, notifySuccess } from '@/lib/notify'

export function ArrearsTab({ buildingId }: { buildingId?: string }) {
  const [period, setPeriod] = useState('')
  const [exporting, setExporting] = useState(false)

  const [year, month] = period
    ? period.split('-').map((value) => Number(value))
    : [undefined, undefined]
  const params = {
    buildingId,
    ...(year && month ? { year, month } : {}),
  }

  const report = useArrearsReport(params)

  const columns: Column<ArrearsItem>[] = [
    {
      key: 'code',
      header: 'Kode',
      cell: (row) => <span className="font-heading">{row.code}</span>,
    },
    {
      key: 'user',
      header: 'Penyewa',
      cell: (row) => row.userName ?? '—',
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) => row.buildingName,
    },
    {
      key: 'period',
      header: 'Periode',
      cell: (row) => monthLabel(row.periodYear, row.periodMonth),
    },
    {
      key: 'dueDate',
      header: 'Jatuh tempo',
      cell: (row) => <DateText value={row.dueDate} />,
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
      key: 'outstanding',
      header: 'Tunggakan',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText
          value={row.outstanding}
          className="font-heading text-danger"
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await exportArrearsCsv(params)
      downloadBlob(blob, `tunggakan-${todayStamp()}.csv`)
      notifySuccess('Ekspor tunggakan dimulai')
    } catch (error) {
      notifyError('Gagal mengekspor tunggakan', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ReportSummary
        items={[
          {
            label: 'Total tunggakan',
            value: report.data ? (
              <CurrencyText value={report.data.totalOutstanding} />
            ) : (
              '—'
            ),
            tone: 'danger',
          },
          {
            label: 'Jumlah tagihan',
            value: report.data?.count ?? '—',
            hint: 'Belum lunas',
          },
          {
            label: 'Periode',
            value:
              report.data?.year && report.data.month
                ? monthLabel(report.data.year, report.data.month)
                : 'Semua periode',
          },
        ]}
      />

      <ArrearsChart items={report.data?.items ?? []} />

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="arrears-period" className="text-xs text-foreground/60">
            Periode tagihan
          </label>
          <Input
            id="arrears-period"
            type="month"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="w-48"
          />
        </div>

        {period ? (
          <button
            type="button"
            className="pb-2 text-sm underline underline-offset-4"
            onClick={() => setPeriod('')}
          >
            Semua periode
          </button>
        ) : null}

        <Can permission="report.EXPORT">
          <LoadingButton
            type="button"
            variant="neutral"
            className="ml-auto"
            loading={exporting}
            onClick={handleExport}
            disabled={report.isLoading}
          >
            <Download />
            Ekspor CSV
          </LoadingButton>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={report.data?.items ?? []}
        getRowId={(row) => row.invoiceId}
        pageSize={10}
        isLoading={report.isLoading}
        error={report.error ? report.error.message : undefined}
        onRetry={() => report.refetch()}
        emptyTitle="Tidak ada tunggakan"
        emptyDescription="Semua tagihan pada filter ini sudah lunas."
      />
    </div>
  )
}

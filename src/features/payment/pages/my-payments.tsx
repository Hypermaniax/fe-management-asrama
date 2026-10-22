import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { FileSearch, Upload } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MyInvoice } from '@/features/invoice/api'
import { useMyInvoices } from '@/features/invoice/hooks'
import { formatPeriod } from '@/features/invoice/lib'
import type {
  PaymentSubmission,
  SubmissionStatus,
} from '@/features/payment/api'
import { MyPaymentSubmissionDialog } from '@/features/payment/components/my-payment-submission-dialog'
import { PaymentProofDialog } from '@/features/payment/components/payment-proof-dialog'
import { useMyPaymentSubmissions } from '@/features/payment/hooks'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_SUBMISSION_STATUS_LABELS,
} from '@/features/payment/lib'
import { cn } from '@/lib/utils'

const OUTSTANDING_STATUSES = ['ISSUED', 'PARTIAL', 'OVERDUE']

function latestSubmission(invoice: MyInvoice) {
  return [...(invoice.submissions ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0]
}

export default function MyPaymentsPage() {
  const [tab, setTab] = useState('tagihan')
  const [payTarget, setPayTarget] = useState<MyInvoice | null>(null)
  const [proof, setProof] = useState<PaymentSubmission | null>(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const invoices = useMyInvoices({})
  const history = useMyPaymentSubmissions({
    status:
      statusFilter === 'ALL'
        ? undefined
        : (statusFilter as SubmissionStatus),
  })

  const outstanding = useMemo(
    () =>
      (invoices.data ?? [])
        .filter((invoice) => OUTSTANDING_STATUSES.includes(invoice.status))
        .sort(
          (a, b) =>
            a.periodYear - b.periodYear || a.periodMonth - b.periodMonth,
        ),
    [invoices.data],
  )

  const pendingCount = useMemo(
    () =>
      outstanding.filter(
        (invoice) => latestSubmission(invoice)?.status === 'PENDING',
      ).length,
    [outstanding],
  )

  const invoiceColumns: Column<MyInvoice>[] = [
    {
      key: 'code',
      header: 'Tagihan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">{row.code}</span>
          <span className="text-xs text-foreground/60">
            {formatPeriod(row.periodYear, row.periodMonth)}
          </span>
        </div>
      ),
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
      key: 'remaining',
      header: 'Sisa',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <CurrencyText
          value={Math.max(row.totalAmount - row.paidAmount, 0)}
          className="font-heading"
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => {
        const submission = latestSubmission(row)
        return (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={row.status} />
            {submission ? (
              <StatusBadge
                status={submission.status}
                label={`Pengajuan ${PAYMENT_SUBMISSION_STATUS_LABELS[
                  submission.status
                ].toLowerCase()}`}
              />
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => {
        const submission = latestSubmission(row)
        if (submission?.status === 'PENDING') {
          return (
            <Badge variant="neutral" className="ml-auto">
              Menunggu verifikasi
            </Badge>
          )
        }
        return (
          <Can permission="payment.CREATE">
            <Button
              type="button"
              size="sm"
              onClick={() => setPayTarget(row)}
            >
              <Upload />
              {submission?.status === 'REJECTED' ? 'Ajukan ulang' : 'Ajukan'}
            </Button>
          </Can>
        )
      },
    },
  ]

  const historyColumns: Column<PaymentSubmission>[] = [
    {
      key: 'code',
      header: 'Pengajuan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">{row.code}</span>
          <DateText
            value={row.createdAt}
            withTime
            className="text-xs text-foreground/60"
          />
        </div>
      ),
    },
    {
      key: 'invoice',
      header: 'Tagihan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">
            {row.invoice?.code ?? row.invoiceId}
          </span>
          <span className="text-xs text-foreground/60">
            {row.invoice
              ? formatPeriod(row.invoice.periodYear, row.invoice.periodMonth)
              : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Nominal',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.amount} />,
    },
    {
      key: 'method',
      header: 'Metode',
      cell: (row) => (
        <Badge
          className={cn(
            'font-heading tracking-wide uppercase',
            row.method === 'TRANSFER'
              ? 'bg-accent-orange text-foreground'
              : 'bg-background text-foreground',
          )}
        >
          {PAYMENT_METHOD_LABELS[row.method]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge
            status={row.status}
            label={PAYMENT_SUBMISSION_STATUS_LABELS[row.status]}
          />
          {row.reviewNote ? (
            <span
              className="max-w-48 truncate text-xs text-foreground/60"
              title={row.reviewNote}
            >
              {row.reviewNote}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'proof',
      header: 'Bukti',
      cell: (row) => (
        <Button
          type="button"
          variant="neutral"
          size="sm"
          onClick={() => setProof(row)}
        >
          <FileSearch />
          Lihat
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pembayaran Saya"
        description="Ajukan pembayaran transfer/QRIS dan pantau status verifikasinya."
      >
        <Link
          to="/app/me/invoices"
          className={buttonVariants({ variant: 'neutral' })}
        >
          Lihat semua tagihan
        </Link>
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="tagihan">
            Belum dibayar
            {outstanding.length > 0 ? ` (${outstanding.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="riwayat">
            Riwayat pengajuan
            {pendingCount > 0 ? ` (${pendingCount} menunggu)` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tagihan" className="pt-4">
          <DataTable
            columns={invoiceColumns}
            data={outstanding}
            getRowId={(row) => row.id}
            pageSize={10}
            isLoading={invoices.isLoading}
            error={invoices.error ? invoices.error.message : undefined}
            onRetry={() => invoices.refetch()}
            emptyTitle="Tidak ada tagihan tertunggak"
            emptyDescription="Semua tagihan Anda sudah lunas atau menunggu verifikasi."
          />
        </TabsContent>

        <TabsContent value="riwayat" className="pt-4">
          <div className="flex flex-col gap-4">
            <NativeSelect
              aria-label="Filter status pengajuan"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-44"
            >
              <NativeSelectOption value="ALL">Semua status</NativeSelectOption>
              <NativeSelectOption value="PENDING">Menunggu</NativeSelectOption>
              <NativeSelectOption value="VERIFIED">
                Terverifikasi
              </NativeSelectOption>
              <NativeSelectOption value="REJECTED">Ditolak</NativeSelectOption>
            </NativeSelect>

            <DataTable
              columns={historyColumns}
              data={history.data ?? []}
              getRowId={(row) => row.id}
              pageSize={10}
              isLoading={history.isLoading}
              error={history.error ? history.error.message : undefined}
              onRetry={() => history.refetch()}
              emptyTitle="Belum ada pengajuan"
              emptyDescription="Pengajuan pembayaran yang Anda kirim akan muncul di sini."
            />
          </div>
        </TabsContent>
      </Tabs>

      {payTarget ? (
        <MyPaymentSubmissionDialog
          key={payTarget.id}
          open
          onOpenChange={(open) => {
            if (!open) setPayTarget(null)
          }}
          invoice={payTarget}
        />
      ) : null}

      <PaymentProofDialog
        key={proof?.proofFileId ?? 'none'}
        open={Boolean(proof)}
        onOpenChange={(open) => {
          if (!open) setProof(null)
        }}
        fileId={proof?.proofFileId ?? null}
        title={`Bukti ${proof?.code ?? ''}`}
      />
    </div>
  )
}

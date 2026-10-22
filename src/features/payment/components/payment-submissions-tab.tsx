import { useMemo, useState } from 'react'
import { Check, FileSearch, X } from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { formatPeriod } from '@/features/invoice/lib'
import type {
  PaymentSubmission,
  SubmissionStatus,
} from '@/features/payment/api'
import { PaymentProofDialog } from '@/features/payment/components/payment-proof-dialog'
import { RejectSubmissionDialog } from '@/features/payment/components/reject-submission-dialog'
import { VerifySubmissionDialog } from '@/features/payment/components/verify-submission-dialog'
import { usePaymentSubmissions } from '@/features/payment/hooks'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_SUBMISSION_STATUS_LABELS,
} from '@/features/payment/lib'
import { useCan } from '@/lib/rbac'
import { cn } from '@/lib/utils'

const STATUS_ITEMS: { value: SubmissionStatus; label: string }[] = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'VERIFIED', label: 'Terverifikasi' },
  { value: 'REJECTED', label: 'Ditolak' },
]

export function PaymentSubmissionsTab() {
  const canApprove = useCan('payment.APPROVE')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [search, setSearch] = useState('')
  const [proof, setProof] = useState<PaymentSubmission | null>(null)
  const [verifying, setVerifying] = useState<PaymentSubmission | null>(null)
  const [rejecting, setRejecting] = useState<PaymentSubmission | null>(null)

  const query = usePaymentSubmissions({
    status:
      statusFilter === 'ALL'
        ? undefined
        : (statusFilter as SubmissionStatus),
  })

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return (query.data ?? []).filter((submission) => {
      if (!value) return true
      const name =
        submission.user?.name ?? submission.user?.email ?? submission.userId
      const invoice = submission.invoice?.code ?? submission.invoiceId
      return (
        name.toLowerCase().includes(value) ||
        invoice.toLowerCase().includes(value)
      )
    })
  }, [query.data, search])

  const columns: Column<PaymentSubmission>[] = [
    {
      key: 'user',
      header: 'Warga',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm">
            {row.user?.name ?? row.user?.email ?? row.userId}
          </span>
          <span className="text-xs text-foreground/60">
            {row.user?.email ?? row.userId}
          </span>
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
    {
      key: 'createdAt',
      header: 'Diajukan',
      cell: (row) => <DateText value={row.createdAt} withTime />,
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
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) =>
        row.status === 'PENDING' && canApprove ? (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Verifikasi ${row.code}`}
              onClick={() => setVerifying(row)}
            >
              <Check />
            </Button>
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Tolak ${row.code}`}
              onClick={() => setRejecting(row)}
            >
              <X />
            </Button>
          </div>
        ) : null,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter status pengajuan"
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

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari warga atau tagihan..."
          aria-label="Cari pengajuan"
          className="w-64 bg-secondary-background"
        />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        pageSize={10}
        isLoading={query.isLoading}
        error={query.error ? query.error.message : undefined}
        onRetry={() => query.refetch()}
        emptyTitle={
          statusFilter === 'PENDING'
            ? 'Tidak ada pengajuan menunggu'
            : 'Belum ada pengajuan'
        }
        emptyDescription="Pengajuan pembayaran warga akan muncul di sini untuk diverifikasi."
      />

      <PaymentProofDialog
        key={proof?.proofFileId ?? 'none'}
        open={Boolean(proof)}
        onOpenChange={(open) => {
          if (!open) setProof(null)
        }}
        fileId={proof?.proofFileId ?? null}
        title={`Bukti ${proof?.code ?? ''}`}
      />

      {verifying ? (
        <VerifySubmissionDialog
          key={verifying.id}
          open
          onOpenChange={(open) => {
            if (!open) setVerifying(null)
          }}
          submission={verifying}
        />
      ) : null}

      {rejecting ? (
        <RejectSubmissionDialog
          key={rejecting.id}
          open
          onOpenChange={(open) => {
            if (!open) setRejecting(null)
          }}
          submission={rejecting}
        />
      ) : null}
    </div>
  )
}

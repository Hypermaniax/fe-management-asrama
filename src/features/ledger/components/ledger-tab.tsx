import { useMemo, useState } from 'react'
import { Plus, RotateCcw } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { useCashAccountBalances, useCashAccounts } from '@/features/cash-account/hooks'
import { useCategories } from '@/features/category/hooks'
import type { LedgerEntry } from '@/features/ledger/api'
import { LedgerIncomeDialog } from '@/features/ledger/components/ledger-income-dialog'
import { LedgerReversalDialog } from '@/features/ledger/components/ledger-reversal-dialog'
import { useLedger } from '@/features/ledger/hooks'
import { entryDate, ledgerSourceLabel } from '@/features/ledger/lib'
import { cn, formatRupiah } from '@/lib/utils'

type LedgerRow = {
  entry: LedgerEntry
  balance: number
}

export function LedgerTab() {
  const accountsQuery = useCashAccounts()
  const categories = useCategories()

  const [accountId, setAccountId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [reversalTarget, setReversalTarget] = useState<LedgerEntry | null>(null)

  const accounts = accountsQuery.data ?? []
  const selectedId = accountId || accounts[0]?.id || ''
  const selectedAccount = accounts.find((account) => account.id === selectedId)

  const ledger = useLedger(
    { cashAccountId: selectedId || undefined },
    Boolean(selectedId),
  )
  const { balances, loading: balanceLoading } = useCashAccountBalances(
    useMemo(() => (selectedId ? [selectedId] : []), [selectedId]),
  )
  const balance = balances.get(selectedId)

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const category of categories.data ?? []) {
      map.set(category.id, category.name)
    }
    return map
  }, [categories.data])

  const rows = useMemo<LedgerRow[]>(() => {
    const chronological = [...(ledger.data ?? [])].sort(
      (a, b) =>
        a.occurredAt.localeCompare(b.occurredAt) ||
        a.createdAt.localeCompare(b.createdAt),
    )
    const hasOpeningEntry = chronological.some(
      (entry) => entry.sourceType === 'OPENING',
    )
    let running = hasOpeningEntry ? 0 : (balance?.openingBalance ?? 0)

    const withBalance = chronological.map((entry) => {
      running += entry.direction === 'IN' ? entry.amount : -entry.amount
      return { entry, balance: running }
    })

    return withBalance
      .filter(({ entry }) => {
        const date = entryDate(entry.occurredAt)
        if (from && date < from) return false
        if (to && date > to) return false
        return true
      })
      .reverse()
  }, [ledger.data, balance?.openingBalance, from, to])

  const reversedIds = useMemo(() => {
    const set = new Set<string>()
    for (const entry of ledger.data ?? []) {
      if (entry.sourceType === 'REVERSAL' && entry.sourceId) {
        set.add(entry.sourceId)
      }
    }
    return set
  }, [ledger.data])

  const columns: Column<LedgerRow>[] = [
    {
      key: 'date',
      header: 'Tanggal',
      cell: ({ entry }) => (
        <div className="flex flex-col gap-0.5">
          <DateText value={entry.occurredAt} />
          <span className="text-xs text-foreground/60">
            {ledgerSourceLabel(entry.sourceType)}
          </span>
        </div>
      ),
    },
    {
      key: 'direction',
      header: 'Tipe',
      cell: ({ entry }) => (
        <Badge
          className={cn(
            'font-heading tracking-wide uppercase',
            entry.direction === 'IN'
              ? 'bg-accent-teal text-foreground'
              : 'bg-accent-orange text-foreground',
          )}
        >
          {entry.direction === 'IN' ? 'Masuk' : 'Keluar'}
        </Badge>
      ),
    },
    {
      key: 'description',
      header: 'Keterangan',
      className: 'max-w-xs',
      cell: ({ entry }) => (
        <div className="flex flex-col gap-0.5">
          <span>{entry.description || '—'}</span>
          <span className="text-xs text-foreground/60">
            {categoryNames.get(entry.categoryId ?? '') ?? 'Tanpa kategori'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Jumlah',
      headClassName: 'text-right',
      className: 'text-right',
      cell: ({ entry }) => (
        <span
          className={cn(
            'font-heading tabular-nums',
            entry.direction === 'IN' ? 'text-foreground' : 'text-danger',
          )}
        >
          {entry.direction === 'IN' ? '+' : '−'}
          {formatRupiah(entry.amount)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Saldo',
      headClassName: 'text-right',
      className: 'text-right',
      cell: ({ balance }) => <CurrencyText value={balance} />,
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: ({ entry }) => {
        if (entry.sourceType === 'REVERSAL') {
          return (
            <Badge variant="neutral" className="ml-auto">
              Reversal
            </Badge>
          )
        }
        if (reversedIds.has(entry.id)) {
          return (
            <Badge variant="neutral" className="ml-auto">
              Dibalik
            </Badge>
          )
        }
        return (
          <Can permission="cash.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label="Balik entri"
              onClick={() => setReversalTarget(entry)}
            >
              <RotateCcw />
            </Button>
          </Can>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard
          label="Saldo awal"
          value={balance?.openingBalance}
          loading={balanceLoading}
        />
        <BalanceCard
          label="Total masuk"
          value={balance?.totalIn}
          loading={balanceLoading}
        />
        <BalanceCard
          label="Total keluar"
          value={balance?.totalOut}
          loading={balanceLoading}
        />
        <BalanceCard
          label="Saldo saat ini"
          value={balance?.balance}
          loading={balanceLoading}
          emphasis
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <NativeSelect
          aria-label="Pilih akun kas"
          value={selectedId}
          onChange={(event) => setAccountId(event.target.value)}
          className="w-56"
          disabled={accountsQuery.isLoading || accounts.length === 0}
        >
          {accounts.length === 0 ? (
            <NativeSelectOption value="">Belum ada akun kas</NativeSelectOption>
          ) : null}
          {accounts.map((account) => (
            <NativeSelectOption key={account.id} value={account.id}>
              {account.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <div className="flex flex-col gap-1">
          <label htmlFor="ledger-from" className="text-xs text-foreground/60">
            Dari
          </label>
          <Input
            id="ledger-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="ledger-to" className="text-xs text-foreground/60">
            Sampai
          </label>
          <Input
            id="ledger-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-40"
          />
        </div>

        {from || to ? (
          <Button
            type="button"
            variant="neutral"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
          >
            Reset tanggal
          </Button>
        ) : null}

        <div className="ml-auto">
          <Can permission="cash.CREATE">
            <Button
              type="button"
              onClick={() => setIncomeOpen(true)}
              disabled={!selectedAccount}
            >
              <Plus />
              Catat pemasukan
            </Button>
          </Can>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.entry.id}
        pageSize={15}
        isLoading={ledger.isLoading || accountsQuery.isLoading}
        error={
          ledger.error
            ? ledger.error.message
            : accountsQuery.error
              ? accountsQuery.error.message
              : undefined
        }
        onRetry={() => ledger.refetch()}
        emptyTitle={
          accounts.length === 0 ? 'Belum ada akun kas' : 'Belum ada mutasi'
        }
        emptyDescription={
          accounts.length === 0
            ? 'Tambahkan akun kas terlebih dahulu di tab Akun Kas.'
            : 'Mutasi pembayaran, pengeluaran, dan penyesuaian akan muncul di sini.'
        }
      />

      {incomeOpen && selectedAccount ? (
        <LedgerIncomeDialog
          key={selectedAccount.id}
          open
          onOpenChange={setIncomeOpen}
          cashAccount={selectedAccount}
        />
      ) : null}

      {reversalTarget ? (
        <LedgerReversalDialog
          key={reversalTarget.id}
          open
          onOpenChange={(open) => {
            if (!open) setReversalTarget(null)
          }}
          entry={reversalTarget}
        />
      ) : null}
    </div>
  )
}

function BalanceCard({
  label,
  value,
  loading,
  emphasis = false,
}: {
  label: string
  value?: number
  loading: boolean
  emphasis?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-base border-2 border-border p-4',
        emphasis ? 'bg-accent-teal text-foreground' : 'bg-secondary-background',
      )}
    >
      <span className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </span>
      {loading ? (
        <Skeleton className="h-6 w-28 border-transparent bg-foreground/10" />
      ) : value === undefined ? (
        <span className="font-heading text-lg">—</span>
      ) : (
        <CurrencyText value={value} className="font-heading text-lg" />
      )}
    </div>
  )
}

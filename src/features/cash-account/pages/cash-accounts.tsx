import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { CurrencyText } from '@/components/shared/currency-text'
import { DataTable, type Column } from '@/components/shared/data-table'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import type { CashAccount } from '@/features/cash-account/api'
import { CashAccountFormDialog } from '@/features/cash-account/components/cash-account-form-dialog'
import {
  useCashAccountBalances,
  useCashAccounts,
  useDeleteCashAccount,
} from '@/features/cash-account/hooks'
import { LedgerTab } from '@/features/ledger/components/ledger-tab'
import { notifyError, notifySuccess } from '@/lib/notify'
import { cn } from '@/lib/utils'

function TypeBadge({ type }: { type: CashAccount['type'] }) {
  const bank = type === 'BANK'
  return (
    <Badge
      className={cn(
        'font-heading tracking-wide uppercase',
        bank
          ? 'bg-background text-foreground'
          : 'bg-accent-teal text-foreground',
      )}
    >
      {bank ? 'Bank' : 'Tunai'}
    </Badge>
  )
}

export default function CashAccountsPage() {
  const { data, isLoading, error, refetch } = useCashAccounts()
  const buildings = useBuildings()
  const remove = useDeleteCashAccount()

  const [tab, setTab] = useState('akun')
  const [buildingFilter, setBuildingFilter] = useState('ALL')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CashAccount | null>(null)
  const [target, setTarget] = useState<CashAccount | null>(null)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const accounts = useMemo(() => {
    if (buildingFilter === 'ALL') return data ?? []
    return (data ?? []).filter(
      (account) => account.buildingId === buildingFilter,
    )
  }, [data, buildingFilter])

  const { balances, loading: balancesLoading } = useCashAccountBalances(
    useMemo(() => accounts.map((account) => account.id), [accounts]),
  )

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (account: CashAccount) => {
    setEditing(account)
    setFormOpen(true)
  }

  const confirmDelete = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Akun kas dihapus', target.name)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal menghapus akun kas', error),
    })
  }

  const columns: Column<CashAccount>[] = [
    {
      key: 'name',
      header: 'Akun',
      className: 'font-heading',
      cell: (row) => row.name,
    },
    {
      key: 'building',
      header: 'Gedung',
      cell: (row) => buildingNames.get(row.buildingId) ?? '—',
    },
    {
      key: 'type',
      header: 'Tipe',
      cell: (row) => <TypeBadge type={row.type} />,
    },
    {
      key: 'openingBalance',
      header: 'Saldo awal',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => <CurrencyText value={row.openingBalance} />,
    },
    {
      key: 'totalIn',
      header: 'Masuk',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => {
        const balance = balances.get(row.id)
        if (!balance) return <BalancePlaceholder loading={balancesLoading} />
        return <CurrencyText value={balance.totalIn} />
      },
    },
    {
      key: 'totalOut',
      header: 'Keluar',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => {
        const balance = balances.get(row.id)
        if (!balance) return <BalancePlaceholder loading={balancesLoading} />
        return <CurrencyText value={balance.totalOut} />
      },
    },
    {
      key: 'balance',
      header: 'Saldo',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => {
        const balance = balances.get(row.id)
        if (!balance) return <BalancePlaceholder loading={balancesLoading} />
        return (
          <CurrencyText value={balance.balance} className="font-heading" />
        )
      },
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Can permission="cash.UPDATE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Ubah ${row.name}`}
              onClick={() => openEdit(row)}
            >
              <Pencil />
            </Button>
          </Can>
          <Can permission="cash.DELETE">
            <Button
              type="button"
              variant="neutral"
              size="icon-sm"
              aria-label={`Hapus ${row.name}`}
              onClick={() => setTarget(row)}
            >
              <Trash2 />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kas"
        description="Akun kas, saldo, dan buku besar mutasi per gedung."
      >
        {tab === 'akun' ? (
          <Can permission="cash.CREATE">
            <Button type="button" onClick={openCreate}>
              <Plus />
              Tambah akun
            </Button>
          </Can>
        ) : null}
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="akun">Akun Kas</TabsTrigger>
          <TabsTrigger value="buku">Buku Kas</TabsTrigger>
        </TabsList>

        <TabsContent value="akun" className="flex flex-col gap-6 pt-4">
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
            data={accounts}
            getRowId={(row) => row.id}
            pageSize={10}
            isLoading={isLoading}
            error={error ? error.message : undefined}
            onRetry={() => refetch()}
            emptyTitle="Belum ada akun kas"
            emptyDescription="Tambahkan akun kas untuk mencatat pemasukan dan pengeluaran gedung."
            emptyAction={
              <Can permission="cash.CREATE">
                <Button type="button" onClick={openCreate}>
                  <Plus />
                  Tambah akun
                </Button>
              </Can>
            }
          />
        </TabsContent>

        <TabsContent value="buku" className="pt-4">
          <LedgerTab />
        </TabsContent>
      </Tabs>

      <CashAccountFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        cashAccount={editing}
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Hapus akun kas?"
        description={
          target
            ? `Akun ${target.name} akan dihapus. Penghapusan gagal bila akun sudah memiliki mutasi kas.`
            : undefined
        }
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function BalancePlaceholder({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <Skeleton className="ml-auto h-4 w-20 border-transparent bg-foreground/10" />
    )
  }
  return <span className="text-foreground/50">—</span>
}

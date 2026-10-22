import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { EmptyState } from '@/components/shared/empty-state'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type {
  ArrearsItem,
  CashBalanceItem,
  IncomeExpenseItem,
} from '@/features/report/api'
import { formatRupiah } from '@/lib/utils'

const chartConfig = {
  total: { label: 'Total' },
} satisfies ChartConfig

type ChartRow = {
  name: string
  total: number
  fill: string
}

function CategoryBarChart({
  rows,
  emptyTitle,
  emptyDescription,
}: {
  rows: ChartRow[]
  emptyTitle: string
  emptyDescription: string
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => formatRupiah(Number(value))}
            />
          }
        />
        <Bar dataKey="total" radius={4}>
          {rows.map((row, index) => (
            <Cell key={`${row.name}-${index}`} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function ArrearsChart({ items }: { items: ArrearsItem[] }) {
  const totals = new Map<string, number>()
  for (const item of items) {
    totals.set(
      item.buildingName,
      (totals.get(item.buildingName) ?? 0) + item.outstanding,
    )
  }
  const rows = [...totals.entries()].map(([name, total]) => ({
    name,
    total,
    fill: 'var(--chart-2)',
  }))

  return (
    <div className="rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <h2 className="mb-4 font-heading text-lg">Tunggakan per gedung</h2>
      <CategoryBarChart
        rows={rows}
        emptyTitle="Tidak ada tunggakan"
        emptyDescription="Semua tagihan pada filter ini sudah lunas."
      />
    </div>
  )
}

export function IncomeExpenseChart({ items }: { items: IncomeExpenseItem[] }) {
  const rows = items.map((item) => ({
    name: item.categoryName,
    total: item.total,
    fill: item.direction === 'IN' ? 'var(--chart-1)' : 'var(--chart-2)',
  }))

  return (
    <div className="rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <h2 className="mb-4 font-heading text-lg">Rincian per kategori</h2>
      <CategoryBarChart
        rows={rows}
        emptyTitle="Belum ada mutasi"
        emptyDescription="Belum ada pemasukan atau pengeluaran pada periode ini."
      />
    </div>
  )
}

export function CashBalanceChart({ items }: { items: CashBalanceItem[] }) {
  const rows = items.map((item) => ({
    name: item.name,
    total: item.balance,
    fill: 'var(--chart-1)',
  }))

  return (
    <div className="rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <h2 className="mb-4 font-heading text-lg">Saldo per akun</h2>
      <CategoryBarChart
        rows={rows}
        emptyTitle="Belum ada akun kas"
        emptyDescription="Saldo akun kas yang dibuat akan muncul di sini."
      />
    </div>
  )
}

export function EventBudgetChart({
  budget,
  realized,
}: {
  budget: number
  realized: number
}) {
  const rows = [
    { name: 'Anggaran', total: budget, fill: 'var(--chart-3)' },
    { name: 'Realisasi', total: realized, fill: 'var(--chart-1)' },
  ]

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={96}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => formatRupiah(Number(value))}
            />
          }
        />
        <Bar dataKey="total" radius={4}>
          {rows.map((row) => (
            <Cell key={row.name} fill={row.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

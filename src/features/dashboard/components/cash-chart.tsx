import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { CurrencyText } from '@/components/shared/currency-text'
import { EmptyState } from '@/components/shared/empty-state'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { IncomeVsExpense } from '@/features/dashboard/api'
import { formatRupiah } from '@/lib/utils'

const chartConfig = {
  total: { label: 'Total' },
  income: { label: 'Pemasukan', color: 'var(--chart-1)' },
  expense: { label: 'Pengeluaran', color: 'var(--chart-2)' },
} satisfies ChartConfig

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-foreground/70">{label}</span>
      <CurrencyText
        value={value}
        className={`font-heading text-lg ${tone}`}
      />
    </div>
  )
}

export function CashChart({ data }: { data: IncomeVsExpense }) {
  const rows = data.items.map((item) => ({
    name: item.categoryName,
    total: item.total,
    fill: item.direction === 'IN' ? 'var(--chart-1)' : 'var(--chart-2)',
  }))

  return (
    <div className="flex flex-col gap-5 rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Arus kas periode ini</span>
          <h2 className="mt-2 font-heading text-xl">Pemasukan vs pengeluaran</h2>
        </div>
        <div className="flex flex-wrap gap-6">
          <SummaryStat label="Pemasukan" value={data.income} tone="text-main" />
          <SummaryStat label="Pengeluaran" value={data.expense} tone="text-danger" />
          <SummaryStat label="Selisih" value={data.net} tone="text-foreground" />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada mutasi"
          description="Belum ada pemasukan atau pengeluaran pada periode ini."
        />
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
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
      )}
    </div>
  )
}

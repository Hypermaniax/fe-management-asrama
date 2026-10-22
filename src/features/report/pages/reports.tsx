import { useState } from 'react'

import { PageHeader } from '@/components/shared/page-header'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import { ArrearsTab } from '@/features/report/components/arrears-tab'
import { CashBalancesTab } from '@/features/report/components/cash-balances-tab'
import { EventBudgetTab } from '@/features/report/components/event-budget-tab'
import { IncomeExpenseTab } from '@/features/report/components/income-expense-tab'

export default function ReportsPage() {
  const buildings = useBuildings()
  const [buildingId, setBuildingId] = useState('ALL')
  const filter = buildingId === 'ALL' ? undefined : buildingId

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Laporan Keuangan"
        description="Tunggakan, saldo kas, arus pemasukan–pengeluaran, dan realisasi anggaran kegiatan."
      />

      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Filter gedung"
          value={buildingId}
          onChange={(event) => setBuildingId(event.target.value)}
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

      <Tabs defaultValue="arrears">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="arrears">Tunggakan</TabsTrigger>
          <TabsTrigger value="cash">Saldo Kas</TabsTrigger>
          <TabsTrigger value="income">Pemasukan vs Pengeluaran</TabsTrigger>
          <TabsTrigger value="budget">Anggaran Kegiatan</TabsTrigger>
        </TabsList>

        <TabsContent value="arrears" className="pt-4">
          <ArrearsTab buildingId={filter} />
        </TabsContent>

        <TabsContent value="cash" className="pt-4">
          <CashBalancesTab buildingId={filter} />
        </TabsContent>

        <TabsContent value="income" className="pt-4">
          <IncomeExpenseTab buildingId={filter} />
        </TabsContent>

        <TabsContent value="budget" className="pt-4">
          <EventBudgetTab buildingId={filter} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import { yearItems } from '@/features/invoice/lib'
import { PaymentFormDialog } from '@/features/payment/components/payment-form-dialog'
import { PaymentMatrix } from '@/features/payment/components/payment-matrix'
import { PaymentSubmissionsTab } from '@/features/payment/components/payment-submissions-tab'
import { PaymentTransactions } from '@/features/payment/components/payment-transactions'
import { usePaymentSubmissions } from '@/features/payment/hooks'
import { useCan } from '@/lib/rbac'
import { useScopeStore } from '@/stores/scope'

type Prefill = {
  buildingId: string
  userId?: string
  invoiceId?: string
}

export default function PaymentsPage() {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const buildings = useBuildings()
  const canRecord = useCan('payment.APPROVE')
  const years = yearItems()

  const [tab, setTab] = useState('rekap')
  const [buildingId, setBuildingId] = useState(activeBuildingId ?? '')
  const [year, setYear] = useState(() => String(new Date().getFullYear()))
  const [formOpen, setFormOpen] = useState(false)
  const [prefill, setPrefill] = useState<Prefill | null>(null)
  const pending = usePaymentSubmissions({ status: 'PENDING' })
  const pendingCount = pending.data?.length ?? 0

  const selectedBuildingId =
    buildingId || buildings.data?.[0]?.id || activeBuildingId || ''

  const openForm = (values?: Prefill) => {
    setPrefill(
      values ?? {
        buildingId: selectedBuildingId,
      },
    )
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pembayaran"
        description="Catat pembayaran dan pantau status pembayaran bulanan penghuni."
      >
        <Can permission="payment.APPROVE">
          <Button type="button" onClick={() => openForm()}>
            <Plus />
            Catat pembayaran
          </Button>
        </Can>
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rekap">Rekap</TabsTrigger>
          <TabsTrigger value="transaksi">Transaksi</TabsTrigger>
          <TabsTrigger value="pengajuan">
            Pengajuan
            {pendingCount > 0 ? ` (${pendingCount})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rekap" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <NativeSelect
              aria-label="Pilih gedung"
              value={selectedBuildingId}
              onChange={(event) => setBuildingId(event.target.value)}
              className="w-48"
            >
              {(buildings.data ?? []).length === 0 ? (
                <NativeSelectOption value="">Belum ada gedung</NativeSelectOption>
              ) : null}
              {(buildings.data ?? []).map((building) => (
                <NativeSelectOption key={building.id} value={building.id}>
                  {building.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <NativeSelect
              aria-label="Pilih tahun"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="w-32"
            >
              {years.map((item) => (
                <NativeSelectOption key={item.value} value={item.value}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <PaymentMatrix
            buildingId={selectedBuildingId}
            year={Number(year)}
            canRecord={canRecord}
            onRecord={(values) =>
              openForm({
                buildingId: selectedBuildingId,
                userId: values.userId,
                invoiceId: values.invoiceId,
              })
            }
          />
        </TabsContent>

        <TabsContent value="transaksi" className="pt-4">
          <PaymentTransactions />
        </TabsContent>

        <TabsContent value="pengajuan" className="pt-4">
          <PaymentSubmissionsTab />
        </TabsContent>
      </Tabs>

      {formOpen ? (
        <PaymentFormDialog
          key={`${prefill?.buildingId ?? ''}:${prefill?.userId ?? ''}:${
            prefill?.invoiceId ?? ''
          }`}
          open={formOpen}
          onOpenChange={setFormOpen}
          initialBuildingId={prefill?.buildingId}
          initialUserId={prefill?.userId}
          initialInvoiceId={prefill?.invoiceId}
        />
      ) : null}
    </div>
  )
}

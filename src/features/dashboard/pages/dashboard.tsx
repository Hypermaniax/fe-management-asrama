import { useMemo } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ReceiptText,
  Vote,
  Wallet,
} from 'lucide-react'

import { CurrencyText } from '@/components/shared/currency-text'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { buttonVariants } from '@/components/ui/button'
import { ActiveElectionCard } from '@/features/dashboard/components/active-election-card'
import { ArrearsList } from '@/features/dashboard/components/arrears-list'
import { AttendanceList } from '@/features/dashboard/components/attendance-list'
import { CashChart } from '@/features/dashboard/components/cash-chart'
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton'
import { MyInvoices } from '@/features/dashboard/components/my-invoices'
import { Panel } from '@/features/dashboard/components/panel'
import { StatCard } from '@/features/dashboard/components/stat-card'
import { UpcomingEvents } from '@/features/dashboard/components/upcoming-events'
import { currentPeriod, outstandingInvoices, upcomingOnly } from '@/features/dashboard/lib'
import {
  useArrears,
  useCashBalances,
  useDashboardEvents,
  useIncomeVsExpense,
  useMyAttendance,
  useMyInvoices,
  useOpenElections,
} from '@/features/dashboard/hooks'
import { useCan } from '@/lib/rbac'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useScopeStore } from '@/stores/scope'

function PanelAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className={cn(buttonVariants({ variant: 'neutral', size: 'sm' }))}
    >
      {label}
      <ArrowRight />
    </Link>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)

  const isManagement = useCan('report.READ')
  const canEvents = useCan('event.READ')
  const canElections = useCan('election.READ')
  const canInvoices = useCan('invoice.READ')

  const period = useMemo(() => currentPeriod(), [])

  const arrears = useArrears(
    { buildingId: activeBuildingId ?? undefined, year: period.year, month: period.month },
    isManagement,
  )
  const cash = useCashBalances(activeBuildingId ?? undefined, isManagement)
  const income = useIncomeVsExpense(
    { buildingId: activeBuildingId ?? undefined, from: period.from, to: period.to },
    isManagement,
  )
  const events = useDashboardEvents(isManagement || canEvents)
  const elections = useOpenElections(isManagement || canElections)
  const attendance = useMyAttendance(canEvents)
  const invoices = useMyInvoices(canInvoices)

  const primaryQueries = isManagement
    ? [arrears, cash, income]
    : canEvents || canElections || canInvoices
      ? [invoices]
      : []

  const isLoading = primaryQueries.some((query) => query.isPending)
  const error = primaryQueries.find((query) => query.error)?.error

  const upcoming = useMemo(
    () => upcomingOnly(events.data ?? [], isManagement ? 4 : 5),
    [events.data, isManagement],
  )

  const outstanding = useMemo(
    () => outstandingInvoices(invoices.data ?? []),
    [invoices.data],
  )
  const outstandingTotal = useMemo(
    () =>
      outstanding.reduce(
        (sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount),
        0,
      ),
    [outstanding],
  )

  const openElections = elections.data ?? []
  const attendanceItems = attendance.data ?? []

  if (isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Ringkasan operasional asrama." />
        <DashboardSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" description="Ringkasan operasional asrama." />
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => primaryQueries.forEach((query) => query.refetch())}
        />
      </>
    )
  }

  if (isManagement) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Dashboard"
          description="Ringkasan keuangan dan kegiatan asrama."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tunggakan bulan ini"
            icon={ReceiptText}
            tone="orange"
            value={
              <CurrencyText value={arrears.data?.totalOutstanding ?? 0} />
            }
            hint={`${arrears.data?.count ?? 0} tagihan belum lunas`}
          />
          <StatCard
            label="Saldo kas"
            icon={Wallet}
            value={<CurrencyText value={cash.data?.totalBalance ?? 0} />}
            hint={`${cash.data?.count ?? 0} akun kas`}
          />
          <StatCard
            label="Kegiatan terdekat"
            icon={CalendarDays}
            value={upcoming.length}
            hint={
              upcoming[0]
                ? new Date(upcoming[0].startAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Belum ada jadwal'
            }
          />
          <StatCard
            label="Pemilihan aktif"
            icon={Vote}
            tone="ink"
            value={openElections.length}
            hint={openElections[0]?.title ?? 'Tidak ada pemilihan dibuka'}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {income.data ? (
            <CashChart data={income.data} />
          ) : (
            <Panel label="Arus kas" title="Pemasukan vs pengeluaran">
              <EmptyState
                title="Belum ada data keuangan bulan ini"
                description="Mutasi kas akan tampil di sini setelah ada transaksi."
              />
            </Panel>
          )}
          <Panel
            label="Keuangan"
            title="Tunggakan bulan ini"
            action={
              <PanelAction to="/app/finance/invoices" label="Lihat tagihan" />
            }
          >
            <ArrearsList items={arrears.data?.items ?? []} />
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            label="Kegiatan"
            title="Kegiatan terdekat"
            action={<PanelAction to="/app/events" label="Semua kegiatan" />}
          >
            <UpcomingEvents events={upcoming} />
          </Panel>
          <Panel
            label="Pemilihan"
            title="Pemilihan aktif"
            action={
              <PanelAction to="/app/elections" label="Kelola pemilihan" />
            }
          >
            <ActiveElectionCard
              elections={openElections}
              to={
                openElections[0]
                  ? `/app/elections/${openElections[0].id}`
                  : '/app/elections'
              }
            />
          </Panel>
        </div>
      </div>
    )
  }

  if (canEvents || canElections || canInvoices) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Dashboard"
          description="Ringkasan tagihan, kegiatan, dan absensimu."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tagihan belum bayar"
            icon={ReceiptText}
            tone="orange"
            value={<CurrencyText value={outstandingTotal} />}
            hint={`${outstanding.length} tagihan`}
          />
          <StatCard
            label="Kegiatan terdekat"
            icon={CalendarDays}
            value={upcoming.length}
            hint={
              upcoming[0]
                ? new Date(upcoming[0].startAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Belum ada jadwal'
            }
          />
          <StatCard
            label="Absensi hadir"
            icon={ClipboardCheck}
            value={attendanceItems.filter((item) => item.status === 'HADIR').length}
            hint="Sepanjang tercatat"
          />
          <StatCard
            label="Pemilihan aktif"
            icon={Vote}
            tone="ink"
            value={openElections.length}
            hint={openElections[0]?.title ?? 'Tidak ada pemilihan dibuka'}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            label="Tagihan"
            title="Tagihan saya"
            action={<PanelAction to="/app/me/invoices" label="Lihat semua" />}
          >
            <MyInvoices items={outstanding} />
          </Panel>
          <Panel
            label="Absensi"
            title="Absensi terakhir"
            action={
              <PanelAction to="/app/me/attendance" label="Lihat semua" />
            }
          >
            <AttendanceList items={attendanceItems} />
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            label="Kegiatan"
            title="Kegiatan terdekat"
            action={<PanelAction to="/app/events" label="Semua kegiatan" />}
          >
            <UpcomingEvents events={upcoming} />
          </Panel>
          <Panel
            label="Pemilihan"
            title="Pemilihan aktif"
            action={<PanelAction to="/app/me/elections" label="Lihat pemilihan" />}
          >
            <ActiveElectionCard
              elections={openElections}
              to="/app/me/elections"
            />
          </Panel>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Selamat datang di portal asrama."
      />
      <div className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-6 shadow-shadow">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-base border-2 border-border bg-accent-teal text-foreground">
            <FileText className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-xl">Lengkapi pendaftaranmu</h2>
            <p className="max-w-xl text-sm text-foreground/80">
              Akun <span className="font-heading">{user?.email}</span> sudah
              terdaftar sebagai calon penghuni. Unggah dokumen persyaratan agar
              pendaftaran dapat diproses pengurus.
            </p>
          </div>
        </div>
        <Link
          to="/app/me/documents"
          className={cn(buttonVariants({ size: 'sm' }), 'w-fit')}
        >
          Unggah dokumen
          <ArrowRight />
        </Link>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'

import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Progress } from '@/components/ui/progress'
import {
  useEventBudgetReport,
  useReportEvents,
} from '@/features/report/hooks'
import { EventBudgetChart } from '@/features/report/components/report-charts'
import { ReportSummary } from '@/features/report/components/report-summary'
import { cn } from '@/lib/utils'

export function EventBudgetTab({ buildingId }: { buildingId?: string }) {
  const events = useReportEvents()
  const [eventId, setEventId] = useState('')

  const eventOptions = useMemo(
    () =>
      (events.data ?? []).filter(
        (event) => !buildingId || event.buildingId === buildingId,
      ),
    [events.data, buildingId],
  )
  const defaultEvent =
    eventOptions.find((event) => event.budgetAmount !== null) ??
    eventOptions[0]
  const currentEvent = eventOptions.find((event) => event.id === eventId)
  const selectedId = currentEvent?.id ?? defaultEvent?.id ?? ''
  const selectedEvent = eventOptions.find((event) => event.id === selectedId)

  const report = useEventBudgetReport(selectedId)
  const data = report.data
  const usage = data?.usagePercent ?? 0

  if (events.isLoading) {
    return <EmptyState title="Memuat kegiatan..." />
  }

  if (events.error) {
    return (
      <ErrorState
        message={events.error.message}
        onRetry={() => events.refetch()}
      />
    )
  }

  if (eventOptions.length === 0) {
    return (
      <EmptyState
        title={
          buildingId ? 'Tidak ada kegiatan di gedung ini' : 'Belum ada kegiatan'
        }
        description={
          buildingId
            ? 'Pilih gedung lain atau buat kegiatan untuk melihat anggarannya.'
            : 'Anggaran kegiatan akan muncul setelah kegiatan dibuat.'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="budget-event" className="text-xs text-foreground/60">
            Kegiatan
          </label>
          <NativeSelect
            id="budget-event"
            value={selectedId}
            onChange={(event) => setEventId(event.target.value)}
            className="w-72"
          >
            {eventOptions.map((event) => (
              <NativeSelectOption key={event.id} value={event.id}>
                {event.title}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        {selectedEvent ? (
          <span className="pb-2 text-xs text-foreground/60">
            Mulai <DateText value={selectedEvent.startAt} />
          </span>
        ) : null}
      </div>

      {report.isLoading ? (
        <EmptyState title="Menghitung anggaran..." />
      ) : report.error ? (
        <ErrorState
          message={report.error.message}
          onRetry={() => report.refetch()}
        />
      ) : data ? (
        <>
          <ReportSummary
            items={[
              {
                label: 'Anggaran',
                value:
                  data.budgetAmount === null ? (
                    'Belum dianggarkan'
                  ) : (
                    <CurrencyText value={data.budgetAmount} />
                  ),
              },
              {
                label: 'Realisasi',
                value: <CurrencyText value={data.realizedAmount} />,
                hint: `${data.expenseCount} pengeluaran`,
              },
              {
                label: 'Sisa anggaran',
                value:
                  data.remaining === null ? (
                    '—'
                  ) : (
                    <CurrencyText value={data.remaining} />
                  ),
                tone: data.overBudget ? 'danger' : 'teal',
              },
              {
                label: 'Pemakaian',
                value:
                  data.usagePercent === null
                    ? '—'
                    : `${data.usagePercent}%`,
                tone: data.overBudget ? 'danger' : 'default',
                hint: data.overBudget ? 'Melebihi anggaran' : undefined,
              },
            ]}
          />

          <div className="rounded-base border-2 border-border bg-background p-5 shadow-shadow">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-lg">{data.title}</h2>
                <span className="text-xs text-foreground/60">
                  {data.buildingName ?? 'Asrama'}
                </span>
              </div>
              <StatusBadge status={data.status} />
            </div>

            {data.budgetAmount === null ? (
              <EmptyState
                title="Belum ada anggaran"
                description="Tetapkan anggaran kegiatan untuk melihat perbandingan realisasi."
              />
            ) : (
              <div className="flex flex-col gap-4">
                <Progress
                  value={Math.min(usage, 100)}
                  className={cn(data.overBudget && '[&_[data-slot=progress-indicator]]:bg-danger')}
                />
                <div className="flex flex-wrap justify-between gap-2 text-xs text-foreground/60">
                  <span>
                    Realisasi <CurrencyText value={data.realizedAmount} /> dari{' '}
                    <CurrencyText value={data.budgetAmount} />
                  </span>
                  <span className="tabular-nums">{usage}%</span>
                </div>
                <EventBudgetChart
                  budget={data.budgetAmount}
                  realized={data.realizedAmount}
                />
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Users } from 'lucide-react'

import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Badge } from '@/components/ui/badge'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import { usePeriods, useStructure } from '@/features/organization/hooks'
import { scopeLabel } from '@/features/organization/lib'

export function StructureTab() {
  const periods = usePeriods()
  const buildings = useBuildings()
  const [periodId, setPeriodId] = useState('')

  const defaultPeriod =
    (periods.data ?? []).find((period) => period.isActive) ??
    (periods.data ?? [])[0]
  const selectedId = periodId || defaultPeriod?.id || ''
  const structure = useStructure(selectedId)

  const buildingNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const building of buildings.data ?? []) {
      map.set(building.id, building.name)
    }
    return map
  }, [buildings.data])

  const positions = useMemo(() => {
    return [...(structure.data?.positions ?? [])].sort(
      (a, b) =>
        (a.level ?? 999) - (b.level ?? 999) ||
        a.name.localeCompare(b.name),
    )
  }, [structure.data])

  const holderCount = positions.reduce(
    (total, position) => total + position.holders.length,
    0,
  )

  if (periods.isLoading) {
    return <EmptyState title="Memuat periode..." />
  }

  if ((periods.data ?? []).length === 0) {
    return (
      <EmptyState
        title="Belum ada periode"
        description="Tambahkan periode kepengurusan terlebih dahulu."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="structure-period"
            className="text-xs text-foreground/60"
          >
            Periode
          </label>
          <NativeSelect
            id="structure-period"
            value={selectedId}
            onChange={(event) => setPeriodId(event.target.value)}
            className="w-64"
          >
            {(periods.data ?? []).map((period) => (
              <NativeSelectOption key={period.id} value={period.id}>
                {period.name}
                {period.isActive ? ' (aktif)' : ''}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {structure.data ? (
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <Badge variant="neutral">{positions.length} jabatan</Badge>
            <Badge variant="neutral">{holderCount} pemegang</Badge>
            {structure.data.period.isActive ? (
              <Badge className="bg-accent-teal text-foreground">Aktif</Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      {structure.isLoading ? (
        <EmptyState title="Menyusun struktur..." />
      ) : structure.error ? (
        <ErrorState
          message={structure.error.message}
          onRetry={() => structure.refetch()}
        />
      ) : positions.length === 0 ? (
        <EmptyState
          title="Struktur masih kosong"
          description="Tambahkan jabatan dan penugasan untuk periode ini."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {positions.map((position) => (
            <div
              key={position.id}
              className="flex flex-col gap-3 rounded-base border-2 border-border bg-background p-4 shadow-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-wide text-foreground/60">
                    {position.code}
                    {position.level === null ? '' : ` · Level ${position.level}`}
                  </span>
                  <span className="font-heading text-lg">{position.name}</span>
                  <span className="text-xs text-foreground/60">
                    {scopeLabel(
                      position.buildingId
                        ? buildingNames.get(position.buildingId)
                        : null,
                    )}
                    {position.role?.name ? ` · ${position.role.name}` : ''}
                  </span>
                </div>
                <Badge variant="neutral">
                  <Users />
                  {position.holders.length}
                </Badge>
              </div>

              {position.holders.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  Belum ada pemegang jabatan.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {position.holders.map((holder) => (
                    <li
                      key={holder.assignmentId}
                      className="rounded-base border-2 border-border bg-secondary-background px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-heading">
                          {holder.user.name ?? holder.user.email}
                        </span>
                        <span className="text-xs text-foreground/60">
                          {holder.buildingId
                            ? (buildingNames.get(holder.buildingId) ?? 'Gedung')
                            : 'Asrama'}
                        </span>
                      </div>
                      <span className="text-xs text-foreground/60">
                        Mulai <DateText value={holder.startDate} />
                        {holder.endDate ? (
                          <>
                            {' · Selesai '}
                            <DateText value={holder.endDate} />
                          </>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

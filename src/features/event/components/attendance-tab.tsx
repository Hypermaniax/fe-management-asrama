import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingButton } from '@/components/shared/loading-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type {
  AttendanceStatus,
  EventAttendance,
  EventDetail,
} from '@/features/event/api'
import {
  useSaveAttendance,
  useSessionAttendance,
} from '@/features/event/hooks'
import { dateTimeInput } from '@/features/event/lib'
import { useResidentDirectory } from '@/features/resident/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: {
  value: AttendanceStatus
  label: string
  className: string
}[] = [
  {
    value: 'HADIR',
    label: 'Hadir',
    className: 'data-[active=true]:bg-accent-teal',
  },
  {
    value: 'IZIN',
    label: 'Izin',
    className: 'data-[active=true]:bg-accent-orange',
  },
  {
    value: 'TIDAK',
    label: 'Tidak',
    className: 'data-[active=true]:bg-danger data-[active=true]:text-main-foreground',
  },
]

type Participant = {
  id: string
  name: string
  email: string
}

function AttendanceEditor({
  event,
  sessionId,
}: {
  event: EventDetail
  sessionId: string
}) {
  const buildings = useBuildings()
  const directory = useResidentDirectory(
    (buildings.data ?? []).map((building) => building.id),
  )
  const attendance = useSessionAttendance(sessionId)
  const save = useSaveAttendance()
  const [overrides, setOverrides] = useState<
    Record<string, AttendanceStatus>
  >({})

  const existing = useMemo(() => {
    const map = new Map<string, EventAttendance>()
    for (const record of attendance.data ?? []) {
      map.set(record.userId, record)
    }
    return map
  }, [attendance.data])

  const participants = useMemo(() => {
    const map = new Map<string, Participant>()
    for (const user of directory) {
      if (
        event.scope === 'GEDUNG' &&
        event.buildingId &&
        user.buildingId !== event.buildingId
      ) {
        continue
      }
      map.set(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
      })
    }
    for (const record of attendance.data ?? []) {
      if (record.user) {
        map.set(record.userId, {
          id: record.userId,
          name: record.user.name ?? record.user.email,
          email: record.user.email,
        })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [directory, attendance.data, event.scope, event.buildingId])

  const statusFor = (userId: string) =>
    overrides[userId] ?? existing.get(userId)?.status

  const counts = useMemo(() => {
    const result: Record<AttendanceStatus, number> = {
      HADIR: 0,
      IZIN: 0,
      TIDAK: 0,
    }
    for (const participant of participants) {
      const status = overrides[participant.id] ?? existing.get(participant.id)?.status
      if (status) result[status] += 1
    }
    return result
  }, [participants, overrides, existing])

  const handleSave = () => {
    const records = participants.flatMap((participant) => {
      const status = statusFor(participant.id)
      return status ? [{ userId: participant.id, status }] : []
    })
    if (records.length === 0) {
      notifyError('Gagal menyimpan', 'Tandai minimal satu peserta.')
      return
    }

    save.mutate(
      { sessionId, records },
      {
        onSuccess: (res) => notifySuccess(res.status, `${records.length} peserta`),
        onError: (error) => notifyError('Gagal menyimpan absensi', error),
      },
    )
  }

  if (attendance.isLoading) {
    return <EmptyState title="Memuat peserta..." />
  }

  if (attendance.error) {
    return (
      <EmptyState
        title="Gagal memuat absensi"
        description={attendance.error.message}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-accent-teal text-foreground">
          Hadir {counts.HADIR}
        </Badge>
        <Badge className="bg-accent-orange text-foreground">
          Izin {counts.IZIN}
        </Badge>
        <Badge className="bg-danger text-main-foreground">
          Tidak {counts.TIDAK}
        </Badge>
        <span className="text-sm text-foreground/60">
          {participants.length} peserta
        </span>
        <div className="ml-auto">
          <Can permission="event.UPDATE">
            <LoadingButton
              type="button"
              loading={save.isPending}
              disabled={save.isPending}
              onClick={handleSave}
            >
              <Save />
              Simpan absensi
            </LoadingButton>
          </Can>
        </div>
      </div>

      {participants.length === 0 ? (
        <EmptyState
          title="Belum ada peserta"
          description="Peserta berasal dari penghuni pada scope kegiatan."
        />
      ) : (
        <div className="flex flex-col divide-y-2 divide-border rounded-base border-2 border-border bg-background">
          {participants.map((participant) => {
            const status = statusFor(participant.id)
            return (
              <div
                key={participant.id}
                className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading">{participant.name}</span>
                  <span className="text-xs text-foreground/60">
                    {participant.email}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      variant="neutral"
                      data-active={status === option.value}
                      className={cn(
                        'min-w-16',
                        option.className,
                      )}
                      onClick={() =>
                        setOverrides((previous) => ({
                          ...previous,
                          [participant.id]: option.value,
                        }))
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function AttendanceTab({ event }: { event: EventDetail }) {
  const [sessionId, setSessionId] = useState('')
  const sessions = [...event.sessions].sort((a, b) =>
    a.scheduledAt.localeCompare(b.scheduledAt),
  )
  const selectedId =
    (sessionId && sessions.some((session) => session.id === sessionId)
      ? sessionId
      : sessions[0]?.id) ?? ''

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="Belum ada sesi"
        description="Tambahkan sesi terlebih dahulu sebelum mengisi absensi."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <NativeSelect
          aria-label="Pilih sesi"
          value={selectedId}
          onChange={(event) => setSessionId(event.target.value)}
          className="w-80"
        >
          {sessions.map((session) => (
            <NativeSelectOption key={session.id} value={session.id}>
              {session.title ?? 'Sesi'} ·{' '}
              {dateTimeInput(session.scheduledAt).replace('T', ' ')}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <AttendanceEditor
        key={selectedId}
        event={event}
        sessionId={selectedId}
      />
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'

import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type {
  MyAttendance,
  MyCommittee,
} from '@/features/event/api'
import {
  useMyAttendance,
  useMyCommittees,
} from '@/features/event/hooks'
import { ATTENDANCE_STATUS_LABELS } from '@/features/event/lib'

function attendanceColumns(): Column<MyAttendance>[] {
  return [
    {
      key: 'event',
      header: 'Kegiatan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">{row.session.event.title}</span>
          <span className="text-xs text-foreground/60">
            {row.session.title ?? 'Sesi'}
          </span>
        </div>
      ),
    },
    {
      key: 'scheduledAt',
      header: 'Jadwal',
      cell: (row) => <DateText value={row.session.scheduledAt} withTime />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={ATTENDANCE_STATUS_LABELS[row.status]}
        />
      ),
    },
    {
      key: 'checkedInAt',
      header: 'Check-in',
      cell: (row) =>
        row.checkedInAt ? (
          <DateText value={row.checkedInAt} withTime />
        ) : (
          <span className="text-foreground/50">—</span>
        ),
    },
    {
      key: 'note',
      header: 'Catatan',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.note ?? '—',
    },
  ]
}

function committeeColumns(): Column<MyCommittee>[] {
  return [
    {
      key: 'event',
      header: 'Kegiatan',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/app/events/${row.event.id}`}
            className="font-heading underline-offset-2 hover:underline"
          >
            {row.event.title}
          </Link>
          <span className="text-xs text-foreground/60">
            Mulai <DateText value={row.event.startAt} />
          </span>
        </div>
      ),
    },
    {
      key: 'eventStatus',
      header: 'Status kegiatan',
      cell: (row) => <StatusBadge status={row.event.status} />,
    },
    {
      key: 'role',
      header: 'Peran',
      cell: (row) => row.eventRole,
    },
    {
      key: 'position',
      header: 'Jabatan',
      cell: (row) => row.position?.name ?? '—',
    },
  ]
}

export default function MyAttendancePage() {
  const attendance = useMyAttendance()
  const committees = useMyCommittees()
  const [tab, setTab] = useState('attendance')

  const attendances = (attendance.data ?? []).sort((a, b) =>
    b.session.scheduledAt.localeCompare(a.session.scheduledAt),
  )
  const myCommittees = (committees.data ?? []).sort((a, b) =>
    b.event.startAt.localeCompare(a.event.startAt),
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kegiatan Saya"
        description="Riwayat absensi dan kepanitiaan Anda pada kegiatan asrama."
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="attendance">Absensi</TabsTrigger>
          <TabsTrigger value="committees">Kepanitiaan</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="pt-4">
          {attendance.error ? (
            <ErrorState
              message={attendance.error.message}
              onRetry={() => attendance.refetch()}
            />
          ) : (
            <DataTable
              columns={attendanceColumns()}
              data={attendances}
              getRowId={(row) => row.id}
              pageSize={10}
              isLoading={attendance.isLoading}
              emptyTitle="Belum ada absensi"
              emptyDescription="Absensi Anda akan muncul setelah mengikuti sesi kegiatan."
            />
          )}
        </TabsContent>

        <TabsContent value="committees" className="pt-4">
          {committees.error ? (
            <ErrorState
              message={committees.error.message}
              onRetry={() => committees.refetch()}
            />
          ) : (
            <DataTable
              columns={committeeColumns()}
              data={myCommittees}
              getRowId={(row) => row.id}
              pageSize={10}
              isLoading={committees.isLoading}
              emptyTitle="Belum menjadi panitia"
              emptyDescription="Kegiatan yang Anda panitiakan akan tampil di sini."
            />
          )}
        </TabsContent>
      </Tabs>

      <p className="text-xs text-foreground/60">
        Tidak melihat kegiatan yang diharapkan?{' '}
        <Link
          to="/app/events"
          className="underline underline-offset-2 hover:underline"
        >
          Lihat daftar kegiatan
        </Link>
      </p>
    </div>
  )
}

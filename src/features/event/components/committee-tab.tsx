import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Plus, UserMinus } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { LoadingButton } from '@/components/shared/loading-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type {
  EventCommittee,
  EventDetail,
} from '@/features/event/api'
import {
  useAddCommittee,
  useDeleteCommittee,
} from '@/features/event/hooks'
import {
  committeeSchema,
  type CommitteeFormValues,
} from '@/features/event/schema'
import { useResidentDirectory } from '@/features/resident/hooks'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

function AddCommitteeDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventDetail
}) {
  const add = useAddCommittee()
  const buildings = useBuildings()
  const directory = useResidentDirectory(
    (buildings.data ?? []).map((building) => building.id),
  )

  const options = useMemo(
    () =>
      event.scope === 'GEDUNG' && event.buildingId
        ? directory.filter((user) => user.buildingId === event.buildingId)
        : directory,
    [directory, event.scope, event.buildingId],
  )

  const form = useForm<CommitteeFormValues>({
    resolver: zodResolver(committeeSchema),
    defaultValues: { userId: '', eventRole: '', positionId: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    add.mutate(
      {
        eventId: event.id,
        input: {
          userId: values.userId,
          eventRole: values.eventRole.trim(),
        },
      },
      {
        onSuccess: (res: ApiEnvelope<EventCommittee>) => {
          notifySuccess(res.status)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menambah panitia', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah panitia</DialogTitle>
          <DialogDescription>
            Satu pengguna hanya dapat terdaftar sekali pada kegiatan ini.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengguna</FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <NativeSelectOption value="">
                        Pilih pengguna
                      </NativeSelectOption>
                      {options.map((user) => (
                        <NativeSelectOption key={user.id} value={user.id}>
                          {user.name} · {user.email}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. Koordinator Acara"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={add.isPending}
                disabled={add.isPending || options.length === 0}
              >
                Tambah panitia
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function CommitteeTab({ event }: { event: EventDetail }) {
  const remove = useDeleteCommittee()
  const [addOpen, setAddOpen] = useState(false)
  const [target, setTarget] = useState<EventCommittee | null>(null)

  const confirmRemove = () => {
    if (!target) return
    remove.mutate(target.id, {
      onSuccess: (res) => {
        notifySuccess(res.status)
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal melepas panitia', error),
    })
  }

  const columns: Column<EventCommittee>[] = [
    {
      key: 'name',
      header: 'Nama',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-heading">
            {row.user?.name ?? row.user?.email ?? row.userId}
          </span>
          <span className="text-xs text-foreground/60">
            {row.user?.email ?? '—'}
          </span>
        </div>
      ),
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
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Can permission="event.UPDATE">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Lepas panitia"
            onClick={() => setTarget(row)}
          >
            <UserMinus />
          </Button>
        </Can>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground/70">
          {event.committees.length} panitia terdaftar
        </p>
        <Can permission="event.UPDATE">
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus />
            Tambah panitia
          </Button>
        </Can>
      </div>

      <DataTable
        columns={columns}
        data={event.committees}
        getRowId={(row) => row.id}
        pageSize={10}
        emptyTitle="Belum ada panitia"
        emptyDescription="Tambahkan pengguna untuk menjadi panitia kegiatan."
        emptyAction={
          <Can permission="event.UPDATE">
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus />
              Tambah panitia
            </Button>
          </Can>
        }
      />

      {addOpen ? (
        <AddCommitteeDialog
          open
          onOpenChange={setAddOpen}
          event={event}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title="Lepas panitia?"
        description={
          target
            ? `${target.user?.name ?? target.user?.email ?? 'Pengguna'} akan dilepas dari kepanitiaan kegiatan ini.`
            : undefined
        }
        confirmLabel="Lepas"
        loading={remove.isPending}
        onConfirm={confirmRemove}
      />
    </div>
  )
}

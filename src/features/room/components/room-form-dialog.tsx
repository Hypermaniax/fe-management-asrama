import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { BuildingSelect } from '@/components/shared/building-select'
import { LoadingButton } from '@/components/shared/loading-button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Room } from '@/features/room/api'
import { useCreateRoom, useUpdateRoom } from '@/features/room/hooks'
import { roomSchema, type RoomFormValues } from '@/features/room/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const STATUS_ITEMS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'MAINTENANCE', label: 'Perbaikan' },
]

const emptyValues: RoomFormValues = {
  buildingId: '',
  number: '',
  capacity: '1',
  status: 'ACTIVE',
}

export function RoomFormDialog({
  open,
  onOpenChange,
  room,
  defaultBuildingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room | null
  defaultBuildingId?: string | null
}) {
  const isEdit = Boolean(room)
  const create = useCreateRoom()
  const update = useUpdateRoom()
  const pending = create.isPending || update.isPending

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      room
        ? {
            buildingId: room.buildingId,
            number: room.number,
            capacity: String(room.capacity),
            status: room.status,
          }
        : { ...emptyValues, buildingId: defaultBuildingId ?? '' },
    )
  }, [open, room, form, defaultBuildingId])

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = (res: ApiEnvelope<Room>) => {
      notifySuccess(res.status, values.number)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    const capacity = Number(values.capacity)

    if (room) {
      update.mutate(
        {
          id: room.id,
          input: {
            number: values.number,
            capacity,
            status: values.status,
          },
        },
        { onSuccess, onError },
      )
      return
    }

    create.mutate(
      {
        buildingId: values.buildingId,
        number: values.number,
        capacity,
        status: values.status,
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah kamar' : 'Tambah kamar'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui nomor, kapasitas, atau status kamar.'
              : 'Lengkapi data kamar baru.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gedung</FormLabel>
                  <FormControl>
                    <BuildingSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEdit}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor kamar</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. 101" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kapasitas</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={50} {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    items={STATUS_ITEMS}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                {isEdit ? 'Simpan perubahan' : 'Tambah kamar'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

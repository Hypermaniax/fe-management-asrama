import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

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
  FormDescription,
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
import { ResidentSelect } from '@/features/resident/components/resident-select'
import { useCreateOccupancy } from '@/features/occupancy/hooks'
import {
  occupancySchema,
  type OccupancyFormValues,
} from '@/features/occupancy/schema'
import { useRooms } from '@/features/room/hooks'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import type { Occupancy } from '@/features/occupancy/api'

const emptyValues: OccupancyFormValues = {
  buildingId: '',
  userId: '',
  roomId: '',
  bedLabel: '',
}

export function OccupancyFormDialog({
  open,
  onOpenChange,
  defaultBuildingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultBuildingId?: string | null
}) {
  const create = useCreateOccupancy()
  const rooms = useRooms(open)

  const form = useForm<OccupancyFormValues>({
    resolver: zodResolver(occupancySchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset({ ...emptyValues, buildingId: defaultBuildingId ?? '' })
  }, [open, defaultBuildingId, form])

  const buildingId = useWatch({ control: form.control, name: 'buildingId' })

  const roomItems = useMemo(
    () =>
      (rooms.data ?? [])
        .filter(
          (room) =>
            room.buildingId === buildingId && room.status === 'ACTIVE',
        )
        .map((room) => ({
          value: room.id,
          label: `Kamar ${room.number} · ${room.capacity} orang`,
        })),
    [rooms.data, buildingId],
  )

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(
      {
        userId: values.userId,
        roomId: values.roomId,
        bedLabel: values.bedLabel.trim() ? values.bedLabel.trim() : undefined,
      },
      {
        onSuccess: (res: ApiEnvelope<Occupancy>) => {
          notifySuccess(res.status)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menempatkan penghuni', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tempatkan penghuni</DialogTitle>
          <DialogDescription>
            Kapasitas kamar dan kecocokan gender gedung divalidasi oleh server.
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
                      value={field.value || null}
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('userId', '')
                        form.setValue('roomId', '')
                      }}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penghuni</FormLabel>
                  <FormControl>
                    <ResidentSelect
                      buildingId={buildingId}
                      status="ACTIVE"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Hanya penghuni aktif pada gedung terpilih.
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kamar</FormLabel>
                  <FormControl>
                    <Select
                      items={roomItems}
                      value={field.value || undefined}
                      onValueChange={(value) =>
                        field.onChange(value as string)
                      }
                      disabled={!buildingId || rooms.isLoading}
                    >
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue placeholder="Pilih kamar" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bedLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label bed</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. A (opsional)" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton type="submit" loading={create.isPending}>
                Tempatkan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

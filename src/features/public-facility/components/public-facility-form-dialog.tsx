import { useEffect, useMemo } from 'react'
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
import { useFacilities } from '@/features/facility/hooks'
import type { PublicFacility } from '@/features/public-facility/api'
import {
  useCreatePublicFacility,
  useUpdatePublicFacility,
} from '@/features/public-facility/hooks'
import {
  publicFacilitySchema,
  type PublicFacilityFormValues,
} from '@/features/public-facility/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const STATUS_ITEMS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'MAINTENANCE', label: 'Perbaikan' },
]

const emptyValues: PublicFacilityFormValues = {
  buildingId: '',
  facilityId: '',
  number: '',
  capacity: '',
  status: 'ACTIVE',
  note: '',
}

export function PublicFacilityFormDialog({
  open,
  onOpenChange,
  publicFacility,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicFacility?: PublicFacility | null
}) {
  const isEdit = Boolean(publicFacility)
  const catalog = useFacilities('PUBLIC', open)
  const create = useCreatePublicFacility()
  const update = useUpdatePublicFacility()
  const pending = create.isPending || update.isPending

  const form = useForm<PublicFacilityFormValues>({
    resolver: zodResolver(publicFacilitySchema),
    defaultValues: emptyValues,
  })

  const facilityItems = useMemo(
    () =>
      (catalog.data ?? [])
        .filter((facility) => facility.isActive)
        .map((facility) => ({ value: facility.id, label: facility.name })),
    [catalog.data],
  )

  useEffect(() => {
    if (!open) return
    form.reset(
      publicFacility
        ? {
            buildingId: publicFacility.buildingId,
            facilityId: publicFacility.facilityId,
            number: publicFacility.number ?? '',
            capacity:
              publicFacility.capacity === null
                ? ''
                : String(publicFacility.capacity),
            status: publicFacility.status,
            note: publicFacility.note ?? '',
          }
        : emptyValues,
    )
  }, [open, publicFacility, form])

  const onSubmit = form.handleSubmit((values) => {
    const facility = (catalog.data ?? []).find(
      (item) => item.id === values.facilityId,
    )
    if (facility?.usageMode === 'ASSIGNED' && !values.number.trim()) {
      form.setError('number', { message: 'Nomor wajib diisi untuk tipe ini' })
      return
    }

    const capacity =
      values.capacity.trim() === '' ? undefined : Number(values.capacity)

    const onSuccess = (res: ApiEnvelope<PublicFacility>) => {
      notifySuccess(res.status)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    if (publicFacility) {
      update.mutate(
        {
          id: publicFacility.id,
          input: {
            number: values.number.trim() || undefined,
            capacity,
            status: values.status,
            note: values.note.trim() || undefined,
          },
        },
        { onSuccess, onError },
      )
      return
    }

    create.mutate(
      {
        buildingId: values.buildingId,
        facilityId: values.facilityId,
        number: values.number.trim() || undefined,
        capacity,
        note: values.note.trim() || undefined,
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah fasilitas umum' : 'Tambah fasilitas umum'}
          </DialogTitle>
          <DialogDescription>
            Instance fasilitas umum per gedung, mis. KM No. 3.
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
              name="facilityId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fasilitas</FormLabel>
                  <Select
                    items={facilityItems}
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={isEdit || catalog.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue placeholder="Pilih fasilitas umum" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {facilityItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Hanya fasilitas berkategori umum (scope PUBLIC).
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. KM-01" {...field} />
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
                      <Input
                        type="number"
                        min={0}
                        placeholder="Opsional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            {isEdit ? (
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
            ) : null}

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                {isEdit ? 'Simpan perubahan' : 'Tambah fasilitas'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

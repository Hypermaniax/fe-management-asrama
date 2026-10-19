import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { Switch } from '@/components/ui/switch'
import type {
  Facility,
  FacilityCategory,
  FacilityScope,
  FacilityUsage,
} from '@/features/facility/api'
import {
  useCreateFacility,
  useUpdateFacility,
} from '@/features/facility/hooks'
import {
  facilitySchema,
  type FacilityFormValues,
} from '@/features/facility/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const SCOPE_ITEMS = [
  { value: 'ROOM', label: 'Kamar' },
  { value: 'PUBLIC', label: 'Umum' },
]
const USAGE_ITEMS = [
  { value: 'SHARED', label: 'Bersama' },
  { value: 'ASSIGNED', label: 'Per penghuni' },
]
const CATEGORY_ITEMS = [
  { value: 'FURNITURE', label: 'Furnitur' },
  { value: 'SANITARY', label: 'Sanitasi' },
  { value: 'APPLIANCE', label: 'Elektronik' },
  { value: 'OTHER', label: 'Lainnya' },
]

const emptyValues: FacilityFormValues = {
  code: '',
  name: '',
  scope: 'ROOM',
  usageMode: 'SHARED',
  category: 'FURNITURE',
  isActive: true,
}

function FieldSelect({
  items,
  value,
  onValueChange,
}: {
  items: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onValueChange(next as string)}
    >
      <SelectTrigger className="bg-secondary-background text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function FacilityFormDialog({
  open,
  onOpenChange,
  facility,
  defaultScope = 'ROOM',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  facility?: Facility | null
  defaultScope?: FacilityScope
}) {
  const isEdit = Boolean(facility)
  const create = useCreateFacility()
  const update = useUpdateFacility()
  const pending = create.isPending || update.isPending

  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      facility
        ? {
            code: facility.code,
            name: facility.name,
            scope: facility.scope,
            usageMode: facility.usageMode,
            category: facility.category,
            isActive: facility.isActive,
          }
        : { ...emptyValues, scope: defaultScope },
    )
  }, [open, facility, form, defaultScope])

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = (res: ApiEnvelope<Facility>) => {
      notifySuccess(res.status, values.name)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    if (facility) {
      update.mutate(
        {
          id: facility.id,
          input: {
            name: values.name,
            category: values.category as FacilityCategory,
            isActive: values.isActive,
          },
        },
        { onSuccess, onError },
      )
      return
    }

    create.mutate(
      {
        code: values.code,
        name: values.name,
        scope: values.scope as FacilityScope,
        usageMode: values.usageMode as FacilityUsage,
        category: values.category as FacilityCategory,
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah fasilitas' : 'Tambah fasilitas'}
          </DialogTitle>
          <DialogDescription>
            Katalog fasilitas. Cakupan dan tipe tidak dapat diubah setelah
            dibuat.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. KASUR"
                      disabled={isEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Kasur" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cakupan</FormLabel>
                    <FormControl>
                      <FieldSelect
                        items={SCOPE_ITEMS}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usageMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe</FormLabel>
                    <FormControl>
                      <FieldSelect
                        items={USAGE_ITEMS}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <FormControl>
                    <FieldSelect
                      items={CATEGORY_ITEMS}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            {isEdit ? (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel>Aktif</FormLabel>
                      <FormDescription>
                        Nonaktif menyembunyikan fasilitas dari pilihan baru.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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

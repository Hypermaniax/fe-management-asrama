import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

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
import type { Building, Gender } from '@/features/building/api'
import { useCreateBuilding, useUpdateBuilding } from '@/features/building/hooks'
import {
  buildingSchema,
  type BuildingFormValues,
} from '@/features/building/schema'
import { ApiRequestError } from '@/lib/api'
import { formErrorClass } from '@/lib/form'

const GENDER_ITEMS = [
  { value: 'MALE', label: 'Putra' },
  { value: 'FEMALE', label: 'Putri' },
]

const emptyValues: BuildingFormValues = {
  code: '',
  name: '',
  gender: 'MALE',
  address: '',
  isActive: true,
}

export function BuildingFormDialog({
  open,
  onOpenChange,
  building,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  building?: Building | null
}) {
  const isEdit = Boolean(building)
  const create = useCreateBuilding()
  const update = useUpdateBuilding()
  const pending = create.isPending || update.isPending

  const form = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      building
        ? {
            code: building.code,
            name: building.name,
            gender: building.gender,
            address: building.address,
            isActive: building.isActive,
          }
        : emptyValues,
    )
  }, [open, building, form])

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = () => {
      toast.success(isEdit ? 'Gedung diperbarui' : 'Gedung ditambahkan', {
        description: values.name,
      })
      onOpenChange(false)
    }
    const onError = (error: unknown) => {
      const description =
        error instanceof ApiRequestError && error.httpStatus === 409
          ? 'Kode gedung sudah dipakai.'
          : error instanceof Error
            ? error.message
            : 'Terjadi kesalahan'
      toast.error('Gagal menyimpan', { description })
    }

    if (building) {
      update.mutate(
        {
          id: building.id,
          input: {
            name: values.name,
            gender: values.gender as Gender,
            address: values.address,
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
        gender: values.gender as Gender,
        address: values.address,
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah gedung' : 'Tambah gedung'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui data gedung. Kode gedung tidak dapat diubah.'
              : 'Lengkapi data gedung baru.'}
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
                      placeholder="mis. GPR"
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
                    <Input
                      placeholder="mis. Gedung Putra"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    items={GENDER_ITEMS}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDER_ITEMS.map((item) => (
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

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. Jl. Kaliurang KM 5, Sleman"
                      {...field}
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
                        Nonaktif menyembunyikan gedung dari daftar aktif.
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
                {isEdit ? 'Simpan perubahan' : 'Tambah gedung'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

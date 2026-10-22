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
import { Textarea } from '@/components/ui/textarea'
import type { Gender } from '@/features/building/api'
import type { Resident } from '@/features/resident/api'
import { useUpdateResidentProfile } from '@/features/resident/hooks'
import {
  residentProfileSchema,
  type ResidentProfileValues,
} from '@/features/resident/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const GENDER_ITEMS = [
  { value: 'MALE', label: 'Laki-laki' },
  { value: 'FEMALE', label: 'Perempuan' },
]

const emptyValues: ResidentProfileValues = {
  name: '',
  phone: '',
  gender: null,
  buildingId: '',
  nationalId: '',
  address: '',
  guardianName: '',
  guardianPhone: '',
}

function optional(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function ResidentFormDialog({
  open,
  onOpenChange,
  resident,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resident?: Resident | null
}) {
  const update = useUpdateResidentProfile()

  const form = useForm<ResidentProfileValues>({
    resolver: zodResolver(residentProfileSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      resident
        ? {
            name: resident.name ?? '',
            phone: resident.phone ?? '',
            gender: resident.gender,
            buildingId: resident.buildingId ?? '',
            nationalId: resident.nationalId ?? '',
            address: resident.address ?? '',
            guardianName: resident.guardianName ?? '',
            guardianPhone: resident.guardianPhone ?? '',
          }
        : emptyValues,
    )
  }, [open, resident, form])

  const onSubmit = form.handleSubmit((values) => {
    if (!resident) return
    update.mutate(
      {
        id: resident.id,
        input: {
          name: values.name,
          phone: optional(values.phone),
          gender: values.gender ?? undefined,
          buildingId: values.buildingId || undefined,
          nationalId: optional(values.nationalId),
          address: optional(values.address),
          guardianName: optional(values.guardianName),
          guardianPhone: optional(values.guardianPhone),
        },
      },
      {
        onSuccess: (res: ApiEnvelope<Resident>) => {
          notifySuccess(res.status, values.name)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menyimpan profil', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ubah profil penghuni</DialogTitle>
          <DialogDescription>
            Perbarui data pribadi, kontak, dan gedung penghuni.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama penghuni" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0812…"
                        inputMode="tel"
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
                    <FormControl>
                      <Select
                        items={GENDER_ITEMS}
                        value={field.value ?? undefined}
                        onValueChange={(value) =>
                          field.onChange(value as Gender)
                        }
                      >
                        <SelectTrigger className="bg-secondary-background text-foreground">
                          <SelectValue placeholder="Pilih gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_ITEMS.map((item) => (
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
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gedung</FormLabel>
                    <FormControl>
                      <BuildingSelect
                        value={field.value || null}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK</FormLabel>
                    <FormControl>
                      <Input placeholder="Nomor KTP" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama wali</FormLabel>
                    <FormControl>
                      <Input placeholder="Opsional" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon wali</FormLabel>
                    <FormControl>
                      <Input placeholder="Opsional" inputMode="tel" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Alamat asal" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton type="submit" loading={update.isPending}>
                Simpan profil
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

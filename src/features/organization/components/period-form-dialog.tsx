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
import type { Period } from '@/features/organization/api'
import {
  useCreatePeriod,
  useUpdatePeriod,
} from '@/features/organization/hooks'
import { dateInput, toIsoDate } from '@/features/organization/lib'
import {
  periodSchema,
  type PeriodFormValues,
} from '@/features/organization/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

function initialValues(period: Period | null): PeriodFormValues {
  return period
    ? {
        code: period.code,
        name: period.name,
        startDate: dateInput(period.startDate),
        endDate: dateInput(period.endDate),
        decreeNumber: period.decreeNumber ?? '',
      }
    : {
        code: '',
        name: '',
        startDate: '',
        endDate: '',
        decreeNumber: '',
      }
}

export function PeriodFormDialog({
  open,
  onOpenChange,
  period,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  period?: Period | null
}) {
  const value = period ?? null
  const isEdit = Boolean(value)
  const create = useCreatePeriod()
  const update = useUpdatePeriod()
  const pending = create.isPending || update.isPending

  const form = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: initialValues(value),
  })

  const onSubmit = form.handleSubmit((values) => {
    const input: {
      code: string
      name: string
      startDate: string
      endDate: string
      decreeNumber?: string
    } = {
      code: values.code.trim(),
      name: values.name.trim(),
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate),
    }
    if (values.decreeNumber.trim() || isEdit) {
      input.decreeNumber = values.decreeNumber.trim()
    }

    const onSuccess = (res: ApiEnvelope<Period>) => {
      notifySuccess(res.status, values.name)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    if (value) {
      update.mutate({ id: value.id, input }, { onSuccess, onError })
      return
    }

    create.mutate(input, { onSuccess, onError })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah periode' : 'Tambah periode'}
          </DialogTitle>
          <DialogDescription>
            Periode kepengurusan menentukan struktur pengurus yang aktif.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. 2026-2027" {...field} />
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
                        placeholder="mis. Kepengurusan 2026/2027"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="decreeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor SK</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormDescription>
                    Hanya satu periode yang dapat aktif pada satu waktu.
                  </FormDescription>
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
                {isEdit ? 'Simpan perubahan' : 'Tambah periode'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

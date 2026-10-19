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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { FeeRule } from '@/features/fee-rule/api'
import { useCreateFeeRule } from '@/features/fee-rule/hooks'
import {
  feeRuleSchema,
  type FeeRuleFormValues,
} from '@/features/fee-rule/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const emptyValues: FeeRuleFormValues = {
  buildingId: '',
  dueDayOfMonth: '10',
  defaultMonthlyRate: '0',
  effectiveFrom: '',
}

export function FeeRuleFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateFeeRule()

  const form = useForm<FeeRuleFormValues>({
    resolver: zodResolver(feeRuleSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) form.reset(emptyValues)
  }, [open, form])

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(
      {
        buildingId: values.buildingId,
        dueDayOfMonth: Number(values.dueDayOfMonth),
        defaultMonthlyRate: Number(values.defaultMonthlyRate),
        effectiveFrom: new Date(values.effectiveFrom).toISOString(),
      },
      {
        onSuccess: (res: ApiEnvelope<FeeRule>) => {
          notifySuccess(res.status)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menyimpan', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah aturan biaya</DialogTitle>
          <DialogDescription>
            Aturan iuran bulanan per gedung. Aturan lama otomatis tergantikan
            sesuai tanggal berlaku.
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
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDayOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal jatuh tempo</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={28} {...field} />
                  </FormControl>
                  <FormDescription>
                    Tanggal 1–28 setiap bulan.
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultMonthlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarif default (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1000} {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Berlaku dari</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={create.isPending}
                disabled={create.isPending}
              >
                Tambah aturan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

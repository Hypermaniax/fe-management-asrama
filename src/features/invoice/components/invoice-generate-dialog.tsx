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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Invoice } from '@/features/invoice/api'
import { useGenerateInvoices } from '@/features/invoice/hooks'
import { MONTH_ITEMS, yearItems } from '@/features/invoice/lib'
import {
  generateInvoiceSchema,
  type GenerateInvoiceFormValues,
} from '@/features/invoice/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useScopeStore } from '@/stores/scope'

const emptyValues: GenerateInvoiceFormValues = {
  buildingId: '',
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1),
}

export function InvoiceGenerateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const generate = useGenerateInvoices()
  const years = yearItems()

  const form = useForm<GenerateInvoiceFormValues>({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      ...emptyValues,
      buildingId: activeBuildingId ?? '',
    })
  }, [open, activeBuildingId, form])

  const onSubmit = form.handleSubmit((values) => {
    generate.mutate(
      {
        buildingId: values.buildingId,
        year: Number(values.year),
        month: Number(values.month),
      },
      {
        onSuccess: (res: ApiEnvelope<Invoice[]>) => {
          const count = res.data.length
          notifySuccess(
            res.status,
            count > 0
              ? `${count} tagihan berhasil dibuat`
              : 'Tidak ada tagihan baru untuk periode ini',
          )
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal generate tagihan', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate tagihan</DialogTitle>
          <DialogDescription>
            Buat tagihan bulanan untuk seluruh penghuni aktif pada gedung dan
            periode yang dipilih.
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bulan</FormLabel>
                    <Select
                      items={MONTH_ITEMS}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-secondary-background text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTH_ITEMS.map((item) => (
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun</FormLabel>
                    <Select
                      items={years}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-secondary-background text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((item) => (
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
            </div>

            <FormDescription>
              Tagihan yang sudah ada pada periode tersebut tidak dibuat ulang.
            </FormDescription>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={generate.isPending}
                disabled={generate.isPending}
              >
                Generate tagihan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
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
import type { CashAccount } from '@/features/cash-account/api'
import { useCategories } from '@/features/category/hooks'
import { useRecordLedgerIncome } from '@/features/ledger/hooks'
import {
  createLedgerIdempotencyKey,
  toOccurredAt,
  todayInputDate,
} from '@/features/ledger/lib'
import {
  ledgerIncomeSchema,
  type LedgerIncomeFormValues,
} from '@/features/ledger/schema'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'

export function LedgerIncomeDialog({
  open,
  onOpenChange,
  cashAccount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cashAccount: CashAccount
}) {
  const record = useRecordLedgerIncome()
  const categories = useCategories('INCOME')
  const [idempotencyKey] = useState(() => createLedgerIdempotencyKey())

  const form = useForm<LedgerIncomeFormValues>({
    resolver: zodResolver(ledgerIncomeSchema),
    defaultValues: {
      categoryId: '',
      amount: '',
      occurredAt: todayInputDate(),
      description: '',
    },
  })

  const categoryItems = (categories.data ?? [])
    .filter((category) => category.buildingId === cashAccount.buildingId)
    .map((category) => ({ value: category.id, label: category.name }))

  const onSubmit = form.handleSubmit((values) => {
    record.mutate(
      {
        categoryId: values.categoryId,
        amount: Number(values.amount),
        occurredAt: toOccurredAt(values.occurredAt),
        cashAccountId: cashAccount.id,
        description: values.description || null,
        idempotencyKey,
      },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, formatRupiah(Number(values.amount)))
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal mencatat pemasukan', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Catat pemasukan manual</DialogTitle>
          <DialogDescription>
            Pemasukan di luar pembayaran tagihan pada akun {cashAccount.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    items={categoryItems}
                    value={field.value || undefined}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={
                      categories.isLoading || categoryItems.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue
                          placeholder={
                            categoryItems.length === 0
                              ? 'Belum ada kategori pemasukan'
                              : 'Pilih kategori'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!categories.isLoading && categoryItems.length === 0 ? (
                    <FormDescription>
                      Buat kategori pemasukan terlebih dahulu.
                    </FormDescription>
                  ) : null}
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="mis. 1000000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occurredAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Donasi" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormDescription>
              Kunci idempotensi:{' '}
              <span className="font-mono">{idempotencyKey}</span>
            </FormDescription>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={record.isPending}
                disabled={record.isPending || categoryItems.length === 0}
              >
                Simpan pemasukan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

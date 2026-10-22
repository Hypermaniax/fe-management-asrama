import { useState, type ChangeEvent } from 'react'
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
import { CashAccountSelect } from '@/features/cash-account/components/cash-account-select'
import { useCategories } from '@/features/category/hooks'
import type { ExpenseInput } from '@/features/expense/api'
import {
  useCreateExpense,
  useUploadExpenseReceipt,
} from '@/features/expense/hooks'
import {
  createExpenseIdempotencyKey,
  RECEIPT_MAX_SIZE_BYTES,
  RECEIPT_MIME_TYPES,
  toOccurredAt,
  todayInputDate,
} from '@/features/expense/lib'
import { expenseSchema, type ExpenseFormValues } from '@/features/expense/schema'
import { formatBytes } from '@/features/document/lib'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'

export function ExpenseFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateExpense()
  const upload = useUploadExpenseReceipt()
  const categories = useCategories('EXPENSE')

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [idempotencyKey] = useState(() => createExpenseIdempotencyKey())

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      buildingId: '',
      cashAccountId: '',
      categoryId: '',
      amount: '',
      occurredAt: todayInputDate(),
      vendor: '',
      description: '',
    },
  })

  const buildingId = useWatch({ control: form.control, name: 'buildingId' })

  const categoryItems = (categories.data ?? [])
    .filter((category) => category.buildingId === buildingId)
    .map((category) => ({ value: category.id, label: category.name }))

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setReceiptFile(null)
      setReceiptError(null)
      return
    }
    if (!RECEIPT_MIME_TYPES.includes(file.type)) {
      setReceiptFile(null)
      setReceiptError('Gunakan berkas PDF, PNG, atau JPEG.')
      return
    }
    if (file.size > RECEIPT_MAX_SIZE_BYTES) {
      setReceiptFile(null)
      setReceiptError(`Ukuran maksimal ${formatBytes(RECEIPT_MAX_SIZE_BYTES)}.`)
      return
    }
    setReceiptFile(file)
    setReceiptError(null)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    if (!receiptFile) {
      setReceiptError('Bukti pengeluaran wajib diunggah.')
      return
    }

    try {
      const uploadResult = await upload.mutateAsync(receiptFile)
      const input: ExpenseInput = {
        categoryId: values.categoryId,
        amount: Number(values.amount),
        occurredAt: toOccurredAt(values.occurredAt),
        receiptFileId: uploadResult.data.id,
        cashAccountId: values.cashAccountId,
        vendor: values.vendor || null,
        description: values.description || null,
        idempotencyKey,
      }
      const result = await create.mutateAsync(input)
      notifySuccess(result.status, formatRupiah(Number(values.amount)))
      onOpenChange(false)
    } catch (error) {
      notifyError('Gagal mencatat pengeluaran', error)
    }
  })

  const pending = upload.isPending || create.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Catat pengeluaran</DialogTitle>
          <DialogDescription>
            Pengeluaran akan mengurangi saldo akun kas dan tercatat di buku kas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
          >
            <FormField
              control={form.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gedung</FormLabel>
                  <FormControl>
                    <BuildingSelect
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('cashAccountId', '')
                        form.setValue('categoryId', '')
                      }}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cashAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Akun kas</FormLabel>
                    <FormControl>
                      <CashAccountSelect
                        buildingId={buildingId}
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      items={categoryItems}
                      value={field.value || undefined}
                      onValueChange={(value) => field.onChange(value)}
                      disabled={
                        !buildingId ||
                        categories.isLoading ||
                        categoryItems.length === 0
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="bg-secondary-background text-foreground">
                          <SelectValue
                            placeholder={
                              !buildingId
                                ? 'Pilih gedung dahulu'
                                : categoryItems.length === 0
                                  ? 'Belum ada kategori'
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
                    {buildingId && categoryItems.length === 0 ? (
                      <FormDescription>
                        Buat kategori pengeluaran terlebih dahulu.
                      </FormDescription>
                    ) : null}
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

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
                        placeholder="mis. 250000"
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
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-heading">Bukti pengeluaran</span>
              <Input
                type="file"
                aria-label="Bukti pengeluaran"
                accept={RECEIPT_MIME_TYPES.join(',')}
                onChange={onFileChange}
                className="cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:font-heading"
              />
              {receiptFile ? (
                <p className="text-sm text-foreground/70">
                  {receiptFile.name} · {formatBytes(receiptFile.size)}
                </p>
              ) : (
                <FormDescription>
                  Wajib · PDF/PNG/JPEG maks{' '}
                  {formatBytes(RECEIPT_MAX_SIZE_BYTES)}.
                </FormDescription>
              )}
              {receiptError ? (
                <p className="text-sm text-danger">{receiptError}</p>
              ) : null}
            </div>

            <FormDescription>
              Kunci idempotensi:{' '}
              <span className="font-mono">{idempotencyKey}</span>
            </FormDescription>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                Simpan pengeluaran
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

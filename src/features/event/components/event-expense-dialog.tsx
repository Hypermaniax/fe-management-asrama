import { useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

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
import { Label } from '@/components/ui/label'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBuildings } from '@/features/building/hooks'
import { CashAccountSelect } from '@/features/cash-account/components/cash-account-select'
import { useCategories } from '@/features/category/hooks'
import type { EventDetail } from '@/features/event/api'
import { useRecordEventExpense } from '@/features/event/hooks'
import {
  eventExpenseSchema,
  type EventExpenseFormValues,
} from '@/features/event/schema'
import { useUploadExpenseReceipt } from '@/features/expense/hooks'
import {
  createExpenseIdempotencyKey,
  RECEIPT_MAX_SIZE_BYTES,
  RECEIPT_MIME_TYPES,
  todayInputDate,
  toOccurredAt,
} from '@/features/expense/lib'
import { formatBytes } from '@/features/document/lib'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'

export function EventExpenseDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventDetail
}) {
  const record = useRecordEventExpense()
  const upload = useUploadExpenseReceipt()
  const categories = useCategories('EXPENSE')
  const buildings = useBuildings()

  const [buildingId, setBuildingId] = useState(event.buildingId ?? '')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [idempotencyKey] = useState(() => createExpenseIdempotencyKey())

  const form = useForm<EventExpenseFormValues>({
    resolver: zodResolver(eventExpenseSchema),
    defaultValues: {
      cashAccountId: '',
      categoryId: '',
      amount: '',
      occurredAt: todayInputDate(),
      vendor: '',
      description: '',
    },
  })

  const accountId = useWatch({
    control: form.control,
    name: 'cashAccountId',
  })

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
    if (!buildingId) {
      notifyError('Gagal mencatat pengeluaran', 'Pilih gedung terlebih dahulu.')
      return
    }
    if (!receiptFile) {
      setReceiptError('Bukti pengeluaran wajib diunggah.')
      return
    }

    try {
      const uploaded = await upload.mutateAsync(receiptFile)
      const result = await record.mutateAsync({
        eventId: event.id,
        input: {
          categoryId: values.categoryId,
          amount: Number(values.amount),
          occurredAt: toOccurredAt(values.occurredAt),
          receiptFileId: uploaded.data.id,
          cashAccountId: values.cashAccountId,
          vendor: values.vendor || null,
          description: values.description || null,
          idempotencyKey,
        },
      })
      notifySuccess(result.status, formatRupiah(Number(values.amount)))
      onOpenChange(false)
    } catch (error) {
      notifyError('Gagal mencatat pengeluaran', error)
    }
  })

  const pending = upload.isPending || record.isPending
  const fixedBuilding = event.scope === 'GEDUNG' && Boolean(event.buildingId)
  const buildingName = (buildings.data ?? []).find(
    (building) => building.id === buildingId,
  )?.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Catat pengeluaran kegiatan</DialogTitle>
          <DialogDescription>
            Pengeluaran mengurangi saldo kas dan menambah realisasi anggaran
            kegiatan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
          >
            <div className="grid gap-2">
              <Label>Gedung</Label>
              {fixedBuilding ? (
                <p className="text-sm text-foreground/80">
                  {buildingName ?? 'Gedung kegiatan'}
                </p>
              ) : (
                <NativeSelect
                  value={buildingId}
                  onChange={(event) => {
                    setBuildingId(event.target.value)
                    form.setValue('cashAccountId', '')
                    form.setValue('categoryId', '')
                  }}
                >
                  <NativeSelectOption value="">Pilih gedung</NativeSelectOption>
                  {(buildings.data ?? []).map((building) => (
                    <NativeSelectOption key={building.id} value={building.id}>
                      {building.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              )}
            </div>

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
                    <Textarea placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel htmlFor="event-expense-receipt">Bukti</FormLabel>
              <FormControl>
                <Input
                  id="event-expense-receipt"
                  type="file"
                  accept={RECEIPT_MIME_TYPES.join(',')}
                  onChange={onFileChange}
                />
              </FormControl>
              <FormDescription>
                PDF/PNG/JPEG maksimal {formatBytes(RECEIPT_MAX_SIZE_BYTES)}.
                {accountId ? '' : ' Pilih akun kas terlebih dahulu.'}
              </FormDescription>
              {receiptError ? (
                <p className="text-sm text-danger">{receiptError}</p>
              ) : null}
            </FormItem>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                Catat pengeluaran
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

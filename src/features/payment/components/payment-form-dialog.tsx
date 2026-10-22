import { useEffect, useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { BuildingSelect } from '@/components/shared/building-select'
import { LoadingButton } from '@/components/shared/loading-button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { CashAccountSelect } from '@/features/cash-account/components/cash-account-select'
import { useCashAccounts } from '@/features/cash-account/hooks'
import { useInvoices } from '@/features/invoice/hooks'
import { formatPeriod } from '@/features/invoice/lib'
import type { PaymentInput, PaymentMethod } from '@/features/payment/api'
import {
  useCreatePayment,
  useUploadPaymentProof,
} from '@/features/payment/hooks'
import {
  createIdempotencyKey,
  PAYMENT_METHOD_ITEMS,
  PROOF_MAX_SIZE_BYTES,
  PROOF_MIME_TYPES,
} from '@/features/payment/lib'
import { paymentSchema, type PaymentFormValues } from '@/features/payment/schema'
import { ResidentSelect } from '@/features/resident/components/resident-select'
import { formErrorClass } from '@/lib/form'
import { formatBytes } from '@/features/document/lib'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'
import { useScopeStore } from '@/stores/scope'

const emptyValues: PaymentFormValues = {
  buildingId: '',
  userId: '',
  amount: '',
  method: 'CASH',
  cashAccountId: '',
  autoFifo: true,
  referenceNo: '',
  note: '',
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  initialBuildingId,
  initialUserId,
  initialInvoiceId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialBuildingId?: string | null
  initialUserId?: string | null
  initialInvoiceId?: string | null
}) {
  const activeBuildingId = useScopeStore((state) => state.activeBuildingId)
  const create = useCreatePayment()
  const upload = useUploadPaymentProof()
  const cashAccounts = useCashAccounts()

  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)
  const [allocationError, setAllocationError] = useState<string | null>(null)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(() =>
    initialInvoiceId ? [initialInvoiceId] : [],
  )
  const [idempotencyKey] = useState(() => createIdempotencyKey())

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...emptyValues,
      buildingId: initialBuildingId ?? activeBuildingId ?? '',
      userId: initialUserId ?? '',
      autoFifo: !initialInvoiceId,
    },
  })

  const buildingId = useWatch({ control: form.control, name: 'buildingId' })
  const userId = useWatch({ control: form.control, name: 'userId' })
  const autoFifo = useWatch({ control: form.control, name: 'autoFifo' })

  const invoices = useInvoices(
    { buildingId: buildingId || undefined },
    open && Boolean(buildingId),
  )

  const outstanding = (invoices.data ?? [])
    .filter(
      (invoice) =>
        invoice.userId === userId &&
        ['ISSUED', 'PARTIAL', 'OVERDUE'].includes(invoice.status),
    )
    .sort(
      (a, b) =>
        a.periodYear - b.periodYear || a.periodMonth - b.periodMonth,
    )

  useEffect(() => {
    if (!initialInvoiceId) return
    const invoice = outstanding.find((item) => item.id === initialInvoiceId)
    if (!invoice) return
    const amount = String(
      Math.max(invoice.totalAmount - invoice.paidAmount, 0),
    )
    if (form.getValues('amount') === amount) return
    form.setValue('amount', amount, { shouldValidate: true })
  }, [initialInvoiceId, outstanding, form])

  useEffect(() => {
    if (!open || !buildingId) return
    const accounts = (cashAccounts.data ?? []).filter(
      (account) => account.buildingId === buildingId,
    )
    if (accounts.length === 1 && !form.getValues('cashAccountId')) {
      form.setValue('cashAccountId', accounts[0].id)
    }
  }, [open, buildingId, cashAccounts.data, form])

  const toggleInvoice = (invoiceId: string, checked: boolean) => {
    const next = checked
      ? [...selectedInvoiceIds, invoiceId]
      : selectedInvoiceIds.filter((id) => id !== invoiceId)
    setSelectedInvoiceIds(next)
    setAllocationError(null)
    const total = outstanding
      .filter((invoice) => next.includes(invoice.id))
      .reduce(
        (sum, invoice) =>
          sum + Math.max(invoice.totalAmount - invoice.paidAmount, 0),
        0,
      )
    form.setValue('amount', String(total), { shouldValidate: true })
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setProofFile(null)
      setProofError(null)
      return
    }
    if (!PROOF_MIME_TYPES.includes(file.type)) {
      setProofFile(null)
      setProofError('Gunakan berkas PDF, PNG, atau JPEG.')
      return
    }
    if (file.size > PROOF_MAX_SIZE_BYTES) {
      setProofFile(null)
      setProofError(`Ukuran maksimal ${formatBytes(PROOF_MAX_SIZE_BYTES)}.`)
      return
    }
    setProofFile(file)
    setProofError(null)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setAllocationError(null)

    const allocations = values.autoFifo
      ? undefined
      : outstanding
          .filter((invoice) => selectedInvoiceIds.includes(invoice.id))
          .map((invoice) => ({
            invoiceId: invoice.id,
            amount: Math.max(invoice.totalAmount - invoice.paidAmount, 0),
          }))

    if (!values.autoFifo && (!allocations || allocations.length === 0)) {
      setAllocationError('Pilih minimal satu tagihan untuk dialokasikan.')
      return
    }

    try {
      let proofFileId: string | null = null
      if (proofFile) {
        const uploadResult = await upload.mutateAsync(proofFile)
        proofFileId = uploadResult.data.id
      }

      const input: PaymentInput = {
        userId: values.userId,
        amount: Number(values.amount),
        method: values.method as PaymentMethod,
        cashAccountId: values.cashAccountId,
        referenceNo: values.referenceNo || null,
        proofFileId,
        idempotencyKey,
        note: values.note || null,
        allocations,
      }

      const result = await create.mutateAsync(input)
      notifySuccess(result.status, formatRupiah(Number(values.amount)))
      onOpenChange(false)
    } catch (error) {
      notifyError('Gagal mencatat pembayaran', error)
    }
  })

  const pending = create.isPending || upload.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Catat pembayaran</DialogTitle>
          <DialogDescription>
            Catat pembayaran tunai/transfer dan alokasikan ke tagihan penghuni.
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
                        form.setValue('userId', '')
                        form.setValue('cashAccountId', '')
                        form.setValue('amount', '')
                        form.setValue('autoFifo', true)
                        setSelectedInvoiceIds([])
                      }}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penghuni</FormLabel>
                  <FormControl>
                    <ResidentSelect
                      buildingId={buildingId}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('amount', '')
                        form.setValue('autoFifo', true)
                        setSelectedInvoiceIds([])
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="mis. 350000"
                        disabled={!autoFifo}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode</FormLabel>
                    <Select
                      items={PAYMENT_METHOD_ITEMS}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-secondary-background text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHOD_ITEMS.map((item) => (
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
              name="autoFifo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
                  <div className="flex flex-col gap-0.5">
                    <FormLabel>Alokasi otomatis (FIFO)</FormLabel>
                    <FormDescription>
                      Nominal dialokasikan ke tagihan outstanding tertua.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        setSelectedInvoiceIds([])
                        setAllocationError(null)
                        form.setValue('amount', '')
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!autoFifo ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-heading">Pilih tagihan</span>
                {outstanding.length === 0 ? (
                  <p className="text-sm text-foreground/60">
                    Tidak ada tagihan outstanding untuk penghuni ini.
                  </p>
                ) : (
                  <div className="flex flex-col rounded-base border-2 border-border">
                    {outstanding.map((invoice, index) => {
                      const amount = Math.max(
                        invoice.totalAmount - invoice.paidAmount,
                        0,
                      )
                      return (
                        <label
                          key={invoice.id}
                          className={`flex cursor-pointer items-center justify-between gap-3 p-3 ${
                            index > 0 ? 'border-t-2 border-border' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedInvoiceIds.includes(invoice.id)}
                              onCheckedChange={(checked) =>
                                toggleInvoice(invoice.id, checked === true)
                              }
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-heading">
                                {invoice.code}
                              </span>
                              <span className="text-xs text-foreground/60">
                                {formatPeriod(
                                  invoice.periodYear,
                                  invoice.periodMonth,
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm tabular-nums">
                            {formatRupiah(amount)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
                {allocationError ? (
                  <p className="text-sm text-danger">{allocationError}</p>
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="referenceNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referensi</FormLabel>
                    <FormControl>
                      <Input placeholder="Opsional" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-heading">Bukti pembayaran</span>
              <Input
                type="file"
                aria-label="Bukti pembayaran"
                accept={PROOF_MIME_TYPES.join(',')}
                onChange={onFileChange}
                className="cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:font-heading"
              />
              {proofFile ? (
                <p className="text-sm text-foreground/70">
                  {proofFile.name} · {formatBytes(proofFile.size)}
                </p>
              ) : (
                <p className="text-sm text-foreground/60">
                  Opsional · PDF/PNG/JPEG maks 10 MB.
                </p>
              )}
              {proofError ? (
                <p className="text-sm text-danger">{proofError}</p>
              ) : null}
            </div>

            <FormDescription>
              Kunci idempotensi: <span className="font-mono">{idempotencyKey}</span>
            </FormDescription>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                Simpan pembayaran
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

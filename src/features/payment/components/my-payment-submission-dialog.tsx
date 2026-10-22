import { useState, type ChangeEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { CurrencyText } from '@/components/shared/currency-text'
import { DateText } from '@/components/shared/date-text'
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
import { formatBytes } from '@/features/document/lib'
import type { MyInvoice } from '@/features/invoice/api'
import { formatPeriod } from '@/features/invoice/lib'
import {
  useCreateMyPaymentSubmission,
  useUploadPaymentProof,
} from '@/features/payment/hooks'
import {
  MY_PAYMENT_METHOD_ITEMS,
  PROOF_MAX_SIZE_BYTES,
  PROOF_MIME_TYPES,
} from '@/features/payment/lib'
import {
  myPaymentSubmissionSchema,
  type MyPaymentSubmissionFormValues,
} from '@/features/payment/schema'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formatRupiah } from '@/lib/utils'

export function MyPaymentSubmissionDialog({
  open,
  onOpenChange,
  invoice,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: MyInvoice | null
}) {
  const upload = useUploadPaymentProof()
  const create = useCreateMyPaymentSubmission()
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofError, setProofError] = useState<string | null>(null)

  const form = useForm<MyPaymentSubmissionFormValues>({
    resolver: zodResolver(myPaymentSubmissionSchema),
    defaultValues: {
      method: 'TRANSFER',
      referenceNo: '',
      note: '',
    },
  })

  const remaining = invoice
    ? Math.max(invoice.totalAmount - invoice.paidAmount, 0)
    : 0

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
    if (!invoice) return
    if (!proofFile) {
      setProofError('Bukti pembayaran wajib diunggah.')
      return
    }

    try {
      const uploadResult = await upload.mutateAsync(proofFile)
      await create.mutateAsync({
        invoiceId: invoice.id,
        amount: remaining,
        method: values.method,
        proofFileId: uploadResult.data.id,
        referenceNo: values.referenceNo || null,
        note: values.note || null,
      })
      notifySuccess(
        'payment submitted',
        `${formatPeriod(invoice.periodYear, invoice.periodMonth)} · ${formatRupiah(remaining)}`,
      )
      onOpenChange(false)
    } catch (error) {
      notifyError('Gagal mengajukan pembayaran', error)
    }
  })

  const pending = upload.isPending || create.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajukan pembayaran</DialogTitle>
          <DialogDescription>
            Pembayaran diverifikasi admin sebelum tagihan dinyatakan lunas.
          </DialogDescription>
        </DialogHeader>

        {invoice ? (
          <div className="flex flex-col gap-2 rounded-base border-2 border-border bg-secondary-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-heading">{invoice.code}</span>
              <span className="text-sm">
                {formatPeriod(invoice.periodYear, invoice.periodMonth)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-foreground/70">
              <span>
                Jatuh tempo <DateText value={invoice.dueDate} />
              </span>
              <span className="text-base text-foreground">
                <CurrencyText value={remaining} />
              </span>
            </div>
            <p className="text-xs text-foreground/60">
              Pembayaran harus penuh untuk periode ini.
            </p>
          </div>
        ) : null}

        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto pr-1"
          >
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode</FormLabel>
                  <Select
                    items={MY_PAYMENT_METHOD_ITEMS}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MY_PAYMENT_METHOD_ITEMS.map((item) => (
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
                <FormDescription>
                  Wajib · PDF/PNG/JPEG maks {formatBytes(PROOF_MAX_SIZE_BYTES)}.
                </FormDescription>
              )}
              {proofError ? (
                <p className="text-sm text-danger">{proofError}</p>
              ) : null}
            </div>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending || !invoice}
              >
                Kirim pengajuan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

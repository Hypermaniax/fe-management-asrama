import { z } from 'zod'

export const paymentSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  userId: z.string().min(1, 'Penghuni wajib dipilih'),
  amount: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        Number(value) >= 1 &&
        Number(value) <= 1_000_000_000_000,
      'Nominal minimal Rp1',
    ),
  method: z.enum(['CASH', 'TRANSFER', 'QRIS'], {
    message: 'Pilih metode pembayaran',
  }),
  cashAccountId: z.string().min(1, 'Akun kas wajib dipilih'),
  autoFifo: z.boolean(),
  referenceNo: z.string().trim().max(100, 'Maksimal 100 karakter'),
  note: z.string().trim().max(255, 'Maksimal 255 karakter'),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>

export const myPaymentSubmissionSchema = z.object({
  method: z.enum(['TRANSFER', 'QRIS'], {
    message: 'Pilih metode pembayaran',
  }),
  referenceNo: z.string().trim().max(100, 'Maksimal 100 karakter'),
  note: z.string().trim().max(255, 'Maksimal 255 karakter'),
})

export type MyPaymentSubmissionFormValues = z.infer<
  typeof myPaymentSubmissionSchema
>

import { z } from 'zod'

export const generateInvoiceSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  year: z
    .string()
    .refine(
      (value) =>
        /^\d{4}$/.test(value) &&
        Number(value) >= 2000 &&
        Number(value) <= 2100,
      'Tahun tidak valid',
    ),
  month: z
    .string()
    .refine(
      (value) => Number(value) >= 1 && Number(value) <= 12,
      'Pilih bulan',
    ),
})

export type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>

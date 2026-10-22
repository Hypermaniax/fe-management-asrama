import { z } from 'zod'

export const expenseSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  cashAccountId: z.string().min(1, 'Akun kas wajib dipilih'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
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
  occurredAt: z
    .string()
    .min(1, 'Tanggal wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid'),
  vendor: z.string().trim().max(150, 'Maksimal 150 karakter'),
  description: z.string().trim().max(255, 'Maksimal 255 karakter'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

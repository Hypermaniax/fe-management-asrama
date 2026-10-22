import { z } from 'zod'

export const cashAccountSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  name: z
    .string()
    .trim()
    .min(1, 'Nama akun wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  type: z.enum(['CASH', 'BANK'], { message: 'Pilih tipe akun' }),
  openingBalance: z
    .string()
    .trim()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        Number(value) >= 0 &&
        Number(value) <= 1_000_000_000_000,
      'Saldo awal berupa angka 0 atau lebih',
    ),
})

export type CashAccountFormValues = z.infer<typeof cashAccountSchema>

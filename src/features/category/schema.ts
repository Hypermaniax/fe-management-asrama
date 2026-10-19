import { z } from 'zod'

export const categorySchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  name: z
    .string()
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  kind: z.enum(['INCOME', 'EXPENSE'], { message: 'Pilih jenis' }),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

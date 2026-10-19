import { z } from 'zod'

export const roleSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Kode wajib diisi')
    .max(50, 'Maksimal 50 karakter')
    .regex(/^[A-Z0-9_]+$/, 'Gunakan huruf kapital, angka, atau garis bawah'),
  name: z
    .string()
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  description: z.string().trim().max(255, 'Maksimal 255 karakter'),
  isActive: z.boolean(),
})

export type RoleFormValues = z.infer<typeof roleSchema>

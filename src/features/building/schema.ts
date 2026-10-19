import { z } from 'zod'

export const buildingSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Maksimal 20 karakter'),
  name: z
    .string()
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  gender: z.enum(['MALE', 'FEMALE'], { message: 'Pilih gender' }),
  address: z
    .string()
    .trim()
    .min(1, 'Alamat wajib diisi')
    .max(255, 'Maksimal 255 karakter'),
  isActive: z.boolean(),
})

export type BuildingFormValues = z.infer<typeof buildingSchema>

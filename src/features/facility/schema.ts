import { z } from 'zod'

export const facilitySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Kode wajib diisi')
    .max(30, 'Maksimal 30 karakter'),
  name: z
    .string()
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Maksimal 100 karakter'),
  scope: z.enum(['ROOM', 'PUBLIC'], { message: 'Pilih cakupan' }),
  usageMode: z.enum(['ASSIGNED', 'SHARED'], { message: 'Pilih tipe' }),
  category: z.enum(['FURNITURE', 'SANITARY', 'APPLIANCE', 'OTHER'], {
    message: 'Pilih kategori',
  }),
  isActive: z.boolean(),
})

export type FacilityFormValues = z.infer<typeof facilitySchema>

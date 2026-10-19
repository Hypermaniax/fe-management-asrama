import { z } from 'zod'

export const publicFacilitySchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  facilityId: z.string().min(1, 'Fasilitas wajib dipilih'),
  number: z.string().trim().max(30, 'Maksimal 30 karakter'),
  capacity: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'Harus angka ≥ 0',
    ),
  status: z.enum(['ACTIVE', 'MAINTENANCE'], { message: 'Pilih status' }),
  note: z.string().trim().max(255, 'Maksimal 255 karakter'),
})

export type PublicFacilityFormValues = z.infer<typeof publicFacilitySchema>

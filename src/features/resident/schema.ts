import { z } from 'zod'

export const residentProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(120, 'Maksimal 120 karakter'),
  phone: z.string().trim().max(30, 'Maksimal 30 karakter'),
  gender: z.enum(['MALE', 'FEMALE']).nullable(),
  buildingId: z.string(),
  nationalId: z.string().trim().max(32, 'Maksimal 32 karakter'),
  address: z.string().trim().max(255, 'Maksimal 255 karakter'),
  guardianName: z.string().trim().max(120, 'Maksimal 120 karakter'),
  guardianPhone: z.string().trim().max(30, 'Maksimal 30 karakter'),
})

export type ResidentProfileValues = z.infer<typeof residentProfileSchema>

export const rejectResidentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Alasan minimal 3 karakter')
    .max(500, 'Maksimal 500 karakter'),
})

export type RejectResidentValues = z.infer<typeof rejectResidentSchema>

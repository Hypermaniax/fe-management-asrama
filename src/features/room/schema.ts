import { z } from 'zod'

export const roomSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  number: z
    .string()
    .trim()
    .min(1, 'Nomor kamar wajib diisi')
    .max(20, 'Maksimal 20 karakter'),
  capacity: z
    .string()
    .trim()
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 50,
      'Kapasitas 1–50 orang',
    ),
  status: z.enum(['ACTIVE', 'MAINTENANCE'], { message: 'Pilih status' }),
})

export type RoomFormValues = z.infer<typeof roomSchema>

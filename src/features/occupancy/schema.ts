import { z } from 'zod'

export const occupancySchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  userId: z.string().min(1, 'Penghuni wajib dipilih'),
  roomId: z.string().min(1, 'Kamar wajib dipilih'),
  bedLabel: z.string().trim().max(20, 'Maksimal 20 karakter'),
})

export type OccupancyFormValues = z.infer<typeof occupancySchema>

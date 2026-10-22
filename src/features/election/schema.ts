import { z } from 'zod'

const dateTimeValue = z
  .string()
  .min(1, 'Waktu wajib diisi')
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Waktu tidak valid')

export const electionSchema = z
  .object({
    code: z.string().trim().min(1, 'Kode wajib diisi').max(50, 'Maksimal 50 karakter'),
    title: z.string().trim().min(1, 'Judul wajib diisi').max(150, 'Maksimal 150 karakter'),
    description: z.string().trim().max(500, 'Maksimal 500 karakter'),
    buildingId: z.string(),
    periodId: z.string(),
    startAt: dateTimeValue,
    endAt: dateTimeValue,
    allowAbstain: z.boolean(),
    eligibleRoleIds: z.array(z.string()),
  })
  .refine((values) => !values.endAt || values.endAt > values.startAt, {
    path: ['endAt'],
    message: 'Selesai harus setelah mulai',
  })

export type ElectionFormValues = z.infer<typeof electionSchema>

export const candidateSchema = z.object({
  userId: z.string().min(1, 'Warga wajib dipilih'),
  orderNo: z
    .string()
    .refine(
      (value) => !value || (/^\d+$/.test(value) && Number(value) >= 1),
      'Nomor urut tidak valid',
    ),
  vision: z.string().trim().max(500, 'Maksimal 500 karakter'),
  mission: z.string().trim().max(1000, 'Maksimal 1000 karakter'),
})

export type CandidateFormValues = z.infer<typeof candidateSchema>

export const finalizeSchema = z.object({
  positionId: z.string().min(1, 'Jabatan wajib dipilih'),
  candidateId: z.string(),
})

export type FinalizeFormValues = z.infer<typeof finalizeSchema>

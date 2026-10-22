import { z } from 'zod'

const dateValue = z
  .string()
  .min(1, 'Tanggal wajib diisi')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid')

export const periodSchema = z
  .object({
    code: z.string().trim().min(1, 'Kode wajib diisi').max(50),
    name: z.string().trim().min(1, 'Nama wajib diisi').max(100),
    startDate: dateValue,
    endDate: dateValue,
    decreeNumber: z.string().trim().max(100, 'Maksimal 100 karakter'),
  })
  .refine((values) => values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'Tanggal selesai tidak boleh sebelum tanggal mulai',
  })

export type PeriodFormValues = z.infer<typeof periodSchema>

export const positionSchema = z.object({
  code: z.string().trim().min(1, 'Kode wajib diisi').max(50),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(100),
  level: z
    .string()
    .trim()
    .refine(
      (value) => !value || (/^\d+$/.test(value) && Number(value) >= 1),
      'Level minimal 1',
    ),
  buildingId: z.string(),
  roleId: z.string(),
  description: z.string().trim().max(255, 'Maksimal 255 karakter'),
})

export type PositionFormValues = z.infer<typeof positionSchema>

export const assignmentSchema = z.object({
  userId: z.string().min(1, 'Pengguna wajib dipilih'),
  periodId: z.string().min(1, 'Periode wajib dipilih'),
  positionId: z.string().min(1, 'Jabatan wajib dipilih'),
  buildingId: z.string(),
  startDate: dateValue,
  decreeNumber: z.string().trim().max(100, 'Maksimal 100 karakter'),
})

export type AssignmentFormValues = z.infer<typeof assignmentSchema>

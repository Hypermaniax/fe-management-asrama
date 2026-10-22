import { z } from 'zod'

import { expenseSchema } from '@/features/expense/schema'

const dateTimeValue = z
  .string()
  .min(1, 'Waktu wajib diisi')
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Waktu tidak valid')

const dateValue = z
  .string()
  .min(1, 'Tanggal wajib diisi')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal tidak valid')

export const eventSchema = z
  .object({
    title: z.string().trim().min(1, 'Judul wajib diisi').max(150),
    description: z.string().trim().max(2000, 'Maksimal 2000 karakter'),
    category: z.enum(['RUTIN', 'BESAR']),
    isAdHoc: z.boolean(),
    scope: z.enum(['ASRAMA', 'GEDUNG']),
    buildingId: z.string(),
    startAt: dateTimeValue,
    endAt: z
      .string()
      .refine(
        (value) => !value || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value),
        'Waktu tidak valid',
      ),
    location: z.string().trim().max(150, 'Maksimal 150 karakter'),
    budgetAmount: z
      .string()
      .trim()
      .refine(
        (value) =>
          !value ||
          (/^\d+$/.test(value) && Number(value) <= 1_000_000_000_000),
        'Nominal tidak valid',
      ),
    isPublic: z.boolean(),
    recurrence: z.enum(['NONE', 'WEEKLY', 'MONTHLY']),
  })
  .refine(
    (values) => values.scope !== 'GEDUNG' || Boolean(values.buildingId),
    { path: ['buildingId'], message: 'Gedung wajib dipilih' },
  )
  .refine(
    (values) => !values.endAt || values.endAt > values.startAt,
    { path: ['endAt'], message: 'Selesai harus setelah mulai' },
  )

export type EventFormValues = z.infer<typeof eventSchema>

export const sessionSchema = z.object({
  title: z.string().trim().max(150, 'Maksimal 150 karakter'),
  scheduledAt: dateTimeValue,
  location: z.string().trim().max(150, 'Maksimal 150 karakter'),
  note: z.string().trim().max(500, 'Maksimal 500 karakter'),
})

export type SessionFormValues = z.infer<typeof sessionSchema>

export const generateSessionsSchema = z.object({
  datesText: z
    .string()
    .trim()
    .min(1, 'Isi minimal satu tanggal')
    .refine(
      (value) =>
        value
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .every((line) => dateValue.safeParse(line).success),
      'Gunakan format YYYY-MM-DD per baris',
    ),
})

export type GenerateSessionsFormValues = z.infer<
  typeof generateSessionsSchema
>

export const committeeSchema = z.object({
  userId: z.string().min(1, 'Pengguna wajib dipilih'),
  eventRole: z.string().trim().min(1, 'Peran wajib diisi').max(100),
  positionId: z.string(),
})

export type CommitteeFormValues = z.infer<typeof committeeSchema>

export const eventExpenseSchema = expenseSchema.omit({ buildingId: true })

export type EventExpenseFormValues = z.infer<typeof eventExpenseSchema>

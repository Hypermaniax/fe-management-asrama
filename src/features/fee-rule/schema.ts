import { z } from 'zod'

export const feeRuleSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  dueDayOfMonth: z
    .string()
    .trim()
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 28,
      'Tanggal 1–28',
    ),
  defaultMonthlyRate: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), 'Tarif harus angka ≥ 0'),
  effectiveFrom: z.string().min(1, 'Tanggal berlaku wajib diisi'),
})

export type FeeRuleFormValues = z.infer<typeof feeRuleSchema>

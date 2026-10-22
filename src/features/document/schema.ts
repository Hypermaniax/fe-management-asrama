import { z } from 'zod'

export const documentTypeSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  code: z
    .string()
    .trim()
    .min(1, 'Kode wajib diisi')
    .max(20, 'Maksimal 20 karakter'),
  name: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(80, 'Maksimal 80 karakter'),
  isRequiredByDefault: z.boolean(),
  maxSizeMb: z
    .string()
    .trim()
    .refine(
      (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 10,
      'Ukuran 1–10 MB',
    ),
  allowedMimeTypes: z
    .array(z.string())
    .min(1, 'Pilih minimal satu tipe berkas'),
  sortOrder: z.string().trim(),
})

export type DocumentTypeFormValues = z.infer<typeof documentTypeSchema>

export const requestDocumentSchema = z.object({
  buildingId: z.string().min(1, 'Gedung wajib dipilih'),
  userId: z.string().min(1, 'Penghuni wajib dipilih'),
  documentTypeId: z.string().min(1, 'Jenis dokumen wajib dipilih'),
})

export type RequestDocumentValues = z.infer<typeof requestDocumentSchema>

export const rejectDocumentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Alasan minimal 3 karakter')
    .max(500, 'Maksimal 500 karakter'),
})

export type RejectDocumentValues = z.infer<typeof rejectDocumentSchema>

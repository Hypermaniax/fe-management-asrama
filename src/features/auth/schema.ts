import { z } from 'zod'

export const emailSchema = z.email('Email tidak valid')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Kata sandi wajib diisi'),
})

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    confirm: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((values) => values.password === values.confirm, {
    path: ['confirm'],
    message: 'Kata sandi tidak cocok',
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

export function isValidEmail(value: string): boolean {
  return emailSchema.safeParse(value).success
}

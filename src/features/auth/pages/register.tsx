import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signUp } from '@/features/auth/api'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schema'
import { ApiRequestError } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirm: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => signUp(values.email, values.password),
    onSuccess: (res, values) => {
      notifySuccess(res.status, 'Kode OTP dikirim ke email kamu.')
      navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`, {
        replace: true,
      })
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.httpStatus === 409) {
        toast.error('Email sudah terdaftar', {
          description: 'Masuk dengan akun itu, atau pakai email lain.',
          action: { label: 'Masuk', onClick: () => navigate('/login') },
        })
        return
      }
      notifyError('Pendaftaran gagal', error)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="label text-foreground/60">Calon penghuni</span>
        <h1 className="font-heading text-2xl">Daftar</h1>
        <p className="text-sm text-foreground/80">
          Buat akun untuk mendaftar jadi penghuni asrama.
        </p>
      </header>

      <Form {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="pl-9"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className={formErrorClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata sandi</FormLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                      className="pl-9 pr-11"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan kata sandi'
                        : 'Tampilkan kata sandi'
                    }
                    aria-pressed={showPassword}
                    className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-base text-foreground/60 hover:bg-accent-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FormDescription className="text-foreground/70">
                  Minimal 8 karakter.
                </FormDescription>
                <FormMessage className={formErrorClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi kata sandi</FormLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Ulangi kata sandi"
                      className="pl-9"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className={formErrorClass} />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Memproses…
              </>
            ) : (
              <>
                <UserPlus />
                Daftar
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-sm">
        Sudah punya akun?{' '}
        <Link
          to="/login"
          className="font-heading underline underline-offset-4"
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signIn } from '@/features/auth/api'
import { loginSchema, type LoginFormValues } from '@/features/auth/schema'
import { ApiRequestError } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { useAuthStore } from '@/stores/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const [showPassword, setShowPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => signIn(values.email, values.password),
    onSuccess: (session) => {
      setSession(session)
      toast.success('Berhasil masuk', {
        description: `Selamat datang, ${session.user.email}`,
      })
      const from = (location.state as { from?: string } | null)?.from ?? '/app'
      navigate(from, { replace: true })
    },
    onError: (error) => {
      if (error instanceof ApiRequestError && error.httpStatus === 403) {
        setNeedsVerification(true)
        toast.error('Email belum diverifikasi', {
          description: 'Cek kotak masuk untuk kode OTP.',
        })
        return
      }
      setNeedsVerification(false)
      toast.error('Gagal masuk', {
        description:
          error instanceof Error ? error.message : 'Terjadi kesalahan',
      })
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="label text-foreground/60">Akun</span>
        <h1 className="font-heading text-2xl">Masuk</h1>
        <p className="text-sm text-foreground/80">
          Lanjutkan ke akun asrama kamu.
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
                      autoComplete="current-password"
                      placeholder="••••••••"
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
                <FormMessage className={formErrorClass} />
              </FormItem>
            )}
          />

          {needsVerification ? (
            <div className="flex items-start gap-2 rounded-base border-2 border-border bg-accent-teal p-3 text-sm">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                Akun kamu belum diverifikasi.{' '}
                <Link
                  to={`/verify-otp?email=${encodeURIComponent(form.getValues('email'))}`}
                  className="font-heading underline underline-offset-4"
                >
                  Verifikasi sekarang
                </Link>
                .
              </p>
            </div>
          ) : null}

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
                <LogIn />
                Masuk
                <ArrowRight />
              </>
            )}
          </Button>
        </form>
      </Form>

      <p className="text-sm">
        Belum punya akun?{' '}
        <Link
          to="/register"
          className="font-heading underline underline-offset-4"
        >
          Daftar sebagai calon penghuni
        </Link>
      </p>
    </div>
  )
}

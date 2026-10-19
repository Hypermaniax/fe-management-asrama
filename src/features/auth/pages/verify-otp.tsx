import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  ArrowRight,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { requestOtp, verifyOtp } from '@/features/auth/api'
import { isValidEmail } from '@/features/auth/schema'
import { ApiRequestError } from '@/lib/api'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useAuthStore } from '@/stores/auth'

const RESEND_SECONDS = 60

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)

  const emailFromQuery = params.get('email') ?? ''
  const [email, setEmail] = useState(emailFromQuery)
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const verify = useMutation({
    mutationFn: (code: string) => verifyOtp(email, code),
    onSuccess: (res) => {
      setSession({ user: res.data.user, token: res.data.token })
      notifySuccess(res.status)
      navigate('/app', { replace: true })
    },
    onError: (error) => {
      setOtp('')
      if (error instanceof ApiRequestError && error.httpStatus === 400) {
        notifyError('Kode salah atau kedaluwarsa', error)
        return
      }
      notifyError('Verifikasi gagal', error)
    },
  })

  const resend = useMutation({
    mutationFn: () => requestOtp(email),
    onSuccess: (res) => {
      setCooldown(RESEND_SECONDS)
      notifySuccess(res.status, `Cek email ${email}.`)
    },
    onError: (error) => notifyError('Gagal mengirim ulang', error),
  })

  const emailValid = isValidEmail(email)
  const canVerify = emailValid && otp.length === 6 && !verify.isPending

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="label text-foreground/60">Verifikasi</span>
        <h1 className="font-heading text-2xl">Cek emailmu</h1>
        <p className="text-sm text-foreground/80">
          Masukkan 6 digit kode yang kami kirim
          {emailFromQuery ? (
            <>
              {' ke '}
              <span className="font-heading">{emailFromQuery}</span>
            </>
          ) : (
            ' ke emailmu'
          )}
          .
        </p>
      </header>

      {!emailFromQuery ? (
        <div className="grid gap-2">
          <Label htmlFor="otp-email">Email terdaftar</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/50" />
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              className="pl-9"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Label htmlFor="otp">Kode OTP</Label>
        <InputOTP
          id="otp"
          maxLength={6}
          value={otp}
          onChange={setOtp}
          onComplete={(value) => {
            if (emailValid && !verify.isPending) verify.mutate(value)
          }}
          containerClassName="gap-2"
        >
          <InputOTPGroup>
            <InputOTPSlot
              index={0}
              className="size-11 font-heading text-lg"
            />
            <InputOTPSlot
              index={1}
              className="size-11 font-heading text-lg"
            />
            <InputOTPSlot
              index={2}
              className="size-11 font-heading text-lg"
            />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot
              index={3}
              className="size-11 font-heading text-lg"
            />
            <InputOTPSlot
              index={4}
              className="size-11 font-heading text-lg"
            />
            <InputOTPSlot
              index={5}
              className="size-11 font-heading text-lg"
            />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!canVerify}
        onClick={() => verify.mutate(otp)}
      >
        {verify.isPending ? (
          <>
            <LoaderCircle className="animate-spin" />
            Memverifikasi…
          </>
        ) : (
          <>
            <ShieldCheck />
            Verifikasi
            <ArrowRight />
          </>
        )}
      </Button>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="neutral"
          className="w-full"
          disabled={!emailValid || cooldown > 0 || resend.isPending}
          onClick={() => resend.mutate()}
        >
          <RefreshCw className={resend.isPending ? 'animate-spin' : undefined} />
          {cooldown > 0
            ? `Kirim ulang dalam ${cooldown}s`
            : 'Kirim ulang kode'}
        </Button>
        <p className="text-center text-sm text-foreground/80">
          Salah email?{' '}
          <Link
            to="/register"
            className="font-heading underline underline-offset-4"
          >
            Daftar ulang
          </Link>{' '}
          atau{' '}
          <Link
            to="/login"
            className="font-heading underline underline-offset-4"
          >
            masuk
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

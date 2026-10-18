import { Link } from 'react-router'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

import { IslandMark } from '@/components/shared/island-mark'
import { buttonVariants } from '@/components/ui/button'
import { cta, ctaPoin, biaya, biayaCatatan } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function Cta() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-dots absolute inset-0" />
        <Sparkles className="absolute -bottom-8 -right-4 size-28 text-main/10 sm:size-44" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="pattern-plus relative overflow-hidden rounded-base border-2 border-border bg-accent-orange p-8 text-foreground shadow-shadow sm:p-12">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="flex flex-col items-start gap-5">
              <span className="label rounded-base border-2 border-border bg-background px-3 py-1.5 shadow-shadow">
                {cta.label}
              </span>
              <h2 className="font-heading text-3xl text-balance sm:text-4xl">
                {cta.judul}
              </h2>
              <p className="max-w-lg text-lg">{cta.teks}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className={cn(buttonVariants({ size: 'lg' }))}
                >
                  Mulai daftar
                  <ArrowRight />
                </Link>
                <Link
                  to="/pengenalan"
                  className={cn(
                    buttonVariants({ variant: 'neutral', size: 'lg' }),
                  )}
                >
                  Kenali asrama
                </Link>
              </div>
              <ul className="flex flex-col gap-3">
                {ctaPoin.map((item) => (
                  <li
                    key={item.teks}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-base border-2 border-border bg-main text-main-foreground">
                      <Check className="size-3" />
                    </span>
                    {item.teks}
                  </li>
                ))}
              </ul>
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

            <div className="mx-auto flex w-full max-w-xs flex-col gap-6">
              <div className="relative">
                <div className="grid w-full place-items-center rounded-base border-2 border-border bg-background p-8 shadow-shadow">
                  <IslandMark className="size-40 sm:size-52" />
                </div>
                <span className="label absolute -top-4 -right-3 -rotate-3 rounded-base border-2 border-border bg-main px-3 py-1.5 text-main-foreground shadow-shadow">
                  Yogyakarta
                </span>
                <span className="label absolute -bottom-4 -left-3 rotate-3 rounded-base border-2 border-border bg-background px-3 py-1.5 text-foreground shadow-shadow">
                  Kepulauan Riau
                </span>
              </div>

              <div className="rounded-base border-2 border-border bg-background p-5 shadow-shadow">
                <span className="label">Perkiraan iuran</span>
                <ul className="mt-3 flex flex-col gap-2">
                  {biaya.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-baseline justify-between gap-3 border-b-2 border-border/30 pb-2 text-sm last:border-b-0 last:pb-0"
                    >
                      <span>{item.label}</span>
                      <span className="font-heading">
                        {item.nilai}
                        <span className="ml-1 font-base text-xs opacity-70">
                          {item.ket}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs opacity-80">{biayaCatatan}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

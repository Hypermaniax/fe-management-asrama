import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { IslandMark } from '@/components/shared/island-mark'
import { buttonVariants } from '@/components/ui/button'
import { heroStats } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-grid absolute inset-0" />
        <span className="absolute -top-6 right-4 select-none font-heading text-7xl leading-none text-main/20 sm:text-9xl">
          ★
        </span>
        <span className="absolute bottom-4 left-6 size-16 rounded-full border-2 border-dashed border-accent-orange/70 sm:size-24" />
      </div>
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="pattern-dots grid items-center gap-10 rounded-base border-2 border-border bg-accent-teal p-8 shadow-shadow md:grid-cols-2 md:p-12">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <span className="label rounded-base border-2 border-border bg-background px-3 py-1.5 shadow-shadow">
              Asrama Mahasiswa Kepulauan Riau · Yogyakarta
            </span>
            <h1 className="font-heading text-4xl leading-[0.95] text-balance sm:text-6xl">
              Rumah kedua bagi mahasiswa Kepri di Yogyakarta.
            </h1>
            <p className="text-lg">
              Satu tempat untuk tinggal, berorganisasi, dan bertumbuh — dengan
              pengelolaan kamar, iuran, kegiatan, dan pemilihan ketua yang
              tertata.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className={cn(buttonVariants({ size: 'lg' }))}>
                Daftar menjadi penghuni
                <ArrowRight />
              </Link>
              <Link
                to="/pengenalan"
                className={cn(buttonVariants({ variant: 'neutral', size: 'lg' }))}
              >
                Kenali asrama
              </Link>
            </div>

            <dl className="flex flex-wrap gap-y-4 divide-border/40 sm:divide-x-2">
              {heroStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn('flex flex-col', i === 0 ? 'pr-6' : 'px-6')}
                >
                  <dt className="font-heading text-2xl text-foreground">
                    {stat.nilai}
                  </dt>
                  <dd className="label text-foreground/80">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
            <div className="grid w-full place-items-center rounded-base border-2 border-border bg-background p-8 shadow-shadow">
              <IslandMark className="size-48 sm:size-64" />
            </div>
            <span className="label absolute -top-4 -right-3 -rotate-3 rounded-base border-2 border-border bg-accent-orange px-3 py-1.5 text-foreground shadow-shadow">
              Kepulauan Riau
            </span>
            <span className="label absolute -bottom-4 -left-3 rotate-3 rounded-base border-2 border-border bg-main px-3 py-1.5 text-main-foreground shadow-shadow">
              Yogyakarta
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

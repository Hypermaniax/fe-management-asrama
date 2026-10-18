import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { alasan } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function KenapaMemilih() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-stripes absolute inset-0" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div className="md:sticky md:top-24 md:self-start">
            <span className="label">Alasan</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Kenapa memilih asrama ini?
            </h2>
            <p className="mt-4 text-lg">
              Bukan sekadar tempat tidur — asrama jadi rumah, komunitas, dan
              ruang belajar berorganisasi bagi mahasiswa Kepri.
            </p>
            <Link
              to="/register"
              className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}
            >
              Daftar menjadi penghuni
              <ArrowRight />
            </Link>
          </div>
          <ol className="divide-y-2 divide-border border-y-2 border-border">
            {alasan.map((item, i) => (
              <li key={item.judul} className="flex items-start gap-4 py-5">
                <span className="font-heading text-2xl leading-none text-main">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg">{item.judul}</h3>
                  <p className="mt-1">{item.teks}</p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-base border-2 border-border bg-accent-teal text-foreground">
                  <item.icon className="size-5" />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}

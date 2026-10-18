import { Link } from 'react-router'
import { ClipboardList } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { langkah } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function CaraJadiPenghuni() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-grid absolute inset-0" />
        <ClipboardList className="absolute -bottom-8 -right-4 size-28 text-main/10 sm:size-44" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="label">Alur pendaftaran</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Cara jadi penghuni
            </h2>
            <p className="mt-4 max-w-xl text-lg">
              Empat langkah dari mendaftar sampai resmi tinggal di asrama.
            </p>
          </div>
          <Link
            to="/register"
            className={cn(buttonVariants(), 'w-fit shrink-0')}
          >
            Daftar sekarang
          </Link>
        </div>

        <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
          <span
            aria-hidden="true"
            className="absolute inset-x-6 top-6 hidden border-t-2 border-dashed border-border lg:block"
          />
          {langkah.map((item, i) => (
            <li key={item.judul} className="relative flex gap-4 lg:block">
              {i < langkah.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-6 top-14 -bottom-10 border-l-2 border-dashed border-border lg:hidden"
                />
              )}
              <div
                className={cn(
                  'relative z-10 grid size-12 shrink-0 place-items-center rounded-base border-2 border-border font-heading text-xl shadow-shadow',
                  item.warna,
                )}
              >
                {i + 1}
              </div>
              <div className="lg:mt-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-base border-2 border-border',
                      item.angka,
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>
                  <h3 className="font-heading text-lg">{item.judul}</h3>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{item.teks}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

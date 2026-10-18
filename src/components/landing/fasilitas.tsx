import { Check } from 'lucide-react'

import { fasilitas } from '@/data/fasilitas'
import { cn } from '@/lib/utils'

export function Fasilitas() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-plus absolute inset-0" />
        <span className="absolute left-4 top-10 size-20 -rotate-12 rounded-base border-2 border-dashed border-accent-orange/60 sm:size-28" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="label">Fasilitas</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Yang kamu dapat di asrama
            </h2>
          </div>
          <span className="label shrink-0 text-foreground/80">
            {String(fasilitas.length).padStart(2, '0')} fasilitas inti
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-lg">
          Kebutuhan harian sudah disiapkan — tinggal bawa barang pribadi.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:auto-rows-[12rem] lg:grid-cols-4">
          {fasilitas.map((item, i) => (
            <div
              key={item.nama}
              className={cn(
                'relative flex snap-in flex-col gap-4 overflow-hidden rounded-base border-2 border-border p-5 shadow-shadow',
                item.warna,
                item.span,
              )}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="pointer-events-none absolute -top-3 right-2 select-none font-heading text-5xl leading-none opacity-10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'grid shrink-0 place-items-center rounded-base border-2 border-border',
                    item.besar ? 'size-12' : 'size-10',
                    item.ikonWarna,
                  )}
                >
                  <item.icon className={item.besar ? 'size-6' : 'size-5'} />
                </span>
                <h3 className={cn('font-heading', item.besar && 'text-xl')}>
                  {item.nama}
                </h3>
              </div>
              <p className="text-sm opacity-80">{item.catatan}</p>
              <ul className="mt-auto flex flex-col gap-1.5 text-sm">
                {item.poin.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'grid size-4 shrink-0 place-items-center rounded-base',
                        item.ikonWarna,
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import { Quote } from 'lucide-react'

import { testimoni } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function Testimoni() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-rings absolute inset-0" />
        <Quote className="absolute -bottom-6 -right-2 size-28 text-main/10 sm:size-40" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="label">Testimoni</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Kata penghuni
            </h2>
          </div>
          <span className="label hidden shrink-0 text-foreground/80 sm:block">
            Penghuni & alumni
          </span>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimoni.map((item) => (
            <figure
              key={item.nama}
              className={cn(
                'flex h-full flex-col gap-4 rounded-base border-2 border-border p-6 shadow-shadow',
                item.warna,
              )}
            >
              <Quote className={cn('size-8', item.kutipWarna)} />
              <blockquote className="font-heading text-lg leading-snug">
                “{item.kutipan}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 border-t-2 border-border/40 pt-4">
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-base border-2 border-border font-heading text-lg',
                    item.avatar,
                  )}
                >
                  {item.nama.charAt(0)}
                </span>
                <span className="text-sm">
                  <span className="block font-heading">{item.nama}</span>
                  {item.asal}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}

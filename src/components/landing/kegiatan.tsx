import { CalendarClock, CalendarDays, PartyPopper } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { acaraRutin, acaraTahunan } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function Kegiatan() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-dots absolute inset-0" />
        <CalendarDays className="absolute -bottom-8 -right-4 size-28 text-main/10 sm:size-44" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="label">Kegiatan</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Acara & kegiatan asrama
            </h2>
          </div>
          <span className="label hidden shrink-0 text-foreground/80 sm:block">
            Rutin & tahunan
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-lg">
          Dari rutinitas bulanan sampai acara besar tahunan — selalu ada alasan
          untuk berkumpul.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            {
              judul: 'Rutin',
              icon: CalendarClock,
              items: acaraRutin,
              warna: 'bg-accent-teal text-foreground',
              chip: [
                'bg-main text-main-foreground',
                'bg-accent-orange text-foreground',
              ],
            },
            {
              judul: 'Tahunan & besar',
              icon: PartyPopper,
              items: acaraTahunan,
              warna: 'bg-accent-orange text-foreground',
              chip: [
                'bg-main text-main-foreground',
                'bg-background text-foreground',
              ],
            },
          ].map((grup) => (
            <div
              key={grup.judul}
              className={cn(
                'rounded-base border-2 border-border p-6 shadow-shadow',
                grup.warna,
              )}
            >
              <div className="mb-4 flex items-center gap-3 border-b-2 border-border/40 pb-4">
                <span className="grid size-9 place-items-center rounded-base border-2 border-border bg-main text-main-foreground">
                  <grup.icon className="size-5" />
                </span>
                <span className="label">{grup.judul}</span>
              </div>
              <ul className="divide-y-2 divide-border/40">
                {grup.items.map((item, j) => (
                  <li
                    key={item.nama}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-8 shrink-0 place-items-center rounded-base border-2 border-border',
                        grup.chip[j % grup.chip.length],
                      )}
                    >
                      <item.icon className="size-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading">{item.nama}</span>
                        <Badge>{item.kadensi}</Badge>
                      </div>
                      <p className="mt-1 text-sm opacity-80">{item.teks}</p>
                    </div>
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

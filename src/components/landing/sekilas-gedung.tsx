import { Building2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { gedung } from '@/data/asrama'
import { cn } from '@/lib/utils'

export function SekilasGedung() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-bricks absolute inset-0" />
        <Building2 className="absolute -bottom-8 -right-4 size-28 text-main/10 sm:size-44" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="label">Gedung</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Sekilas gedung
            </h2>
          </div>
          <span className="label hidden shrink-0 text-foreground/80 sm:block">
            Putra &amp; putri terpisah
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-lg">
          Dua gedung dengan pengelolaan, fasilitas, dan kas yang berdiri sendiri.
        </p>
        <div className="mt-8 grid gap-6 auto-rows-fr sm:grid-cols-2">
          {gedung.map((item) => (
            <Card
              key={item.kode}
              className={cn('relative overflow-hidden', item.warna)}
            >
              <img
                src={item.gambar}
                alt={`Ilustrasi ${item.nama}`}
                loading="lazy"
                className="-mt-6 h-44 w-full border-b-2 border-border object-cover"
              />
              <CardHeader>
                <span
                  className={cn(
                    'grid size-12 place-items-center rounded-base border-2 border-border',
                    item.ikonWarna,
                  )}
                >
                  <item.icon className="size-6" />
                </span>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{item.nama}</CardTitle>
                  <Badge>{item.kode}</Badge>
                </div>
                <CardDescription>{item.teks}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

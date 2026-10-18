import { Sailboat } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { kepriStats, kepulauan } from '@/data/kepulauan'
import { cn } from '@/lib/utils'

export function Wilayah() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-waves absolute inset-0" />
        <Sailboat className="absolute -bottom-8 -right-4 size-28 text-main/10 sm:size-44" />
      </div>
      <section className="relative mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="label">Kepulauan Riau</span>
            <h2 className="mt-3 font-heading text-3xl text-balance sm:text-4xl">
              Dari pulau ke pulau, bertemu di Yogyakarta
            </h2>
          </div>
          <span className="label hidden shrink-0 text-foreground/80 sm:block">
            5 kabupaten · 2 kota
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-lg">
          Kepulauan Riau terbentang dari Selat Malaka hingga Laut Natuna — 5
          kabupaten dan 2 kota, dengan ribuan pulau dan 96% wilayahnya laut.
          Dari Batam yang sibuk sampai Anambas yang tenang, penghuni asrama ini
          datang dari pulau-pulau yang berbeda.
        </p>

        <div className="mt-8 grid gap-4 auto-rows-fr sm:grid-cols-2 lg:grid-cols-4">
          {kepriStats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                'h-full snap-in rounded-base border-2 border-border p-5 shadow-shadow',
                stat.warna,
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-base border-2 border-border',
                  stat.ikonWarna,
                )}
              >
                <stat.icon className="size-5" />
              </span>
              <div className="mt-4 font-heading text-4xl sm:text-5xl">
                {stat.nilai}
              </div>
              <div className="label mt-1 opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue={kepulauan[0].kode} className="mt-10">
          <div className="label mb-3">
            {kepulauan.length} wilayah · pilih untuk lihat penjelasan
          </div>
          <TabsList className="h-auto flex-wrap justify-start!">
            {kepulauan.map((item) => (
              <TabsTrigger key={item.kode} value={item.kode}>
                {item.nama}
              </TabsTrigger>
            ))}
          </TabsList>

          {kepulauan.map((item) => (
            <TabsContent
              key={item.kode}
              value={item.kode}
              className="mt-6 snap-in"
            >
              <Card className="bg-accent-teal text-foreground">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="grid size-14 shrink-0 place-items-center rounded-base border-2 border-border bg-accent-orange font-heading text-lg text-foreground">
                      {item.kode}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="label">{item.status}</span>
                      <CardTitle className="text-2xl sm:text-3xl">
                        {item.nama}
                      </CardTitle>
                      <CardDescription className="max-w-2xl text-base">
                        {item.ringkas}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:gap-8">
                  <p className="max-w-2xl">{item.deskripsi}</p>
                  <div className="flex flex-col gap-5">
                    <dl className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 rounded-base border-2 border-border bg-background p-3">
                        <dt className="label opacity-70">Pusat</dt>
                        <dd className="mt-1 font-heading">{item.pusat}</dd>
                      </div>
                      <div className="rounded-base border-2 border-border bg-accent-orange p-3">
                        <dt className="label opacity-70">Luas</dt>
                        <dd className="mt-1 font-heading">{item.luas}</dd>
                      </div>
                      <div className="rounded-base border-2 border-border bg-main p-3 text-main-foreground">
                        <dt className="label opacity-70">Penduduk</dt>
                        <dd className="mt-1 font-heading">{item.penduduk}</dd>
                      </div>
                    </dl>
                    <div>
                      <div className="label mb-2">Sorotan</div>
                      <div className="flex flex-wrap gap-2">
                        {item.sorotan.map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <p className="label mt-8 text-foreground/80">Sumber: Pemprov Kepri / BPS</p>
      </section>
    </div>
  )
}

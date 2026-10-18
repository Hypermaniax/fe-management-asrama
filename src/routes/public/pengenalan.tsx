import { CalendarClock, PartyPopper } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { alasan, acaraRutin, acaraTahunan } from '@/data/asrama'
import { fasilitasKamar as fasilitas } from '@/data/fasilitas'
import { galeri, kontak, prestasi, tentang } from '@/data/pengenalan'

export default function PengenalanPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Badge>Pengenalan</Badge>
      <h1 className="mt-4 font-heading text-3xl leading-[0.95] sm:text-5xl">
        Asrama Mahasiswa Kepulauan Riau di Yogyakarta
      </h1>
      <p className="mt-3 text-lg">
        Wadah tinggal dan berorganisasi bagi mahasiswa asal Kepulauan Riau yang
        menempuh pendidikan di Yogyakarta.
      </p>

      <Tabs defaultValue="tentang" className="mt-10">
        <TabsList className="h-auto flex-wrap justify-start!">
          <TabsTrigger value="tentang">Tentang</TabsTrigger>
          <TabsTrigger value="fasilitas">Fasilitas</TabsTrigger>
          <TabsTrigger value="kegiatan">Kegiatan</TabsTrigger>
          <TabsTrigger value="galeri">Galeri</TabsTrigger>
          <TabsTrigger value="prestasi">Prestasi</TabsTrigger>
          <TabsTrigger value="kontak">Kontak</TabsTrigger>
        </TabsList>

        <TabsContent value="tentang" className="mt-6 flex flex-col gap-6">
          {tentang.map((item) => (
            <Card key={item.judul}>
              <CardHeader>
                <CardTitle>{item.judul}</CardTitle>
                <CardDescription>{item.teks}</CardDescription>
              </CardHeader>
            </Card>
          ))}
          <div>
            <h2 className="font-heading text-2xl">
              Kenapa memilih asrama ini?
            </h2>
            <ol className="mt-4 divide-y-2 divide-border border-y-2 border-border">
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
        </TabsContent>

        <TabsContent value="fasilitas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Fasilitas</CardTitle>
              <CardDescription>
                Fasilitas kamar dikelola per kamar, sedangkan fasilitas umum
                bernomor dan berslot untuk pemerataan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4 sm:grid-cols-2">
                {fasilitas.map((item) => (
                  <li
                    key={item.nama}
                    className={`flex items-start gap-3 rounded-base border-2 border-border p-4 ${item.warna}`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-base border-2 border-border ${item.ikonWarna}`}
                    >
                      <item.icon className="size-5" />
                    </span>
                    <div>
                      <div className="font-heading">{item.nama}</div>
                      <p className="mt-1 text-sm opacity-80">{item.teks}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kegiatan" className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              judul: 'Rutin',
              icon: CalendarClock,
              items: acaraRutin,
              warna: 'bg-accent-teal text-foreground!',
              chip: [
                'bg-main text-main-foreground',
                'bg-accent-orange text-foreground',
              ],
            },
            {
              judul: 'Tahunan & besar',
              icon: PartyPopper,
              items: acaraTahunan,
              warna: 'bg-accent-orange text-foreground!',
              chip: [
                'bg-main text-main-foreground',
                'bg-background text-foreground',
              ],
            },
          ].map((grup) => (
            <Card key={grup.judul} className={grup.warna}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-base border-2 border-border bg-main text-main-foreground">
                    <grup.icon className="size-5" />
                  </span>
                  <CardTitle>{grup.judul}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-3">
                  {grup.items.map((item, j) => (
                    <li key={item.nama} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-base border-2 border-border ${grup.chip[j % grup.chip.length]}`}
                      >
                        <item.icon className="size-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading">{item.nama}</span>
                          <Badge>{item.kadensi}</Badge>
                        </div>
                        <p className="text-sm opacity-80">{item.teks}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="galeri" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galeri.map((item) => (
              <figure
                key={item.caption}
                className="overflow-hidden rounded-base border-2 border-border bg-background shadow-shadow"
              >
                <img
                  src={item.src}
                  alt={item.caption}
                  loading="lazy"
                  className="aspect-[4/3] w-full border-b-2 border-border object-cover"
                />
                <figcaption className="label p-4">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prestasi" className="mt-6 grid gap-4 sm:grid-cols-3">
          {prestasi.map((item) => (
            <Card key={item.judul}>
              <CardHeader>
                <CardTitle>{item.judul}</CardTitle>
                <CardDescription>{item.teks}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="kontak" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontak & lokasi</CardTitle>
              <CardDescription>
                Hubungi sekretariat untuk pertanyaan seputar pendaftaran dan
                domisili.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                {kontak.map((item) => (
                  <div key={item.label}>
                    <dt className="label text-main-foreground/80">
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-heading">{item.nilai}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

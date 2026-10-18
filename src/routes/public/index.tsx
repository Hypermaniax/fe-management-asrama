import { CaraJadiPenghuni } from '@/components/landing/cara-jadi-penghuni'
import { Cta } from '@/components/landing/cta'
import { Fasilitas } from '@/components/landing/fasilitas'
import { Hero } from '@/components/landing/hero'
import { Kegiatan } from '@/components/landing/kegiatan'
import { KenapaMemilih } from '@/components/landing/kenapa-memilih'
import { Marquee } from '@/components/landing/marquee'
import { SekilasGedung } from '@/components/landing/sekilas-gedung'
import { Testimoni } from '@/components/landing/testimoni'
import { Wilayah } from '@/components/landing/wilayah'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Wilayah />
      <Fasilitas />
      <KenapaMemilih />
      <Kegiatan />
      <Testimoni />
      <CaraJadiPenghuni />
      <SekilasGedung />
      <Cta />
    </>
  )
}

import type { LucideIcon } from 'lucide-react'
import {
  BedDouble,
  BookOpen,
  Boxes,
  MoonStar,
  ShieldCheck,
  ShowerHead,
  Sofa,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
} from 'lucide-react'

export interface FasilitasTile {
  icon: LucideIcon
  nama: string
  catatan: string
  poin: string[]
  span: string
  besar?: boolean
  warna: string
  ikonWarna: string
}

export interface FasilitasRingkas {
  icon: LucideIcon
  nama: string
  teks: string
  warna: string
  ikonWarna: string
}

export const fasilitas: FasilitasTile[] = [
  {
    icon: BedDouble,
    nama: 'Kamar tidur',
    catatan: 'Putra dan putri terpisah, dengan fasilitas lengkap per kamar.',
    poin: [
      'Kasur, lemari, dan meja',
      'Fasilitas lengkap per kamar',
      'Gedung putra & putri terpisah',
    ],
    span: 'lg:col-span-2 lg:row-span-2',
    besar: true,
    warna: 'bg-main text-main-foreground',
    ikonWarna: 'bg-accent-orange text-foreground',
  },
  {
    icon: ShowerHead,
    nama: 'Kamar mandi',
    catatan: 'Air bersih setiap hari.',
    poin: ['Bernomor per penghuni', 'Air bersih & lancar'],
    span: 'lg:col-span-2',
    warna: 'bg-accent-teal text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: UtensilsCrossed,
    nama: 'Dapur & ruang makan',
    catatan: 'Masak dan makan bersama.',
    poin: ['Kompor & alat masak', 'Ruang makan bersama'],
    span: 'lg:col-span-2',
    warna: 'bg-accent-orange text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: MoonStar,
    nama: 'Mushola',
    catatan: 'Tempat ibadah penghuni.',
    poin: ['Perlengkapan salat', 'Untuk ibadah harian'],
    span: '',
    warna: 'bg-background text-foreground',
    ikonWarna: 'bg-accent-teal text-foreground',
  },
  {
    icon: BookOpen,
    nama: 'Ruang belajar',
    catatan: 'Aula untuk belajar dan rapat.',
    poin: ['Meja & kursi', 'Rapat pengurus'],
    span: '',
    warna: 'bg-background text-foreground',
    ikonWarna: 'bg-accent-orange text-foreground',
  },
  {
    icon: Wifi,
    nama: 'Wi-Fi',
    catatan: 'Koneksi di area bersama.',
    poin: ['Gratis untuk penghuni', 'Area bersama & belajar'],
    span: 'lg:col-span-2',
    warna: 'bg-accent-teal text-foreground',
    ikonWarna: 'bg-accent-orange text-foreground',
  },
  {
    icon: WashingMachine,
    nama: 'Laundry & jemuran',
    catatan: 'Cuci dan jemur sendiri.',
    poin: ['Area cuci', 'Jemuran'],
    span: 'lg:col-span-2',
    warna: 'bg-background text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: ShieldCheck,
    nama: 'Parkir & keamanan',
    catatan: 'Aman dan terpantau.',
    poin: ['Area parkir', 'Penjagaan & keamanan'],
    span: 'lg:col-span-2',
    warna: 'bg-accent-orange text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
]

export const fasilitasKamar: FasilitasRingkas[] = [
  {
    icon: BedDouble,
    nama: 'Kamar berkapasitas',
    teks: 'Dengan fasilitas per kamar.',
    warna: 'bg-accent-teal text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: ShowerHead,
    nama: 'Kamar mandi bernomor',
    teks: 'Terdaftar per penghuni.',
    warna: 'bg-accent-orange text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: Sofa,
    nama: 'Ruang bersama',
    teks: 'Aula, dapur, dan area parkir.',
    warna: 'bg-background text-foreground',
    ikonWarna: 'bg-accent-teal text-foreground',
  },
  {
    icon: Boxes,
    nama: 'Fasilitas umum terkelola',
    teks: 'Berstatus ASSIGNED/SHARED.',
    warna: 'bg-accent-teal text-foreground',
    ikonWarna: 'bg-accent-orange text-foreground',
  },
  {
    icon: Wifi,
    nama: 'Wi-Fi',
    teks: 'Koneksi di area bersama.',
    warna: 'bg-accent-orange text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: WashingMachine,
    nama: 'Laundry & jemuran',
    teks: 'Area cuci dan jemur.',
    warna: 'bg-background text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
]

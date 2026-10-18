import type { LucideIcon } from 'lucide-react'
import {
  Building,
  Building2,
  ClipboardList,
  Flag,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Home,
  MapPin,
  MoonStar,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'

export interface HeroStat {
  nilai: string
  label: string
}

export interface Alasan {
  icon: LucideIcon
  judul: string
  teks: string
}

export interface Acara {
  icon: LucideIcon
  nama: string
  kadensi: string
  teks: string
}

export interface Testimoni {
  kutipan: string
  nama: string
  asal: string
  warna: string
  avatar: string
  kutipWarna: string
}

export interface Langkah {
  icon: LucideIcon
  judul: string
  teks: string
  warna: string
  angka: string
}

export interface Gedung {
  kode: string
  nama: string
  teks: string
  gambar: string
  icon: LucideIcon
  warna: string
  ikonWarna: string
}

export interface CtaPoin {
  icon: LucideIcon
  teks: string
}

export interface Biaya {
  label: string
  nilai: string
  ket: string
}

export const cta = {
  label: 'Gabung sekarang',
  judul: 'Siap tinggal bersama kami?',
  teks: 'Buat akun, unggah dokumen, lalu tunggu verifikasi pengurus.',
}

export const ctaPoin: CtaPoin[] = [
  { icon: ShieldCheck, teks: 'Verifikasi langsung oleh pengurus' },
  { icon: Wallet, teks: 'Iuran dibayar setelah diterima' },
  { icon: Home, teks: 'Gedung putra & putri terpisah' },
]

export const biaya: Biaya[] = [
  { label: 'Sewa kamar', nilai: 'Rp 300.000', ket: '/bulan' },
  { label: 'Listrik & air', nilai: 'Rp 75.000', ket: '/bulan' },
  { label: 'Kas kegiatan', nilai: 'Rp 50.000', ket: '/bulan' },
]

export const biayaCatatan =
  'Perkiraan iuran — ditarik setelah kamu diterima & check-in. Tanpa biaya pendaftaran.'

export const heroStats: HeroStat[] = [
  { nilai: '02', label: 'Gedung' },
  { nilai: '5 + 2', label: 'Kabupaten & kota' },
  { nilai: '±2.408', label: 'Pulau' },
]

export const marqueeItems: string[] = [
  'Asrama Mahasiswa Kepulauan Riau',
  'Yogyakarta',
  '2 Gedung',
  'Kepengurusan',
  'Kegiatan rutin',
]

export const alasan: Alasan[] = [
  {
    icon: Home,
    judul: 'Rumah kedua, bukan sekadar kos',
    teks: 'Tinggal jauh dari kampung jadi lebih ringan karena ada keluarga sedaerah yang menemani.',
  },
  {
    icon: Wallet,
    judul: 'Hemat & terjangkau',
    teks: 'Iuran asrama jauh lebih ringan daripada sewa kos, dengan fasilitas yang sudah disiapkan.',
  },
  {
    icon: MapPin,
    judul: 'Lokasi di Yogyakarta',
    teks: 'Kota pelajar dengan kampus berlimpah; asrama jadi titik awal menjelajah kota.',
  },
  {
    icon: Users,
    judul: 'Kekeluargaan sedaerah',
    teks: 'Bahasa, makanan, dan tradisi Kepulauan Riau yang sama bikin cepat akrab.',
  },
  {
    icon: Trophy,
    judul: 'Ruang berkembang',
    teks: 'Lewat kepengurusan, kegiatan, dan pemilihan ketua, penghuni belajar memimpin dan berorganisasi.',
  },
  {
    icon: ShieldCheck,
    judul: 'Aman & terkelola',
    teks: 'Gedung putra dan putri terpisah, dengan aturan, keamanan, dan pengelolaan keuangan yang terbuka.',
  },
]

export const acaraRutin: Acara[] = [
  {
    icon: HeartHandshake,
    nama: 'Yasinan bersama',
    kadensi: 'Bulanan',
    teks: 'Silaturahmi dan pembinaan rohani penghuni.',
  },
  {
    icon: Sparkles,
    nama: 'Kerja bakti',
    kadensi: 'Bulanan',
    teks: 'Menjaga kebersihan dan kerapian gedung bersama.',
  },
  {
    icon: ClipboardList,
    nama: 'Rapat koordinasi pengurus',
    kadensi: 'Bulanan',
    teks: 'Evaluasi program, keuangan, dan agenda asrama.',
  },
]

export const acaraTahunan: Acara[] = [
  {
    icon: PartyPopper,
    nama: 'Hari Jadi Kepulauan Riau',
    kadensi: 'Tahunan',
    teks: 'Lomba, pentas seni, dan makan bersama memperingati hari jadi Provinsi Kepri.',
  },
  {
    icon: GraduationCap,
    nama: 'Pelatihan & seminar',
    kadensi: 'Berkala',
    teks: 'Peningkatan wawasan dan keterampilan: kepemimpinan, karier, dan kewirausahaan.',
  },
  {
    icon: Handshake,
    nama: 'Malam keakraban penghuni baru',
    kadensi: 'Tahunan',
    teks: 'Orientasi dan pengakraban penghuni baru tiap awal tahun ajaran.',
  },
  {
    icon: Trophy,
    nama: 'Turnamen olahraga antar gedung',
    kadensi: 'Tahunan',
    teks: 'Futsal, badminton, voli, dan cabang olahraga lainnya.',
  },
  {
    icon: MoonStar,
    nama: 'Buka puasa bersama',
    kadensi: 'Ramadan',
    teks: 'Kebersamaan penghuni di bulan Ramadan.',
  },
  {
    icon: Flag,
    nama: 'Lomba & upacara HUT RI',
    kadensi: 'Agustus',
    teks: 'Memeriahkan 17 Agustus bersama seluruh warga asrama.',
  },
]

export const testimoni: Testimoni[] = [
  {
    kutipan:
      'Jauh dari kampung jadi terasa ringan karena ada keluarga sedaerah yang menemani tiap hari.',
    nama: 'Rizky Ananda',
    asal: 'Angkatan 2023 · Natuna',
    warna: 'bg-background text-foreground',
    avatar: 'bg-accent-teal text-foreground',
    kutipWarna: 'text-main',
  },
  {
    kutipan:
      'Belajar organisasi dan kepemimpinan langsung dari kegiatan asrama — bekal yang tak didapat di kelas.',
    nama: 'Dewi Anggraini',
    asal: 'Alumni 2022 · Batam',
    warna: 'bg-accent-teal text-foreground',
    avatar: 'bg-accent-orange text-foreground',
    kutipWarna: 'text-foreground',
  },
  {
    kutipan:
      'Iuran ramah kantong, fasilitas lengkap, dan suasana yang aman untuk fokus kuliah.',
    nama: 'Fajar Ramadhan',
    asal: 'Angkatan 2024 · Bintan',
    warna: 'bg-accent-orange text-foreground',
    avatar: 'bg-main text-main-foreground',
    kutipWarna: 'text-foreground',
  },
]

export const langkah: Langkah[] = [
  {
    icon: ClipboardList,
    judul: 'Siapkan syarat',
    teks: 'Mahasiswa aktif asal Kepulauan Riau. Siapkan KTP/KK, KTM, dan pas foto.',
    warna: 'bg-main text-main-foreground',
    angka: 'bg-accent-orange text-foreground',
  },
  {
    icon: Users,
    judul: 'Daftar akun',
    teks: 'Isi email aktif dan kata sandi, lalu lengkapi data diri serta asal daerah.',
    warna: 'bg-accent-teal text-foreground!',
    angka: 'bg-main text-main-foreground',
  },
  {
    icon: ShieldCheck,
    judul: 'Verifikasi OTP',
    teks: 'Masukkan kode OTP yang dikirim ke email untuk mengaktifkan akun.',
    warna: 'bg-accent-orange text-foreground!',
    angka: 'bg-main text-main-foreground',
  },
  {
    icon: Home,
    judul: 'Verifikasi & check-in',
    teks: 'Setelah disetujui pengurus, pilih kamar dan check-in di asrama.',
    warna: 'bg-background text-foreground!',
    angka: 'bg-main text-main-foreground',
  },
]

export const gedung: Gedung[] = [
  {
    kode: 'G1',
    nama: 'Gedung Putra',
    teks: 'Kamar, fasilitas, dan kas khusus penghuni putra.',
    gambar: '/images/gedung-putra.svg',
    icon: Building2,
    warna: 'bg-main text-main-foreground',
    ikonWarna: 'bg-accent-orange text-foreground',
  },
  {
    kode: 'G2',
    nama: 'Gedung Putri',
    teks: 'Kamar, fasilitas, dan kas khusus penghuni putri.',
    gambar: '/images/gedung-putri.svg',
    icon: Building,
    warna: 'bg-accent-teal text-foreground!',
    ikonWarna: 'bg-main text-main-foreground',
  },
]

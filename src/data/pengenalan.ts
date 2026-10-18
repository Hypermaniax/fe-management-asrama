export interface Tentang {
  judul: string
  teks: string
}

export interface Prestasi {
  judul: string
  teks: string
}

export interface Galeri {
  caption: string
  src: string
}

export interface Kontak {
  label: string
  nilai: string
}

export const tentang: Tentang[] = [
  {
    judul: 'Latar',
    teks: 'Asrama dikelola oleh kepengurusan per periode, dengan dua gedung terpisah untuk putra dan putri. Keuangan, aturan, dan fasilitas tiap gedung dikelola mandiri.',
  },
  {
    judul: 'Visi & misi',
    teks: 'Menjadi rumah kedua yang aman, tertata, dan mendukung prestasi mahasiswa Kepri — melalui kebersamaan, transparansi, dan regenerasi kepemimpinan.',
  },
]

export const prestasi: Prestasi[] = [
  {
    judul: 'Regenerasi kepemimpinan',
    teks: 'Kepengurusan berganti tiap periode lewat pemilihan penghuni.',
  },
  {
    judul: 'Program kegiatan aktif',
    teks: 'Kegiatan rutin bulanan hingga acara besar tahunan.',
  },
  {
    judul: 'Jejaring penghuni',
    teks: 'Penghuni dari 5 kabupaten dan 2 kota se-Provinsi Kepulauan Riau.',
  },
]

export const galeri: Galeri[] = [
  { caption: 'Gedung putra', src: '/images/gedung-putra.svg' },
  { caption: 'Gedung putri', src: '/images/gedung-putri.svg' },
  { caption: 'Ruang bersama', src: '/images/ruang-bersama.svg' },
  { caption: 'Kegiatan rutin', src: '/images/kegiatan-rutin.svg' },
  { caption: 'Acara tahunan', src: '/images/acara-tahunan.svg' },
  { caption: 'Kebersamaan penghuni', src: '/images/kebersamaan.svg' },
]

export const kontak: Kontak[] = [
  { label: 'Alamat', nilai: 'Yogyakarta, Daerah Istimewa Yogyakarta' },
  { label: 'Patokan', nilai: 'Dekat kampus dan akses kota' },
  { label: 'Email', nilai: 'sekretariat@asrama-kepri.id' },
  { label: 'Telepon', nilai: '(0274) 000-000' },
  { label: 'Jam sekretariat', nilai: 'Senin–Jumat, 08.00–20.00 WIB' },
]

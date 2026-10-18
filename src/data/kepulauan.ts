import type { LucideIcon } from 'lucide-react'
import { MapPinned, Mountain, TreePalm, Waves } from 'lucide-react'

export interface StatWilayah {
  icon: LucideIcon
  nilai: string
  label: string
  warna: string
  ikonWarna: string
}

export interface Wilayah {
  kode: string
  nama: string
  status: string
  ringkas: string
  pusat: string
  luas: string
  penduduk: string
  deskripsi: string
  sorotan: string[]
}

export const kepriStats: StatWilayah[] = [
  {
    icon: TreePalm,
    nilai: '±2.408',
    label: 'Pulau besar & kecil',
    warna: 'bg-background text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
  {
    icon: Waves,
    nilai: '96%',
    label: 'Wilayah laut',
    warna: 'bg-main text-main-foreground',
    ikonWarna: 'bg-accent-teal text-foreground',
  },
  {
    icon: MapPinned,
    nilai: '5 + 2',
    label: 'Kabupaten & kota',
    warna: 'bg-accent-teal text-foreground',
    ikonWarna: 'bg-accent-orange text-foreground',
  },
  {
    icon: Mountain,
    nilai: '1.165 m',
    label: 'Gunung Daik, Lingga',
    warna: 'bg-accent-orange text-foreground',
    ikonWarna: 'bg-main text-main-foreground',
  },
]

export const kepulauan: Wilayah[] = [
  {
    kode: 'AMB',
    nama: 'Anambas',
    status: 'Kabupaten',
    ringkas:
      'Gugusan pulau tropis dengan laut jernih, terumbu karang yang kaya, dan pesona bahari yang memikat di utara Kepulauan Riau.',
    pusat: 'Tarempa',
    luas: '627,03 km²',
    penduduk: '50.922',
    deskripsi:
      'Terletak di ujung utara Kepulauan Riau, Anambas adalah kabupaten kepulauan yang hidup dari laut. Dari Tarempa sebagai pusat pemerintahan hingga pulau-pulau kecil di perairannya, wilayah ini menawarkan pantai jernih dan ekosistem terumbu karang yang masih alami. Pulau Bawah dengan laguna tropisnya menjadi daya tarik bahari yang paling dikenal.',
    sorotan: [
      'Tarempa',
      'Pulau Bawah',
      'Terumbu Karang',
      'Wisata Bahari',
      'Kehidupan Pesisir',
    ],
  },
  {
    kode: 'BIN',
    nama: 'Bintan',
    status: 'Kabupaten',
    ringkas:
      'Pesona pantai tropis, lanskap alam yang unik, dan warisan sejarah Melayu dalam satu perjalanan yang penuh pengalaman.',
    pusat: 'Bandar Seri Bentan',
    luas: '1.317,15 km²',
    penduduk: '180.404',
    deskripsi:
      'Bintan memadukan wisata bahari, bentang alam yang tidak biasa, dan kekayaan budaya Melayu. Pantai berpasir putihnya menghadirkan suasana yang menenangkan, sementara Gurun Pasir Busung dan Telaga Biru menawarkan lanskap yang berbeda dari pantai tropis pada umumnya. Di balik pesona wisatanya, tradisi pesisir dan cerita sejarah Melayu masih hidup dalam keseharian.',
    sorotan: [
      'Gurun Pasir Busung',
      'Telaga Biru',
      'Pantai Trikora',
      'Lagoi',
      'Wisata Bahari',
      'Budaya Melayu',
    ],
  },
  {
    kode: 'KRM',
    nama: 'Karimun',
    status: 'Kabupaten',
    ringkas:
      'Kehidupan pesisir yang hangat, gugusan pulau yang menawan, dan kekayaan maritim yang menjadi identitas masyarakatnya.',
    pusat: 'Tanjung Balai Karimun',
    luas: '930,45 km²',
    penduduk: '273.946',
    deskripsi:
      'Karimun tumbuh sebagai wilayah kepulauan yang berdampingan dengan laut. Dari Tanjung Balai Karimun sebagai pusat aktivitas hingga pulau-pulau pesisirnya, daerah ini memperlihatkan hubungan erat antara perdagangan, budaya, dan kehidupan maritim. Pantai, kuliner hasil laut, dan tradisi pesisir melengkapinya sebagai pengalaman kepulauan yang khas.',
    sorotan: [
      'Tanjung Balai Karimun',
      'Pantai Telunas',
      'Pulau Kundur',
      'Wisata Bahari',
      'Kuliner Laut',
      'Budaya Pesisir',
    ],
  },
  {
    kode: 'LNG',
    nama: 'Lingga',
    status: 'Kabupaten',
    ringkas:
      'Tanah bersejarah di selatan Kepulauan Riau, tempat warisan Kesultanan Melayu, perbukitan hijau, dan kehidupan pulau berpadu dalam harmoni.',
    pusat: 'Daik',
    luas: '2.210,82 km²',
    penduduk: '101.039',
    deskripsi:
      'Lingga menyimpan kekayaan sejarah dan budaya Melayu, dengan Daik sebagai pusat pemerintahan dan jejak Kesultanan Riau-Lingga yang masih terasa. Bentang alamnya beragam — dari perbukitan dan hutan tropis hingga air terjun dan kawasan pesisir. Daerah ini menawarkan sisi Kepulauan Riau yang lebih tenang, alami, dan kaya cerita.',
    sorotan: [
      'Daik Lingga',
      'Air Terjun Resun',
      'Gunung Daik',
      'Warisan Kesultanan Melayu',
      'Wisata Alam',
      'Sejarah Lokal',
    ],
  },
  {
    kode: 'NTN',
    nama: 'Natuna',
    status: 'Kabupaten',
    ringkas:
      'Keindahan alam di utara Indonesia, dengan formasi granit megah, perairan luas, dan kehidupan masyarakat yang tumbuh bersama laut.',
    pusat: 'Ranai',
    luas: '1.999,16 km²',
    penduduk: '84.325',
    deskripsi:
      'Menempati bagian paling utara Provinsi Kepulauan Riau, Natuna dikenal dengan bentang alam yang khas dan potensi kelautan yang besar. Alif Stone Park menampilkan batu-batu granit raksasa yang berpadu dengan panorama laut dan garis pantai yang memikat. Kehidupan perikanan dan tradisi maritim masyarakatnya melengkapi pengalaman mengenal wilayah perbatasan Indonesia.',
    sorotan: [
      'Ranai',
      'Alif Stone Park',
      'Pantai Tanjung',
      'Batu Sindu',
      'Wisata Bahari',
      'Budaya Maritim',
    ],
  },
  {
    kode: 'BTM',
    nama: 'Batam',
    status: 'Kota',
    ringkas:
      'Kota dinamis di perbatasan Indonesia, tempat pertumbuhan industri, keberagaman budaya, dan pesona wisata bahari bertemu.',
    pusat: 'Batam',
    luas: '1.034,73 km²',
    penduduk: '1.342.038',
    deskripsi:
      'Batam adalah salah satu pusat pertumbuhan ekonomi dan industri penting di Kepulauan Riau, berkat letaknya di jalur perdagangan internasional. Namun kota ini juga punya sisi rekreasi: Jembatan Barelang yang menghubungkan sejumlah pulau, kawasan Nongsa, pantai pesisir, hingga beragam kuliner dan hiburan. Perpaduan modernitas, keberagaman masyarakat, dan keindahan alam menjadikannya salah satu wajah Kepulauan Riau yang terus berkembang.',
    sorotan: [
      'Jembatan Barelang',
      'Nongsa',
      'Pantai Marina',
      'Wisata Kuliner',
      'Pusat Perdagangan',
      'Industri dan Investasi',
    ],
  },
  {
    kode: 'TPI',
    nama: 'Tanjungpinang',
    status: 'Kota',
    ringkas:
      'Kota berakar pada sejarah Melayu, dengan warisan budaya, kehidupan pesisir, dan cerita masa lalu yang tetap hidup di tengah perkembangan zaman.',
    pusat: 'Tanjungpinang',
    luas: '150,37 km²',
    penduduk: '239.216',
    deskripsi:
      'Tanjungpinang adalah ibu kota Provinsi Kepulauan Riau sekaligus salah satu pusat penting sejarah dan kebudayaan Melayu. Pulau Penyengat menjadi tujuan bersejarah yang menonjol, dengan Masjid Raya Sultan Riau serta peninggalan budaya yang erat kaitannya dengan perkembangan bahasa dan sastra Melayu. Suasana tepi laut dan ragam kuliner lokal mempertemukan kehidupan masa kini dengan warisan masa lalu.',
    sorotan: [
      'Pulau Penyengat',
      'Masjid Raya Sultan Riau',
      'Gedung Gonggong',
      'Tepi Laut Tanjungpinang',
      'Sejarah Melayu',
      'Kuliner Tradisional',
    ],
  },
]

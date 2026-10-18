# UI — Peta Halaman Asrama Mahasiswa Kepri (FE)

Dokumen ini **diturunkan dari [`plan.md`](./plan.md)**. Isinya: peta zona & layout, spec **tiap halaman** (46 menu BE → screen), wireframe, dan state standar. Ubah plan dulu bila ada perubahan desain.

Konteks gaya: **neobrutalism** (border hitam tebal, hard shadow) + palet custom. Warna = makna status (lihat `plan.md` §9.3).

Legenda akses: `(r)` read-only · `*` dibatasi gedung · `(self)` data sendiri · `(CLOSED)` tampil setelah pemilihan ditutup.

---

## 1. Zona & layout

```
zona        route                 layout
──────────  ────────────────────  ─────────────────────────
public      / , /pengenalan       PublicLayout  (header + footer)
auth        /login /register      AuthLayout    (kartu tengah)
            /verify-otp
protected   /app/*                AppLayout     (sidebar + topbar + breadcrumb)
```

### 1.1 PublicLayout

```
┌───────────────────────────────────────────────┐
│ [▣ Asrama Kepri]  Beranda  Pengenalan   [Masuk]│
├───────────────────────────────────────────────┤
│                                               │
│        konten (hero / artikel)                │
│                                               │
├───────────────────────────────────────────────┤
│ footer: alamat · kontak · ©                   │
└───────────────────────────────────────────────┘
```

Motif pulau/ombak neobrutalist diletakkan di hero & footer. Tanpa login.

### 1.2 AuthLayout

```
┌──────────────────────────────────────┐
│           [▣ Asrama Kepri]            │
│      ┌──────────────────────────┐     │
│      │  kartu form (putih,      │     │
│      │  border hitam, shadow)   │     │
│      └──────────────────────────┘     │
│   tautan bantu (Daftar / Masuk)       │
└──────────────────────────────────────┘
```

Sudah login → redirect `/app`.

### 1.3 AppLayout (protected)

```
┌────────────┬────────────────────────────────────────┐
│ SIDEBAR    │ TOPBAR  [Gedung: Putra ▾]   [user ▾]  │
│ Asrama Kepri├────────────────────────────────────────┤
│ ─────────  │ Breadcrumb ▸ …                          │
│ Dashboard   │ JUDUL HALAMAN            [+ Aksi]       │
│ Data Master │ ┌ filter / tabs ──────────────────────┐ │
│  Gedung     │ └─────────────────────────────────────┘ │
│  Kamar ◄────│ ┌ DataTable (putih, border hitam) ────┐ │
│ Penghuni    │ │ …                    [StatusBadge]   │ │
│ Keuangan    │ └─────────────────────────────────────┘ │
│ Kegiatan    │ pagination                              │
│ Pemilihan   │                                         │
│ Sistem      │                                         │
│ Akun Saya   │                                         │
│ ─────────   │                                         │
│ [keluar]    │                                         │
└────────────┴────────────────────────────────────────┘
```

- Sidebar: dari `menus` (`/rbac/me`), 2 level, aktif = item main (teal).
- Topbar: pemilih gedung (bila `buildings.length > 1`) + menu user (profil, keluar). Lonceng notifikasi belum ada (BE tanpa endpoint notifikasi — lihat plan.md §4).
- Mobile: sidebar jadi drawer.

### 1.4 Halaman sistem

- **403** — "Kamu tidak punya akses ke halaman ini." + tombol "Kembali ke Dashboard".
- **404** — ilustrasi pulau + "Halaman tidak ditemukan."

---

## 2. Halaman public

### 2.1 `/` — Index / Beranda

- **Tujuan**: memperkenalkan asrama; pintu masuk ke `login`/`register`.
- **Isi** (urutan): hero (nama asrama + tagline + CTA), marquee identitas, blok **Kepulauan Riau** (4 stat + **tab** 7 kabupaten/kota: penjelasan, pusat, luas, penduduk, sorotan), panel **Fasilitas** (bento grid berikon: kamar tidur [tile besar], kamar mandi, dapur, mushola, ruang belajar, Wi-Fi, laundry, parkir), seksi **Kenapa memilih** (6 alasan), **Acara & kegiatan** (rutin + tahunan/besar), **Testimoni** (kutipan penghuni/alumni), langkah "cara jadi penghuni" (editorial statis — **bukan** dari API publik), sekilas 2 gedung, CTA daftar di bawah.
- **Aksi**: `Masuk` → `/login`; `Daftar` → `/register`; `Pengenalan` → `/pengenalan`.
- **State**: konten statis (tidak ada fetch); gambar lazy-load.

> Tidak ada endpoint publik untuk kegiatan (whitelist publik BE hanya `/health` + 4 endpoint auth; lihat plan.md §12 #6). Jadi langkah "cara jadi penghuni", **Acara & kegiatan**, dan **Testimoni** diisi statis/editorial dulu (ganti dengan data asli bila BE menyediakan).

### 2.2 `/pengenalan` — Pengenalan Asrama

- **Tujuan**: profil lengkap asrama Kepri di Yogyakarta.
- **Isi**: tab **Tentang** (latar, visi/misi, kenapa memilih), **Fasilitas** (kamar + umum), **Kegiatan** (rutin + tahunan/besar), **Galeri** (placeholder — aset foto menyusul), **Prestasi**, **Kontak & lokasi**.
- **Aksi**: CTA `Daftar menjadi penghuni`.
- **State**: statis (konten editorial), gambar lazy-load.

---

## 3. Halaman auth

### 3.1 `/register`

- **Field**: nama, email, password, konfirmasi password.
- **Aksi**: kirim → status `PENDING` + role `CALON_PENGHUNI` → redirect `/verify-otp?email=…`.
- **Error**: email terpakai; password lemah.

### 3.2 `/verify-otp`

- **Field**: 6 digit OTP (komponen **Input OTP**).
- **Aksi**: verifikasi → simpan token → `/app/dashboard`; `Kirim ulang` (cooldown).
- **Error**: kode salah/kedaluwarsa.

### 3.3 `/login`

- **Field**: email, password.
- **Aksi**: masuk → simpan token + muat `/rbac/me` → `/app/dashboard`.
- **Error**: kredensial salah; akun belum verifikasi → arahkan ke OTP.

---

## 4. Peta menu → route (46 baris)

| #   | Modul / Menu       | Route FE                        | Halaman           | Akses                                                    |
| --- | ------------------ | ------------------------------- | ----------------- | -------------------------------------------------------- |
| 1   | Dashboard          | `/app/dashboard`                | ringkasan         | semua role                                               |
| 2   | Data Master        | –                               | parent            | –                                                        |
| 2.1 | Gedung             | `/app/master/buildings`         | list/form         | SUPER_ADMIN, ADMIN_GEDUNG(r)                             |
| 2.2 | Kamar              | `/app/master/rooms`             | list/form         | SUPER_ADMIN, ADMIN_GEDUNG\*                              |
| 2.3 | Fasilitas Kamar    | `/app/master/room-facilities`   | list/form         | SUPER_ADMIN, ADMIN_GEDUNG\*                              |
| 2.4 | Fasilitas Umum     | `/app/master/public-facilities` | list/form         | SUPER_ADMIN, ADMIN_GEDUNG\*                              |
| 2.5 | Aturan Biaya       | `/app/master/fee-rules`         | list/form         | SUPER_ADMIN, BENDAHARA\*                                 |
| 2.6 | Kategori Kas       | `/app/master/categories`        | list/form         | SUPER_ADMIN, BENDAHARA\*                                 |
| 3   | Penghuni           | –                               | parent            | –                                                        |
| 3.1 | Pendaftar/Calon    | `/app/residents/applicants`     | list/detail       | SUPER_ADMIN, ADMIN_GEDUNG\*                              |
| 3.2 | Data Penghuni      | `/app/residents`                | list/detail       | SUPER_ADMIN, ADMIN_GEDUNG*, BENDAHARA(r*), PENGURUS(r\*) |
| 3.3 | Penempatan Kamar   | `/app/residents/occupancies`    | list/form         | SUPER_ADMIN, ADMIN_GEDUNG\*                              |
| 3.4 | Verifikasi Dokumen | `/app/residents/documents`      | list/review       | SUPER_ADMIN, ADMIN_GEDUNG\*                              |
| 4   | Keuangan           | –                               | parent            | –                                                        |
| 4.1 | Tagihan            | `/app/finance/invoices`         | list/form         | SUPER_ADMIN, ADMIN_GEDUNG*, BENDAHARA*                   |
| 4.2 | Pembayaran         | `/app/finance/payments`         | list/form         | SUPER_ADMIN, BENDAHARA*, ADMIN_GEDUNG*                   |
| 4.3 | Pengeluaran        | `/app/finance/expenses`         | list/form         | SUPER_ADMIN, BENDAHARA*, PENGURUS*                       |
| 4.4 | Buku Kas           | `/app/finance/cash`             | ledger            | SUPER_ADMIN, BENDAHARA*, ADMIN_GEDUNG(r*)                |
| 4.5 | Laporan Keuangan   | `/app/finance/reports`          | dashboard laporan | SUPER_ADMIN, BENDAHARA*, ADMIN_GEDUNG(r*)                |
| 5   | Organisasi         | –                               | parent            | –                                                        |
| 5.1 | Periode            | `/app/organization/periods`     | list/form         | SUPER_ADMIN, ADMIN_GEDUNG(r*), PENGURUS(r*)              |
| 5.2 | Jabatan            | `/app/organization/positions`   | list/form         | SUPER_ADMIN, ADMIN_GEDUNG(r*), PENGURUS(r*)              |
| 5.3 | Penugasan          | `/app/organization/assignments` | list/form         | SUPER_ADMIN, ADMIN_GEDUNG(r*), PENGURUS(r*)              |
| 6   | Kegiatan           | –                               | parent            | –                                                        |
| 6.1 | Daftar Kegiatan    | `/app/events`                   | list/detail       | SUPER_ADMIN, ADMIN_GEDUNG*, PENGURUS*, PENGHUNI(r)       |
| 6.2 | Sesi/Agenda        | `/app/events/sessions`          | list              | SUPER_ADMIN, ADMIN_GEDUNG*, PENGURUS*, PENGHUNI(r)       |
| 6.3 | Panitia            | `/app/events/committees`        | list/form         | SUPER_ADMIN, PENGURUS\*                                  |
| 6.4 | Absensi            | `/app/events/attendance`        | list/form         | SUPER_ADMIN, ADMIN_GEDUNG*, PENGURUS*, PENGHUNI(self)    |
| 6.5 | Lampiran/LPJ       | `/app/events/attachments`       | list/upload       | SUPER_ADMIN, ADMIN_GEDUNG*, PENGURUS*                    |
| 7   | Pemilihan          | –                               | parent            | –                                                        |
| 7.1 | Daftar Pemilihan   | `/app/elections`                | list/detail       | SUPER_ADMIN, PENGURUS\*, PENGHUNI(r)                     |
| 7.2 | Kandidat           | `/app/elections/candidates`     | list/form         | SUPER_ADMIN, PENGURUS\*                                  |
| 7.3 | Pemilih (eligible) | `/app/elections/eligible`       | list/form         | SUPER_ADMIN, PENGURUS\*                                  |
| 7.4 | Hasil              | `/app/elections/results`        | hasil             | SUPER_ADMIN, PENGURUS\*, PENGHUNI(CLOSED)                |
| 8   | Sistem             | –                               | parent            | –                                                        |
| 8.1 | Pengguna           | `/app/system/users`             | list/form         | SUPER_ADMIN                                              |
| 8.2 | Role               | `/app/system/roles`             | list/form         | SUPER_ADMIN                                              |
| 8.3 | Permission         | `/app/system/permissions`       | list              | SUPER_ADMIN                                              |
| 8.4 | Menu               | `/app/system/menus`             | list/form         | SUPER_ADMIN                                              |
| 8.5 | Audit Log          | `/app/system/audit`             | list              | SUPER_ADMIN                                              |
| 9   | Akun Saya          | –                               | parent            | –                                                        |
| 9.1 | Profil Saya        | `/app/me/profile`               | form              | CALON_PENGHUNI, PENGHUNI, PENGURUS                       |
| 9.2 | Tagihan Saya       | `/app/me/invoices`              | list              | PENGHUNI                                                 |
| 9.3 | Dokumen Saya       | `/app/me/documents`             | list/upload       | CALON_PENGHUNI, PENGHUNI                                 |
| 9.4 | Absensi Saya       | `/app/me/attendance`            | list              | PENGHUNI                                                 |
| 9.5 | Pemilihan Saya     | `/app/me/elections`             | list/vote         | PENGHUNI                                                 |

### Detail page (turunan, diluar 46 menu)

| Route                   | Fungsi                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `/app/residents/:id`    | profil penghuni + riwayat kamar/dokumen/tagihan             |
| `/app/events/:id`       | detail kegiatan: sesi, panitia, absensi, anggaran, lampiran |
| `/app/elections/:id`    | detail pemilihan: kandidat, status, hasil, pengesahan       |
| `/app/system/roles/:id` | set permission + menu role                                  |
| `/app/me/elections/:id` | halaman voting (warga)                                      |

---

## 5. Spec per halaman

Format: **Tujuan · Data (query) · Komponen · Kolom/Field · Aksi · State khas.**

### 5.1 Dashboard `/app/dashboard`

- **Tujuan**: ringkasan operasional sesuai role.
- **Data**: tunggakan bulan ini, saldo kas, kegiatan terdekat, status pemilihan aktif.
- **Komponen**: kartu stat (border tebal), line chart kas, daftar "belum bayar", kartu kegiatan.
- **Aksi**: pintasan ke modul terkait.
- **State**: skeleton kartu; kosong → ajakan "Belum ada data keuangan bulan ini".

### Data Master

**Gedung `/app/master/buildings`**

- Komponen: DataTable; field form: kode, nama, gender (MALE/FEMALE), alamat, aktif.
- Aksi: tambah/ubah/hapus (soft). State: 403 bila bukan super admin.

**Kamar `/app/master/rooms`**

- Kolom: nomor, gedung, kapasitas, tarif, status (ACTIVE/MAINTENANCE), penghuni terisi.
- Field: nomor, kapasitas, tarif, status. Filter: gedung, status.
- Aksi: CRUD; badge kapasitas `terisi/maks`.

**Fasilitas Kamar `/app/master/room-facilities`**

- Kolom: kamar, fasilitas, jumlah. Field: kamar, fasilitas (katalog scope ROOM + kategori FURNITURE/SANITARY/APPLIANCE/OTHER), jumlah, catatan.

**Fasilitas Umum `/app/master/public-facilities`**

- Kolom: nama (dari katalog `Facility` + kategori), tipe (ASSIGNED/SHARED), nomor, kapasitas, status.
- Aksi: CRUD; untuk ASSIGNED → kelola slot.

**Aturan Biaya `/app/master/fee-rules`**

- Kolom: gedung, jatuh tempo, tarif default, berlaku dari. Field: `dueDayOfMonth` (1–28), tarif, `effectiveFrom`.

**Kategori Kas `/app/master/categories`**

- Kolom: nama, jenis (INCOME/EXPENSE). Field: nama, jenis.

### Penghuni

**Pendaftar/Calon `/app/residents/applicants`**

- Kolom: nama, email, gedung, status (PENDING🟧/REJECTED🟥), tanggal submit.
- Aksi: review → **Setujui** (ACTIVE🟩) / **Tolak** (alasan). Detail → `/app/residents/:id`.

**Data Penghuni `/app/residents`**

- Kolom: nama, gedung, kamar, status, kontak. Filter: gedung, status, kata kunci.
- Aksi: lihat detail; unduh daftar (export) bila berizin.

**Penempatan Kamar `/app/residents/occupancies`**

- Kolom: penghuni, kamar, bed, mulai, status (ACTIVE🟩/ENDED⬛).
- Form: pilih penghuni + kamar → validasi kapasitas & gender.
- Aksi: **Tempatkan**, **Checkout**. Slot KM di-set saat menempatkan.

**Verifikasi Dokumen `/app/residents/documents`**

- Kolom: penghuni, jenis, versi, status (REQUESTED🟧/UPLOADED🟨/VERIFIED🟩/REJECTED🟥), waktu.
- Aksi: **Verifikasi** / **Tolak** (alasan); **Minta dokumen** (pilih `DocumentType`).
- Pratinjau file: `GET /files/:id`.

### Keuangan

**Tagihan `/app/finance/invoices`**

- Kolom: kode, penghuni, periode, total, dibayar, status (ISSUED🟧/PARTIAL🟨/PAID🟩/OVERDUE🟥/VOID⬛).
- Aksi: **Generate tagihan** (gedung+bulan+tahun), **Batalkan** (VOID), lihat rincian.
- Filter: gedung, periode, status.

**Pembayaran `/app/finance/payments`**

- Kolom: kode, penghuni, jumlah, metode (CASH/TRANSFER/QRIS), waktu, akun kas.
- Form: penghuni, jumlah, metode, akun kas, alokasi ke tagihan (cicil/multi-bulan), `idempotencyKey` (dibuat FE).
- Aksi: **Catat pembayaran** → toast "Pembayaran tercatat".

**Pengeluaran `/app/finance/expenses`**

- Kolom: tanggal, kategori, jumlah, vendor, sumber kas. Form: kas, kategori, jumlah, tanggal, keterangan, bukti.

**Buku Kas `/app/finance/cash`**

- Tampilan ledger: tanggal, tipe (IN/OUT), sumber, jumlah, saldo berjalan. Filter: akun, rentang tanggal.
- Read-only (append-only); koreksi hanya via entri REVERSAL.

**Laporan Keuangan `/app/finance/reports`**

- Tab: Tunggakan · Saldo Kas · Pemasukan vs Pengeluaran · Realisasi Anggaran Kegiatan.
- Komponen: chart + tabel; tombol **Ekspor**.

### Organisasi

**Periode `/app/organization/periods`** — kolom: kode, nama, rentang, SK, aktif. Aksi: CRUD + **Aktifkan** (1 aktif).
**Jabatan `/app/organization/positions`** — kolom: kode, nama, scope (asrama/gedung), role terkait.
**Penugasan `/app/organization/assignments`** — kolom: orang, jabatan, periode, gedung. Form: user, position, period, gedung, SK.

### Kegiatan

**Daftar Kegiatan `/app/events`**

- Kolom: judul, kategori (RUTIN/BESAR), scope (ASRAMA/GEDUNG), mulai, status, `ad-hoc`.
- Aksi: **Buat kegiatan** (mode cepat: judul + mulai → `isAdHoc`), buka detail.
- PENGHUNI: hanya `isPublic`.

**Detail `/app/events/:id`** — tab: **Sesi**, **Panitia**, **Absensi**, **Anggaran**, **Lampiran**.

- Sesi: tambah `EventSession` (jadwal), untuk kegiatan berulang.
- Panitia: tambah/lepas anggota + peran.
- Absensi: per sesi, tandai HADIR🟩/IZIN🟨/TIDAK🟥 per user.
- Anggaran: catat `Expense` bertaut event; lihat rencana vs realisasi.
- Lampiran: unggah proposal/notulen/LPJ/foto.

**Sesi/Agenda `/app/events/sessions`** · **Panitia `/app/events/committees`** · **Absensi `/app/events/attendance`** (self untuk PENGHUNI) · **Lampiran `/app/events/attachments`**.

### Pemilihan

**Daftar Pemilihan `/app/elections`** — kolom: judul, periode, jadwal, status (DRAFT⬛/SCHEDULED🟧/OPEN🟨/CLOSED🟩/DONE🟩/CANCELLED🟥).

- Aksi: **Buat**, **Buka**, **Tutup**, **Sahkan pemenang**.

**Kandidat `/app/elections/candidates`** — kolom: no urut, nama, visi/misi. Form: pilih warga aktif, visi, misi.
**Pemilih `/app/elections/eligible`** — tentukan role pemilih (`ElectionEligibleRole`, default PENGHUNI) + pratinjau jumlah eligible.
**Hasil `/app/elections/results`** — bar per kandidat (warna palet), %, rank. **Hanya tampil setelah CLOSED**; saat OPEN → 403/kosong dengan pesan.

### Sistem (SUPER_ADMIN)

**Pengguna `/app/system/users`** — kolom: nama, email, status, role, gedung. Aksi: CRUD, assign role + scope gedung.
**Role `/app/system/roles`** — kolom: kode, nama, sistem?. Detail → `/app/system/roles/:id` (set permission + menu).
**Permission `/app/system/permissions`** — tabel resource × action (read-only).
**Menu `/app/system/menus`** — tree editor: parent, kode, nama, path, ikon, urutan.
**Audit Log `/app/system/audit`** — kolom: waktu, aktor, aksi, entitas, ringkasan. Detail sebelum/sesudah.

### Akun Saya

**Profil `/app/me/profile`** — form: nama, telepon, NIK, gender, wali, alamat. Aksi: **Simpan perubahan**.
**Tagihan Saya `/app/me/invoices`** — kolom: periode, total, dibayar, status, jatuh tempo. Read-only.
**Dokumen Saya `/app/me/documents`** — daftar dokumen wajib/permintaan; unggah (validasi MIME/ukuran); lihat status.
**Absensi Saya `/app/me/attendance`** — riwayat kehadiran per kegiatan/sesi.
**Pemilihan Saya `/app/me/elections`** — daftar pemilihan di mana user eligible.

- Detail `/app/me/elections/:id`: kartu kandidat + pilih + **Kirim suara**; opsi **Abstain** bila `allowAbstain`; konfirmasi sebelum kirim (1 warga 1 suara, tidak bisa dibatalkan). Setelah memilih → status "Sudah memilih".

---

## 6. Komponen shared

> Daftar **lengkap** komponen (boundary, tabel, keuangan, penghuni, kegiatan, pemilihan, organisasi, form lanjutan, layout) ada di [`components.md`](./components.md). Berikut yang paling sering dipakai:

| Komponen                   | Fungsi                                               |
| -------------------------- | ---------------------------------------------------- |
| `DataTable`                | tabel reusable: kolom, sorting, pagination, row aksi |
| `PageHeader`               | judul + deskripsi + slot aksi (kanan)                |
| `DataTableToolbar`         | cari + filter + toggle kolom                         |
| `QueryBoundary`            | wrapper loading(skeleton)/empty/error                |
| `FormDialog` / `FormSheet` | dialog form standar (create/edit)                    |
| `ConfirmDialog`            | konfirmasi aksi destruktif                           |
| `StatusBadge`              | peta status → warna (plan.md §9.3)                   |
| `EmptyState`               | ilustrasi pulau + ajakan aksi                        |
| `Can`                      | gate aksi berdasar permission                        |
| `CurrencyText`             | rupiah (tabular-nums)                                |
| `DateText`                 | tanggal `Asia/Jakarta`                               |
| `BuildingPicker`           | pemilih gedung aktif                                 |
| `FileDropzone`             | unggah + validasi MIME/ukuran                        |
| `SkeletonTable`            | skeleton tabel (sejajar kolom)                       |
| `SkeletonCard`             | skeleton grid kartu stat                             |
| `SkeletonForm`             | skeleton label + field                               |
| `SkeletonDetail`           | skeleton header + paragraf (halaman detail)          |

---

## 7. State standar tiap halaman

- **Loading** → **skeleton yang menyerupai layout halaman itu** (bukan spinner layar penuh): tabel → baris+kolom, kartu → grid kartu, detail → header+paragraf, form → label+field, chart → area blok. Lihat `plan.md §9.6`.
- **Empty** → `EmptyState` dengan CTA sesuai konteks.
- **Error** → pesan dari API + tombol coba lagi; 403 → halaman terkunci.
- **Sukses aksi** → toast "…tercatat/tersimpan".
- **Aksi destruktif** → `ConfirmDialog` dulu.

### 7.1 Skeleton per tipe halaman

| Halaman                                        | Skeleton                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| DataTable (semua list)                         | baris skeleton sejumlah `pageSize`, kolom sejajar lebar kolom asli |
| Dashboard                                      | grid kartu stat + area chart + list belum bayar                    |
| Detail `/app/events/:id`, `/app/residents/:id` | header (avatar/judul + meta) + paragraf + panel tab                |
| Form (dialog/sheet)                            | label + input per field, sejajar grid form                         |
| Ledger/Buku Kas                                | baris ledger + kolom saldo                                         |
| Sidebar (saat `/rbac/me`)                      | baris menu skeleton                                                |

---

## 8. Visibilitas diturunkan runtime (bukan matriks statis)

FE **tidak menyimpan** pemetaan role → halaman. RBAC & menu **ada di DB**, jadi FE menerimanya lewat `GET /rbac/me`:

- **Sidebar** dirender dari `menus` — bukan daftar statis.
- **Aksi** digate `permissions` (mis. `invoice.create`) via `<Can>`.
- **Scope gedung** dari `buildings`.
- Role/menu diubah di DB → UI ikut berubah **tanpa deploy FE**.

Route `protected` tetap mendeklarasikan `permission` yang dibutuhkan sebagai pertahanan di sisi klien; kalau tak cocok → 403. Tapi sumber kebenarannya tetap server.

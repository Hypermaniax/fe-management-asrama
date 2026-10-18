# Plan — Front-End Asrama Mahasiswa Kepulauan Riau (Yogyakarta)

> **Dokumen ini adalah SUMBER KEBENARAN untuk FE.** Urutan kerja: **plan → ui → phases**.
> Kontrak data & aturan bisnis tetap milik backend — lihat [`../../be/docs/plan.md`](../../be/docs/plan.md).
> Kalau ada perubahan desain, ubah **plan ini dulu**, baru sinkronkan [`ui.md`](./ui.md) dan [`phases.md`](./phases.md).

---

## 1. Ringkasan proyek

Front-end untuk **Asrama Mahasiswa Kepulauan Riau (Kepri) di Yogyakarta** — konsumen REST API backend (`/api/*`, auth JWT).

Aplikasi punya **dua wajah dalam satu codebase**:

- **Situs publik** — pengenalan asrama (index + pengenalan), tanpa login.
- **Aplikasi terproteksi** — dashboard kepengurusan + portal self-service warga, tampilannya menyesuaikan role (RBAC) dan scope gedung.

Karakter visual: **neobrutalism** (border tebal, hard shadow, warna solid) dengan palet custom, **tanpa mode gelap**.

---

## 2. Alur dokumen (proses kerja)

```
1. docs/plan.md    ← SUMBER (apa, kenapa, keputusan FE)   [difinalkan lebih dulu]
2. docs/ui.md      ← TURUNAN (peta halaman + komponen + wireframe)
3. docs/phases.md  ← TURUNAN (langkah implementasi)
```

Aturan: implementasi tidak jalan sebelum plan & ui konsisten. Perubahan skema/API di BE → sinkronkan `ui.md` & `phases.md` FE.

---

## 3. Keputusan desain

| #   | Topik            | Keputusan                                                                                              | Alasan                                 |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| 1   | Build tool       | **Vite** + **React 19** + TypeScript                                                                   | cepat, sudah terpasang                 |
| 2   | Styling          | **Tailwind v4** + **neobrutalism components** (registry `neobrutalism.dev`, basis shadcn/Base UI)      | style bold, komponen siap pakai        |
| 3   | Tema             | **Satu palet, tanpa light/dark toggle**                                                                | neobrutalism berkarakter tetap         |
| 4   | Routing          | **React Router** (data router) dengan **layout routes** per zona                                       | pemisahan public/auth/protected        |
| 5   | Server state     | **TanStack Query** (fetch, cache, invalidate)                                                          | mayoritas state = data dari API        |
| 6   | Client state     | **Zustand** (auth/access, scope gedung, UI)                                                            | ringan, terstruktur, tanpa boilerplate |
| 7   | Form             | **react-hook-form** + **zod**                                                                          | validasi konsisten dgn BE              |
| 8   | Auth             | JWT Bearer; token + access di Zustand; dipersist ke `localStorage`                                     | header `Authorization` per request     |
| 9   | RBAC UI          | sidebar digenerate dari `menus` (`/rbac/me`); aksi dibungkus `<Can permission="…">`                    | satu sumber kebenaran dari BE          |
| 10  | Scope gedung     | `activeBuildingId` di Zustand + ditampilkan di topbar; ikut ke query                                   | isolasi data per gedung                |
| 11  | Layout           | sidebar kiri 2 level + topbar + breadcrumb                                                             | pola dashboard admin                   |
| 12  | Tabel            | `DataTable` reusable (sorting/pagination, siap server-side)                                            | dipakai di hampir semua modul          |
| 13  | Notifikasi       | **sonner** (toast gaya neobrutalism)                                                                   | umpan balik aksi                       |
| 14  | Ikon             | **lucide-react**                                                                                       | dipakai komponen neobrutalism (instal terpisah) |
| 15  | Error/loading    | ErrorBoundary + halaman 403/404 + skeleton                                                             | tidak pernah blank                     |
| 16  | Zona route       | `public` (`/`, `/pengenalan`) · `auth` (`/login`, `/register`, `/verify-otp`) · `protected` (`/app/*`) | pemisahan tegas akses                  |
| 17  | Istilah folder   | zona terproteksi bernama **`protected/`** (bukan `secret/`)                                            | penamaan jelas                         |
| 18  | Prefix protected | **`/app/*`** (mis. `/app/dashboard`, `/app/residents`)                                                 | rapi & tidak bentrok dgn publik        |
| 19  | Konvensi modul   | **satu fitur = satu folder** `features/<modul>`                                                        | kolokasi api+hooks+pages+komponen      |
| 20  | Motion           | gerak *hard & snappy*: press "ambles", hover lift, stagger *snap* (bukan fade); detail di §9.7     | khas neobrutalism, hemat efek          |
| 21  | Bahasa UI        | **Indonesia**, verb CTA konsisten dengan workflow                                                      | audiens lokal                          |
| 22  | Data fetching    | server-side filter/pagination via query param (query key terstruktur)                                  | data asrama bisa besar                 |
| 23  | Testing          | smoke test alur kritis + `tsc -b` + `oxlint`                                                           | verifikasi cepat                       |

---

## 4. Ruang lingkup

**In scope**

- **Public**: index/beranda (hero, marquee identitas, blok **Kepulauan Riau** — 4 stat + tab 7 kabupaten/kota dengan penjelasan, panel Fasilitas, seksi **Kenapa memilih**, **Acara & kegiatan**, **Testimoni**, langkah "cara jadi penghuni", sekilas gedung, CTA) + halaman pengenalan asrama (tentang, fasilitas, kegiatan, galeri, prestasi, kontak). Konten editorial statis (tanpa API publik).
- **Auth**: register (calon), request OTP, verify OTP, login, logout, sesi JWT.
- **Protected shell**: sidebar dari menu RBAC, pemilih gedung, breadcrumb, halaman 403/404.
- **Dashboard**: ringkasan tunggakan, saldo kas, kegiatan terdekat, status pemilihan.
- **Data Master**: gedung, kamar, fasilitas kamar, fasilitas umum, aturan biaya, kategori kas.
- **Penghuni**: pendaftar/calon, data penghuni, penempatan kamar, verifikasi dokumen.
- **Keuangan**: tagihan, pembayaran, pengeluaran, buku kas, laporan.
- **Organisasi**: periode, jabatan, penugasan.
- **Kegiatan**: daftar, sesi/agenda, panitia, absensi, lampiran/LPJ.
- **Pemilihan**: daftar, kandidat, pemilih, hasil.
- **Sistem**: pengguna, role, permission, menu, audit log (khusus super admin).
- **Akun Saya**: profil, tagihan, dokumen, absensi, pemilihan (self-service).
- Semua halaman mengikuti **RBAC + scope gedung**.

**Out of scope**

- OAuth / social login, denda, realtime/websocket, notifikasi in-app, aplikasi mobile native, mode gelap.

---

## 5. Arsitektur FE

### 5.1 Tiga zona route

```
zona        contoh route            layout          akses
──────────  ──────────────────────  ──────────────  ──────────────────────────
public      /                       PublicLayout    tanpa login
            /pengenalan             (header+footer)
auth        /login                  AuthLayout      hanya tamu (redirect bila login)
            /register               (kartu tengah)
            /verify-otp
protected   /app/dashboard          AppLayout       login + RBAC + scope gedung
            /app/residents          (sidebar+topbar)
            ... (46 menu BE)
```

Guard:

- `public` → bebas.
- `auth` → sudah login? redirect ke `/app`.
- `protected` → belum login? redirect ke `/login`; tak punya menu/izin? render **403**.

### 5.2 Struktur folder

```
src/
  app/
    router.tsx            # definisi route + layout routes
    providers.tsx         # QueryClientProvider, Toaster, ErrorBoundary
  routes/
    public/               # index.tsx, pengenalan.tsx
    auth/                 # login.tsx, register.tsx, verify-otp.tsx
    protected/            # tree route /app/* (tipis, delegasi ke features)
  features/<modul>/
    api.ts                # fungsi panggil endpoint (typed)
    hooks.ts              # useQuery / useMutation + query key
    schema.ts             # zod (form)
    components/           # komponen khas modul
    pages/                # halaman (list / form / detail)
  components/
    ui/                   # komponen neobrutalism (hasil registry)
    shared/               # DataTable, PageHeader, EmptyState, StatusBadge, `<Can>`, dll
  layouts/
    public-layout.tsx     # header + footer (motif pulau)
    auth-layout.tsx       # kartu tengah
    app-layout.tsx        # sidebar + topbar + breadcrumb
  lib/
    api.ts                # fetch wrapper (base URL, Authorization, error)
    query.ts              # QueryClient + konvensi query key
    rbac.ts               # can(permission), filter menu
    utils.ts              # cn(), formatter rupiah/tanggal
  stores/
    auth.ts               # Zustand: user, roles, permissions, menus, token
    scope.ts              # Zustand: activeBuildingId, buildings
    ui.ts                 # Zustand: sidebar collapsed, preferensi tabel
  styles/globals.css      # token neobrutalism + Tailwind
```

---

## 6. Integrasi API BE

- **Base URL**: `import.meta.env.VITE_API_URL` (mis. `http://localhost:8080/api`).
- **Auth**: header `Authorization: Bearer <token>` (dari Zustand).
- **Error**: normalisasi ke `{ status, code, message }`; `401` → logout + redirect `/login`; `403` → halaman/tombol terkunci.
- **Waktu & uang**: format tanggal `Asia/Jakarta`; rupiah integer tanpa desimal.

### 6.1 Peta endpoint

| Modul           | Endpoint                                                                                                                                                                      | Status BE   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Auth            | `POST /auth/register` · `/login` · `/request-otp` · `/verify-otp` · `GET /auth/me`                                                                                            | ✅ ada      |
| RBAC            | `GET/POST /rbac/roles` · `PATCH/DELETE /rbac/roles/:id` · `PUT /rbac/roles/:id/permissions` · `/menus` · `POST /rbac/assign` · `DELETE /rbac/user-roles/:id` · `GET /rbac/me` | ✅ ada      |
| Building        | `GET/POST /buildings` · `PATCH/DELETE /buildings/:id`                                                                                                                         | ✅ ada      |
| Room            | `/rooms` (CRUD)                                                                                                                                                               | ⬜ menyusul |
| FeeRule         | `/fee-rules`                                                                                                                                                                  | ⬜ menyusul |
| Facility        | `/facilities`, `/room-facilities`                                                                                                                                             | ⬜ menyusul |
| PublicFacility  | `/public-facilities`, `/assignments`                                                                                                                                          | ⬜ menyusul |
| Resident        | `/residents` (submit/approve/reject/checkout/profil)                                                                                                                          | ⬜ menyusul |
| Document        | `/documents`, `GET /files/:id`                                                                                                                                                | ⬜ menyusul |
| Occupancy       | `/occupancies`                                                                                                                                                                | ⬜ menyusul |
| Billing         | `/invoices`, `/payments`, `/allocations`                                                                                                                                      | ⬜ menyusul |
| Cash            | `/cash-accounts`, `/categories`, `/expenses`, `/ledger`                                                                                                                       | ⬜ menyusul |
| Organisasi      | `/organization/periods`, `/positions`, `/assignments`, `/structure`                                                                                                           | ⬜ menyusul |
| Kegiatan        | `/events` (+`/sessions`, `/committees`, `/attendance`, `/expenses`, `/attachments`)                                                                                           | ⬜ menyusul |
| Pemilihan       | `/elections` (+`/eligible-roles`, `/candidates`, `/vote`, `/result`, `/finalize`)                                                                                             | ⬜ menyusul |
| Audit / Laporan | `/audit`, `/reports/*`                                                                                                                                                        | ⬜ menyusul |

> Detail route & field: [`../../be/docs/plan.md`](../../be/docs/plan.md) §6–7 dan [`../../be/docs/phases.md`](../../be/docs/phases.md).

---

## 7. RBAC di FE

Sumber tunggal: `GET /rbac/me` →

```ts
{
  roles: string[]
  permissions: Set<string>   // mis. "invoice.create"
  menus: MenuTree[]          // hierarkis, dari BE
  buildings: string[]        // gedung yang boleh diakses
  isSuperAdmin: boolean
}
```

- **Sidebar** dirender dari `menus` (urutan `sortOrder`, maks 2 level).
- **Guard route**: route `protected` mendeklarasikan `permission` yang dibutuhkan; gagal → 403.
- **Gate aksi**: `<Can permission="invoice.create">…</Can>` untuk tombol create/edit/delete.
- **Bypass**: `isSuperAdmin` lolos semua gate.
- **Scope gedung**: `scope.store.activeBuildingId` dikirim ke query; daftar pilihan = `buildings`.

---

## 8. State & data

| Jenis           | Tempat                               | Contoh                                      |
| --------------- | ------------------------------------ | ------------------------------------------- |
| Server state    | TanStack Query                       | daftar penghuni, tagihan, events, elections |
| Identitas/akses | Zustand `authStore`                  | user, permissions, menus, token             |
| Scope           | Zustand `scopeStore`                 | gedung aktif                                |
| UI lokal        | Zustand `uiStore` / `useState` / URL | sidebar, filter, dialog                     |

- **Query key** terstruktur: `['invoices', { buildingId, status, page }]`.
- Mutasi → `invalidateQueries` pada key terkait; optimistik bila aman.
- `401` global → reset `authStore` + redirect `/login`.
- Filter/pagination disimpan di **URL query** bila perlu shareable.

---

## 9. Design system — neobrutalism

### 9.1 Prinsip: "bold di cangkang, tenang di data"

- **Cangkang** (sidebar, topbar, tombol, kartu, badge, dialog, header) → neobrutalism penuh: **border tinta 2px**, hard shadow offset besar, sudut **tajam (`--radius-base: 0`)**, warna solid.
- **Permukaan**: kanvas **krem**, **kartu teal** (`--main`, teks putih — kontras jelas), field/input **putih** (`--secondary-background`). Outline tebal hanya di **komponen** (kartu/tombol/badge), **tanpa garis pembatas antar section**; heading **uppercase**; label mikro **mono** (`.label`); satu **marquee** sebagai momen gerak.
- **Sekali bold**: tombol yang "ambles" saat ditekan + blok status berwarna jadi elemen yang diingat.

### 9.2 Token warna (tanpa dark mode)

**Urutan palet:** 1) `#8AD6D1` · 2) `#359FA0` · 3) `#FFF0C5` · 4) `#FF8C52`.

**Komposisi (perkiraan):** ~55% krem (kanvas) · ~25% mint (section/kartu ringan) · ~15% teal (identitas: tombol/link aktif/ikon) · ~5% orange (aksen CTA/badge). Teal = tombol utama dengan teks **putih**; teks gelap `#243B3B` di atas krem/mint.

```
--background:            #FFF0C5   /* kanvas halaman (krem) */
--secondary-background:  #FFFFFF   /* field/input (kartu = teal --main) */
--main:                  #2A7D7E   /* primary: aksi utama, nav aktif, ikon (teal lebih gelap agar teks putih lolos AA) */
--main-foreground:       #FFFFFF   /* teks putih di atas teal */
--foreground:            #243B3B   /* teks netral gelap (paragraf) */
--border:                #1E3A3A   /* tinta gelap teal (tanpa hitam pekat) */
--ring:                  #1E3A3A
--overlay:               rgba(30,58,58,.75)
--shadow:                6px 6px 0 0 var(--border)
--shadow-hover:          9px 9px 0 0 var(--border)

/* aksen tambahan (dipakai lewat utility) */
--accent-orange:         #FF8C52
--accent-teal:           #8AD6D1
--accent-cream:          #FFF0C5
--danger:                #C15A5A   /* merah utk aksi destruktif */

chart-1..5:              #359FA0 · #FF8C52 · #FFF0C5 · #8AD6D1 · #1E3A3A
radius-base:             0px
font-weight-base:        500
font-weight-heading:     700
heading-transform:       uppercase (letter-spacing -0.02em)
label:                   mono uppercase, tracking 0.12em
```

### 9.3 Warna = makna status

| Warna               | Makna                        |
| ------------------- | ---------------------------- |
| 🟧 `#FF8C52` orange | menunggu aksi                |
| 🟨 `#FFF0C5` krem   | sedang berjalan              |
| 🟩 `#8AD6D1` teal   | selesai / positif            |
| 🟥 `#C15A5A` merah  | gagal / terlambat            |
| ⬛ `#1E3A3A` tinta  | void / dibatalkan / nonaktif |

```
User      PENDING🟧 ACTIVE🟩 REJECTED🟥 CHECKOUT🟨 INACTIVE⬛
Invoice   ISSUED🟧 PARTIAL🟨 PAID🟩 OVERDUE🟥 VOID⬛
Dokumen   REQUESTED🟧 UPLOADED🟨 VERIFIED🟩 REJECTED🟥
Occupancy ACTIVE🟩 ENDED⬛
Event     PLANNED🟧 ONGOING🟨 DONE🟩 CANCELLED🟥
Election  DRAFT⬛ SCHEDULED🟧 OPEN🟨 CLOSED🟩 DONE🟩 CANCELLED🟥
Attendance HADIR🟩 IZIN🟨 TIDAK🟥
```

`StatusBadge` menangani peta ini di satu komponen (konsisten di 46 halaman).

### 9.4 Tipografi

- **Space Grotesk**, satu keluarga (base 500, heading 700).
- Angka & kode (rupiah, NIK, kode tagihan) pakai `font-variant-numeric: tabular-nums`.
- Hindari tell generik: tidak ada eyebrow ALL-CAPS, tidak ada satu kata di-italic di headline.

### 9.5 Komponen (dari registry neobrutalism)

Diambil dari koleksi `neobrutalism.dev`, dikelompokkan per pemakaian:

**Form & input**

- `Input` · `Textarea` · `Native Select` · `Select` · `Combobox` · `Input Group` · `Input OTP` (verifikasi) · `Checkbox` · `Radio Group` · `Switch` · `Slider` · `Label` · `Field` (pembungkus field + error) · `Form` (integrasi react-hook-form).

**Tanggal & pilihan**

- `Calendar` · `Date Picker` · `Toggle` · `Toggle Group`.

**Overlay & dialog**

- `Dialog` (form create/edit, rincian) · `Alert Dialog` (konfirmasi destruktif → `ConfirmDialog`) · `Sheet`/`Drawer` (form samping, sidebar mobile) · `Dropdown Menu` · `Context Menu` · `Popover` · `Hover Card` · `Tooltip`.

**Navigasi**

- `Sidebar` · `Breadcrumb` · `Tabs` (detail kegiatan/pemilihan) · `Navigation Menu` · `Pagination` · `Menubar`.

**Data & tampilan**

- `Table` · `Data Table` (list utama) · `Card` · `Badge` (`StatusBadge`) · `Avatar` · `Empty` (`EmptyState`) · `Chart` (dashboard/laporan) · `Progress` · `Skeleton` · `Spinner` · `Scroll Area` · `Resizable`.

**Umpan balik & lain-lain**

- `Toast` (sonner) · `Alert` · `Accordion` · `Collapsible` · `Command` (pencarian cepat) · `Kbd` · `Marker` · `Attachment` · `Image Card` · `Carousel` · `Marquee` · `Item` · `Button` · `Button Group`.

Peta komponen → pemakaian (contoh konvensi):

| Kebutuhan          | Komponen                               |
| ------------------ | -------------------------------------- |
| Tabel daftar       | `DataTable` + `Pagination`             |
| Form create/edit   | `Dialog` atau `Sheet` + `Form`/`Field` |
| Konfirmasi hapus   | `AlertDialog` (`ConfirmDialog`)        |
| Status berwarna    | `Badge` (`StatusBadge`, plan.md §9.3)  |
| Verifikasi OTP     | `InputOTP`                             |
| Grafik kas/laporan | `Chart`                                |
| Navigasi modul     | `Sidebar` + `Breadcrumb`               |

> Abstraksi khas domain (`DataTable`, `QueryBoundary`, `CurrencyInput`, `AttendanceGrid`, `PermissionMatrix`, dll.) didaftar di [`components.md`](./components.md).

### 9.6 Loading & skeleton

**Aturan: skeleton harus menyerupai layout tujuan, bukan spinner generik.** Jumlah, posisi, dan bentuk blok skeleton = cermin dari konten yang akan tampil, agar tidak ada "lompatan" tata letak saat data masuk.

| Layout tujuan         | Skeleton                                                           |
| --------------------- | ------------------------------------------------------------------ |
| Tabel daftar          | baris skeleton sejumlah `pageSize`, kolom sejajar lebar kolom asli |
| Kartu statistik       | grid kartu seukuran kartu asli                                     |
| Detail (profil/event) | blok header (avatar + 2 baris) + paragraf                          |
| Form                  | label + field per input, sejajar grid form                         |
| Chart                 | area blok tinggi chart + garis sumbu                               |
| Sidebar/menu          | baris menu (hanya saat memuat `/rbac/me`)                          |

- Komponen: `Skeleton` (neobrutalism) + `SkeletonTable`, `SkeletonCard`, `SkeletonForm`, `SkeletonDetail` di `components/shared`.
- **Tanpa** spinner layar penuh; spinner hanya untuk aksi pendek (submit, tombol) via `Spinner`.
- Transisi skeleton → konten nyata tanpa animasi kedip (hindari layout shift).

### 9.7 Animasi & motion (brutalism)

**Prinsip: gerak _hard & snappy_, bukan fade lembut.** Easing `steps()`/spring kaku (bounce 0), durasi pendek (80–200ms), perpindahan kecil. Ini yang membedakan brutalism dari "SaaS smooth". Semua menghormati `prefers-reduced-motion`.

**Library:** `motion` (motion/react) untuk transisi kompleks/stagger; Tailwind/CSS untuk yang sederhana; opsional `@formkit/auto-animate` untuk list.

**Token motion:**

| Token           | Nilai                                 |
| --------------- | ------------------------------------- |
| `--dur-instant` | 80ms                                  |
| `--dur-quick`   | 150ms                                 |
| `--dur-base`    | 200ms                                 |
| `--ease-hard`   | `steps(4)` · `cubic-bezier(.2,0,0,1)` |
| `--spring-snap` | spring, stiffness tinggi, bounce 0    |
| shadow hover    | 6px → 9px                             |
| shadow press    | 6px → 0                               |

**Animasi per elemen:**

| Elemen           | Animasi                                                        |
| ---------------- | -------------------------------------------------------------- |
| Button           | hover lift (−2px); press **ambles** (translate 2px + shadow→0) |
| Card             | hover lift; entrance stagger _snap_ (bukan fade-up halus)      |
| Dialog/Sheet     | scale 0.96 + slide + shadow tumbuh; exit kebalikan             |
| Dropdown/Popover | scale cepat + shadow                                           |
| Toast            | slide dari tepi + "stamp"                                      |
| Baris tabel      | stagger ringan                                                 |
| Nav aktif        | blok main meluncur ke item                                     |
| Badge/status     | _pop_ saat berubah                                             |
| Marquee (shell)  | geser linier kontinu, pause saat `prefers-reduced-motion`      |
| Skeleton         | blink bertingkat `steps()` (bukan shimmer gradien halus)       |
| Pindah halaman   | slide _snap_ antar route                                       |
| Chart            | bar tumbuh / line tergambar                                    |
| Angka saldo      | count-up `steps()`                                             |
| Aksi invalid     | **shake** (OTP salah, vote ganda)                              |

### 9.8 Ciri khas

- **Motif pulau/ombak** neobrutalist (outline hitam, blok solid) — hanya di **PublicLayout** dan **empty state**. Satu tempat, tidak tersebar.
- Sidebar menampilkan **nama asrama + pemilih gedung** sebagai identitas, bukan cuma daftar menu.

### 9.9 Voice (bahasa Indonesia)

- CTA = hasil aksi: "Catat pembayaran" → toast "Pembayaran tercatat".
- Empty state = ajakan: "Belum ada tagihan bulan ini. Generate tagihan".
- Error menyebut sebab: "NIK sudah dipakai penghuni lain".

---

## 10. Konvensi kode

- **Satu fitur = satu folder** `features/<modul>/` (`api.ts`, `hooks.ts`, `schema.ts`, `components/`, `pages/`).
- Route di `routes/**` tipis: panggil handler dari `features`.
- Form: `react-hook-form` + `zodResolver`, tombol submit disabled saat `isSubmitting`.
- Semua aksi menulis menampilkan toast sukses/gagal.
- Import alias `@/` → `src/`.

---

## 11. Fase implementasi (ringkas)

Detail: [`phases.md`](./phases.md). Nomor fase diselaraskan dengan BE.

| Fase | Isi                                                          | Status |
| ---- | ------------------------------------------------------------ | ------ |
| 0    | Setup: Tailwind, registry neobrutalism, router, query, store | ⬜     |
| 1    | API client + Auth (register/OTP/login/sesi)                  | ⬜     |
| 2    | Layout zones + shell + RBAC nav + guard                      | ⬜     |
| 3    | Public (index + pengenalan)                                  | ⬜     |
| 4    | Dashboard                                                    | ⬜     |
| 5    | Data Master                                                  | ⬜     |
| 6    | Penghuni                                                     | ⬜     |
| 7    | Keuangan (tagihan, bayar, kas, laporan)                      | ⬜     |
| 8    | Organisasi                                                   | ⬜     |
| 9    | Kegiatan                                                     | ⬜     |
| 10   | Pemilihan                                                    | ⬜     |
| 11   | Sistem (users, roles, permissions, menus, audit)             | ⬜     |
| 12   | Akun Saya (self-service)                                     | ⬜     |
| 13   | Polish: a11y, responsive, empty/error, build verify          | ⬜     |

---

## 12. Asumsi & pertanyaan terbuka

| #   | Topik                                       | Asumsi default                   | Status           |
| --- | ------------------------------------------- | -------------------------------- | ---------------- |
| 1   | Kanvas krem `#FFF0C5`                       | dipakai (bold)                   | bisa direvisi    |
| 2   | Tombol destruktif                           | merah `#C15A5A`                  | bisa direvisi    |
| 3   | Motif pulau                                 | dipakai di public + empty state  | dikonfirmasi     |
| 4   | Nama halaman pengenalan                     | `/pengenalan`                    | dikonfirmasi     |
| 5   | Prefix area terproteksi                     | `/app/*`                         | dikonfirmasi     |
| 6   | Kegiatan publik di luar pengenalan          | belum (hanya index + pengenalan) | perlu konfirmasi |
| 7   | Pilih gedung aktif untuk multi-gedung admin | wajib pilih saat login           | perlu konfirmasi |
| 8   | Dark mode                                   | tidak ada                        | dikonfirmasi     |
| 9   | Library animasi                             | `motion` + Tailwind              | bisa direvisi    |

---

## 13. Changelog keputusan

1. FE dipisah dari BE; `plan → ui → phases`, kontrak API milik BE.
2. Stack: React 19 + Vite + TypeScript + Tailwind + neobrutalism components.
3. State: TanStack Query (server) + Zustand (client) — **bukan** Redux.
4. Gaya visual neobrutalism, **satu palet**, tanpa light/dark.
5. Palet custom: teal/orange/krem + hitam; warna = makna status.
6. Tiga zona route: `public` (`/`, `/pengenalan`) · `auth` · `protected` (`/app/*`).
7. Zona terproteksi bernama `protected/` (bukan `secret/`).
8. RBAC-driven UI: sidebar dari `menus`, aksi via `<Can>`, scope gedung di Zustand.
9. Prinsip "bold di cangkang, tenang di data"; motion press "ambles".
10. Font Space Grotesk; motif pulau di public + empty state.
11. Bahasa UI Indonesia dengan verb CTA konsisten.
12. **Animasi brutalism**: gerak hard/snappy (`steps()`/spring kaku), press "ambles", skeleton blink; lib `motion` + Tailwind; hormati reduced-motion (§9.7).
13. **Inventaris komponen** dipisah ke [`components.md`](./components.md) (boundary, tabel, keuangan, penghuni, kegiatan, pemilihan, organisasi, form, layout).
14. **Revisi palet**: teal `#359FA0` (main) · orange `#FF8C52` (aksen) · krem `#FFF0C5` (kanvas) · teal muda `#8AD6D1` (aksen 2); merah `#C15A5A` utk destruktif (§9.2, §9.3).

---

## 14. Glossary

| Istilah               | Arti                                                  |
| --------------------- | ----------------------------------------------------- |
| **Zona**              | kelompok route: `public`, `auth`, `protected`.        |
| **AppLayout**         | shell terproteksi (sidebar + topbar + breadcrumb).    |
| **`<Can>`**           | komponen gate aksi berdasar permission.               |
| **Scope gedung**      | filter data ke gedung aktif (`activeBuildingId`).     |
| **neobrutalism**      | gaya visual border tebal + hard shadow + warna solid. |
| **StatusBadge**       | komponen pemeta status → warna (lihat §9.3).          |
| **Query key**         | identitas cache TanStack Query.                       |
| **DataTable**         | tabel reusable (sorting/pagination).                  |
| **Animasi brutalism** | gerak hard/snappy (bukan fade lembut), lihat §9.7.    |
| **QueryBoundary**     | wrapper loading/empty/error standar.                  |

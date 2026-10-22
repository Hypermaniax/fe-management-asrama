# Rencana Fase (Detail) — Front-End Asrama Mahasiswa Kepri

Legenda: `[ ]` belum · `[x]` selesai · `[~]` ditunda (blocked API atau dijadwalkan di fase lain). Dokumen ini diturunkan dari [`plan.md`](./plan.md) → [`ui.md`](./ui.md).

> **Sumber kebenaran endpoint: [`api.md`](./api.md).** Jangan memakai asumsi dari luar dokumen ini.
> Semua modul yang tercatat di `api.md` sudah tersedia; tidak perlu mock. Yang belum didukung API dibuat `disabled`/deferred, bukan data palsu.

Konteks: FE konsumen API BE; zona **public / auth / protected**; gaya **neobrutalism**; state **TanStack Query + Zustand**.

---

## Pola modul FE (dipakai semua fase)

**1 modul API = 1 folder feature.** Satu modul boleh punya beberapa halaman.

```txt
src/features/<modul>/
  api.ts          # type + fungsi typed per endpoint (pakai lib/api.ts)
  hooks.ts        # useQuery/useMutation + query key + invalidasi
  schema.ts       # zod untuk form (bila ada)
  pages/          # list.tsx, detail.tsx, dst.
  components/     # dialog form, kolom tabel, badge khusus modul
```

Urutan kerja tiap modul:

1. **API** — `features/<modul>/api.ts`, type mengikuti `api.md`.
2. **Hooks** — query key terstruktur, invalidasi setelah mutasi.
3. **Schema** — zod + `zodResolver` untuk form.
4. **Pages** — list/detail/form; route hanya meng-import page.
5. **Components** — komponen khas modul.
6. **Route** — daftar di `app/router.tsx` + `PermissionGate`.
7. **Verifikasi** — `pnpm lint` + `pnpm build` (`tsc -b`).

Aturan umum:

- Loading → skeleton sesuai layout; empty → `EmptyState`; error → `ErrorState`.
- Aksi destruktif → `ConfirmDialog`; aksi tulis → toast sukses/gagal.
- Rupiah/tanggal pakai formatter; permission pakai `<Can>` + `PermissionGate`.
- Page tidak memanggil `fetch` langsung; semua lewat `hooks.ts`.
- Tidak ada pagination server-side sampai `api.md` mendokumentasikan `page/limit`.

**Definition of Done per fase**

- Semua endpoint modul punya fungsi typed di `api.ts`.
- Halaman utama + aksi utama (create/edit/delete/detail) berjalan.
- Permission, empty/loading/error, dan invalidasi query benar.
- `pnpm lint` dan `pnpm build` lolos.

---

## FASE 0 — Fondasi & kontrak API

**Tujuan:** fondasi tooling, fetch, error, file, tabel, dan struktur page per feature.

- [x] Install deps: `tailwindcss` + `@tailwindcss/vite`, `lucide-react`, `react-router`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `motion`, `sonner`, `clsx`/`tailwind-merge`, `date-fns`.
- [x] Setup **Tailwind v4** + `globals.css`, font Space Grotesk, alias `@/`.
- [x] `app/providers.tsx` (QueryClientProvider, Toaster, ErrorBoundary).
- [x] `lib/api.ts`: base URL, Authorization, redirect 401.
- [x] Komponen shared dasar: `PageHeader`, `EmptyState`, `StatusBadge`, `Can`, `CurrencyText`, `DateText`, skeleton.
- [x] `DataTable` dasar (kolom/render/loading/empty/error).
- [x] **Perbaiki `lib/api.ts`**: baca error `{ status: "<pesan>" }` + `{ status: "validation error", errors: [...] }`; hapus ketergantungan `code`/`message`.
- [x] **Dukung `FormData`** (upload dokumen/attachment) tanpa memaksa `Content-Type: application/json`.
- [x] **Dukung respons non-JSON**: CSV laporan + blob file.
- [x] Helper `GET /files/:id` untuk preview/download dengan Bearer token.
- [x] Refactor page yang sudah ada ke pola feature:
  - `routes/auth/*` → `features/auth/pages/*`
  - `routes/app/master/buildings.tsx` → `features/building/pages/*`
  - `routes/app/system/roles.tsx` → `features/rbac/pages/*`
- [x] `DataTable`: filter toolbar + pagination client-side (bukan server-side).
- [x] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 1 — Auth (§3 `api.md`)

**Tujuan:** register → OTP → login → sesi.

**Halaman:** `/login`, `/register`, `/verify-otp` · **Feature:** `features/auth`

- [x] `features/auth/api.ts`: `signUp`, `signIn`, `requestOtp`, `verifyOtp`, `me`, `fetchAccess`.
- [x] `features/auth/hooks.ts`, schema zod.
- [x] `stores/auth.ts` (Zustand + persist token, user, roles, permissions, menus).
- [x] Login/register/verify OTP berfungsi.
- [x] Setelah verifikasi/login → `GET /rbac/me` → isi access.
- [x] `401` → clear session + redirect `/login`.
- [x] Pindahkan page ke `features/auth/pages/` dan update router.
- [x] Tangani error “Email not verified” → arahkan ke `/verify-otp`.
- [x] Pesan sukses pakai field `status` API + error via toast (`lib/notify.ts`); error inline dihapus.
- [x] Verifikasi alur register → OTP → login dengan BE (`403 "Email not verified"` → `/verify-otp` → login 200 → `/rbac/me`).
- [x] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 2 — Shell + RBAC (§4 `api.md`)

**Tujuan:** kerangka public/auth/protected + navigasi berbasis RBAC.

**Halaman:** shell, `/app/system/roles` · **Feature:** `features/rbac`

- [x] `app/router.tsx`: layout routes **public**, **auth**, **protected**.
- [x] `AppLayout`: sidebar dari `menus`, topbar (pemilih gedung, user menu), breadcrumb.
- [x] `stores/scope.ts` (gedung aktif, persisten). `stores/ui.ts` dihapus — state sidebar ditangani `SidebarProvider` shadcn (persist via cookie).
- [x] `lib/rbac.ts`: `can`, `useCan`, `filterMenu`.
- [x] `<Can>` + `PermissionGate`, halaman 403/404.
- [x] Mobile sidebar drawer.
- [x] Roles: list, create, edit, nonaktifkan (`isSystem` terkunci).
- [x] Pindahkan page roles ke `features/rbac/pages/`.
- [x] Menu diurutkan `sortOrder` (`filterMenu`), ikon menu anak di `lib/menu-icons.ts`.
- [x] Skeleton sidebar saat `/rbac/me` memuat (`SidebarMenuSkeleton`).
- [x] Error `/rbac/me` → `ErrorState` + coba lagi (401 dikecualikan, ditangani redirect global).
- [x] `DataTable` pakai komponen `Pagination` registry (nomor halaman + ellipsis).
- [~] Role detail `/app/system/roles/:id` → **deferred**: `api.md §4` tidak punya `GET /rbac/roles/:id` maupun katalog `GET permission/menu`, jadi `PUT /roles/:id/{permissions,menus}` tak bisa diisi.
- [~] Assign/revoke role ke user → dikerjakan di Fase 11 (butuh daftar user dari modul Penghuni, Fase 6).
- [x] Verifikasi sidebar & akses dengan akun demo (`/rbac/me` admin/gedung/warga/calon; menu & permission cocok; permission lowercase BE ditangani `can` case-insensitive).
- [x] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 3 — Public

**Tujuan:** situs publik tanpa API.

- [x] `/` (hero, marquee, wilayah, fasilitas, kegiatan, testimoni, CTA).
- [x] `/pengenalan` (tentang, visi/misi, gedung, fasilitas, kontak) + CTA daftar/masuk di bawah (`ui.md §2.2`).
- [x] `PublicLayout` + motif pulau.
- [x] Verifikasi responsive (breakpoint `sm/md/lg`, nav mobile via `Sheet`) + CTA ke `/login` dan `/register` ada di hero, CTA, header, footer, dan `/pengenalan`; aset gambar `/images/*.svg` tersedia.

---

## FASE 4 — Dashboard

**Tujuan:** ringkasan role-aware. Tidak ada endpoint `/dashboard` khusus; data disusun dari modul lain.

**Halaman:** `/app/dashboard` · **Feature:** `features/dashboard`

- [x] Route + page `features/dashboard` (route tipis re-export).
- [x] Kartu statistik + bar chart (income vs expense + breakdown kategori) + daftar ringkas.
- [x] Manajemen (`report.READ`): `/reports/arrears`, `/reports/cash-balances`, `/reports/income-vs-expense`, `/events`, `/elections?status=OPEN`.
- [x] PENGHUNI: self (`/invoices` untuk tagihan — **asumsi server-scope**, `/payments?userId=`, `/events/me/attendance`, `/events`, `/elections`) + pintasan `/app/me/*`.
- [x] CALON_PENGHUNI: welcome + CTA dokumen.
- [x] Data nyata aktif (shape lengkap di `api.md`); tidak menunggu Fase 7/9/10.
- [x] Skeleton (`DashboardSkeleton`) + empty state per seksi.
- [x] Verifikasi: `pnpm lint` + `pnpm build`.

> Catatan: `ui.md §5.1` minta "line chart kas", tetapi `api.md` tidak punya endpoint time-series kas — dipakai bar chart `income-vs-expense` + breakdown kategori. Filter tagihan self (blocker #4) memakai `GET /invoices` dengan asumsi BE membatasi ke user login.

---

## FASE 5 — Data Master

**Tujuan:** CRUD master data per modul.

### 5.1 Gedung (§5)
- [x] List, form dialog, nonaktifkan, `GenderBadge`.
- [x] Route `/app/master/buildings`.

### 5.2 Kamar (§6)
- [x] Feature `room`; endpoint `POST/GET /rooms`, `PATCH/DELETE /rooms/:id`.
- [x] Halaman `/app/master/rooms`: list/form, filter gedung/status, kapasitas.
- [x] Permission `room.*` (`Can` per aksi + `PermissionGate` route).
- Catatan: `api.md` `Room` tidak menyediakan `tarif`/`penghuni terisi`; kolom dibatasi nomor/gedung/kapasitas/status (tarif dari Aturan Biaya; terisi tunggu modul Penempatan Fase 6).

### 5.3 Aturan Biaya (§7)
- [x] Feature `fee-rule`; endpoint `POST/GET /fee-rules`, `DELETE /fee-rules/:id`.
- [x] Halaman `/app/master/fee-rules`: list + form create + nonaktifkan (tidak ada `PATCH` di `api.md`).
- [x] Permission `feeRule.*`.

### 5.4 Fasilitas (§8)
- [x] Feature `facility`; endpoint katalog + `GET/PUT /facilities/rooms/:roomId`.
- [x] Halaman `/app/master/room-facilities`: tab **Katalog** (CRUD `scope=ROOM`) + tab **Per kamar** (editor fasilitas via `PUT`).
- [x] Permission `facility.*`.
- Catatan: `PATCH /facilities/:id` hanya mengirim `{ name, category, isActive }` (scope/usageMode/code dianggap tetap, tidak ada kontrak tegas di `api.md`).

### 5.5 Fasilitas Umum (§9)
- [x] Feature `public-facility`; endpoint list/form + `POST /public-facilities/:id/assign`, `GET /public-facilities/:id/assignments`, `DELETE /public-facilities/assignments/:assignmentId`.
- [x] Halaman `/app/master/public-facilities`: list/form + assign/release slot (dialog).
- [x] Permission `facility.*` (slot: `facility.CREATE`/`facility.DELETE`).
- Catatan: pemilih penghuni memakai `GET /residents?buildingId=` (`user.READ`), kini lewat hook `useResidents` milik modul Penghuni.

### 5.6 Kategori Kas (§16)
- [x] Feature `category`; endpoint `POST/GET /categories`, `PATCH/DELETE /categories/:id`.
- [x] Halaman `/app/master/categories`: list/form INCOME/EXPENSE.
- [x] Permission `category.*`.

- [x] Verifikasi: `pnpm lint` + `pnpm build` ✅ (tanpa BE).

---

## FASE 6 — Penghuni

**Tujuan:** siklus calon → penghuni → penempatan + dokumen.

### 6.1 Penghuni (§10)
- [x] Feature `resident`; endpoint list/detail/profile/submit/approve/reject/checkout.
- [x] Halaman `/app/residents/applicants`: daftar PENDING/REJECTED + setujui/tolak.
- [x] Halaman `/app/residents`: daftar ACTIVE/CHECKOUT + filter gedung/status/cari.
- [x] Halaman `/app/residents/:id`: tab Profil + Penempatan + Dokumen, aksi submit/approve/reject/checkout.
- [x] Permission `user.READ`, `user.UPDATE`, `user.APPROVE`.
- Catatan: `GET /residents` mewajibkan `buildingId` → halaman memakai pemilih gedung; pendaftar tanpa gedung tidak tampil pada filter gedung mana pun.

### 6.2 Dokumen (§11)
- [x] Feature `document`; endpoint tipe, required, list, request, upload, verify, reject.
- [x] Halaman `/app/residents/documents`: pilih penghuni → list/review + minta dokumen + kelola jenis + preview `GET /files/:id`.
- [x] Halaman `/app/me/documents`: required + upload milik sendiri + pratinjau.
- [x] Permission `document.CREATE`, `document.READ`, `document.VERIFY`.
- [x] Upload memakai `FormData` (`documentTypeId` + `file`, validasi MIME/ukuran client).
- Catatan: `GET /documents` wajib `userId` (tidak ada list semua dokumen) → review harus pilih penghuni dulu. `POST /documents/upload` tidak menerima `userId` → unggah hanya untuk user login; manajemen memakai "Minta dokumen". `POST /documents/types` tanpa PATCH/DELETE → jenis dokumen hanya bisa ditambah.

### 6.3 Penempatan (§12)
- [x] Feature `occupancy`; endpoint `POST/GET /occupancies`, `POST /occupancies/:id/checkout`.
- [x] Halaman `/app/residents/occupancies`: list, tempatkan, checkout.
- [x] Validasi kapasitas, gender gedung, penempatan aktif (dilakukan server; form membatasi penghuni ACTIVE + kamar ACTIVE satu gedung).
- [x] Permission `occupancy.*`.
- Catatan: `GET /occupancies` tanpa query → filter gedung/status di client.

- [x] Verifikasi: transisi PENDING → ACTIVE → CHECKOUT didukung UI; `pnpm lint` + `pnpm build` ✅ (tanpa BE).

---

## FASE 7 — Keuangan

**Tujuan:** tagihan, pembayaran, kas, pengeluaran, laporan.

### 7.1 Akun Kas (§17)
- [x] Feature `cash-account`; endpoint CRUD + `GET /cash-accounts/:id/balance`, `GET /cash-accounts/:id/ledger`.
- [x] Halaman `/app/finance/cash`: list/form akun, saldo.
- [x] Permission `cash.*`.
- Catatan: satu akun per gedung; saldo dihitung per akun lewat `GET /cash-accounts/:id/balance`. Hapus akun gagal bila sudah ada mutasi (pesan API ditampilkan via toast). Tab ledger menyusul di 7.5.

### 7.2 Tagihan (§13)
- [x] Feature `invoice`; endpoint generate/list/detail/void.
- [x] Halaman `/app/finance/invoices`: list, generate (gedung+bulan+tahun), detail, void.
- [x] Halaman `/app/me/invoices`: tagihan self.
- [x] Permission `invoice.CREATE`, `invoice.READ`, `invoice.UPDATE`.
- Catatan: list memakai filter server `buildingId/status/year/month`; nama penghuni dipetakan dari `/residents?buildingId=` per gedung. Halaman self memakai §15 `GET /me/invoices` (bukan `GET /invoices`) dan menampilkan status pengajuan pembayaran; form pengajuan tersedia di `/app/me/payments` (7.4). Void gagal bila sudah ada pembayaran (toast API).

### 7.3 Pembayaran (§14)
- [x] Feature `payment`; endpoint create/list/detail.
- [x] Halaman `/app/finance/payments`: tab **Rekap** (matriks bulan × penghuni) + **Transaksi**; form pembayaran + alokasi ke tagihan + `idempotencyKey`.
- [x] Permission `payment.APPROVE`, `payment.READ`.
- Catatan: matriks disusun dari `GET /invoices?buildingId=&year=` (status bayar per bulan) + `GET /payment-submissions?status=PENDING` untuk penanda menunggu; detail sel memakai `GET /payments?userId=`. Bukti admin memakai `POST /me/payments/proof` (izin `payment.CREATE`). Verifikasi/tolak pengajuan §16 tersedia di 7.4.

### 7.4 Verifikasi Pembayaran (§16)
- [x] Feature `payment` submission: list/verify/reject + unggah bukti (`/me/payments/proof`).
- [x] Halaman `/app/finance/payments` tab **Pengajuan**: pratinjau bukti, verifikasi (akun kas opsional), tolak (alasan).
- [x] Halaman `/app/me/payments`: tagihan outstanding + form pengajuan (transfer/QRIS, bukti wajib, bayar penuh) + riwayat pengajuan.
- [x] Permission `payment.READ`, `payment.APPROVE`, `payment.CREATE`.
- Catatan: pengajuan warga memakai `GET/POST /me/payments` + `POST /me/payments/proof`; riwayat self memakai query key `my-payment-submissions`, dan sukses pengajuan menginvalidasi `my-invoices` agar status langsung berubah. Verifikasi atomik/idempoten ditangani server; UI hanya menampilkan status API. Nominal dikunci ke sisa tagihan dan tombol ajukan disembunyikan saat masih ada pengajuan `PENDING`.

### 7.5 Pengeluaran (§19)
- [x] Feature `expense`; endpoint create/list/detail.
- [x] Halaman `/app/finance/expenses`: list + filter gedung/kategori/cari, form + bukti + kategori + akun kas, detail, pratinjau bukti.
- [x] Permission `cash.CREATE`, `cash.READ`.
- Catatan: `GET /expenses` tidak punya query filter, jadi filter gedung/kategori/pencarian dilakukan client dari `GET /cash-accounts`, `GET /categories?kind=EXPENSE`, dan `GET /buildings`. Form membuat `idempotencyKey` di FE; sukses mencatat menginvalidasi `expenses`, saldo akun kas, ledger, dan laporan. **Bukti wajib diunggah memakai `POST /me/payments/proof`** (belum ada endpoint upload khusus pengeluaran), sehingga role perlu `payment.CREATE`; jika backend menambah endpoint receipt khusus, ganti `uploadExpenseReceipt` saja.

### 7.6 Buku Kas (§20)
- [x] Feature `ledger`; endpoint list, income manual, reversal.
- [x] Halaman `/app/finance/cash` tab **Buku Kas**: ringkasan saldo, filter akun + rentang tanggal, tabel mutasi dengan saldo berjalan, aksi pemasukan manual + reversal.
- [x] Permission `cash.READ`, `cash.CREATE`, `cash.UPDATE`.
- Catatan: `GET /ledger` hanya mendukung filter `cashAccountId`, jadi rentang tanggal difilter client dari data akun terpilih. Saldo berjalan dihitung kronologis dari `openingBalance` (`GET /cash-accounts/:id/balance`), lalu tabel ditampilkan terbaru dulu. Entri `REVERSAL` tidak bisa dibalik lagi; entri yang sudah memiliki reversal ditandai **Dibalik**. Pemasukan manual memakai kategori `INCOME` gedung akun dan `idempotencyKey` FE; reversal wajib alasan (≤255).

### 7.7 Laporan (§24)
- [x] Feature `report`; endpoint tunggakan, saldo, income vs expense, budget event, export CSV.
- [x] Halaman `/app/finance/reports`: tab Tunggakan (filter periode + ekspor), Saldo Kas, Pemasukan vs Pengeluaran (rentang tanggal + ekspor), Anggaran Kegiatan (pilih event); chart + tabel + ringkasan.
- [x] Permission `report.READ`, `report.EXPORT`.
- Catatan: filter gedung global berlaku untuk semua tab; daftar event pada tab anggaran difilter client dari `GET /events`. Rentang tanggal dikirim sebagai ISO awal/akhir hari (`T00:00:00.000Z`/`T23:59:59.999Z`) agar inklusif. Ekspor CSV diunduh via blob dan dibatasi `Can report.EXPORT`; filenya `tunggakan-YYYY-MM-DD.csv` / `pemasukan-pengeluaran-YYYY-MM-DD.csv`. Angka mengikuti API; `usagePercent`/`remaining` null ditampilkan sebagai "—".

- [ ] Dependency: Penghuni, Penempatan, Aturan Biaya, Kategori, Akun Kas.
- [ ] Verifikasi angka rupiah + `pnpm lint` + `pnpm build`.

---

## FASE 8 — Organisasi (§21)

**Tujuan:** periode, jabatan, penugasan, struktur.

**Halaman:** `/app/organization/{periods,positions,assignments}` · **Feature:** `organization`

- [x] Periode: CRUD + activate (hanya satu aktif).
- [x] Jabatan: CRUD + role terkait.
- [x] Penugasan: user + jabatan + periode + gedung.
- [x] Struktur organisasi.
- [x] Permission `period.*`, `position.*`.
- [x] Verifikasi: `pnpm lint` + `pnpm build`.
- Catatan: tidak ada endpoint daftar user global, jadi halaman penugasan memilih pengguna dari direktori penghuni per gedung (`GET /residents?buildingId=`) lalu memuat penugasan via `GET /organization/assignments?userId=`. Scope penugasan opsional (`buildingId` kosong = asrama). Dialog jabatan memakai `GET /rbac/roles` untuk role terkait dan `GET /buildings` untuk scope. Tab **Struktur** memakai `GET /organization/structure?periodId=` dan default ke periode aktif; holder ditampilkan dari data struktur (read-only). API menolak `null` untuk field opsional, jadi payload hanya mengirim field yang diisi; scope jabatan dinonaktifkan saat edit karena API belum mendukung pengosongan `buildingId`/`roleId`.

---

## FASE 9 — Kegiatan (§19)

**Tujuan:** kegiatan, sesi, panitia, absensi, anggaran, lampiran.

**Halaman:** `/app/events`, `/app/events/:id`, `/app/me/attendance` · **Feature:** `event`

- [x] List + create cepat/ad-hoc (filter status/kategori/scope, pencarian, modifikasi `isAdHoc` saat create).
- [x] Detail tab: Sesi, Panitia, Absensi, Anggaran, Lampiran (tab 3 pertama hanya untuk `event.UPDATE`; PENGHUNI hanya lihat Sesi + Lampiran read-only).
- [x] Sesi: tambah + generate dari daftar tanggal (tanggal sudah ada dilewati server).
- [x] Panitia: tambah/lepas (direktori warga difilter per scope kegiatan).
- [x] Absensi: set per sesi (HADIR/IZIN/TIDAK); summary per status; self untuk PENGHUNI di `/app/me/attendance`.
- [x] Anggaran: expense bertaut event — summary anggaran/realisasi/sisa + progress, daftar expense difilter client `GET /expenses?eventId` filter (tidak ada endpoint daftar expense per event); form memakai `POST /events/:id/expenses`.
- [x] Lampiran: upload proposal/notulen/LPJ/foto — **tidak ada endpoint upload file umum**, memakai workaround `POST /me/payments/proof` (butuh `payment.CREATE`) lalu `POST /events/:id/attachments`, sama seperti bukti pengeluaran.
- [x] Self: `/events/me/committees`, `/events/me/attendance` di `/app/me/attendance` (tab Absensi & Kepanitiaan).
- [x] Permission `event.*` via `PermissionGate` route + `Can`/`useCan` di UI.
- [x] Verifikasi: create → session → committee → attendance GET/PUT → status → PATCH → attach → expense → me/committees+attendance diuji via curl (semua 200/201); `GET /events/:id` mengembalikan schedules+committee+attachment+attendanceSummary. `pnpm lint` bersih untuk file baru + `pnpm build` lulus. Akun PENGHUNI belum tersedia di DB dev, sehingga "kegiatan publik hanya tampil untuk PENGHUNI" masih perlu dicek manual saat akun warga ada (`GET /events` sudah non-public filter sisi server).

- Catatan: **upload lampiran/bukti memakai workaround** `POST /me/payments/proof` karena `api.md` tidak menyediakan endpoint upload file umum; butuh `payment.CREATE` (ADMIN_GEDUNG/SUPER_ADMIN sudah punya). Tidak ada endpoint daftar expense per event, jadi tab Anggaran memfilter `GET /expenses` di client berdasarkan `eventId`. Sesi/panitia/absensi/lampiran UI dipaginasi client (API mengembalikan seluruh data). Status event diubah lewat select pada header detail (`POST /events/:id/status`). Warga non-`event.UPDATE` hanya melihat tab Sesi & Lampiran (read-only) di detail kegiatan.

---

## FASE 10 — Pemilihan (§20)

**Tujuan:** pemilihan ketua, voting, hasil, finalisasi.

**Halaman:** `/app/elections`, `/app/elections/:id`, `/app/elections/results`, `/app/me/elections` · **Feature:** `election`

- [x] List + create (filter status + pencarian; form: kode/judul/deskripsi, scope gedung/asrama, periode, jadwal, abstain, role pemilih saat create).
- [x] Eligible roles: tab **Role Pemilih** di detail — chip role aktif, simpan via `PUT /elections/:id/eligible-roles`.
- [x] Kandidat (dari warga aktif) + visi/misi: wajib occupancy aktif + role PENGHUNI (server), pilihan dari direktori warga per scope; nomor urut opsional.
- [x] Open/close/cancel: tombol di list (Buka/Tutup) + detail (Buka/Tutup/Batalkan) dengan konfirmasi; maks 1 OPEN per scope (server).
- [x] Voting + abstain; cegah vote ganda: `/app/me/elections` kartu pemilihan OPEN → dialog vote per kandidat + abstain (bila `allowAbstain`); vote kedua → 409 "You have already voted" ditampilkan sebagai notifikasi.
- [x] Hasil hanya setelah CLOSED; terkunci saat OPEN: tab **Hasil** dan `/app/elections/results` (paged select) memakai bar per kandidat + abstain; saat OPEN → pesan "Hasil terkunci"; saat OPEN endpoint `GET /result` memang 403 "Result is not available yet".
- [x] Finalize ke jabatan (butuh periode/posisi): tab **Finalisasi** — pilih jabatan aktif + kandidat (default peringkat 1) → `POST /elections/:id/finalize`; status jadi DONE + assignment dibuat. Peringatan bila periode belum terkait.
- [x] Permission `election.*` via `PermissionGate` + `Can`.
- [x] Dependency: Fase 8 (periode/jabatan) dipakai untuk finalisasi.
- [x] Verifikasi: end-to-end via curl — register 2 warga (OTP stateless dihitung lokal), approve+occupancy+role, tambah 2 kandidat, PUT eligible-roles, open, vote (warga terverifikasi; admin/ non-eligible → 403), vote ganda → 409, result saat OPEN → 403, close → result → finalize (status DONE + assignment). `pnpm lint` bersih + `pnpm build` lulus.

- Catatan: kandidat harus warga **aktif dengan occupancy** + role PENGHUNI (bukan sekadar status ACTIVE). Tidak ada endpoint "sudah memilih", jadi status vote diketahui dari error 409 saat vote kedua. OTP dev bersifat stateless (HMAC OTP_SECRET/JWT_SECRET + email + step 300s). Finalisasi menautkan `assignment` sesuai periode pemilihan; warga terpilih otomatis jadi pemegang jabatan pada periode terkait.

---

## FASE 11 — Sistem

**Tujuan:** pengguna, role, audit. Permission/menu ditunda sesuai kemampuan `api.md`.

- [x] **11.1 Roles**: list/form/nonaktifkan.
- [x] **11.2 Users**: `/app/system/users` — read-only dari `GET /residents?buildingId=` per gedung (digabung + dedupe), filter status/pencarian, taut ke detail warga; **Kelola role** di dialog: beri role (`POST /rbac/assign`, scope gedung opsional) + cabut (`DELETE /rbac/user-roles/:id`). Daftar role per user direkonstruksi dari jejak audit `userRole` (CREATE→assign, DELETE→revoke) karena tidak ada endpoint daftar role per user.
- [x] **11.3 Audit** (§25): `/app/system/audit` — filter entitas/ID/aksi + jumlah baris (maks 500), tabel waktu/aktor/aksi/entitas/path, dialog detail menampilkan `before`/`after` JSON, path, IP, aktor; data detail diambil langsung dari baris tabel (`GET /audit-logs/:id` juga terverifikasi 200 via curl untuk kontrak).
- [x] **11.4 Permission/Menu**: selesai setelah BE menyediakan `GET /rbac/permissions` (140 direktori), `GET /rbac/menus` (47), dan `GET /rbac/roles/:id/{permissions,menus}`. Halaman `/app/system/permissions` (matrix resource × aksi, read-only), `/app/system/menus` (tree read-only), dan `/app/system/roles/:id` (tab editor Permission (checkbox matrix + filter pencarian, simpan `PUT .../permissions`) & Menu (checkbox tree, simpan `PUT .../menus`); dirty-check pakai overlay override, tanpa setState-in-effect; daftar role menaut "Atur →" ke detail).
- [x] Khusus SUPER_ADMIN: `system/users` gated `user.READ`, `system/audit` gated `audit.READ` (akses efektif SUPER_ADMIN).
- [x] Verifikasi: curl — `GET /audit-logs?entity=userRole&take=10` (200, `after` berisi `userId/roleId/buildingId`), `GET /audit-logs/:id` (200; 404 bila memakai entityId bukan id audit), filter `action=DELETE` (200) mencatat revoke; `POST /rbac/assign` 201 + `DELETE /rbac/user-roles/:id` 200 → keduanya menghasilkan entri audit `userRole`. `pnpm lint` bersih + `pnpm build` lulus.

- Catatan: penugasan role per pengguna diperoleh dari rekap jejak audit `userRole` (`take` maks 500) — tanpa endpoint daftar role per user. Pencabutan/penambahan role baru langsung terlihat setelah invalidasi query `system`. Gedung tanpa pengguna ringan (semua gedung di-fetch paralel lalu digabung). Audit hanya terekam untuk mutasi oleh SUPER_ADMIN/ADMIN_GEDUNG (middleware server).

---

## FASE 12 — Akun Saya

**Tujuan:** self-service untuk CALON_PENGHUNI/PENGHUNI.

**Halaman:** `/app/me/{profile,invoices,documents,attendance,elections}`

- [~] **12.1 Profil**: `/auth/me` hanya `id`+`email`; profil lengkap **deferred** sampai ada endpoint.
- [ ] **12.2 Tagihan**: `/app/me/invoices`; perlu klarifikasi filter self karena `api.md` tidak mencantumkan `userId` pada `GET /invoices`.
- [ ] **12.3 Dokumen**: `/app/me/documents` — required, list milik sendiri, upload.
- [x] **12.4 Absensi**: `/app/me/attendance` — `/events/me/attendance` (tab Absensi & Kepanitiaan via `/events/me/committees`).
- [x] **12.5 Pemilihan**: `/app/me/elections` — kartu pemilihan OPEN (vote + abstain), hasil via dialog bar per kandidat.
- [ ] Pastikan CALON hanya melihat profil + dokumen; PENGHUNI melihat 5 menu self.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 13 — Polish & verifikasi menyeluruh

- [x] A11y: focus visible (ring `focus-visible` sudah dari registry), kontras (foreground gelap di krem/putih), `prefers-reduced-motion` — global reset animasi/transisi + shake invalid dibungkus `no-preference`.
- [x] Motion neobrutalism konsisten: press amble (`active:` translate + shadow-none) ditambahkan ke semua varian `Button` (default/neutral/reverse); hover lift & stagger snap-in tidak berubah.
- [x] Responsive: sidebar `collapsible="icon"` + `SidebarTrigger` drawer mobile dari registry; tabel bungkus `overflow-auto` (registry `table.tsx`); DataTable + semua halaman pakai pola responsif.
- [x] Empty/loading/error konsisten: semua 36 pages memakai `DataTable`/`SkeletonTable`/`EmptyState`/`ErrorState` (auth pages memakai `LoadingButton`/error inline).
- [x] Tidak ada placeholder/mock tersisa — `AppPlaceholderPage` hanya untuk fallback `*` dan menu yang di-*defer* (`system/permissions`, `system/menus`).
- [x] Smoke test alur kritis via curl: register → OTP (HMAC sha256 dev, pass) → approve → profil (gender wajib untuk penempatan; okupansi cek gender & kapasitas gedung — penghuni MALE hanya masuk kamar Gedung Putra) → generate invoice (201, semua penghuni aktif) → payment (idempotencyKey wajib; invoice → PAID) → event + session + attendance (PUT) → election open (vote admin 403 diharapkan, warga sudah tervalidasi Fase 10) → close → result (termasuk abstain) → laporan arrears/cash-balances/income-vs-expense (200).
- [x] Verifikasi final: `pnpm lint` (warnings pre-existing registry toast.tsx), `pnpm exec tsc -b`, `pnpm build` lulus.

---

## Blockers / keputusan terbuka

1. **Role detail** butuh endpoint daftar permission/menu — **selesai**: `GET /rbac/permissions`, `GET /rbac/menus`, `GET /rbac/roles/:id/{permissions,menus}` kini ada di BE (terverifikasi curl Oktober 2026); editor role detail dibangun pada 11.4. `PUT` juga ikut menulis `permissionIds` lengkap ke audit.
2. **Users CRUD** tidak ada di `api.md`; halaman Users hanya read-only + assign role.
3. **Profil self-service** belum punya endpoint update/full profile.
4. **Tagihan self** belum jelas filternya (`GET /invoices` tanpa `userId`).
5. **Pagination/sorting** belum ada kontrak query di `api.md`; gunakan client-side sementara.
6. **Dashboard** tidak punya endpoint khusus; harus disusun dari modul lain dan role-aware.
7. **Casing permission tidak konsisten**: `api.md` menulis `building.READ` (uppercase), tetapi `/rbac/me` dari BE mengembalikan lowercase (`building.read`). Sudah dinormalisasi case-insensitive di `lib/rbac.ts` (`can`), dipakai `<Can>` + `PermissionGate`.

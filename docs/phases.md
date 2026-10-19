# Rencana Fase (Detail) — Front-End Asrama Mahasiswa Kepri

Legenda: `[ ]` belum · `[x]` selesai. Dokumen ini diturunkan dari [`plan.md`](./plan.md) → [`ui.md`](./ui.md).

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
- [ ] Tangani error “Email not verified” → arahkan ke `/verify-otp`.
- [ ] Verifikasi alur register → OTP → login dengan BE.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 2 — Shell + RBAC (§4 `api.md`)

**Tujuan:** kerangka public/auth/protected + navigasi berbasis RBAC.

**Halaman:** shell, `/app/system/roles` · **Feature:** `features/rbac`

- [x] `app/router.tsx`: layout routes **public**, **auth**, **protected**.
- [x] `AppLayout`: sidebar dari `menus`, topbar (pemilih gedung, user menu), breadcrumb.
- [x] `stores/scope.ts`, `stores/ui.ts`.
- [x] `lib/rbac.ts`: `can`, `useCan`, `filterMenu`.
- [x] `<Can>` + `PermissionGate`, halaman 403/404.
- [x] Mobile sidebar drawer.
- [x] Roles: list, create, edit, nonaktifkan (`isSystem` terkunci).
- [x] Pindahkan page roles ke `features/rbac/pages/`.
- [ ] Role detail `/app/system/roles/:id` → **deferred**: `api.md` belum punya endpoint daftar permission/menu.
- [ ] Assign/revoke role ke user → dikerjakan di Fase 11.
- [ ] Verifikasi sidebar & akses dengan akun demo.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 3 — Public

**Tujuan:** situs publik tanpa API.

- [x] `/` (hero, marquee, wilayah, fasilitas, kegiatan, testimoni, CTA).
- [x] `/pengenalan` (tentang, visi/misi, gedung, fasilitas, kontak).
- [x] `PublicLayout` + motif pulau.
- [ ] Verifikasi responsive + CTA ke `/login` dan `/register`.

---

## FASE 4 — Dashboard

**Tujuan:** ringkasan role-aware. Tidak ada endpoint `/dashboard` khusus; data disusun dari modul lain.

**Halaman:** `/app/dashboard` · **Feature:** `features/dashboard`

- [x] Route + placeholder.
- [ ] Kartu statistik + chart + daftar ringkas.
- [ ] Admin: `/reports/*`, `/cash-accounts/:id/balance`, `/events`, `/elections`.
- [ ] PENGHUNI: hanya endpoint self (`/payments?userId=`, `/events/me/attendance`, `/elections`).
- [ ] Aktifkan data nyata setelah Fase 7, 9, dan 10.
- [ ] Skeleton kartu + empty state.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 5 — Data Master

**Tujuan:** CRUD master data per modul.

### 5.1 Gedung (§5)
- [x] List, form dialog, nonaktifkan, `GenderBadge`.
- [x] Route `/app/master/buildings`.

### 5.2 Kamar (§6)
- [ ] Feature `room`; endpoint `POST/GET /rooms`, `PATCH/DELETE /rooms/:id`.
- [ ] Halaman `/app/master/rooms`: list/form, filter gedung/status, kapasitas.
- [ ] Permission `room.*`.

### 5.3 Aturan Biaya (§7)
- [ ] Feature `fee-rule`; endpoint `POST/GET /fee-rules`, `DELETE /fee-rules/:id`.
- [ ] Halaman `/app/master/fee-rules`: list/form, nonaktifkan.
- [ ] Permission `feeRule.*`.

### 5.4 Fasilitas (§8)
- [ ] Feature `facility`; endpoint katalog + `GET/PUT /facilities/rooms/:roomId`.
- [ ] Halaman `/app/master/room-facilities`: katalog + editor fasilitas per kamar.
- [ ] Permission `facility.*`.

### 5.5 Fasilitas Umum (§9)
- [ ] Feature `public-facility`; endpoint list/form + `POST /public-facilities/:id/assign`, `GET /public-facilities/:id/assignments`, `DELETE /public-facilities/assignments/:assignmentId`.
- [ ] Halaman `/app/master/public-facilities`: list/form + assign/release slot.
- [ ] Permission `facility.*`.

### 5.6 Kategori Kas (§16)
- [ ] Feature `category`; endpoint `POST/GET /categories`, `PATCH/DELETE /categories/:id`.
- [ ] Halaman `/app/master/categories`: list/form INCOME/EXPENSE.
- [ ] Permission `category.*`.

- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 6 — Penghuni

**Tujuan:** siklus calon → penghuni → penempatan + dokumen.

### 6.1 Penghuni (§10)
- [ ] Feature `resident`; endpoint list/detail/profile/submit/approve/reject/checkout.
- [ ] Halaman `/app/residents/applicants`: daftar PENDING/REJECTED + setujui/tolak.
- [ ] Halaman `/app/residents`: daftar ACTIVE/CHECKOUT + filter.
- [ ] Halaman `/app/residents/:id`: profil + aksi status.
- [ ] Permission `user.READ`, `user.UPDATE`, `user.APPROVE`.

### 6.2 Dokumen (§11)
- [ ] Feature `document`; endpoint tipe, required, list, request, upload, verify, reject.
- [ ] Halaman `/app/residents/documents`: list/review + minta dokumen + preview `GET /files/:id`.
- [ ] Halaman `/app/me/documents`: required + upload milik sendiri.
- [ ] Permission `document.CREATE`, `document.READ`, `document.VERIFY`.
- [ ] Upload memakai `FormData`.

### 6.3 Penempatan (§12)
- [ ] Feature `occupancy`; endpoint `POST/GET /occupancies`, `POST /occupancies/:id/checkout`.
- [ ] Halaman `/app/residents/occupancies`: list, tempatkan, checkout.
- [ ] Validasi kapasitas, gender gedung, penempatan aktif.
- [ ] Permission `occupancy.*`.

- [ ] Verifikasi: transisi PENDING → ACTIVE → CHECKOUT; `pnpm lint` + `pnpm build`.

---

## FASE 7 — Keuangan

**Tujuan:** tagihan, pembayaran, kas, pengeluaran, laporan.

### 7.1 Akun Kas (§15)
- [ ] Feature `cash-account`; endpoint CRUD + `GET /cash-accounts/:id/balance`, `GET /cash-accounts/:id/ledger`.
- [ ] Halaman `/app/finance/cash`: list/form akun, saldo.
- [ ] Permission `cash.*`.

### 7.2 Tagihan (§13)
- [ ] Feature `invoice`; endpoint generate/list/detail/void.
- [ ] Halaman `/app/finance/invoices`: list, generate (gedung+bulan+tahun), detail, void.
- [ ] Halaman `/app/me/invoices`: tagihan self.
- [ ] Permission `invoice.CREATE`, `invoice.READ`, `invoice.UPDATE`.

### 7.3 Pembayaran (§14)
- [ ] Feature `payment`; endpoint create/list/detail.
- [ ] Halaman `/app/finance/payments`: form pembayaran + alokasi ke tagihan + `idempotencyKey`.
- [ ] Permission `payment.CREATE`, `payment.READ`.

### 7.4 Pengeluaran (§17)
- [ ] Feature `expense`; endpoint create/list/detail.
- [ ] Halaman `/app/finance/expenses`: form + bukti + kategori + akun kas.
- [ ] Permission `cash.CREATE`, `cash.READ`.

### 7.5 Buku Kas (§18)
- [ ] Feature `ledger`; endpoint list, income manual, reversal.
- [ ] Halaman `/app/finance/cash` tab ledger: read-only + filter akun/rentang.
- [ ] Permission `cash.READ`, `cash.CREATE`, `cash.UPDATE`.

### 7.6 Laporan (§22)
- [ ] Feature `report`; endpoint tunggakan, saldo, income vs expense, budget event, export CSV.
- [ ] Halaman `/app/finance/reports`: tab + chart + tabel + ekspor.
- [ ] Permission `report.READ`, `report.EXPORT`.

- [ ] Dependency: Penghuni, Penempatan, Aturan Biaya, Kategori, Akun Kas.
- [ ] Verifikasi angka rupiah + `pnpm lint` + `pnpm build`.

---

## FASE 8 — Organisasi (§21)

**Tujuan:** periode, jabatan, penugasan, struktur.

**Halaman:** `/app/organization/{periods,positions,assignments}` · **Feature:** `organization`

- [ ] Periode: CRUD + activate (hanya satu aktif).
- [ ] Jabatan: CRUD + role terkait.
- [ ] Penugasan: user + jabatan + periode + gedung.
- [ ] Struktur organisasi.
- [ ] Permission `period.*`, `position.*`.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 9 — Kegiatan (§19)

**Tujuan:** kegiatan, sesi, panitia, absensi, anggaran, lampiran.

**Halaman:** `/app/events`, `/app/events/:id`, `/app/me/attendance` · **Feature:** `event`

- [ ] List + create cepat/ad-hoc.
- [ ] Detail tab: Sesi, Panitia, Absensi, Anggaran, Lampiran.
- [ ] Sesi: tambah + generate dari daftar tanggal.
- [ ] Panitia: tambah/lepas.
- [ ] Absensi: set per sesi (HADIR/IZIN/TIDAK); self untuk PENGHUNI.
- [ ] Anggaran: expense bertaut event.
- [ ] Lampiran: upload proposal/notulen/LPJ/foto.
- [ ] Self: `/events/me/committees`, `/events/me/attendance`.
- [ ] Permission `event.*`.
- [ ] Verifikasi: kegiatan publik hanya tampil untuk PENGHUNI; `pnpm lint` + `pnpm build`.

---

## FASE 10 — Pemilihan (§20)

**Tujuan:** pemilihan ketua, voting, hasil, finalisasi.

**Halaman:** `/app/elections`, `/app/elections/:id`, `/app/elections/results`, `/app/me/elections` · **Feature:** `election`

- [ ] List + create.
- [ ] Eligible roles.
- [ ] Kandidat (dari warga aktif) + visi/misi.
- [ ] Open/close/cancel.
- [ ] Voting + abstain; cegah vote ganda.
- [ ] Hasil hanya setelah CLOSED; terkunci saat OPEN.
- [ ] Finalize ke jabatan (butuh periode/posisi).
- [ ] Permission `election.*`.
- [ ] Dependency: Fase 8 (periode/jabatan).
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 11 — Sistem

**Tujuan:** pengguna, role, audit. Permission/menu ditunda sesuai kemampuan `api.md`.

- [x] **11.1 Roles**: list/form/nonaktifkan.
- [ ] **11.2 Users**: read-only dari `/residents` + assign/revoke role via `/rbac/assign` dan `DELETE /rbac/user-roles/:id`. Tidak ada CRUD user di `api.md`.
- [ ] **11.3 Audit** (§23): `/app/system/audit`, list/filter + detail.
- [ ] **11.4 Permission/Menu**: **deferred** — `api.md` tidak menyediakan endpoint daftar/simpan permission & menu di luar `PUT /rbac/roles/:id/{permissions,menus}`.
- [ ] Khusus SUPER_ADMIN.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 12 — Akun Saya

**Tujuan:** self-service untuk CALON_PENGHUNI/PENGHUNI.

**Halaman:** `/app/me/{profile,invoices,documents,attendance,elections}`

- [ ] **12.1 Profil**: `/auth/me` hanya `id`+`email`; profil lengkap **deferred** sampai ada endpoint.
- [ ] **12.2 Tagihan**: `/app/me/invoices`; perlu klarifikasi filter self karena `api.md` tidak mencantumkan `userId` pada `GET /invoices`.
- [ ] **12.3 Dokumen**: `/app/me/documents` — required, list milik sendiri, upload.
- [ ] **12.4 Absensi**: `/app/me/attendance` — `/events/me/attendance`.
- [ ] **12.5 Pemilihan**: `/app/me/elections` — list, vote, hasil.
- [ ] Pastikan CALON hanya melihat profil + dokumen; PENGHUNI melihat 5 menu self.
- [ ] Verifikasi: `pnpm lint` + `pnpm build`.

---

## FASE 13 — Polish & verifikasi menyeluruh

- [ ] A11y: focus visible, kontras, `prefers-reduced-motion`.
- [ ] Motion neobrutalism konsisten (press amble, hover lift, stagger snap, shake invalid).
- [ ] Responsive desktop → mobile (sidebar drawer, tabel scroll).
- [ ] Empty/loading/error konsisten di semua halaman.
- [ ] Hapus placeholder/mock yang tersisa.
- [ ] Smoke test alur kritis: daftar → OTP → approve → penempatan → tagihan → bayar → kegiatan → voting → laporan.
- [ ] Verifikasi final: `pnpm lint` + `pnpm build`.

---

## Blockers / keputusan terbuka

1. **Role detail** butuh endpoint daftar permission/menu — belum ada di `api.md`.
2. **Users CRUD** tidak ada di `api.md`; halaman Users hanya read-only + assign role.
3. **Profil self-service** belum punya endpoint update/full profile.
4. **Tagihan self** belum jelas filternya (`GET /invoices` tanpa `userId`).
5. **Pagination/sorting** belum ada kontrak query di `api.md`; gunakan client-side sementara.
6. **Dashboard** tidak punya endpoint khusus; harus disusun dari modul lain dan role-aware.

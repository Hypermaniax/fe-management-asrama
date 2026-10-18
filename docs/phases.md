# Rencana Fase (Detail) — Front-End Asrama Mahasiswa Kepri

Legenda: `[ ]` belum · `[x]` selesai. Dokumen ini **detail dan kecil-kecil** supaya tiap langkah mudah dikerjakan & diverifikasi. Diturunkan dari [`plan.md`](./plan.md) → [`ui.md`](./ui.md) (ubah plan dulu bila ada perubahan).

Konteks: FE konsumen API BE; zona **public / auth / protected**; gaya **neobrutalism**; state **TanStack Query + Zustand**.

> Fase FE diselaraskan dengan fase BE. Endpoint yang belum ada di BE (⬜) → bangun UI dengan **mock**/placeholder, ganti saat endpoint siap.

---

## Pola modul FE (dipakai semua fase)

Setiap fitur ditulis berurutan dengan pola yang sama:

1. **API** — `features/<modul>/api.ts`: fungsi typed per endpoint (pakai `lib/api.ts`).
2. **Hooks** — `features/<modul>/hooks.ts`: `useQuery`/`useMutation` + query key + invalidasi.
3. **Schema** — `features/<modul>/schema.ts`: zod untuk form.
4. **Pages** — `features/<modul>/pages/`: `list`, `form` (dialog/sheet), `detail`.
5. **Components** — komponen khas modul (kolom tabel, field khusus).
6. **Route** — daftarkan di `app/router.tsx` (di bawah `AppLayout` + permission).
7. **Verifikasi** — `pnpm lint` + `pnpm build` (`tsc -b`).

Aturan umum: loading → skeleton; empty → `EmptyState`; aksi destruktif → `ConfirmDialog`; aksi tulis → toast; nomor/tanggal/uang pakai formatter.

---

## FASE 0 — Setup proyek

**Tujuan:** fondasi tooling & gaya.

- [x] Install deps: `tailwindcss` + `@tailwindcss/vite`, `lucide-react`, `react-router`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `motion`, `sonner`, `clsx`/`tailwind-merge`, `date-fns`.
- [x] Setup **Tailwind v4** + `globals.css`.
- [x] Init **neobrutalism** via shadcn CLI: `pnpm dlx shadcn@latest init https://neobrutalism.dev/r/styling/blue.json` lalu ganti token ke palet custom (plan.md §9.2).
- [x] Pasang **Space Grotesk**; set `font-weight-base=500`, `font-weight-heading=700`.
- [x] Alias `@/` di `vite.config.ts` + `tsconfig`.
- [x] `app/providers.tsx` (QueryClientProvider, Toaster, ErrorBoundary).
- [x] `lib/api.ts` (base URL, Authorization, normalisasi error), `lib/utils.ts` (cn, rupiah, tanggal).
- [x] Komponen shared dasar: `PageHeader`, `EmptyState`, `StatusBadge`, `Can`, `CurrencyText`, `DateText`, dan **skeleton sesuai layout** (`SkeletonTable`, `SkeletonCard`, `SkeletonForm`, `SkeletonDetail`).
- [x] **Motion**: definisikan token & varian di `lib/motion.ts` (durasi, `--ease-hard`, `--spring-snap`, press "ambles", hover lift, stagger snap, shake).
- [x] Verifikasi: `pnpm build` ✅.

> Inventaris komponen aplikasi: [`components.md`](./components.md).

---

## FASE 1 — API client + Auth

**Tujuan:** register → OTP → login → sesi.

- [x] `stores/auth.ts` (Zustand + persist token): `user`, `roles`, `permissions`, `menus`, `isSuperAdmin`, `setSession`, `clear`.
- [x] `features/auth/api.ts`: `signUp`, `signIn`, `requestOtp`, `verifyOtp`, `me`.
- [x] `features/auth/pages/register.tsx`, `verify-otp.tsx`, `login.tsx` + schema zod. _(ditaruh di `routes/auth/` mengikuti struktur yang ada)_
- [x] Simpan token; setelah verifikasi/login → panggil `/rbac/me` → isi `authStore`.
- [x] `AuthLayout` + redirect bila sudah login.
- [x] `lib/api.ts`: on `401` → `authStore.clear()` + redirect `/login`.
- [ ] Verifikasi: alur register → OTP → login (pakai Gmail SMTP/console BE) berjalan; `build` ✅.

---

## FASE 2 — Layout zones + shell + RBAC

**Tujuan:** kerangka public/auth/protected + navigasi berbasis RBAC.

- [x] `app/router.tsx`: layout routes **public**, **auth**, **protected**.
- [x] `AppLayout`: `Sidebar` (dari `menus`), `Topbar` (pemilih gedung, user menu), `Breadcrumb`, konten.
- [x] `stores/scope.ts` (`activeBuildingId`, `buildings`), `stores/ui.ts` (sidebar collapsed).
- [x] `lib/rbac.ts`: `can(permission)`, `filterMenu(items)`.
- [x] `components/shared/Can.tsx`.
- [x] Guard: `RequireAuth` (protected), redirect 403 bila tanpa permission; halaman **403** & **404**.
- [x] Mobile: sidebar → drawer.
- [ ] Verifikasi: dengan akun dev BE (`admin@gmail.com`/`gedung@gmail.com`/`warga@gmail.com`), sidebar beda sesuai role; `build` ✅.

---

## FASE 3 — Public

- [x] `routes/public/index.tsx` (hero, sorotan kegiatan, CTA).
- [x] `routes/public/pengenalan.tsx` (tentang, visi/misi, gedung, fasilitas, kontak).
- [x] `PublicLayout` + **motif pulau** neobrutalist (hero/footer).
- [x] Verifikasi: responsive; CTA mengarah ke `/login`,`/register`.

---

## FASE 4 — Dashboard

- [ ] `features/dashboard/`: query ringkasan (tunggakan, saldo kas, kegiatan terdekat, pemilihan aktif).
- [ ] Kartu stat + line chart kas + daftar belum bayar (data dari BE bila tersedia; jika belum → mock).
- [ ] Verifikasi: `build` ✅.

---

## FASE 5 — Data Master

- [ ] `Building` (`/buildings` sudah ada di BE) — list + form + scope.
- [ ] `Room`, `FeeRule`, `Facility`, `RoomFacility`, `PublicFacility`, `Category` — (mock sampai endpoint BE siap).
- [ ] `components/shared/DataTable` finalisasi (sorting, pagination, row aksi).
- [ ] Verifikasi: CRUD building real; yang lain jalan dgn mock; `build` ✅.

---

## FASE 6 — Penghuni

- [ ] `Applicants` (list + review setujui/tolak).
- [ ] `Residents` (list + detail `/app/residents/:id`).
- [ ] `Occupancies` (tempatkan/checkout, validasi kapasitas & gender).
- [ ] `Documents` (verifikasi/tolak, minta dokumen, pratinjau file).
- [ ] Verifikasi: state PENDING→ACTIVE terlihat; `build` ✅.

---

## FASE 7 — Keuangan

- [ ] `Invoices` (generate, void, rincian).
- [ ] `Payments` (catat + alokasi cicil/multi-bulan, idempotencyKey).
- [ ] `Expenses` (catat pengeluaran + bukti).
- [ ] `Cash` (ledger read-only + filter).
- [ ] `Reports` (tunggakan, saldo, pemasukan vs pengeluaran, realisasi; ekspor).
- [ ] Verifikasi: angka rupiah tabular; `build` ✅.

---

## FASE 8 — Organisasi

- [ ] `Periods` (CRUD + aktifkan, 1 aktif).
- [ ] `Positions` (scope asrama/gedung + role).
- [ ] `Assignments` (user + jabatan + periode + gedung).
- [ ] Verifikasi: akses pengurus mengikuti role jabatan; `build` ✅.

---

## FASE 9 — Kegiatan

- [ ] `Events` list + **buat cepat (ad-hoc)**.
- [ ] Detail `/app/events/:id` dengan tab Sesi/Panitia/Absensi/Anggaran/Lampiran.
- [ ] Absensi per sesi (self untuk PENGHUNI).
- [ ] Anggaran → `Expense` bertaut event; lampiran LPJ.
- [ ] Verifikasi: kegiatan publik tampil untuk PENGHUNI; `build` ✅.

---

## FASE 10 — Pemilihan

- [ ] `Elections` list + buat + buka/tutup + sahkan.
- [ ] `Candidates` (dari warga aktif + visi/misi).
- [ ] `Eligible` (role pemilih + pratinjau jumlah).
- [ ] `Results` (hanya `CLOSED`; saat `OPEN` → terkunci).
- [ ] `Me/elections/:id` — voting + abstain + konfirmasi; status "sudah memilih".
- [ ] Verifikasi: hasil 403 saat `OPEN`, tampil saat `CLOSED`; `build` ✅.

---

## FASE 11 — Sistem

- [ ] `Users` (CRUD + assign role + scope gedung).
- [ ] `Roles` (list + detail `/app/system/roles/:id`: set permission & menu).
- [ ] `Permissions` (tabel resource × action).
- [ ] `Menus` (tree editor).
- [ ] `Audit` (list + detail before/after).
- [ ] Verifikasi: hanya SUPER_ADMIN; `build` ✅.

---

## FASE 12 — Akun Saya

- [ ] `Profile`, `Invoices`, `Documents`, `Attendance`, `Elections` (self).
- [ ] Redirect agar CALON hanya lihat profil+dokumen; PENGHUNI lihat 5 menu.
- [ ] Verifikasi: `build` ✅.

---

## FASE 13 — Polish & verifikasi menyeluruh

- [ ] A11y: focus visible, kontras (hitam di atas palet), `prefers-reduced-motion`.
- [ ] **Animasi**: pastikan seragam & hard/snappy (press amble, hover lift, stagger snap, shake invalid), tanpa fade-up bertebaran.
- [ ] Responsive desktop → mobile (sidebar drawer, tabel scroll).
- [ ] Empty/loading/error konsisten di semua halaman.
- [ ] Ganti semua **mock** dengan endpoint BE yang sudah tersedia.
- [ ] Smoke test alur kritis: daftar → OTP → approve → penempatan → tagihan → bayar → kegiatan → voting → laporan.
- [ ] Verifikasi final: `pnpm lint` + `pnpm build` ✅.

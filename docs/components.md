# Komponen — Asrama Mahasiswa Kepri (FE)

Inventaris komponen FE. Diturunkan dari [`plan.md`](./plan.md) §9; spec halaman ada di [`ui.md`](./ui.md).

Dua lapis:

1. **Primitif UI** — dari registry **neobrutalism** (di `components/ui/`), lihat [`plan.md §9.5`](./plan.md).
2. **Komponen aplikasi** — abstraksi khas domain (di `components/shared/` + `features/<modul>/components/`), didaftar di bawah.

Aturan umum: semua komponen tunduk pada prinsip "bold di cangkang, tenang di data" dan sistem warna status (`plan.md §9.3`), serta animasi brutalism (`plan.md §9.7`).

---

## 1. Boundary & state

| Komponen              | Fungsi                                                              | Catatan                                                        |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| `QueryBoundary`       | Bungkus query: tampilkan skeleton → error → empty → konten          | props: `isLoading`, `error`, `isEmpty`, `skeleton`, `fallback` |
| `AsyncBoundary`       | Versi untuk mutasi async                                            | `pending`, `error`, `children`                                 |
| `ErrorState`          | Tampilan error + tombol "Coba lagi"                                 | pesan dari API                                                 |
| `LoadingButton`       | Tombol dengan spinner inline                                        | `loading`, `disabled` saat submit                              |
| `PermissionGate`      | Gate yang redirect bila tanpa izin (vs `<Can>` yang menyembunyikan) | `permission`, `to="/app/dashboard"`                            |
| `ConfirmDialog`       | Konfirmasi aksi destruktif (basis `AlertDialog`)                    | `title`, `description`, `onConfirm`                            |
| `UnsavedChangesGuard` | Cegah navigasi saat form kotor                                      | pakai `useBlocker`                                             |
| `Can`                 | Sembunyikan aksi tanpa izin                                         | `permission="invoice.create"`                                  |

## 2. Tabel & data

| Komponen           | Fungsi                                            |
| ------------------ | ------------------------------------------------- |
| `DataTable`        | Tabel utama: kolom, sorting, pagination, row aksi |
| `DataTableToolbar` | Pencarian + filter + toggle visibilitas kolom     |
| `RowActions`       | Dropdown aksi per baris (lihat/ubah/hapus)        |
| `BulkActionsBar`   | Aksi massal (mis. verifikasi banyak dokumen)      |
| `PaginationBar`    | Info jumlah + navigasi halaman                    |
| `ColumnHeader`     | Header dengan indikator sort                      |
| `ResponsiveTable`  | Beralih ke `MobileCardList` di layar kecil        |
| `MobileCardList`   | Daftar kartu pengganti tabel di mobile            |

## 3. Keuangan

| Komponen                  | Fungsi                                                    |
| ------------------------- | --------------------------------------------------------- |
| `CurrencyInput`           | Input rupiah berformat otomatis (integer)                 |
| `CurrencyText`            | Tampil rupiah (`tabular-nums`)                            |
| `AmountCell`              | Sel angka dengan warna masuk/keluar                       |
| `PaymentAllocationEditor` | Alokasi 1 pembayaran → banyak tagihan (cicil/multi-bulan) |
| `LedgerTable`             | Buku kas + kolom saldo berjalan                           |
| `BalanceCard`             | Kartu saldo kas                                           |
| `ArrearsList`             | Daftar tunggakan                                          |
| `BudgetProgress`          | Anggaran vs realisasi kegiatan                            |
| `InvoiceStatusBadge`      | `StatusBadge` khusus status tagihan                       |

## 4. Penghuni & dokumen

| Komponen              | Fungsi                                  |
| --------------------- | --------------------------------------- |
| `ResidentPicker`      | Combobox cari/pilih penghuni            |
| `ResidentAvatar`      | Avatar inisial + warna gedung           |
| `GenderBadge`         | Badge MALE/FEMALE                       |
| `OccupancyCard`       | Kartu penempatan kamar                  |
| `FilePreview`         | Pratinjau PDF/gambar (`GET /files/:id`) |
| `FileDropzone`        | Unggah + validasi MIME/ukuran           |
| `DocumentReviewPanel` | Panel verifikasi/tolak dokumen          |
| `DocumentStatusBadge` | `StatusBadge` khusus dokumen            |

## 5. Kegiatan & pemilihan

| Komponen             | Fungsi                                           |
| -------------------- | ------------------------------------------------ |
| `EventCard`          | Kartu kegiatan (kategori, scope, status, ad-hoc) |
| `SessionTimeline`    | Daftar sesi/agenda kegiatan                      |
| `AttendanceGrid`     | Kisi absensi user × sesi (HADIR/IZIN/TIDAK)      |
| `CommitteeList`      | Daftar panitia + peran                           |
| `CandidateCard`      | Kartu kandidat (nomor urut, visi/misi)           |
| `VoteConfirmDialog`  | Konfirmasi sebelum kirim suara (final)           |
| `ElectionCountdown`  | Hitung mundur buka/tutup                         |
| `ResultBarChart`     | Bar hasil per kandidat (warna palet)             |
| `EligibilityPreview` | Pratinjau jumlah pemilih eligible                |

## 6. Organisasi & RBAC

| Komponen                 | Fungsi                                   |
| ------------------------ | ---------------------------------------- |
| `OrgChart`               | Struktur jabatan (periode + gedung)      |
| `PeriodSwitcher`         | Pilih periode kepengurusan               |
| `PositionAssignmentCard` | Kartu penugasan jabatan                  |
| `PermissionMatrix`       | Kisi resource × action                   |
| `MenuTreeEditor`         | Editor pohon menu (parent, urutan, ikon) |
| `AuditDiffViewer`        | Perbandingan before/after audit log      |
| `RoleBadge`              | Badge role                               |
| `BuildingPicker`         | Pemilih gedung aktif (scope)             |

## 7. Form lanjutan

| Komponen          | Fungsi                                      |
| ----------------- | ------------------------------------------- |
| `FormDialog`      | Dialog standar form create/edit             |
| `FormSheet`       | Sheet/drawer form samping (mobile-friendly) |
| `FormField`       | Pembungkus label + deskripsi + pesan error  |
| `FormSection`     | Pengelompokan field + judul                 |
| `PasswordInput`   | Input sandi + show/hide                     |
| `PhoneInput`      | Input telepon (format ID)                   |
| `NikInput`        | Input NIK 16 digit                          |
| `DateRangePicker` | Rentang tanggal (laporan/filter)            |
| `MultiSelect`     | Pilih banyak (mis. role eligible)           |
| `AsyncCombobox`   | Combobox dengan pencarian server-side       |
| `SubmitButton`    | Tombol submit + status `isSubmitting`       |

## 8. Layout & util

| Komponen           | Fungsi                               |
| ------------------ | ------------------------------------ |
| `AppSidebar`       | Sidebar dari `menus` (RBAC)          |
| `Topbar`           | Bar atas (pemilih gedung, user menu) |
| `UserMenu`         | Menu pengguna (profil, keluar)       |
| `Breadcrumbs`      | Jejak navigasi                       |
| `PageHeader`       | Judul + deskripsi + slot aksi        |
| `SectionCard`      | Kartu seksi (border hitam + shadow)  |
| `CopyButton`       | Salin ke clipboard                   |
| `DateText`         | Tampil tanggal `Asia/Jakarta`        |
| `RelativeTime`     | "3 hari lalu"                        |
| `SkeletonTable`    | Skeleton tabel (sejajar kolom)       |
| `SkeletonCard`     | Skeleton grid kartu                  |
| `SkeletonForm`     | Skeleton label + field               |
| `SkeletonDetail`   | Skeleton header + paragraf           |
| `EmptyState`       | Ilustrasi pulau + ajakan aksi        |
| `StatusBadge`      | Peta status → warna (`plan.md §9.3`) |

---

## Catatan: animasi (ringkas)

Semua komponen di atas mengikuti sistem animasi brutalism di [`plan.md §9.7`](./plan.md): press "ambles", hover lift, _snap_ (bukan fade lembut), skeleton blink `steps()`, dan hormati `prefers-reduced-motion`.

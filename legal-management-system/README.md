# Legal Management System — Perumda Air Minum Tirta Hita Buleleng

Sistem internal perusahaan (enterprise BUMD) dengan dua modul utama:

1. **Document Management System** — khusus Divisi Hukum: pengelolaan dokumen hukum rahasia (upload, versi, histori, status, pengingat).
2. **Legal Consultation System** — untuk seluruh pegawai: pengajuan konsultasi hukum, penjadwalan, diskusi, dan riwayat.

Seluruh antarmuka menggunakan **Bahasa Indonesia**.

---

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + komponen ala shadcn/ui (Radix primitives) |
| Chart | Recharts |
| Icon | Lucide |
| Toast | Sonner |
| Tanggal | date-fns (locale `id`) |

## Menjalankan Proyek

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build production
npm start        # serve hasil build
```

## Akun Demo

| Role | Email / ID Pegawai | Password |
| --- | --- | --- |
| Admin Divisi Hukum | `hukum@tirtahita.co.id` atau `LH-001` | `admin123` |
| Staff Bagian Keuangan | `kartika.keuangan@gmail.com` | `staff123` |

Registrasi staff terbuka di `/register` (wajib email Gmail).

---

## Struktur Folder

```
app/
  (auth)/            # Halaman publik: login, register
  (app)/             # Area terproteksi (guard sesi di layout)
    dashboard/       # Dashboard per role
    documents/       # Modul DMS (list, upload, detail) — LEGAL_ADMIN saja
    consultations/   # Modul konsultasi (list, new, detail)
    calendar/        # Kalender konsultasi
    notifications/   # Pusat notifikasi
    reports/         # Dashboard analitik (chart)
    settings/        # Pengaturan
  api/               # Mock REST API (route handlers)
components/
  ui/                # Primitif UI (button, table, dialog, ...)
  layout/            # Sidebar role-aware, header, page header
  shared/            # StatCard, badge status, FilePicker, RoleGate, ...
  documents/         # Komponen khusus modul dokumen
  consultations/     # Stepper, thread diskusi, timeline, dialog jadwal
  dashboard/         # Dashboard admin/staff, mini kalender
  reports/           # ChartCard
lib/
  types.ts           # Kontrak tipe domain (selaras skema DB backend)
  constants.ts       # Label status, kategori, departemen, dsb.
  dummy-data.ts      # Data dummy realistis (ganti dengan backend)
  api-client.ts      # Gerbang tunggal fetch -> REST API
  api-store.ts       # Store in-memory untuk mock API
  auth-context.tsx   # Sesi pengguna (siap diganti JWT/OAuth)
  use-api.ts         # Hook pengambilan data
  utils.ts           # cn, format tanggal Indonesia, dll.
```

## Integrasi Backend

Frontend **sudah terpisah penuh dari data**:

- Semua halaman mengambil data lewat `lib/api-client.ts` (`api.getDocuments()`, `api.createConsultation()`, dst.).
- Secara default permintaan ditangani **mock API** di `app/api/**` (route handlers Next.js, store in-memory, data awal dari `lib/dummy-data.ts`).
- Ketika backend asli siap, cukup set environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.perusahaan.co.id
```

Seluruh panggilan otomatis diarahkan ke REST backend tanpa mengubah kode halaman.

### Kontrak REST yang disiapkan

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| POST | `/api/login` | Autentikasi (email / ID pegawai) |
| POST | `/api/register` | Registrasi staff (wajib Gmail) |
| GET/POST | `/api/documents` | Daftar / buat dokumen |
| GET/PUT/DELETE | `/api/documents/{id}` | Detail / ubah / hapus dokumen |
| GET/POST | `/api/consultations` | Daftar (ops. `?userId=`) / buat konsultasi |
| GET/PUT | `/api/consultations/{id}` | Detail / ubah status & jadwal |
| GET/POST | `/api/consultations/{id}/discussion` | Baca / kirim pesan diskusi |
| GET | `/api/notifications` | Daftar notifikasi (ops. `?userId=`) |
| PUT | `/api/notifications/{id}/read` | Tandai dibaca |
| PUT | `/api/notifications/read-all` | Tandai semua dibaca |
| GET | `/api/stats` | Agregat dashboard |
| GET | `/api/reports` | Agregat laporan analitik |

Semua respons dibungkus `{ "data": ... }`; error berbentuk `{ "message": "..." }`.

## Model Data

Sesuai spesifikasi backend (lihat `lib/types.ts`):

- **User** — `id, name, email, password, role (LEGAL_ADMIN | STAFF), department, created_at`
- **Document** — `id, name, category, pic, department, effective_date, expiry_date, review_date, status, file_url, version` (+ `history[]` untuk timeline versi)
- **Consultation** — `id, user_id, title, description, attachment, status, assigned_legal, schedule, created_at` (+ `timeline[]`)
- **Discussion** — `id, consultation_id, user_id, message, attachment, created_at`
- **Notification** — `id, user_id, type, message, priority, is_read, created_at`

## Alur Status Konsultasi

`Menunggu Review → Diterima → Dijadwalkan → Sedang Konsultasi → Selesai` (dapat `Ditutup`).

## Role & Keamanan

- **LEGAL_ADMIN** — akses penuh modul dokumen, konsultasi, kalender, laporan, pengaturan.
- **STAFF** — hanya pengajuan/konsultasi miliknya; modul `/documents/**` diblokir oleh `RoleGate` dan sisi API harus diberlakukan sama di backend.
- Sesi disimpan di `localStorage` melalui `AuthProvider` — saat produksi, ganti dengan cookie `httpOnly` + verifikasi token di middleware.

## Deployment

Siap di-deploy ke Vercel / Node server:

```bash
npm run build && npm start
```

Environment variable yang didukung: `NEXT_PUBLIC_API_BASE_URL` (opsional, untuk backend eksternal).

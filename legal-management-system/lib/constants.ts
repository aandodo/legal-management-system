import type {
  BadgeVariant,
} from "@/components/ui/badge";
import type {
  ConsultationStatus,
  DocumentStatus,
  NotificationType,
  Priority,
  Role,
} from "@/lib/types";

export const APP_NAME = "Legal Management System";
export const COMPANY_NAME = "Perumda Air Minum Tirta Hita Buleleng";

export const DEPARTMENTS = [
  "Divisi Hukum",
  "Bagian Keuangan",
  "Bagian Teknik",
  "Bagian SDM",
  "Bagian Umum",
  "Bagian Perencanaan",
  "Bagian Pemasaran",
  "Bagian Operasional",
] as const;

export const DOCUMENT_CATEGORIES = [
  "Perjanjian Kerja Sama",
  "Kontrak Vendor",
  "Surat Keputusan",
  "Perjanjian Kerja",
  "Perjanjian Sewa",
  "Legal Opinion",
  "Perizinan",
  "MoU",
] as const;

export const ACCEPTED_FILE_TYPES = ".pdf,.docx,.xlsx";

export const ROLE_LABEL: Record<Role, string> = {
  LEGAL_ADMIN: "Admin Divisi Hukum",
  STAFF: "Staff / Pegawai",
};

// ------------------------------------------------------------
// Documents
// ------------------------------------------------------------

export const DOCUMENT_STATUS: Record<
  DocumentStatus,
  { label: string; variant: BadgeVariant }
> = {
  ACTIVE: { label: "Aktif", variant: "success" },
  EXPIRING_SOON: { label: "Segera Expired", variant: "warning" },
  NEED_REVIEW: { label: "Perlu Review", variant: "info" },
  EXPIRED: { label: "Expired", variant: "destructive" },
  DRAFT: { label: "Draf", variant: "secondary" },
};

// ------------------------------------------------------------
// Consultations
// ------------------------------------------------------------

export const CONSULTATION_STATUS: Record<
  ConsultationStatus,
  { label: string; variant: BadgeVariant }
> = {
  MENUNGGU_REVIEW: { label: "Menunggu Review", variant: "secondary" },
  DITERIMA: { label: "Diterima", variant: "info" },
  DIJADWALKAN: { label: "Dijadwalkan", variant: "violet" },
  SEDANG_KONSULTASI: { label: "Sedang Konsultasi", variant: "default" },
  SELESAI: { label: "Selesai", variant: "success" },
  DITUTUP: { label: "Ditutup", variant: "outline" },
};

export const CONSULTATION_STEPS: { key: ConsultationStatus; label: string }[] = [
  { key: "MENUNGGU_REVIEW", label: "Menunggu Review" },
  { key: "DITERIMA", label: "Diterima" },
  { key: "DIJADWALKAN", label: "Dijadwalkan" },
  { key: "SEDANG_KONSULTASI", label: "Sedang Konsultasi" },
  { key: "SELESAI", label: "Selesai" },
];

// ------------------------------------------------------------
// Notifications
// ------------------------------------------------------------

export const NOTIFICATION_TYPE: Record<
  NotificationType,
  { label: string }
> = {
  EXPIRED_DOCUMENT: { label: "Dokumen Expired" },
  UPCOMING_EXPIRATION: { label: "Akan Expired" },
  REVIEW_REQUIRED: { label: "Perlu Review" },
  DOCUMENT_UPDATED: { label: "Dokumen Diperbarui" },
  NEW_CONSULTATION: { label: "Konsultasi Baru" },
  CONSULTATION_SCHEDULE: { label: "Jadwal Konsultasi" },
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  TINGGI: "Tinggi",
  SEDANG: "Sedang",
  RENDAH: "Rendah",
};

export const CHART_COLORS = [
  "#2563eb",
  "#0ea5e9",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
];

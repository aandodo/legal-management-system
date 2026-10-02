// ============================================================
// Tipe data domain — Legal Management System
// Selaras dengan model database yang akan dipakai backend.
// ============================================================

export type Role = "LEGAL_ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  department: string;
  employee_id: string;
  position: string;
  created_at: string;
}

export type SafeUser = Omit<User, "password">;

// ------------------------------------------------------------
// Documents
// ------------------------------------------------------------

export type DocumentStatus =
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "NEED_REVIEW"
  | "EXPIRED"
  | "DRAFT";

export type FileType = "PDF" | "DOCX" | "XLSX";

export interface Attachment {
  name: string;
  type: FileType;
  size: string;
}

export interface DocumentVersionEntry {
  version: string;
  note: string;
  date: string;
  author: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  category: string;
  description: string;
  pic: string;
  department: string;
  effective_date: string;
  expiry_date: string | null;
  review_date: string | null;
  status: DocumentStatus;
  file_url: string;
  file_type: FileType;
  file_size: string;
  version: string;
  created_at: string;
  updated_at: string;
  history: DocumentVersionEntry[];
}

// ------------------------------------------------------------
// Consultations
// ------------------------------------------------------------

export type ConsultationStatus =
  | "MENUNGGU_REVIEW"
  | "DITERIMA"
  | "DIJADWALKAN"
  | "SEDANG_KONSULTASI"
  | "SELESAI"
  | "DITUTUP";

export interface ConsultationSchedule {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
}

export interface ConsultationTimelineEntry {
  status: ConsultationStatus;
  note: string;
  date: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  requester_name: string;
  department: string;
  email: string;
  title: string;
  description: string;
  attachment: Attachment | null;
  status: ConsultationStatus;
  assigned_legal: string | null;
  schedule: ConsultationSchedule | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  timeline: ConsultationTimelineEntry[];
}

// ------------------------------------------------------------
// Discussion
// ------------------------------------------------------------

export interface DiscussionMessage {
  id: string;
  consultation_id: string;
  user_id: string;
  author_name: string;
  author_role: Role;
  message: string;
  attachment: Attachment | null;
  created_at: string;
}

// ------------------------------------------------------------
// Notifications
// ------------------------------------------------------------

export type NotificationType =
  | "EXPIRED_DOCUMENT"
  | "UPCOMING_EXPIRATION"
  | "REVIEW_REQUIRED"
  | "DOCUMENT_UPDATED"
  | "NEW_CONSULTATION"
  | "CONSULTATION_SCHEDULE";

export type Priority = "TINGGI" | "SEDANG" | "RENDAH";

export interface AppNotification {
  id: string;
  user_id: string; // id user atau "ALL"
  type: NotificationType;
  title: string;
  message: string;
  priority: Priority;
  is_read: boolean;
  created_at: string;
  link?: string;
}

// ------------------------------------------------------------
// API responses
// ------------------------------------------------------------

export interface LoginResponse {
  token: string;
  user: SafeUser;
}

export interface DashboardStats {
  documents: {
    total: number;
    active: number;
    expiringSoon: number;
    needReview: number;
    expired: number;
  };
  consultations: {
    baru: number;
    menungguRespon: number;
    berjalan: number;
    selesai: number;
  };
}

export interface ReportData {
  documentStatus: { name: string; value: number; key: DocumentStatus }[];
  expiredTrend: { month: string; expired: number; expiring: number }[];
  reviewCompletion: number;
  documentOwnership: { department: string; total: number }[];
  monthlyConsultations: { month: string; total: number; selesai: number }[];
  departmentConsultations: { department: string; total: number }[];
  completionStatus: { name: string; value: number; key: ConsultationStatus }[];
  averageCompletionDays: number;
}

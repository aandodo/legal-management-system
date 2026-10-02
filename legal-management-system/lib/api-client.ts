// ============================================================
// API CLIENT
// Satu-satunya gerbang komunikasi frontend -> backend.
// Saat backend REST siap, cukup set NEXT_PUBLIC_API_BASE_URL
// tanpa mengubah kode halaman.
// ============================================================

import type {
  AppNotification,
  Consultation,
  ConsultationTimelineEntry,
  DashboardStats,
  DiscussionMessage,
  DocumentVersionEntry,
  LegalDocument,
  LoginResponse,
  ReportData,
  SafeUser,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (body as { message?: string }).message ??
        `Permintaan gagal (${res.status})`
    );
  }

  return body as T;
}

interface ApiEnvelope<T> {
  data: T;
}

/** Backend membungkus payload dalam { data } — unwrap di sini. */
async function unwrap<T>(promise: Promise<ApiEnvelope<T>>): Promise<T> {
  const res = await promise;
  return res.data;
}

// ------------------------------------------------------------
// Authentication
// ------------------------------------------------------------

export interface LoginPayload {
  identifier: string; // email atau employee id
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  department: string;
}

// ------------------------------------------------------------
// Documents
// ------------------------------------------------------------

export type DocumentPayload = Partial<
  Omit<LegalDocument, "id" | "history">
> & {
  history?: DocumentVersionEntry[];
};

// ------------------------------------------------------------
// Consultations
// ------------------------------------------------------------

export type ConsultationPayload = Partial<
  Omit<Consultation, "id" | "timeline">
> & {
  timeline?: ConsultationTimelineEntry[];
};

export interface DiscussionPayload {
  user_id: string;
  author_name: string;
  author_role: "LEGAL_ADMIN" | "STAFF";
  message: string;
  attachment?: DiscussionMessage["attachment"];
}

// ------------------------------------------------------------
// API surface
// ------------------------------------------------------------

export const api = {
  // Auth
  login: (payload: LoginPayload) =>
    unwrap<LoginResponse>(
      request<ApiEnvelope<LoginResponse>>("/api/login", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ),
  register: (payload: RegisterPayload) =>
    unwrap<SafeUser>(
      request<ApiEnvelope<SafeUser>>("/api/register", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ),

  // Documents
  getDocuments: () =>
    unwrap<LegalDocument[]>(
      request<ApiEnvelope<LegalDocument[]>>("/api/documents")
    ),
  getDocument: (id: string) =>
    unwrap<LegalDocument>(
      request<ApiEnvelope<LegalDocument>>(`/api/documents/${id}`)
    ),
  createDocument: (payload: DocumentPayload) =>
    unwrap<LegalDocument>(
      request<ApiEnvelope<LegalDocument>>("/api/documents", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ),
  updateDocument: (id: string, payload: DocumentPayload) =>
    unwrap<LegalDocument>(
      request<ApiEnvelope<LegalDocument>>(`/api/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
    ),
  deleteDocument: (id: string) =>
    request<{ success: boolean }>(`/api/documents/${id}`, {
      method: "DELETE",
    }),

  // Consultations
  getConsultations: (params?: { userId?: string }) => {
    const qs = params?.userId ? `?userId=${params.userId}` : "";
    return unwrap<Consultation[]>(
      request<ApiEnvelope<Consultation[]>>(`/api/consultations${qs}`)
    );
  },
  getConsultation: (id: string) =>
    unwrap<Consultation>(
      request<ApiEnvelope<Consultation>>(`/api/consultations/${id}`)
    ),
  createConsultation: (payload: ConsultationPayload) =>
    unwrap<Consultation>(
      request<ApiEnvelope<Consultation>>("/api/consultations", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    ),
  updateConsultation: (id: string, payload: ConsultationPayload) =>
    unwrap<Consultation>(
      request<ApiEnvelope<Consultation>>(`/api/consultations/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
    ),

  // Discussion
  getDiscussion: (consultationId: string) =>
    unwrap<DiscussionMessage[]>(
      request<ApiEnvelope<DiscussionMessage[]>>(
        `/api/consultations/${consultationId}/discussion`
      )
    ),
  sendDiscussion: (consultationId: string, payload: DiscussionPayload) =>
    unwrap<DiscussionMessage>(
      request<ApiEnvelope<DiscussionMessage>>(
        `/api/consultations/${consultationId}/discussion`,
        { method: "POST", body: JSON.stringify(payload) }
      )
    ),

  // Notifications
  getNotifications: (params?: { userId?: string }) => {
    const qs = params?.userId ? `?userId=${params.userId}` : "";
    return unwrap<AppNotification[]>(
      request<ApiEnvelope<AppNotification[]>>(`/api/notifications${qs}`)
    );
  },
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: "PUT",
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>(`/api/notifications/read-all`, {
      method: "PUT",
    }),

  // Dashboard & reports
  getStats: () =>
    unwrap<DashboardStats>(request<ApiEnvelope<DashboardStats>>("/api/stats")),
  getReports: () =>
    unwrap<ReportData>(request<ApiEnvelope<ReportData>>("/api/reports")),
};

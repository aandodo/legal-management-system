// ============================================================
// MOCK API STORE
// Database in-memory untuk pengembangan frontend.
// Ketika backend asli tersedia, hapus folder ini bersama
// app/api dan arahkan NEXT_PUBLIC_API_BASE_URL ke backend.
// Kontrak respons sudah mengikuti skema REST yang direncanakan.
// ============================================================

import {
  mockConsultations,
  mockDiscussions,
  mockDocuments,
  mockNotifications,
  mockUsers,
} from "@/lib/dummy-data";
import type {
  AppNotification,
  Consultation,
  DiscussionMessage,
  LegalDocument,
  SafeUser,
  User,
} from "@/lib/types";

// State in-memory disimpan di globalThis agar seluruh instance modul
// (bundle per-route) berbagi data yang sama selama proses server hidup.
type Store = {
  users: User[];
  documents: LegalDocument[];
  consultations: Consultation[];
  discussions: DiscussionMessage[];
  notifications: AppNotification[];
};

const globalForStore = globalThis as unknown as { __lmsMockStore?: Store };

export const db: Store =
  globalForStore.__lmsMockStore ?? {
    users: [...mockUsers],
    documents: [...mockDocuments],
    consultations: [...mockConsultations],
    discussions: [...mockDiscussions],
    notifications: [...mockNotifications],
  };

globalForStore.__lmsMockStore = db;

export const toSafeUser = (user: User): SafeUser => {
  const { password: _password, ...safe } = user;
  return safe;
};

export function nextId(prefix: string, list: { id: string }[]): string {
  const max = list.reduce((acc, item) => {
    const n = Number.parseInt(item.id.split("-").pop() ?? "0", 10);
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function jsonOk<T>(data: T, status = 200) {
  return Response.json({ data }, { status });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

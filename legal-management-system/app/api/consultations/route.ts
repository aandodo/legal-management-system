import { db, jsonError, jsonOk, nextId } from "@/lib/api-store";
import type { Consultation } from "@/lib/types";

/**
 * GET  /api/consultations           — seluruh konsultasi (admin)
 * GET  /api/consultations?userId=   — konsultasi milik user tertentu (staff)
 * POST /api/consultations           — pengajuan baru
 */

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  const rows = userId
    ? db.consultations.filter((c) => c.user_id === userId)
    : db.consultations;
  return jsonOk(rows);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<Consultation> | null;

  if (!body?.title || !body?.description || !body?.user_id) {
    return jsonError("Judul, deskripsi, dan pemohon wajib diisi", 422);
  }

  const now = new Date().toISOString();
  const consultation: Consultation = {
    id: nextId("KNS", db.consultations).replace("KNS-", `KNS-${new Date().getFullYear()}-`),
    user_id: body.user_id,
    requester_name: body.requester_name ?? "Pegawai",
    department: body.department ?? "-",
    email: body.email ?? "-",
    title: body.title,
    description: body.description,
    attachment: body.attachment ?? null,
    status: "MENUNGGU_REVIEW",
    assigned_legal: null,
    schedule: null,
    created_at: now,
    updated_at: now,
    completed_at: null,
    timeline: [
      {
        status: "MENUNGGU_REVIEW",
        note: "Pengajuan konsultasi dibuat",
        date: now.slice(0, 10),
      },
    ],
  };

  db.consultations.unshift(consultation);

  // Notifikasi untuk Divisi Hukum
  db.notifications.unshift({
    id: `NTF-${Date.now()}`,
    user_id: "ALL",
    type: "NEW_CONSULTATION",
    title: "Konsultasi baru",
    message: `${consultation.requester_name} (${consultation.department}) mengajukan konsultasi "${consultation.title}".`,
    priority: "SEDANG",
    is_read: false,
    created_at: now,
    link: `/consultations/${consultation.id}`,
  });

  return jsonOk(consultation, 201);
}

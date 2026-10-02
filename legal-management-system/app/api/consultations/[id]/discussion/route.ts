import { db, jsonError, jsonOk } from "@/lib/api-store";
import type { DiscussionMessage } from "@/lib/types";

/**
 * GET  /api/consultations/:id/discussion
 * POST /api/consultations/:id/discussion
 */

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const rows = db.discussions
    .filter((m) => m.consultation_id === params.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return jsonOk(rows);
}

export async function POST(request: Request, { params }: Params) {
  const cons = db.consultations.find((c) => c.id === params.id);
  if (!cons) return jsonError("Konsultasi tidak ditemukan", 404);

  const body = (await request.json().catch(() => null)) as Partial<DiscussionMessage> | null;
  if (!body?.message?.trim()) {
    return jsonError("Pesan tidak boleh kosong", 422);
  }

  const message: DiscussionMessage = {
    id: `DIS-${Date.now()}`,
    consultation_id: params.id,
    user_id: body.user_id ?? "",
    author_name: body.author_name ?? "Pengguna",
    author_role: body.author_role ?? "STAFF",
    message: body.message.trim(),
    attachment: body.attachment ?? null,
    created_at: new Date().toISOString(),
  };

  db.discussions.push(message);
  return jsonOk(message, 201);
}

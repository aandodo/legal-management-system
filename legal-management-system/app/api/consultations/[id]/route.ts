import { db, jsonError, jsonOk } from "@/lib/api-store";
import type { Consultation, ConsultationStatus } from "@/lib/types";

/**
 * GET /api/consultations/:id
 * PUT /api/consultations/:id
 */

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const cons = db.consultations.find((c) => c.id === params.id);
  if (!cons) return jsonError("Konsultasi tidak ditemukan", 404);
  return jsonOk(cons);
}

export async function PUT(request: Request, { params }: Params) {
  const cons = db.consultations.find((c) => c.id === params.id);
  if (!cons) return jsonError("Konsultasi tidak ditemukan", 404);

  const body = (await request.json().catch(() => null)) as Partial<Consultation> | null;
  if (!body) return jsonError("Data tidak valid", 422);

  // Timeline: bila pemanggil mengirim timeline baru, pakai itu;
  // bila status berubah tanpa timeline, catat otomatis.
  if (body.timeline) {
    cons.timeline = body.timeline;
  } else if (body.status && body.status !== cons.status) {
    cons.timeline = [
      {
        status: body.status as ConsultationStatus,
        note: `Status diubah menjadi ${body.status}`,
        date: new Date().toISOString().slice(0, 10),
      },
      ...cons.timeline,
    ];
  }

  if (body.status === "SELESAI") {
    cons.completed_at = new Date().toISOString().slice(0, 10);
  }

  Object.assign(cons, body, { updated_at: new Date().toISOString() });
  return jsonOk(cons);
}

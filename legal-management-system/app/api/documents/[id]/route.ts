import { db, jsonError, jsonOk } from "@/lib/api-store";
import type { LegalDocument } from "@/lib/types";

/**
 * GET    /api/documents/:id
 * PUT    /api/documents/:id
 * DELETE /api/documents/:id
 */

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const doc = db.documents.find((d) => d.id === params.id);
  if (!doc) return jsonError("Dokumen tidak ditemukan", 404);
  return jsonOk(doc);
}

export async function PUT(request: Request, { params }: Params) {
  const doc = db.documents.find((d) => d.id === params.id);
  if (!doc) return jsonError("Dokumen tidak ditemukan", 404);

  const body = (await request.json().catch(() => null)) as Partial<LegalDocument> | null;
  if (!body) return jsonError("Data tidak valid", 422);

  // Naikkan versi bila ada perubahan substansi (file/status/metadata utama)
  const substantive =
    body.file_url !== undefined ||
    (body.status !== undefined && body.status !== doc.status) ||
    (body.name !== undefined && body.name !== doc.name) ||
    (body.history?.length ?? 0) > doc.history.length;

  if (substantive && !body.history) {
    const [major, minor] = doc.version.split(".").map(Number);
    Object.assign(doc, {
      version: `${major}.${minor + 1}`,
      history: [
        {
          version: `${major}.${minor + 1}`,
          note: "Dokumen diperbarui",
          date: new Date().toISOString().slice(0, 10),
          author: "Divisi Hukum",
        },
        ...doc.history,
      ],
    });
  }

  Object.assign(doc, body, { updated_at: new Date().toISOString() });
  return jsonOk(doc);
}

export async function DELETE(_request: Request, { params }: Params) {
  const index = db.documents.findIndex((d) => d.id === params.id);
  if (index === -1) return jsonError("Dokumen tidak ditemukan", 404);

  db.documents.splice(index, 1);
  return jsonOk({ success: true });
}

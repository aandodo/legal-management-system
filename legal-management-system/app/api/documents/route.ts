import { db, jsonError, jsonOk, nextId } from "@/lib/api-store";
import type { LegalDocument } from "@/lib/types";

/**
 * GET  /api/documents  — daftar seluruh dokumen (khusus Divisi Hukum)
 * POST /api/documents  — dokumen baru
 */

export async function GET() {
  return jsonOk(db.documents);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<LegalDocument> | null;

  if (!body?.name || !body?.category || !body?.department || !body?.pic) {
    return jsonError("Nama, kategori, departemen, dan PIC wajib diisi", 422);
  }

  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const doc: LegalDocument = {
    id: `DOC-${year}-${String(db.documents.length + 1).padStart(3, "0")}`,
    name: body.name,
    category: body.category,
    description: body.description ?? "",
    pic: body.pic,
    department: body.department,
    effective_date: body.effective_date ?? now.slice(0, 10),
    expiry_date: body.expiry_date ?? null,
    review_date: body.review_date ?? null,
    status: body.status ?? "ACTIVE",
    file_url: body.file_url ?? "",
    file_type: body.file_type ?? "PDF",
    file_size: body.file_size ?? "0 KB",
    version: "1.0",
    created_at: now,
    updated_at: now,
    history: [
      {
        version: "1.0",
        note: "Dokumen dibuat",
        date: now.slice(0, 10),
        author: body.pic,
      },
    ],
  };

  db.documents.unshift(doc);
  return jsonOk(doc, 201);
}

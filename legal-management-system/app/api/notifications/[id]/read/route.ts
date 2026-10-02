import { db, jsonError, jsonOk } from "@/lib/api-store";

/**
 * PUT /api/notifications/:id/read — tandai satu notifikasi dibaca
 */

export async function PUT(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const notification = db.notifications.find((n) => n.id === params.id);
  if (!notification) return jsonError("Notifikasi tidak ditemukan", 404);

  notification.is_read = true;
  return jsonOk({ success: true });
}

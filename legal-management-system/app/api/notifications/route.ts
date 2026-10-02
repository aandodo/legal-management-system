import { db, jsonError, jsonOk } from "@/lib/api-store";

/**
 * GET /api/notifications            — seluruh notifikasi (admin)
 * GET /api/notifications?userId=    — notifikasi user + notifikasi umum
 * PUT /api/notifications/read-all   — tandai semua dibaca
 */

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  const rows = userId
    ? db.notifications.filter(
        (n) => n.user_id === "ALL" || n.user_id === userId
      )
    : db.notifications;
  return jsonOk(rows.sort((a, b) => b.created_at.localeCompare(a.created_at)));
}

export async function PUT() {
  db.notifications.forEach((n) => {
    n.is_read = true;
  });
  return jsonOk({ success: true });
}

import { db, jsonOk } from "@/lib/api-store";
import type { DashboardStats } from "@/lib/types";

/**
 * GET /api/stats — agregat untuk kartu statistik dashboard.
 * Pada implementasi backend, agregasi ini dilakukan di sisi database.
 */
export async function GET() {
  const docs = db.documents;
  const cons = db.consultations;

  const stats: DashboardStats = {
    documents: {
      total: docs.length,
      active: docs.filter((d) => d.status === "ACTIVE").length,
      expiringSoon: docs.filter((d) => d.status === "EXPIRING_SOON").length,
      needReview: docs.filter((d) => d.status === "NEED_REVIEW").length,
      expired: docs.filter((d) => d.status === "EXPIRED").length,
    },
    consultations: {
      baru: cons.filter((c) => c.status === "MENUNGGU_REVIEW").length,
      menungguRespon: cons.filter(
        (c) => c.status === "DITERIMA" || c.status === "MENUNGGU_REVIEW"
      ).length,
      berjalan: cons.filter(
        (c) =>
          c.status === "DIJADWALKAN" || c.status === "SEDANG_KONSULTASI"
      ).length,
      selesai: cons.filter(
        (c) => c.status === "SELESAI" || c.status === "DITUTUP"
      ).length,
    },
  };

  return jsonOk(stats);
}

import { db, jsonOk } from "@/lib/api-store";
import type { ReportData } from "@/lib/types";

/**
 * GET /api/reports — agregat untuk dashboard analitik laporan.
 * Pada implementasi backend, nilai-nilai ini dihitung dari database.
 */
export async function GET() {
  const data: ReportData = {
    documentStatus: [
      { name: "Aktif", value: 6, key: "ACTIVE" },
      { name: "Segera Expired", value: 3, key: "EXPIRING_SOON" },
      { name: "Perlu Review", value: 2, key: "NEED_REVIEW" },
      { name: "Expired", value: 3, key: "EXPIRED" },
    ],
    expiredTrend: [
      { month: "Mar", expired: 0, expiring: 1 },
      { month: "Apr", expired: 1, expiring: 0 },
      { month: "Mei", expired: 0, expiring: 2 },
      { month: "Jun", expired: 2, expiring: 1 },
      { month: "Jul", expired: 1, expiring: 0 },
      { month: "Agu", expired: 1, expiring: 1 },
      { month: "Sep", expired: 3, expiring: 2 },
      { month: "Okt", expired: 3, expiring: 3 },
    ],
    reviewCompletion: 78,
    documentOwnership: [
      { department: "Bagian Umum", total: 3 },
      { department: "Bagian Teknik", total: 3 },
      { department: "Divisi Hukum", total: 3 },
      { department: "Bagian SDM", total: 1 },
      { department: "Bagian Keuangan", total: 1 },
      { department: "Bagian Operasional", total: 1 },
      { department: "Bagian Pemasaran", total: 1 },
    ],
    monthlyConsultations: [
      { month: "Jan", total: 3, selesai: 3 },
      { month: "Feb", total: 2, selesai: 2 },
      { month: "Mar", total: 4, selesai: 3 },
      { month: "Apr", total: 5, selesai: 4 },
      { month: "Mei", total: 3, selesai: 3 },
      { month: "Jun", total: 6, selesai: 5 },
      { month: "Jul", total: 7, selesai: 6 },
      { month: "Agu", total: 8, selesai: 7 },
      { month: "Sep", total: 9, selesai: 7 },
    ],
    departmentConsultations: [
      { department: "Bagian Keuangan", total: 3 },
      { department: "Bagian Teknik", total: 3 },
      { department: "Bagian SDM", total: 2 },
      { department: "Bagian Umum", total: 2 },
      { department: "Bagian Perencanaan", total: 2 },
    ],
    completionStatus: [
      { name: "Selesai", value: 2, key: "SELESAI" },
      { name: "Sedang Konsultasi", value: 1, key: "SEDANG_KONSULTASI" },
      { name: "Dijadwalkan", value: 3, key: "DIJADWALKAN" },
      { name: "Diterima", value: 1, key: "DITERIMA" },
      { name: "Menunggu Review", value: 2, key: "MENUNGGU_REVIEW" },
      { name: "Ditutup", value: 1, key: "DITUTUP" },
    ],
    averageCompletionDays: 18,
  };

  return jsonOk(data);
}

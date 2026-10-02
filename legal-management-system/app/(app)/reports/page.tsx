"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  FileCheck2,
  FolderClock,
  Gauge,
  Layers,
  Timer,
  TrendingDown,
} from "lucide-react";

import { ChartCard } from "@/components/reports/chart-card";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api-client";
import { CHART_COLORS } from "@/lib/constants";
import { useApi } from "@/lib/use-api";
import type { ReportData } from "@/lib/types";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 12,
};

export default function ReportsPage() {
  const { data, loading } = useApi<ReportData>(() => api.getReports(), []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Laporan Hukum"
        description="Analitik dokumen hukum dan konsultasi untuk mendukung pengambilan keputusan manajemen."
      />

      {/* Ringkasan angka */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Dokumen Terpantau"
          value={data.documentStatus.reduce((a, b) => a + b.value, 0)}
          icon={Layers}
          accent="blue"
        />
        <StatCard
          label="Review Tuntas"
          value={`${data.reviewCompletion}%`}
          icon={Gauge}
          accent="emerald"
          hint="Target minimal 90%"
        />
        <StatCard
          label="Konsultasi Bulan Ini"
          value={data.monthlyConsultations.at(-1)?.total ?? 0}
          icon={Activity}
          accent="violet"
        />
        <StatCard
          label="Rata-rata Penyelesaian"
          value={`${data.averageCompletionDays} hari`}
          icon={Timer}
          accent="amber"
          hint="Dari pengajuan ke selesai"
        />
      </div>

      <Tabs defaultValue="documents">
        <TabsList className="mb-4">
          <TabsTrigger value="documents">Laporan Dokumen</TabsTrigger>
          <TabsTrigger value="consultations">Laporan Konsultasi</TabsTrigger>
        </TabsList>

        {/* ================= Laporan Dokumen ================= */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Distribusi Status Dokumen"
              description="Komposisi seluruh dokumen berdasarkan status saat ini."
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.documentStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.documentStatus.map((entry, i) => (
                      <Cell key={entry.key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={28} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Tren Dokumen Expired"
              description="Jumlah dokumen expired dan yang mendekati expired per bulan (8 bulan terakhir)."
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.expiredTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={28} iconSize={10} />
                  <Line
                    type="monotone"
                    dataKey="expired"
                    name="Expired"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expiring"
                    name="Akan Expired"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Kepemilikan Dokumen per Departemen"
              description="Jumlah dokumen yang menjadi tanggung jawab tiap departemen."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.documentOwnership} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={130}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="total" name="Jumlah dokumen" radius={[0, 6, 6, 0]} barSize={18}>
                    {data.documentOwnership.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card>
              <div className="flex h-full flex-col">
                <div className="border-b p-6">
                  <p className="font-semibold text-slate-900">
                    Persentase Penyelesaian Review
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Proporsi dokumen yang telah direview sesuai jadwal.
                  </p>
                </div>
                <CardContent className="flex flex-1 flex-col justify-center gap-6 p-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600">
                        Review selesai tepat waktu
                      </span>
                      <span className="text-xl font-bold text-blue-700">
                        {data.reviewCompletion}%
                      </span>
                    </div>
                    <Progress value={data.reviewCompletion} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <FileCheck2 className="mx-auto h-5 w-5 text-emerald-600" />
                      <p className="mt-1.5 text-lg font-bold text-emerald-700">
                        {data.documentStatus[0]?.value ?? 0}
                      </p>
                      <p className="text-[11px] text-emerald-700/70">Aktif</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <FolderClock className="mx-auto h-5 w-5 text-amber-600" />
                      <p className="mt-1.5 text-lg font-bold text-amber-700">
                        {data.documentStatus[1]?.value ?? 0}
                      </p>
                      <p className="text-[11px] text-amber-700/70">Akan Expired</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <TrendingDown className="mx-auto h-5 w-5 text-red-600" />
                      <p className="mt-1.5 text-lg font-bold text-red-700">
                        {data.documentStatus[3]?.value ?? 0}
                      </p>
                      <p className="text-[11px] text-red-700/70">Expired</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Dokumen yang melewati tanggal review otomatis diberi status
                    "Perlu Review" dan muncul pada pusat notifikasi Divisi
                    Hukum.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ================= Laporan Konsultasi ================= */}
        <TabsContent value="consultations" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Jumlah Konsultasi per Bulan"
              description="Total pengajuan dan yang diselesaikan per bulan (9 bulan terakhir)."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyConsultations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={28} iconSize={10} />
                  <Bar
                    dataKey="total"
                    name="Total pengajuan"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="selesai"
                    name="Selesai"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Status Penyelesaian Konsultasi"
              description="Komposisi status seluruh konsultasi periode berjalan."
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.completionStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.completionStatus.map((entry, i) => (
                      <Cell key={entry.key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={28} iconSize={10} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Departemen Paling Banyak Konsultasi"
              description="Peringkat departemen berdasarkan jumlah pengajuan konsultasi."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentConsultations} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={140}
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="total"
                    name="Jumlah konsultasi"
                    fill="#8b5cf6"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card>
              <div className="flex h-full flex-col">
                <div className="border-b p-6">
                  <p className="font-semibold text-slate-900">
                    Efisiensi Penyelesaian
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Rata-rata waktu dari pengajuan hingga konsultasi selesai.
                  </p>
                </div>
                <CardContent className="flex flex-1 flex-col justify-center gap-4 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                      <Timer className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">
                        {data.averageCompletionDays}{" "}
                        <span className="text-base font-medium text-slate-500">
                          hari kerja
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Target SLA internal: maksimal 21 hari
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (data.averageCompletionDays / 21) * 100
                    )}
                    className="h-3"
                  />
                  <p className="text-xs leading-relaxed text-slate-400">
                    Rata-rata penyelesaian masih dalam batas SLA. Waktu tercepat
                    dicapai pada pengajuan tanpa dokumen pendukung yang kompleks.
                  </p>
                </CardContent>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

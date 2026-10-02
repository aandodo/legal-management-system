"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileWarning,
  FolderOpen,
  Hourglass,
  Inbox,
  MessageSquareText,
  PlayCircle,
  RefreshCcw,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { MonthMini } from "@/components/dashboard/month-mini";
import {
  ConsultationStatusBadge,
  DocumentStatusBadge,
} from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";
import type { Consultation, DashboardStats, LegalDocument } from "@/lib/types";

export function AdminDashboard() {
  const { user } = useAuth();
  const stats = useApi<DashboardStats>(() => api.getStats(), []);
  const documents = useApi<LegalDocument[]>(() => api.getDocuments(), []);
  const consultations = useApi<Consultation[]>(
    () => api.getConsultations(),
    []
  );

  const docList = documents.data ?? [];
  const consList = consultations.data ?? [];

  const upcoming = consList
    .filter((c) => c.schedule)
    .sort((a, b) =>
      `${a.schedule!.date} ${a.schedule!.time}`.localeCompare(
        `${b.schedule!.date} ${b.schedule!.time}`
      )
    )
    .slice(0, 5);

  const recentDocs = docList.slice(0, 5);
  const recentConsultations = [...consList]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const s = stats.data;

  return (
    <div className="space-y-6">
      {/* Sambutan */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Selamat datang kembali, {user?.name?.split(",")[0]}
          </h1>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })} ·
            Ringkasan aktivitas hukum perusahaan hari ini
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/upload">
            Upload Dokumen <ArrowRight />
          </Link>
        </Button>
      </div>

      {/* Statistik dokumen */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Statistik Dokumen
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {stats.loading || !s ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Total Dokumen"
                value={s.documents.total}
                icon={FolderOpen}
                accent="blue"
                hint="Seluruh arsip hukum"
                href="/documents"
              />
              <StatCard
                label="Dokumen Aktif"
                value={s.documents.active}
                icon={CheckCircle2}
                accent="emerald"
                hint="Berlaku & in-force"
                href="/documents?status=ACTIVE"
              />
              <StatCard
                label="Akan Expired"
                value={s.documents.expiringSoon}
                icon={Hourglass}
                accent="amber"
                hint="≤ 30 hari lagi"
                href="/documents?status=EXPIRING_SOON"
              />
              <StatCard
                label="Perlu Review"
                value={s.documents.needReview}
                icon={FileWarning}
                accent="sky"
                hint="Melewati review date"
                href="/documents?status=NEED_REVIEW"
              />
              <StatCard
                label="Expired"
                value={s.documents.expired}
                icon={AlertTriangle}
                accent="red"
                hint="Perlu tindak lanjut"
                href="/documents?status=EXPIRED"
              />
            </>
          )}
        </div>
      </section>

      {/* Statistik konsultasi */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Statistik Konsultasi
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.loading || !s ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Konsultasi Baru"
                value={s.consultations.baru}
                icon={Inbox}
                accent="violet"
                hint="Menunggu review"
                href="/consultations"
              />
              <StatCard
                label="Menunggu Respon"
                value={s.consultations.menungguRespon}
                icon={Clock3}
                accent="amber"
                hint="Sudah diterima"
                href="/consultations"
              />
              <StatCard
                label="Sedang Berjalan"
                value={s.consultations.berjalan}
                icon={PlayCircle}
                accent="blue"
                hint="Terjadwal / berlangsung"
                href="/consultations"
              />
              <StatCard
                label="Selesai"
                value={s.consultations.selesai}
                icon={CheckCircle2}
                accent="emerald"
                hint="Tuntas ditangani"
                href="/consultations"
              />
            </>
          )}
        </div>
      </section>

      {/* Kalender + jadwal terdekat */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Kalender Konsultasi</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/calendar">
                Buka <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <MonthMini
              events={consList
                .filter((c) => c.schedule)
                .map((c) => ({
                  date: c.schedule!.date,
                  title: `${c.schedule!.time} — ${c.title}`,
                }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Jadwal Konsultasi Terdekat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {consultations.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            ) : upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Belum ada jadwal konsultasi.
              </p>
            ) : (
              upcoming.map((c) => (
                <Link
                  key={c.id}
                  href={`/consultations/${c.id}`}
                  className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <span className="text-[10px] font-semibold uppercase">
                      {formatDate(c.schedule!.date, "MMM")}
                    </span>
                    <span className="text-base font-bold leading-none">
                      {formatDate(c.schedule!.date, "dd")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {c.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {c.schedule!.time} WITA · {c.schedule!.location}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-medium text-slate-700">
                      {c.requester_name}
                    </p>
                    <p className="text-xs text-slate-400">{c.department}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dokumen terbaru + konsultasi terbaru */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Dokumen Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/documents">
                Semua <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {documents.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="mb-3 h-14 rounded-lg" />
              ))
            ) : (
              recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {doc.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {doc.id} · {doc.category}
                    </p>
                  </div>
                  <DocumentStatusBadge status={doc.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Konsultasi Terbaru</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/consultations">
                Semua <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {consultations.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="mb-3 h-14 rounded-lg" />
              ))
            ) : (
              recentConsultations.map((c) => (
                <Link
                  key={c.id}
                  href={`/consultations/${c.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {c.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {c.requester_name} · {c.department}
                    </p>
                  </div>
                  <ConsultationStatusBadge status={c.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

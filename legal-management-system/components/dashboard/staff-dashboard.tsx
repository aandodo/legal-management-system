"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Inbox,
  MessagesSquare,
  PlayCircle,
  Scale,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { MonthMini } from "@/components/dashboard/month-mini";
import { ConsultationStatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/utils";
import type { Consultation } from "@/lib/types";

export function StaffDashboard() {
  const { user } = useAuth();
  const consultations = useApi<Consultation[]>(
    () => api.getConsultations({ userId: user?.id }),
    [user?.id]
  );

  const list = consultations.data ?? [];
  const mine = user ? list.filter((c) => c.user_id === user.id) : [];

  const counts = {
    total: mine.length,
    baru: mine.filter((c) => c.status === "MENUNGGU_REVIEW").length,
    berjalan: mine.filter(
      (c) => c.status === "DIJADWALKAN" || c.status === "SEDANG_KONSULTASI" || c.status === "DITERIMA"
    ).length,
    selesai: mine.filter(
      (c) => c.status === "SELESAI" || c.status === "DITUTUP"
    ).length,
  };

  const upcoming = mine
    .filter((c) => c.schedule)
    .sort((a, b) =>
      `${a.schedule!.date} ${a.schedule!.time}`.localeCompare(
        `${b.schedule!.date} ${b.schedule!.time}`
      )
    )
    .slice(0, 4);

  const recent = [...mine]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Selamat datang, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm capitalize text-slate-500">
            {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })} ·
            Layanan konsultasi hukum untuk {user?.department}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/consultations/new">
            <FilePlus2 /> Ajukan Konsultasi
          </Link>
        </Button>
      </div>

      {/* Banner layanan */}
      <div className="flex flex-col items-start gap-4 rounded-xl bg-gradient-to-r from-blue-700 to-sky-600 p-6 text-white sm:flex-row sm:items-center">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Scale className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Butuh bantuan hukum?</p>
          <p className="mt-1 text-sm text-blue-100">
            Ajukan konsultasi ke Divisi Hukum untuk review kontrak, legal
            opinion, perizinan, atau permasalahan hukum lainnya. Respon
            diproses pada hari kerja 08.00–16.00 WITA.
          </p>
        </div>
        <Button asChild variant="secondary" className="shrink-0">
          <Link href="/consultations/new">Buat Pengajuan</Link>
        </Button>
      </div>

      {/* Statistik pribadi */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {consultations.loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Pengajuan"
              value={counts.total}
              icon={Inbox}
              accent="blue"
              href="/consultations"
            />
            <StatCard
              label="Menunggu Review"
              value={counts.baru}
              icon={Clock3}
              accent="amber"
              hint="Belum diproses Divisi Hukum"
              href="/consultations"
            />
            <StatCard
              label="Sedang Berjalan"
              value={counts.berjalan}
              icon={PlayCircle}
              accent="violet"
              hint="Diterima / terjadwal"
              href="/consultations"
            />
            <StatCard
              label="Selesai"
              value={counts.selesai}
              icon={CheckCircle2}
              accent="emerald"
              hint="Konsultasi tuntas"
              href="/consultations"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Jadwal saya */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Jadwal Konsultasi Saya</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/calendar">
                Kalender <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {consultations.loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))
            ) : upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Belum ada jadwal konsultasi yang ditetapkan Divisi Hukum.
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
                  <ConsultationStatusBadge status={c.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Mini kalender */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Kalender Saya</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthMini
              events={mine
                .filter((c) => c.schedule)
                .map((c) => ({
                  date: c.schedule!.date,
                  title: `${c.schedule!.time} — ${c.title}`,
                }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Riwayat terbaru */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Riwayat Konsultasi Terbaru</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/consultations">
              Lihat Semua <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="divide-y">
          {consultations.loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="mb-3 h-14 rounded-lg" />
            ))
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <MessagesSquare className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">
                Anda belum pernah mengajukan konsultasi hukum.
              </p>
              <Button asChild size="sm">
                <Link href="/consultations/new">Ajukan Sekarang</Link>
              </Button>
            </div>
          ) : (
            recent.map((c) => (
              <Link
                key={c.id}
                href={`/consultations/${c.id}`}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Diajukan {formatDate(c.created_at)}
                  </p>
                </div>
                <ConsultationStatusBadge status={c.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

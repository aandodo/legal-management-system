"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CheckCheck,
  CircleCheck,
  CircleStop,
  FileText,
  Mail,
  MessagesSquare,
  PlayCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { DiscussionThread } from "@/components/consultations/discussion-thread";
import { HistoryTimeline } from "@/components/consultations/history-timeline";
import { ScheduleDialog } from "@/components/consultations/schedule-dialog";
import { StatusStepper } from "@/components/consultations/status-stepper";
import { AttachmentChip } from "@/components/shared/attachment-chip";
import { ConsultationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ConsultationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { user } = useAuth();
  const isAdmin = user?.role === "LEGAL_ADMIN";

  const { data, loading, refresh } = useApi(
    () => api.getConsultation(id),
    [id]
  );
  const discussion = useApi(
    () => api.getDiscussion(id),
    [id]
  );

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Terbuka otomatis saat ?schedule=1 (mis. dari kalender)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("schedule")) {
      setScheduleOpen(true);
    }
  }, []);

  const changeStatus = async (
    status: "DITERIMA" | "SEDANG_KONSULTASI" | "SELESAI" | "DITUTUP",
    note: string
  ) => {
    if (!data) return;
    const cons = data;
    setBusy(true);
    try {
      await api.updateConsultation(id, {
        status,
        assigned_legal:
          status === "DITERIMA" ? (user?.name ?? cons.assigned_legal) : cons.assigned_legal,
        timeline: [
          { status, note, date: new Date().toISOString().slice(0, 10) },
          ...cons.timeline,
        ],
      });
      toast.success("Status diperbarui", { description: note });
      void refresh();
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <MessagesSquare className="h-10 w-10 text-slate-300" />
        <div>
          <p className="font-semibold text-slate-900">Konsultasi tidak ditemukan</p>
          <p className="mt-1 text-sm text-slate-500">
            Pengajuan dengan ID {id} tidak tersedia.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/consultations">
            <ArrowLeft /> Kembali ke Daftar Konsultasi
          </Link>
        </Button>
      </div>
    );
  }

  const cons = data;

  return (
    <>
      <div className="mb-6 space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-slate-500">
          <Link href="/consultations">
            <ArrowLeft /> Kembali ke Daftar Konsultasi
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                {cons.id}
              </span>
              <ConsultationStatusBadge status={cons.status} />
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-slate-900">
              {cons.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {cons.requester_name} · {cons.department}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              {cons.status === "MENUNGGU_REVIEW" && (
                <Button onClick={() => changeStatus("DITERIMA", "Diterima oleh Divisi Hukum")} disabled={busy}>
                  <CircleCheck /> Terima Pengajuan
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setScheduleOpen(true)}
                disabled={busy}
              >
                <CalendarPlus />
                {cons.schedule ? "Ubah Jadwal" : "Buat Jadwal"}
              </Button>
              {cons.status === "DIJADWALKAN" && (
                <Button onClick={() => changeStatus("SEDANG_KONSULTASI", "Sesi konsultasi dimulai")} disabled={busy}>
                  <PlayCircle /> Mulai Konsultasi
                </Button>
              )}
              {cons.status === "SEDANG_KONSULTASI" && (
                <Button onClick={() => changeStatus("SELESAI", "Konsultasi selesai — rekomendasi diberikan")} disabled={busy}>
                  <CheckCheck /> Tandai Selesai
                </Button>
              )}
              {cons.status !== "DITUTUP" && cons.status !== "SELESAI" && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => changeStatus("DITUTUP", "Pengajuan ditutup oleh Divisi Hukum")}
                  disabled={busy}
                >
                  <CircleStop /> Tutup
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <StatusStepper status={cons.status} />
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Kolom utama: detail + diskusi */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Pengajuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Pemohon</p>
                    <p className="text-sm font-medium text-slate-800">
                      {cons.requester_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Departemen</p>
                    <p className="text-sm font-medium text-slate-800">
                      {cons.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="truncate text-sm font-medium text-slate-800">
                      {cons.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tanggal Pengajuan</p>
                    <p className="text-sm font-medium text-slate-800">
                      {formatDateTime(cons.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">PIC Divisi Hukum</p>
                    <p className="text-sm font-medium text-slate-800">
                      {cons.assigned_legal ?? "Belum ditugaskan"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Jadwal Konsultasi</p>
                    <p className="text-sm font-medium text-slate-800">
                      {cons.schedule
                        ? `${formatDate(cons.schedule.date)} · ${cons.schedule.time} WITA`
                        : "Belum dijadwalkan"}
                    </p>
                    {cons.schedule && (
                      <p className="text-xs text-slate-400">
                        {cons.schedule.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">
                  Deskripsi Permasalahan
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {cons.description}
                </p>
              </div>

              {cons.attachment && (
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">
                    Dokumen Pendukung
                  </p>
                  <AttachmentChip attachment={cons.attachment} downloadable />
                </div>
              )}
            </CardContent>
          </Card>

          <DiscussionThread
            consultationId={cons.id}
            initialMessages={discussion.data ?? []}
          />
        </div>

        {/* Sidebar: riwayat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Konsultasi</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryTimeline timeline={cons.timeline} />
          </CardContent>
        </Card>
      </div>

      <ScheduleDialog
        consultation={cons}
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onScheduled={refresh}
      />
    </>
  );
}

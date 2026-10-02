"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  Download,
  FileText,
  History,
  Pencil,
  RefreshCcw,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { EditMetadataDialog } from "@/components/documents/edit-metadata-dialog";
import { ReplaceDocumentDialog } from "@/components/documents/replace-document-dialog";
import { VersionTimeline } from "@/components/documents/version-timeline";
import { AttachmentChip } from "@/components/shared/attachment-chip";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { daysUntil, formatDate } from "@/lib/utils";

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, loading, refresh } = useApi(
    () => api.getDocument(id),
    [id]
  );
  const [editOpen, setEditOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);

  // Buka dialog edit otomatis dari ?edit=1 (tautan tabel dokumen)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("edit")) {
      setEditOpen(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <FileText className="h-10 w-10 text-slate-300" />
        <div>
          <p className="font-semibold text-slate-900">Dokumen tidak ditemukan</p>
          <p className="mt-1 text-sm text-slate-500">
            Dokumen dengan ID {id} tidak tersedia di database.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/documents">
            <ArrowLeft /> Kembali ke Daftar Dokumen
          </Link>
        </Button>
      </div>
    );
  }

  const doc = data;
  const days = daysUntil(doc.expiry_date);

  return (
    <>
      <div className="mb-6 space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-slate-500">
          <Link href="/documents">
            <ArrowLeft /> Kembali ke Daftar Dokumen
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                {doc.id}
              </span>
              <DocumentStatusBadge status={doc.status} />
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                v{doc.version}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-slate-900">
              {doc.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {doc.category} · {doc.department}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Unduhan dimulai", {
                  description: `Pada versi produksi, file ${doc.file_type} (${doc.file_size}) akan diunduh dari server aman.`,
                })
              }
            >
              <Download /> Download
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit Metadata
            </Button>
            <Button variant="outline" onClick={() => setReplaceOpen(true)}>
              <RefreshCcw /> Replace Document
            </Button>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Kolom utama */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deskripsi Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-slate-600">
                {doc.description || "Tidak ada deskripsi."}
              </p>
              <Separator />
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">
                  File Dokumen
                </p>
                <AttachmentChip
                  attachment={{
                    name: doc.file_url.split("/").pop() ?? `${doc.id}.pdf`,
                    type: doc.file_type,
                    size: doc.file_size,
                  }}
                  downloadable
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-blue-600" />
                Histori & Timeline Versi
              </CardTitle>
              <span className="text-xs text-slate-400">
                {doc.history.length} aktivitas
              </span>
            </CardHeader>
            <CardContent>
              <VersionTimeline history={doc.history} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {[
                {
                  icon: CalendarCheck,
                  label: "Created Date",
                  value: formatDate(doc.created_at),
                },
                {
                  icon: CalendarCheck,
                  label: "Effective Date",
                  value: formatDate(doc.effective_date),
                },
                {
                  icon: CalendarOff,
                  label: "Expiry Date",
                  value: doc.expiry_date ? formatDate(doc.expiry_date) : "Tanpa batas waktu",
                  hint:
                    days !== null
                      ? days >= 0
                        ? `${days} hari lagi`
                        : `Lewat ${Math.abs(days)} hari`
                      : undefined,
                },
                {
                  icon: CalendarClock,
                  label: "Next Review Date",
                  value: doc.review_date ? formatDate(doc.review_date) : "-",
                },
                { icon: User, label: "PIC", value: doc.pic },
                { icon: Building2, label: "Departemen", value: doc.department },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{row.label}</p>
                    <p className="font-medium text-slate-800">{row.value}</p>
                    {row.hint && (
                      <p
                        className={
                          (days ?? 0) >= 0
                            ? "text-xs text-amber-600"
                            : "text-xs text-red-600"
                        }
                      >
                        {row.hint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-blue-900">
                Dokumen Rahasia
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-800/80">
                Dokumen ini hanya boleh diakses, disalin, atau didistribusikan
                oleh pegawai Divisi Hukum sesuai kebijakan keamanan informasi
                perusahaan.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditMetadataDialog
        document={doc}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={refresh}
      />
      <ReplaceDocumentDialog
        document={doc}
        open={replaceOpen}
        onOpenChange={setReplaceOpen}
      />
    </>
  );
}

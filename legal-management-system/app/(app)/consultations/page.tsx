"use client";

import Link from "next/link";
import { FilePlus2, MessagesSquare } from "lucide-react";

import { ConsultationTable } from "@/components/consultations/consultation-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function ConsultationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "LEGAL_ADMIN";

  return (
    <>
      <PageHeader
        title={isAdmin ? "Konsultasi Masuk" : "Konsultasi Saya"}
        description={
          isAdmin
            ? "Kelola seluruh pengajuan konsultasi hukum dari pegawai Perumda."
            : "Riwayat pengajuan konsultasi hukum pribadi Anda beserta statusnya."
        }
        actions={
          !isAdmin ? (
            <Button asChild>
              <Link href="/consultations/new">
                <FilePlus2 /> Ajukan Konsultasi
              </Link>
            </Button>
          ) : undefined
        }
      />
      <ConsultationTable />
      <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <MessagesSquare className="h-3.5 w-3.5" />
        Diskusi bersifat privat antara pemohon dan Divisi Hukum.
      </p>
    </>
  );
}

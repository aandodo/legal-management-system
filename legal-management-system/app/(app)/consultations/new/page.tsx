"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2, SendHorizonal } from "lucide-react";
import { toast } from "sonner";

import { FilePicker } from "@/components/shared/file-picker";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import type { Attachment } from "@/lib/types";

export default function NewConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning("Judul konsultasi wajib diisi");
      return;
    }
    if (description.trim().length < 20) {
      toast.warning("Deskripsi terlalu singkat", {
        description:
          "Jelaskan permasalahan hukum minimal 20 karakter agar Divisi Hukum dapat menindaklanjuti dengan tepat.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.createConsultation({
        user_id: user?.id,
        requester_name: user?.name,
        department: user?.department,
        email: user?.email,
        title: title.trim(),
        description: description.trim(),
        attachment,
        status: "MENUNGGU_REVIEW",
        timeline: [
          {
            status: "MENUNGGU_REVIEW",
            note: "Pengajuan konsultasi dibuat",
            date: new Date().toISOString().slice(0, 10),
          },
        ],
      });
      toast.success("Konsultasi terkirim", {
        description:
          "Pengajuan Anda telah diteruskan ke Divisi Hukum. Pantau statusnya pada halaman Konsultasi Saya.",
      });
      router.push("/consultations");
    } catch {
      toast.error("Gagal mengirim pengajuan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ajukan Konsultasi Hukum"
        description="Sampaikan permasalahan hukum Anda kepada Divisi Hukum Perumda."
      />

      <form
        onSubmit={handleSubmit}
        className="grid items-start gap-6 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Detail Permasalahan</CardTitle>
            <CardDescription>
              Data pemohon otomatis terisi dari akun Anda dan tidak dapat
              diubah.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Data pemohon (readonly) */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Nama Pemohon</Label>
                <Input value={user?.name ?? ""} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label>Departemen</Label>
                <Input value={user?.department ?? ""} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} readOnly disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cons-title">Judul Konsultasi *</Label>
              <Input
                id="cons-title"
                placeholder="contoh: Review Perjanjian Kerja Sama Vendor Baru"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cons-desc">Deskripsi Permasalahan *</Label>
              <Textarea
                id="cons-desc"
                rows={6}
                placeholder="Jelaskan permasalahan hukum, latar belakang, serta hasil yang Anda harapkan dari Divisi Hukum..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-slate-400">
                Minimal 20 karakter. Semakin jelas deskripsi, semakin cepat
                pengajuan diproses.
              </p>
            </div>

            <div>
              <FilePicker
                label="Dokumen Pendukung (opsional)"
                value={attachment}
                onChange={setAttachment}
              />
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <SendHorizonal /> Kirim Konsultasi
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Panel alur */}
        <Card className="border-blue-100 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-blue-600" />
              Alur Konsultasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {[
                ["Pengajuan dibuat", "Anda mengirim formulir konsultasi."],
                ["Review Divisi Hukum", "Pengajuan diterima dan ditelaah."],
                ["Penjadwalan", "Jadwal konsultasi ditetapkan."],
                ["Sesi konsultasi", "Diskusi berlangsung sesuai jadwal."],
                ["Selesai", "Rekomendasi hukum diberikan."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{t}</p>
                    <p className="text-xs text-blue-800/70">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-blue-100 pt-4 text-xs leading-relaxed text-blue-800/80">
              Seluruh isi konsultasi bersifat rahasia dan hanya dapat dilihat
              oleh Anda serta petugas Divisi Hukum.
            </p>
          </CardContent>
        </Card>
      </form>
    </>
  );
}

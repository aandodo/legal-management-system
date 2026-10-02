"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Info, Loader2, Save, Send, UploadCloud } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { DEPARTMENTS, DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { Attachment } from "@/lib/types";

export default function UploadDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [pic, setPic] = useState(user?.name ?? "");
  const [description, setDescription] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [file, setFile] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validate = (): string | null => {
    if (!name.trim()) return "Nama dokumen wajib diisi.";
    if (!category) return "Kategori dokumen wajib dipilih.";
    if (!department) return "Departemen wajib dipilih.";
    if (!pic.trim()) return "PIC (penanggung jawab) wajib diisi.";
    if (!effectiveDate) return "Effective date wajib diisi.";
    if (!file) return "File dokumen wajib diunggah (PDF, DOCX, atau XLSX).";
    if (expiryDate && expiryDate < effectiveDate)
      return "Expiry date tidak boleh sebelum effective date.";
    if (reviewDate && reviewDate < effectiveDate)
      return "Review date tidak boleh sebelum effective date.";
    return null;
  };

  const simulateUpload = async () => {
    setUploading(true);
    setProgress(0);
    for (let p = 0; p <= 100; p += 10) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 120));
    }
  };

  const handleSubmit = async (asDraft: boolean) => {
    const error = validate();
    if (error) {
      toast.warning("Lengkapi formulir", { description: error });
      return;
    }

    if (asDraft) {
      toast.success("Draf disimpan", {
        description: `Draf "${name}" tersimpan lokal dan belum masuk database dokumen.`,
      });
      return;
    }

    await simulateUpload();

    try {
      await api.createDocument({
        name: name.trim(),
        category,
        department,
        pic: pic.trim(),
        description: description.trim(),
        effective_date: effectiveDate,
        expiry_date: expiryDate || null,
        review_date: reviewDate || null,
        status: "ACTIVE",
        file_url: `/files/${file!.name}`,
        file_type: file!.type,
        file_size: file!.size,
        version: "1.0",
      });
      toast.success("Dokumen berhasil diunggah", {
        description: `${name} telah ditambahkan ke database dokumen hukum.`,
      });
      router.push("/documents");
    } catch {
      toast.error("Gagal mengunggah dokumen");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <PageHeader
        title="Upload Dokumen"
        description="Tambahkan dokumen hukum baru ke database Perumda. File yang didukung: PDF, DOCX, dan XLSX."
      />

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void handleSubmit(false);
        }}
        className="grid items-start gap-6 lg:grid-cols-3"
      >
        {/* Metadata */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Informasi Dokumen</CardTitle>
            <CardDescription>
              Metadata ini digunakan untuk pelacakan, pengingat review, dan
              pelaporan dokumen.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="doc-name">Nama Dokumen *</Label>
              <Input
                id="doc-name"
                placeholder="contoh: Perjanjian Kerja Sama Penyediaan Air Bersih PT ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Departemen *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih departemen pemilik" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="doc-pic">PIC (Penanggung Jawab) *</Label>
              <Input
                id="doc-pic"
                placeholder="Nama pegawai Divisi Hukum"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-effective">Effective Date *</Label>
              <Input
                id="doc-effective"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-expiry">Expiry Date</Label>
              <Input
                id="doc-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-review">Review Date</Label>
              <Input
                id="doc-review"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
              <p className="text-xs text-slate-400">
                Pengingat otomatis dikirim H-30 sebelum tanggal review.
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="doc-desc">Deskripsi</Label>
              <Textarea
                id="doc-desc"
                rows={4}
                placeholder="Ringkasan isi dan tujuan dokumen hukum..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload file */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Unggah File</CardTitle>
              <CardDescription>
                Tarik file ke area berikut atau pilih dari perangkat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FilePicker
                value={file}
                onChange={setFile}
                label="File Dokumen *"
              />

              {uploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Mengunggah {file?.name}...</span>
                    <span className="font-semibold text-blue-700">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                Dokumen yang diunggah bersifat rahasia dan hanya dapat diakses
                oleh pegawai Divisi Hukum.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-6">
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <Send /> Submit Dokumen
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => void handleSubmit(true)}
              >
                <Save /> Save Draft
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Spacer agar footer tidak menutup konten saat sticky pada layar kecil */}
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <UploadCloud className="h-4 w-4" />
        Maksimal ukuran file 10 MB. Versi produksi akan menyimpan file pada
        penyimpanan terenkripsi.
      </div>
    </>
  );
}

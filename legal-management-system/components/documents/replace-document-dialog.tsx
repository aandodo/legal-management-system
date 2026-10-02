"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { FilePicker } from "@/components/shared/file-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import type { Attachment, LegalDocument } from "@/lib/types";

interface ReplaceDocumentDialogProps {
  document: LegalDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReplaceDocumentDialog({
  document: doc,
  open,
  onOpenChange,
}: ReplaceDocumentDialogProps) {
  const [file, setFile] = useState<Attachment | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleReplace = async () => {
    if (!file) {
      toast.warning("Pilih file pengganti terlebih dahulu");
      return;
    }
    setSaving(true);
    try {
      const [major, minor] = doc.version.split(".").map(Number);
      const nextVersion = `${major}.${minor + 1}`;
      await api.updateDocument(doc.id, {
        file_url: `/files/${file.name}`,
        file_type: file.type,
        file_size: file.size,
        version: nextVersion,
        history: [
          {
            version: nextVersion,
            note: note.trim() || "File dokumen diganti",
            date: new Date().toISOString().slice(0, 10),
            author: "Divisi Hukum",
          },
          ...doc.history,
        ],
      });
      toast.success("Dokumen diganti", {
        description: `Versi baru ${nextVersion} atas ${doc.id} berhasil diunggah.`,
      });
      onOpenChange(false);
      setFile(null);
      setNote("");
    } catch {
      toast.error("Gagal mengganti dokumen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ganti File Dokumen</DialogTitle>
          <DialogDescription>
            Unggah file baru untuk {doc.id}. Versi dokumen akan dinaikkan
            otomatis dan tercatat pada histori.
          </DialogDescription>
        </DialogHeader>

        <FilePicker value={file} onChange={setFile} />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Catatan Versi
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="contoh: Perubahan klausul pembayaran pasal 7"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleReplace} disabled={saving}>
            <RefreshCcw /> {saving ? "Mengunggah..." : "Ganti Dokumen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

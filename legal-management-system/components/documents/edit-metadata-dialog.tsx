"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api-client";
import {
  DEPARTMENTS,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUS,
} from "@/lib/constants";
import type { DocumentStatus, LegalDocument } from "@/lib/types";

interface EditMetadataDialogProps {
  document: LegalDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function EditMetadataDialog({
  document: doc,
  open,
  onOpenChange,
  onUpdated,
}: EditMetadataDialogProps) {
  const [name, setName] = useState(doc.name);
  const [category, setCategory] = useState(doc.category);
  const [department, setDepartment] = useState(doc.department);
  const [pic, setPic] = useState(doc.pic);
  const [status, setStatus] = useState<DocumentStatus>(doc.status);
  const [description, setDescription] = useState(doc.description);
  const [effective, setEffective] = useState(doc.effective_date);
  const [expiry, setExpiry] = useState(doc.expiry_date ?? "");
  const [review, setReview] = useState(doc.review_date ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(doc.name);
      setCategory(doc.category);
      setDepartment(doc.department);
      setPic(doc.pic);
      setStatus(doc.status);
      setDescription(doc.description);
      setEffective(doc.effective_date);
      setExpiry(doc.expiry_date ?? "");
      setReview(doc.review_date ?? "");
    }
  }, [open, doc]);

  const handleSave = async () => {
    if (!name.trim() || !pic.trim()) {
      toast.warning("Nama dokumen dan PIC wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await api.updateDocument(doc.id, {
        name: name.trim(),
        category,
        department,
        pic: pic.trim(),
        status,
        description: description.trim(),
        effective_date: effective,
        expiry_date: expiry || null,
        review_date: review || null,
      });
      toast.success("Metadata diperbarui", {
        description: `Perubahan pada ${doc.id} tersimpan. Versi naik menjadi revisi baru.`,
      });
      onOpenChange(false);
      onUpdated?.();
    } catch {
      toast.error("Gagal memperbarui metadata");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Metadata Dokumen</DialogTitle>
          <DialogDescription>
            Perbarui informasi dokumen {doc.id}. Perubahan tercatat pada
            histori dokumen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nama Dokumen</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
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
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DOCUMENT_STATUS) as DocumentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {DOCUMENT_STATUS[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Departemen</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
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
          <div className="space-y-2">
            <Label>PIC</Label>
            <Input value={pic} onChange={(e) => setPic(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Input
              type="date"
              value={effective}
              onChange={(e) => setEffective(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Review Date</Label>
            <Input
              type="date"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Deskripsi</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Pencil /> Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

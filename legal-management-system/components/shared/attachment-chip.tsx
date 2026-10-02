"use client";

import { Download, FileSpreadsheet, FileText, FileType2 } from "lucide-react";
import { toast } from "sonner";

import type { Attachment, FileType } from "@/lib/types";

const ICONS: Record<FileType, typeof FileText> = {
  PDF: FileText,
  DOCX: FileType2,
  XLSX: FileSpreadsheet,
};

const COLORS: Record<FileType, string> = {
  PDF: "bg-red-50 text-red-600",
  DOCX: "bg-sky-50 text-sky-600",
  XLSX: "bg-emerald-50 text-emerald-600",
};

export function AttachmentChip({
  attachment,
  downloadable = false,
}: {
  attachment: Attachment | null;
  downloadable?: boolean;
}) {
  if (!attachment) return null;
  const Icon = ICONS[attachment.type];

  const handleDownload = () => {
    toast.info("Unduhan file", {
      description: `Pada versi produksi, "${attachment.name}" akan diunduh dari server dokumen.`,
    });
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-slate-50 p-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${COLORS[attachment.type]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">
          {attachment.name}
        </p>
        <p className="text-xs text-slate-500">
          {attachment.type} · {attachment.size}
        </p>
      </div>
      {downloadable && (
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-white hover:text-blue-600"
          aria-label="Unduh lampiran"
        >
          <Download className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

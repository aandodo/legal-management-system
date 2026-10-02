"use client";

import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet, FileText, FileType2, UploadCloud, X } from "lucide-react";

import { ACCEPTED_FILE_TYPES } from "@/lib/constants";
import { cn, formatFileSize } from "@/lib/utils";
import type { Attachment, FileType } from "@/lib/types";

const FILE_ICONS: Record<FileType, typeof FileText> = {
  PDF: FileText,
  DOCX: FileType2,
  XLSX: FileSpreadsheet,
};

export function fileTypeFromName(name: string): FileType {
  const ext = name.split(".").pop()?.toUpperCase();
  if (ext === "PDF" || ext === "DOCX" || ext === "XLSX") return ext;
  return "PDF";
}

interface FilePickerProps {
  label?: string;
  value: Attachment | null;
  onChange: (file: Attachment | null) => void;
  hint?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Area unggah drag & drop untuk PDF/DOCX/XLSX.
 * Menangani pilihan file secara lokal (demo) — integrasi nyata
 * cukup mengganti handler onChange dengan upload ke storage backend.
 */
export function FilePicker({
  label,
  value,
  onChange,
  hint,
  className,
  compact = false,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = useCallback(
    (file: File) => {
      onChange({
        name: file.name,
        type: fileTypeFromName(file.name),
        size: formatFileSize(file.size),
      });
    },
    [onChange]
  );

  const Icon = value ? FILE_ICONS[value.type] : null;

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {value && Icon ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3",
            compact && "p-2"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {value.name}
            </p>
            <p className="text-xs text-slate-500">
              {value.type} · {value.size}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-red-500"
            aria-label="Hapus file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) accept(file);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/60 text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600",
            compact ? "px-4 py-4" : "px-6 py-10",
            dragging && "border-blue-500 bg-blue-50 text-blue-600"
          )}
        >
          <UploadCloud className={compact ? "h-6 w-6" : "h-9 w-9"} />
          <span className="text-sm font-medium">
            Tarik & lepas file di sini, atau <span className="text-blue-600 underline-offset-2 hover:underline">pilih file</span>
          </span>
          <span className="text-xs text-slate-400">
            {hint ?? "Format PDF, DOCX, atau XLSX — maks. 10 MB"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) accept(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

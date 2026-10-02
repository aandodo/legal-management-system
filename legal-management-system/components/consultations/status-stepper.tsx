"use client";

import { Check, XCircle } from "lucide-react";

import { CONSULTATION_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ConsultationStatus } from "@/lib/types";

/**
 * Indikator alur konsultasi 5 tahap:
 * Menunggu Review -> Diterima -> Dijadwalkan -> Sedang Konsultasi -> Selesai.
 * Status DITUTUP ditampilkan terpisah.
 */
export function StatusStepper({ status }: { status: ConsultationStatus }) {
  if (status === "DITUTUP") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <XCircle className="h-5 w-5 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Konsultasi Ditutup
          </p>
          <p className="text-xs text-slate-500">
            Pengajuan ini telah ditutup dan tidak diproses lagi.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = CONSULTATION_STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-center">
      {CONSULTATION_STEPS.map((step, idx) => {
        const done = idx < currentIndex;
        const current = idx === currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-start sm:items-center">
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  done && "border-blue-600 bg-blue-600 text-white",
                  current && "border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-100",
                  !done && !current && "border-slate-200 bg-white text-slate-400"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "pb-4 text-center text-[11px] font-medium leading-tight sm:pb-0 sm:text-left sm:text-xs",
                  current ? "text-blue-700" : done ? "text-slate-600" : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < CONSULTATION_STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 hidden h-0.5 flex-1 sm:block",
                  idx < currentIndex ? "bg-blue-600" : "bg-slate-200"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

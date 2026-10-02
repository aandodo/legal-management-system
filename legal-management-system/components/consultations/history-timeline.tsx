import {
  CalendarPlus,
  CheckCheck,
  CheckCircle2,
  FileText,
  MessageSquarePlus,
  XCircle,
} from "lucide-react";

import {
  CONSULTATION_STATUS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { ConsultationTimelineEntry } from "@/lib/types";

const ICONS = {
  MENUNGGU_REVIEW: { Icon: FileText, color: "bg-slate-100 text-slate-600" },
  DITERIMA: { Icon: CheckCircle2, color: "bg-sky-100 text-sky-600" },
  DIJADWALKAN: { Icon: CalendarPlus, color: "bg-violet-100 text-violet-600" },
  SEDANG_KONSULTASI: {
    Icon: MessageSquarePlus,
    color: "bg-blue-100 text-blue-600",
  },
  SELESAI: { Icon: CheckCheck, color: "bg-emerald-100 text-emerald-600" },
  DITUTUP: { Icon: XCircle, color: "bg-slate-100 text-slate-500" },
} as const;

/**
 * Timeline riwayat pengajuan konsultasi.
 */
export function HistoryTimeline({
  timeline,
}: {
  timeline: ConsultationTimelineEntry[];
}) {
  const sorted = [...timeline].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {sorted.map((entry, idx) => {
        const { Icon, color } = ICONS[entry.status];
        return (
          <li key={`${entry.date}-${entry.status}`} className="relative">
            <span
              className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${color}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="text-sm font-semibold text-slate-800">
              {CONSULTATION_STATUS[entry.status].label}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">{entry.note}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatDate(entry.date)}
              {idx === 0 && (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  Terbaru
                </span>
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

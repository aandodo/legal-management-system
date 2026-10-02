import { CircleCheckBig, FilePenLine, GitCommitVertical } from "lucide-react";

import { formatDateShort } from "@/lib/utils";
import type { DocumentVersionEntry } from "@/lib/types";

function iconFor(note: string) {
  if (/disetujui/i.test(note))
    return { Icon: CircleCheckBig, color: "bg-emerald-100 text-emerald-600" };
  if (/diperbarui|revisi/i.test(note))
    return { Icon: FilePenLine, color: "bg-sky-100 text-sky-600" };
  return { Icon: GitCommitVertical, color: "bg-slate-100 text-slate-600" };
}

export function VersionTimeline({
  history,
}: {
  history: DocumentVersionEntry[];
}) {
  const sorted = [...history].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {sorted.map((entry, idx) => {
        const { Icon, color } = iconFor(entry.note);
        return (
          <li key={`${entry.version}-${entry.date}`} className="relative">
            <span
              className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${color}`}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                Version {entry.version}
              </span>
              {idx === 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  Versi Terkini
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-700">{entry.note}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatDateShort(entry.date)} · oleh {entry.author}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ACCENTS = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
} as const;

export type StatAccent = keyof typeof ACCENTS;

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent?: StatAccent;
  href?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "blue",
  href,
}: StatCardProps) {
  const body = (
    <div className="group flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
          ACCENTS[accent]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        {hint && <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}

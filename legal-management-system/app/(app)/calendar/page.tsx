"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format, isSameDay, isToday } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarDays, Clock3, MapPin, User2 } from "lucide-react";

import { ConsultationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { WEEKDAY_LABELS, buildMonthMatrix } from "@/lib/calendar-utils";
import { cn, formatDate } from "@/lib/utils";
import {
  addMonths,
} from "date-fns";
import { api } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { Consultation } from "@/lib/types";

export default function CalendarPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "LEGAL_ADMIN";
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const { data, loading } = useApi<Consultation[]>(
    () => api.getConsultations(isAdmin ? undefined : { userId: user?.id }),
    [user?.id]
  );

  const scheduled = useMemo(
    () => (data ?? []).filter((c) => c.schedule),
    [data]
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Consultation[]>();
    for (const c of scheduled) {
      const key = c.schedule!.date;
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.schedule!.time.localeCompare(b.schedule!.time));
    }
    return map;
  }, [scheduled]);

  const days = useMemo(() => buildMonthMatrix(month), [month]);
  const selectedItems = byDate.get(format(selected, "yyyy-MM-dd")) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kalender Konsultasi
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin
              ? "Jadwal seluruh konsultasi Divisi Hukum. Klik tanggal untuk melihat detail, kelola jadwal dari halaman konsultasi."
              : "Jadwal konsultasi Anda bersama Divisi Hukum."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            ← Sebelumnya
          </Button>
          <Button variant="outline" onClick={() => setMonth(new Date())}>
            Hari Ini
          </Button>
          <Button
            variant="outline"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            Berikutnya →
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[520px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[520px] rounded-xl" />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {/* Grid kalender */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base capitalize">
                {format(month, "MMMM yyyy", { locale: localeId })}
              </CardTitle>
              <span className="text-xs text-slate-400">
                {scheduled.length} jadwal tercatat
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAY_LABELS.map((d) => (
                  <div
                    key={d}
                    className="py-1 text-center text-xs font-semibold uppercase text-slate-400"
                  >
                    {d}
                  </div>
                ))}
                {days.map(({ date, isCurrentMonth, key }) => {
                  const items = byDate.get(key);
                  const active = isSameDay(date, selected);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(date)}
                      className={cn(
                        "flex h-20 flex-col items-center gap-1 rounded-lg border p-1.5 pt-1.5 text-left transition-colors sm:h-24",
                        isCurrentMonth
                          ? "border-slate-200 bg-white"
                          : "border-transparent bg-slate-50 text-slate-300",
                        active && "border-blue-500 ring-2 ring-blue-100",
                        !active && isCurrentMonth && "hover:border-blue-300"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          isCurrentMonth ? "text-slate-700" : "text-slate-300",
                          isToday(date) && "bg-blue-600 text-white"
                        )}
                      >
                        {format(date, "d")}
                      </span>
                      {items?.slice(0, 2).map((c) => (
                        <span
                          key={c.id}
                          className="w-full truncate rounded bg-blue-50 px-1 py-0.5 text-[9px] font-medium leading-tight text-blue-700 sm:text-[10px]"
                        >
                          {c.schedule!.time} {c.title}
                        </span>
                      ))}
                      {items && items.length > 2 && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          +{items.length - 2} lainnya
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detail tanggal terpilih */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base capitalize">
                Jadwal — {format(selected, "EEEE, dd MMMM yyyy", { locale: localeId })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <CalendarDays className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    Tidak ada konsultasi pada tanggal ini.
                  </p>
                </div>
              ) : (
                selectedItems.map((c) => (
                  <Link
                    key={c.id}
                    href={`/consultations/${c.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-blue-700">
                        <Clock3 className="h-4 w-4" />
                        {c.schedule!.time} WITA
                      </span>
                      <ConsultationStatusBadge status={c.status} />
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-snug text-slate-800">
                      {c.title}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <User2 className="h-3.5 w-3.5" />
                      Pemohon: {c.requester_name} ({c.department})
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {c.schedule!.location}
                    </p>
                  </Link>
                ))
              )}
              {isAdmin && selectedItems.length > 0 && (
                <p className="border-t pt-3 text-xs text-slate-400">
                  Untuk membuat atau mengubah jadwal, buka detail konsultasi
                  lalu pilih aksi jadwal.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

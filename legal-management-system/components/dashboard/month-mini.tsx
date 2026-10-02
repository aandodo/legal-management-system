"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, format, isToday } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { WEEKDAY_LABELS, buildMonthMatrix, isSameDay } from "@/lib/calendar-utils";
import { cn } from "@/lib/utils";

export interface MiniCalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
}

/**
 * Mini kalender bulanan untuk dashboard — menandai hari yang memiliki
 * jadwal konsultasi dengan titik biru.
 */
export function MonthMini({ events }: { events: MiniCalendarEvent[] }) {
  const [month, setMonth] = useState(() => new Date());

  const days = useMemo(() => buildMonthMatrix(month), [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MiniCalendarEvent[]>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold capitalize text-slate-900">
          {format(month, "MMMM yyyy", { locale: localeId })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11px] font-semibold uppercase text-slate-400"
          >
            {d}
          </div>
        ))}
        {days.map(({ date, isCurrentMonth, key }) => {
          const dayEvents = eventsByDay.get(key);
          const today = isToday(date);
          return (
            <div
              key={key}
              title={dayEvents?.map((e) => e.title).join("\n")}
              className={cn(
                "relative flex h-9 items-center justify-center rounded-md text-xs",
                isCurrentMonth ? "text-slate-700" : "text-slate-300",
                today && "bg-blue-600 font-bold text-white"
              )}
            >
              {format(date, "d")}
              {dayEvents && dayEvents.length > 0 && (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    today ? "bg-white" : "bg-blue-500"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

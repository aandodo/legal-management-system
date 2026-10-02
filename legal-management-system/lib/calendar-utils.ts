import {
  addMonths,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  key: string;
}

/** Matriks 6x7 hari untuk tampilan kalender bulanan (Senin awal). */
export function buildMonthMatrix(month: Date): CalendarDay[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, month),
    key: format(date, "yyyy-MM-dd"),
  }));
}

export const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export { isSameDay, isSameMonth };

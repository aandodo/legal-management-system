import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format tanggal panjang Indonesia: "1 Oktober 2026" */
export function formatDate(
  date?: string | null,
  pattern = "dd MMMM yyyy"
): string {
  if (!date) return "-";
  try {
    return format(parseISO(date), pattern, { locale: localeId });
  } catch {
    return date;
  }
}

/** Format tanggal pendek: "1 Okt 2026" */
export function formatDateShort(date?: string | null): string {
  return formatDate(date, "dd MMM yyyy");
}

/** Format tanggal + jam: "1 Okt 2026, 09:30" */
export function formatDateTime(date?: string | null): string {
  return formatDate(date, "dd MMM yyyy, HH:mm");
}

/** "2 hari yang lalu" */
export function timeAgo(date?: string | null): string {
  if (!date) return "-";
  try {
    return formatDistanceToNow(parseISO(date), {
      locale: localeId,
      addSuffix: true,
    });
  } catch {
    return date;
  }
}

/** Selisih hari dari hari ini (negatif = sudah lewat) */
export function daysUntil(date?: string | null): number | null {
  if (!date) return null;
  try {
    return differenceInCalendarDays(parseISO(date), new Date());
  } catch {
    return null;
  }
}

/** Inisial nama: "I Made Suardika" -> "IMS" */
export function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/** Ukuran file manusiabel dari bytes */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

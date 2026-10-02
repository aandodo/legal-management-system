"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  FilePlus2,
  FileText,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  UploadCloud,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AppNotification, Role } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dokumen", href: "/documents", icon: FileText },
  { label: "Upload Dokumen", href: "/documents/upload", icon: UploadCloud },
  { label: "Konsultasi", href: "/consultations", icon: MessagesSquare },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Notifikasi", href: "/notifications", icon: Bell, showBadge: true },
  { label: "Laporan", href: "/reports", icon: BarChart3 },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

const STAFF_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ajukan Konsultasi", href: "/consultations/new", icon: FilePlus2 },
  { label: "Konsultasi Saya", href: "/consultations", icon: MessagesSquare },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Notifikasi", href: "/notifications", icon: Bell, showBadge: true },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  LEGAL_ADMIN: ADMIN_NAV,
  STAFF: STAFF_NAV,
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  const nav = user ? NAV_BY_ROLE[user.role] : [];

  useEffect(() => {
    if (!user) return;
    let active = true;
    api
      .getNotifications({ userId: user.id })
      .then((rows) => {
        if (active) {
          setUnread(rows.filter((n: AppNotification) => !n.is_read).length);
        }
      })
      .catch(() => {
        // biarkan badge kosong bila gagal
      });
    return () => {
      active = false;
    };
  }, [user, pathname]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center border-b px-5">
        <Logo showText />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.showBadge && unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {unread}
                </span>
              )}
              {active && (
                <span className="h-6 w-1 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 p-4 text-white">
          <p className="text-xs font-semibold">Divisi Hukum</p>
          <p className="mt-1 text-[11px] leading-relaxed text-blue-100">
            Layanan konsultasi hukum internal Senin–Jumat, 08.00–16.00 WITA
          </p>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400">
          v1.0.0 — Internal Use
        </p>
      </div>
    </div>
  );
}

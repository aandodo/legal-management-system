"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { ROLE_LABEL } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import type { AppNotification, Role } from "@/lib/types";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    api
      .getNotifications({ userId: user.id })
      .then((rows) =>
        setUnread(rows.filter((n: AppNotification) => !n.is_read).length)
      )
      .catch(() => undefined);
  }, [user]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 px-4 backdrop-blur lg:px-8">
      {/* Menu mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Buka menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden flex-col md:flex">
        <span className="text-sm font-semibold capitalize text-slate-900">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}
        </span>
        <span className="text-xs text-slate-500">
          Sistem manajemen hukum internal perusahaan
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Cari dokumen, konsultasi..."
            className="h-10 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          asChild
        >
          <Link href="/notifications" aria-label="Notifikasi">
            <Bell className="h-5 w-5 text-slate-600" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-44 truncate text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {user ? ROLE_LABEL[user.role as Role] : ""}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs font-normal text-slate-500">{user?.email}</p>
              <Badge variant="info" className="mt-2">
                {user ? ROLE_LABEL[user.role as Role] : ""}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

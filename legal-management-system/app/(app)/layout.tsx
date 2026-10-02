"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Logo } from "@/components/shared/logo";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Logo showText={false} />
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat sesi Anda...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 lg:block">
        <AppSidebar />
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-400 lg:px-8">
          © 2026 Perumda Air Minum Tirta Hita Buleleng — Legal Management
          System. Untuk penggunaan internal saja.
        </footer>
      </div>
    </div>
  );
}

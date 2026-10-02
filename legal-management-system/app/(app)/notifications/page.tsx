"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CalendarClock,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Clock3,
  Eye,
  FileWarning,
  MessageSquarePlus,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

import { PriorityBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { NOTIFICATION_TYPE } from "@/lib/constants";
import { useApi } from "@/lib/use-api";
import { cn, timeAgo } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/lib/types";

const TYPE_ICON: Record<
  NotificationType,
  { Icon: typeof BellRing; color: string }
> = {
  EXPIRED_DOCUMENT: { Icon: CircleAlert, color: "bg-red-50 text-red-600" },
  UPCOMING_EXPIRATION: { Icon: Clock3, color: "bg-amber-50 text-amber-600" },
  REVIEW_REQUIRED: { Icon: FileWarning, color: "bg-sky-50 text-sky-600" },
  DOCUMENT_UPDATED: { Icon: RefreshCcw, color: "bg-emerald-50 text-emerald-600" },
  NEW_CONSULTATION: { Icon: MessageSquarePlus, color: "bg-violet-50 text-violet-600" },
  CONSULTATION_SCHEDULE: { Icon: CalendarClock, color: "bg-blue-50 text-blue-600" },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data, loading, refresh } = useApi<AppNotification[]>(
    () => api.getNotifications({ userId: user?.id }),
    [user?.id]
  );

  const [tab, setTab] = useState("semua");
  const [category, setCategory] = useState("SEMUA");

  const notifications = useMemo(() => {
    let rows = data ?? [];
    if (tab === "belum") rows = rows.filter((n) => !n.is_read);
    if (category !== "SEMUA")
      rows = rows.filter((n) => n.type === (category as NotificationType));
    return rows;
  }, [data, tab, category]);

  const unreadCount = (data ?? []).filter((n) => !n.is_read).length;

  const markRead = async (n: AppNotification) => {
    if (n.is_read) return;
    try {
      await api.markNotificationRead(n.id);
      void refresh();
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      toast.success("Semua notifikasi ditandai telah dibaca");
      void refresh();
    } catch {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  return (
    <>
      <PageHeader
        title="Pusat Notifikasi"
        description={
          user?.role === "LEGAL_ADMIN"
            ? "Pemberitahuan dokumen hukum dan aktivitas konsultasi."
            : "Pemberitahuan status konsultasi dan jadwal Anda."
        }
        actions={
          <Button variant="outline" onClick={markAll} disabled={unreadCount === 0}>
            <CheckCheck /> Tandai Semua Dibaca
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="semua">
              Semua
              <Badge variant="secondary" className="ml-2">
                {(data ?? []).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="belum">
              Belum Dibaca
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-60">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMUA">Semua Kategori</SelectItem>
            {(Object.keys(NOTIFICATION_TYPE) as NotificationType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {NOTIFICATION_TYPE[t].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={BellRing}
            title="Tidak ada notifikasi"
            description="Semua pemberitahuan telah ditangani. Notifikasi baru akan muncul di sini."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const { Icon, color } = TYPE_ICON[n.type];
            return (
              <Card
                key={n.id}
                className={cn(
                  "transition-colors",
                  !n.is_read && "border-blue-200 bg-blue-50/40"
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                      color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "text-sm",
                          n.is_read
                            ? "font-medium text-slate-700"
                            : "font-bold text-slate-900"
                        )}
                      >
                        {n.title}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {NOTIFICATION_TYPE[n.type].label}
                      </Badge>
                      <PriorityBadge priority={n.priority} />
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {n.link && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={n.link} onClick={() => void markRead(n)}>
                          <Eye /> Detail
                        </Link>
                      </Button>
                    )}
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void markRead(n)}
                      >
                        <CircleCheck /> Tandai Dibaca
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

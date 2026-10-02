"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Eye,
  MessagesSquare,
  Search,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { ConsultationStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { CONSULTATION_STATUS } from "@/lib/constants";
import { useApi } from "@/lib/use-api";
import { formatDateShort } from "@/lib/utils";
import type { Consultation, ConsultationStatus } from "@/lib/types";

const PAGE_SIZE = 8;

export function ConsultationTable() {
  const { user } = useAuth();
  const isAdmin = user?.role === "LEGAL_ADMIN";

  const { data, loading } = useApi<Consultation[]>(
    () => api.getConsultations(isAdmin ? undefined : { userId: user!.id }),
    [user?.id, isAdmin]
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("SEMUA");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((c) =>
        [c.id, c.title, c.requester_name, c.department, c.assigned_legal ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (status !== "SEMUA") rows = rows.filter((c) => c.status === status);
    return [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [data, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={
              isAdmin
                ? "Cari judul, pemohon, departemen, atau PIC..."
                : "Cari judul konsultasi Anda..."
            }
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="lg:w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMUA">Semua Status</SelectItem>
            {(
              Object.keys(CONSULTATION_STATUS) as ConsultationStatus[]
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {CONSULTATION_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Belum ada konsultasi"
          description={
            isAdmin
              ? "Belum ada pengajuan konsultasi yang cocok dengan filter."
              : "Anda belum memiliki konsultasi. Ajukan konsultasi hukum pertama Anda."
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="min-w-28">ID</TableHead>
              <TableHead className="min-w-64">Judul Konsultasi</TableHead>
              {isAdmin && <TableHead className="min-w-40">Pemohon</TableHead>}
              <TableHead className="min-w-32">Departemen</TableHead>
              {isAdmin && <TableHead className="min-w-40">PIC Hukum</TableHead>}
              <TableHead className="min-w-36">Jadwal</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-medium text-slate-600">
                  {c.id}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/consultations/${c.id}`}
                    className="group flex items-start gap-2 font-medium text-slate-800 hover:text-blue-700"
                  >
                    <span className="line-clamp-2">{c.title}</span>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <p className="text-sm font-medium">{c.requester_name}</p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </TableCell>
                )}
                <TableCell className="text-sm">{c.department}</TableCell>
                {isAdmin && (
                  <TableCell className="text-sm">
                    {c.assigned_legal ?? (
                      <span className="text-xs italic text-slate-400">
                        Belum ditugaskan
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-sm">
                  {c.schedule ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                      {formatDateShort(c.schedule.date)} · {c.schedule.time}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Belum ada</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateShort(c.created_at)}
                </TableCell>
                <TableCell>
                  <ConsultationStatusBadge status={c.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/consultations/${c.id}`}>
                      <Eye /> Detail
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="border-t">
        <Pagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </Card>
  );
}

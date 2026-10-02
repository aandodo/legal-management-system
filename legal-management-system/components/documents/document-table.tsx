"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp,
  ChevronRight,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { DocumentStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { api, type DocumentPayload } from "@/lib/api-client";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUS } from "@/lib/constants";
import { useApi } from "@/lib/use-api";
import { cn, formatDateShort } from "@/lib/utils";
import type { DocumentStatus, LegalDocument } from "@/lib/types";

const PAGE_SIZE = 8;

type SortKey = "id" | "name" | "effective_date" | "expiry_date" | "review_date";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "SEMUA", label: "Semua Status" },
  ...(Object.keys(DOCUMENT_STATUS) as DocumentStatus[]).map((s) => ({
    value: s,
    label: DOCUMENT_STATUS[s].label,
  })),
];

function SortButton({
  label,
  target,
  sortKey,
  dir,
  onSort,
}: {
  label: string;
  target: SortKey;
  sortKey: SortKey | null;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === target;
  return (
    <button
      type="button"
      onClick={() => onSort(target)}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-slate-900",
        active && "text-blue-700"
      )}
    >
      {label}
      <ArrowDownUp className="h-3 w-3" />
      {active && (
        <span className="text-[10px] font-bold uppercase">
          {dir === "asc" ? "A-Z" : "Z-A"}
        </span>
      )}
    </button>
  );
}

export function DocumentTable() {
  const { data, loading, refresh } = useApi<LegalDocument[]>(
    () => api.getDocuments(),
    []
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("SEMUA");
  const [status, setStatus] = useState("SEMUA");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<LegalDocument | null>(null);

  // Sinkronkan filter awal dari query string (mis. /documents?status=EXPIRED)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("status");
    if (q && (DOCUMENT_STATUS as Record<string, unknown>)[q]) setStatus(q);
  }, []);

  const filtered = useMemo(() => {
    let rows = data ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((d) =>
        [d.id, d.name, d.pic, d.department, d.category]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (category !== "SEMUA") rows = rows.filter((d) => d.category === category);
    if (status !== "SEMUA") rows = rows.filter((d) => d.status === status);
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const va = (a[sortKey] ?? "").toString();
        const vb = (b[sortKey] ?? "").toString();
        const cmp = va.localeCompare(vb);
        return dir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, category, status, sortKey, dir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDir("asc");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.deleteDocument(target.id);
      toast.success("Dokumen dihapus", {
        description: `${target.id} — ${target.name} telah dihapus dari database.`,
      });
      void refresh();
    } catch {
      toast.error("Gagal menghapus dokumen");
    }
  };

  const handleQuickEdit = async (doc: LegalDocument, patch: DocumentPayload) => {
    try {
      await api.updateDocument(doc.id, patch);
      toast.success("Dokumen diperbarui", {
        description: `${doc.id} — status dokumen berhasil diubah.`,
      });
      void refresh();
    } catch {
      toast.error("Gagal memperbarui dokumen");
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari nama dokumen, ID, PIC, atau departemen..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-52">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMUA">Semua Kategori</SelectItem>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabel */}
      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Dokumen tidak ditemukan"
          description="Coba ubah kata kunci pencarian atau filter kategori/status dokumen."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="min-w-28">
                <SortButton label="ID Dokumen" target="id" sortKey={sortKey} dir={dir} onSort={handleSort} />
              </TableHead>
              <TableHead className="min-w-64">
                <SortButton label="Nama Dokumen" target="name" sortKey={sortKey} dir={dir} onSort={handleSort} />
              </TableHead>
              <TableHead className="min-w-36">Kategori</TableHead>
              <TableHead className="min-w-36">PIC</TableHead>
              <TableHead className="min-w-32">Departemen</TableHead>
              <TableHead>
                <SortButton label="Effective" target="effective_date" sortKey={sortKey} dir={dir} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortButton label="Expiry" target="expiry_date" sortKey={sortKey} dir={dir} onSort={handleSort} />
              </TableHead>
              <TableHead>
                <SortButton label="Review" target="review_date" sortKey={sortKey} dir={dir} onSort={handleSort} />
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-mono text-xs font-medium text-slate-600">
                  {doc.id}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="group flex items-start gap-2 font-medium text-slate-800 hover:text-blue-700"
                  >
                    <span className="line-clamp-2">{doc.name}</span>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    v{doc.version} · {doc.file_type}
                  </p>
                </TableCell>
                <TableCell className="text-sm">{doc.category}</TableCell>
                <TableCell className="text-sm">{doc.pic}</TableCell>
                <TableCell className="text-sm">{doc.department}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateShort(doc.effective_date)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateShort(doc.expiry_date)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatDateShort(doc.review_date)}
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Aksi</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>Aksi Dokumen</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/documents/${doc.id}`}>
                          <Eye /> Lihat Detail
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/documents/${doc.id}?edit=1`}>
                          <Pencil /> Edit Metadata
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                      {(Object.keys(DOCUMENT_STATUS) as DocumentStatus[])
                        .filter((s) => s !== "DRAFT" && s !== doc.status)
                        .map((s) => (
                          <DropdownMenuItem
                            key={s}
                            onClick={() => handleQuickEdit(doc, { status: s })}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  s === "ACTIVE"
                                    ? "#10b981"
                                    : s === "EXPIRING_SOON"
                                      ? "#f59e0b"
                                      : s === "NEED_REVIEW"
                                        ? "#0ea5e9"
                                        : "#ef4444",
                              }}
                            />
                            {DOCUMENT_STATUS[s].label}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteTarget(doc)}
                      >
                        <Trash2 /> Hapus Dokumen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      {/* Konfirmasi hapus */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus dokumen ini?</DialogTitle>
            <DialogDescription>
              Dokumen{" "}
              <strong className="text-slate-700">
                {deleteTarget?.id} — {deleteTarget?.name}
              </strong>{" "}
              akan dihapus permanen dari database hukum. Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 /> Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

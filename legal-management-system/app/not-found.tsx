import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <FileQuestion className="h-8 w-8 text-blue-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">
        Halaman tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-slate-500">
        Halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan
        kembali ke beranda aplikasi.
      </p>
      <Button asChild>
        <Link href="/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}

"use client";

import { ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL } from "@/lib/constants";
import type { Role } from "@/lib/types";

interface RoleGateProps {
  role: Role;
  children: React.ReactNode;
}

/**
 * Membatasi akses halaman berdasarkan peran pengguna.
 * Dipakai untuk melindungi modul khusus (mis. Documents dari Staff).
 */
export function RoleGate({ role, children }: RoleGateProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== role) {
    return (
      <Card className="mx-auto mt-16 max-w-lg border-red-200">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-7 w-7 text-red-600" />
          </div>
          <CardTitle>Akses Ditolak</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-slate-600">
          <p>
            Halaman ini hanya dapat diakses oleh{" "}
            <strong>{ROLE_LABEL[role]}</strong>. Dokumen hukum internal
            Perumda bersifat rahasia dan tidak dapat diakses oleh pegawai di
            luar Divisi Hukum.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Jika Anda merasa ini adalah kesalahan, hubungi administrator sistem.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

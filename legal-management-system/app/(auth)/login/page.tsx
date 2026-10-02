"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Loader2,
  Lock,
  LockKeyhole,
  MessagesSquare,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { COMPANY_NAME } from "@/lib/constants";

const HIGHLIGHTS = [
  {
    icon: FileCheck2,
    title: "Manajemen Dokumen Hukum",
    description:
      "Kelola kontrak, perjanjian, dan perizinan rahasia perusahaan secara terpusat dan aman.",
  },
  {
    icon: MessagesSquare,
    title: "Konsultasi Hukum Pegawai",
    description:
      "Pengajuan konsultasi, penjadwalan, dan diskusi langsung dengan Divisi Hukum.",
  },
  {
    icon: ShieldCheck,
    title: "Akses Berbasis Peran",
    description:
      "Dokumen internal hanya dapat diakses oleh Divisi Hukum dengan kontrol ketat.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const doLogin = async (id: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login({ identifier: id, password: pass });
      setUser(res.user);
      toast.success(`Selamat datang, ${res.user.name}`, {
        description: "Anda berhasil masuk ke sistem.",
      });
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Gagal masuk", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      toast.warning("Lengkapi data", {
        description: "Masukkan email / ID Pegawai dan kata sandi Anda.",
      });
      return;
    }
    void doLogin(identifier.trim(), password);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel brand */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,.4) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.3) 0, transparent 45%)",
          }}
        />
        <Logo light />

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Legal Management
              <br />
              System
            </h1>
            <p className="mt-4 max-w-md text-blue-100">
              Sistem internal {COMPANY_NAME} untuk pengelolaan dokumen hukum
              dan layanan konsultasi hukum bagi seluruh pegawai.
            </p>
          </div>

          <div className="space-y-5">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-sm text-blue-100">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-blue-200">
          © 2026 {COMPANY_NAME}. Hak cipta dilindungi — penggunaan hanya untuk
          keperluan internal.
        </p>
      </div>

      {/* Form login */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <Card className="border-slate-200 shadow-lg shadow-slate-200/60">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-900">
                Masuk ke Sistem
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Gunakan akun Divisi Hukum atau akun staff yang terdaftar.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Email / ID Pegawai</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="identifier"
                      placeholder="contoh: hukum@tirtahita.co.id atau LH-001"
                      className="pl-9"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Ingat saya
                  </label>

                  <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Lupa kata sandi?
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Atur ulang kata sandi</DialogTitle>
                        <DialogDescription>
                          Masukkan email terdaftar Anda. Tautan pengaturan ulang
                          kata sandi akan dikirim oleh administrator sistem.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        type="email"
                        placeholder="email@perusahaan.co.id"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setResetOpen(false)}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={() => {
                            if (!resetEmail.includes("@")) {
                              toast.warning("Email tidak valid");
                              return;
                            }
                            setResetOpen(false);
                            toast.success("Permintaan terkirim", {
                              description:
                                "Tautan pengaturan ulang akan dikirim ke email Anda bila terdaftar.",
                            });
                            setResetEmail("");
                          }}
                        >
                          Kirim Tautan
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <Lock /> Masuk
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-blue-200 bg-blue-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Akun Demo
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    disabled={loading}
                    onClick={() =>
                      doLogin("hukum@tirtahita.co.id", "admin123").catch(() => undefined)
                    }
                  >
                    <ShieldCheck className="text-blue-600" />
                    Admin Divisi Hukum
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    disabled={loading}
                    onClick={() =>
                      doLogin("kartika.keuangan@gmail.com", "staff123").catch(
                        () => undefined
                      )
                    }
                  >
                    <User className="text-sky-600" />
                    Staff Keuangan
                  </Button>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Admin: hukum@tirtahita.co.id / admin123 · Staff:
                  kartika.keuangan@gmail.com / staff123
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-slate-600">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Daftar Staff
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

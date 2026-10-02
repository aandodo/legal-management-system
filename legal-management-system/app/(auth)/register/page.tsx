"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { DEPARTMENTS } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !department) {
      toast.warning("Lengkapi data", {
        description: "Seluruh kolom wajib diisi.",
      });
      return;
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      toast.warning("Email tidak didukung", {
        description: "Registrasi staff wajib menggunakan alamat Gmail (@gmail.com).",
      });
      return;
    }
    if (password.length < 6) {
      toast.warning("Kata sandi terlalu pendek", {
        description: "Gunakan minimal 6 karakter.",
      });
      return;
    }
    if (password !== confirm) {
      toast.warning("Kata sandi tidak cocok", {
        description: "Pastikan konfirmasi kata sandi sama.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        department,
      });
      setUser(res);
      toast.success("Registrasi berhasil", {
        description: `Selamat datang, ${res.name}. Akun staff Anda aktif.`,
      });
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Registrasi gagal", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">
              <ArrowLeft /> Kembali ke Login
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <Card className="border-slate-200 shadow-lg shadow-slate-200/60">
            <CardContent className="p-8">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">
                  Daftar Akun Staff
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Registrasi khusus pegawai non-Divisi Hukum. Gunakan email
                  Gmail aktif Anda untuk menerima notifikasi konsultasi.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="contoh: I Made Contoh Nama"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Gmail)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama.anda@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Departemen</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter((d) => d !== "Divisi Hukum").map(
                        (dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Konfirmasi Kata Sandi</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Ulangi kata sandi"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                    Pegawai Divisi Hukum tidak perlu mendaftar — akun admin
                    dibuat oleh administrator sistem. Akun staff tidak dapat
                    mengakses database dokumen hukum internal.
                  </p>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" /> Mendaftarkan...
                      </>
                    ) : (
                      <>
                        <UserPlus /> Daftar sebagai Staff
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Sudah punya akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Building2, BellRing, Mail, Save, UserCog } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { COMPANY_NAME, ROLE_LABEL } from "@/lib/constants";

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "LEGAL_ADMIN";

  // Notifikasi
  const [notifDocument, setNotifDocument] = useState(true);
  const [notifConsultation, setNotifConsultation] = useState(true);
  const [notifSchedule, setNotifSchedule] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);

  // Email reminder
  const [expiryDays, setExpiryDays] = useState("30");
  const [reviewDays, setReviewDays] = useState("14");
  const [emailOnNew, setEmailOnNew] = useState(true);

  // Preferensi
  const [locale, setLocale] = useState("id-ID");
  const [density, setDensity] = useState("nyaman");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Perusahaan
  const [companyName, setCompanyName] = useState(COMPANY_NAME);
  const [address, setAddress] = useState(
    "Jl. Ngurah Rai No. 123, Singaraja, Buleleng, Bali 81119"
  );
  const [phone, setPhone] = useState("(0362) 123456");
  const [emailCorp, setEmailCorp] = useState("corsec@tirtahita.co.id");

  const handleSave = (section: string) => {
    toast.success("Pengaturan tersimpan", {
      description: `Bagian ${section} berhasil diperbarui.`,
    });
  };

  return (
    <>
      <PageHeader
        title="Pengaturan"
        description="Kelola preferensi notifikasi, pengingat, dan informasi aplikasi."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Notifikasi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-4 w-4 text-blue-600" />
              Pengaturan Notifikasi
            </CardTitle>
            <CardDescription>
              Tentukan pemberitahuan yang ingin Anda terima.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <SettingRow
              title="Notifikasi Dokumen"
              description="Peringatan dokumen expired, akan expired, dan perlu review."
            >
              <Switch checked={notifDocument} onCheckedChange={setNotifDocument} />
            </SettingRow>
            <SettingRow
              title="Notifikasi Konsultasi"
              description="Konsultasi baru, balasan diskusi, dan perubahan status."
            >
              <Switch
                checked={notifConsultation}
                onCheckedChange={setNotifConsultation}
              />
            </SettingRow>
            <SettingRow
              title="Pengingat Jadwal"
              description="Pemberitahuan H-1 dan hari-H sesi konsultasi."
            >
              <Switch checked={notifSchedule} onCheckedChange={setNotifSchedule} />
            </SettingRow>
            <SettingRow
              title="Ringkasan Mingguan"
              description="Ikhtisar aktivitas hukum dikirim setiap Senin pagi."
            >
              <Switch checked={notifDigest} onCheckedChange={setNotifDigest} />
            </SettingRow>
          </CardContent>
          <CardContent className="border-t pt-4">
            <Button onClick={() => handleSave("Notifikasi")}>
              <Save /> Simpan Pengaturan Notifikasi
            </Button>
          </CardContent>
        </Card>

        {/* Email reminder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-blue-600" />
              Konfigurasi Pengingat Email
            </CardTitle>
            <CardDescription>
              Otomatisasi pengingat via email kepada PIC dan pemohon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pengingat sebelum expiry (hari)</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["7", "14", "30", "60"].map((d) => (
                      <SelectItem key={d} value={d}>
                        H-{d} hari
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pengingat sebelum review (hari)</Label>
                <Select value={reviewDays} onValueChange={setReviewDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["7", "14", "30", "60"].map((d) => (
                      <SelectItem key={d} value={d}>
                        H-{d} hari
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <SettingRow
              title="Email saat pengajuan baru"
              description="Kirim email ke PIC Divisi Hukum setiap ada pengajuan konsultasi baru."
            >
              <Switch checked={emailOnNew} onCheckedChange={setEmailOnNew} />
            </SettingRow>
            <Button onClick={() => handleSave("Pengingat Email")}>
              <Save /> Simpan Konfigurasi
            </Button>
          </CardContent>
        </Card>

        {/* Preferensi pengguna */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="h-4 w-4 text-blue-600" />
              Preferensi Pengguna
            </CardTitle>
            <CardDescription>
              Akun {user?.email} — {user ? ROLE_LABEL[user.role] : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bahasa & Format Regional</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id-ID">
                      Bahasa Indonesia (id-ID)
                    </SelectItem>
                    <SelectItem value="en-US" disabled>
                      English (en-US) — segera
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kepadatan Tampilan</Label>
                <Select value={density} onValueChange={setDensity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nyaman">Nyaman</SelectItem>
                    <SelectItem value="padat">Padat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SettingRow
              title="Pembaruan data otomatis"
              description="Segarkan daftar dokumen, konsultasi, dan notifikasi secara periodik."
            >
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </SettingRow>
            <Button onClick={() => handleSave("Preferensi")}>
              <Save /> Simpan Preferensi
            </Button>
          </CardContent>
        </Card>

        {/* Informasi perusahaan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-blue-600" />
              Informasi Perusahaan
            </CardTitle>
            <CardDescription>
              Data profil yang ditampilkan pada header dokumen resmi.
              {isAdmin ? "" : " Hanya Divisi Hukum yang dapat mengubah data ini."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Nama Badan Usaha</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat Kantor Pusat</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telepon</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Resmi</Label>
                <Input
                  value={emailCorp}
                  onChange={(e) => setEmailCorp(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
            </div>
            <Button onClick={() => handleSave("Informasi Perusahaan")} disabled={!isAdmin}>
              <Save /> Simpan Informasi
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

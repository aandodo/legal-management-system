"use client";

import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import type { Consultation, ConsultationSchedule } from "@/lib/types";

const LOCATIONS = [
  "Ruang Rapat Direksi",
  "Ruang Rapat Divisi Hukum",
  "Ruang Rapat Umum",
  "Kantor Notaris Singaraja",
  "Daring (Video Conference)",
];

interface ScheduleDialogProps {
  consultation: Consultation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

/**
 * Dialog pembuatan/ubah jadwal konsultasi oleh Divisi Hukum.
 */
export function ScheduleDialog({
  consultation,
  open,
  onOpenChange,
  onScheduled,
}: ScheduleDialogProps) {
  const [date, setDate] = useState(consultation.schedule?.date ?? "");
  const [time, setTime] = useState(consultation.schedule?.time ?? "09:00");
  const [location, setLocation] = useState(
    consultation.schedule?.location ?? LOCATIONS[0]
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(consultation.schedule?.date ?? "");
      setTime(consultation.schedule?.time ?? "09:00");
      setLocation(consultation.schedule?.location ?? LOCATIONS[0]);
    }
  }, [open, consultation]);

  const handleSave = async () => {
    if (!date || !time) {
      toast.warning("Lengkapi tanggal dan jam konsultasi");
      return;
    }
    setSaving(true);
    try {
      const schedule: ConsultationSchedule = { date, time, location };
      const alreadyScheduled = !!consultation.schedule;
      await api.updateConsultation(consultation.id, {
        schedule,
        status: alreadyScheduled ? consultation.status : "DIJADWALKAN",
        timeline: [
          {
            status: "DIJADWALKAN" as const,
            note: alreadyScheduled
              ? `Jadwal diubah — ${date} pukul ${time} WITA, ${location}`
              : `Jadwal konsultasi dibuat — ${date} pukul ${time} WITA, ${location}`,
            date: new Date().toISOString().slice(0, 10),
          },
          ...consultation.timeline,
        ],
      });
      toast.success(alreadyScheduled ? "Jadwal diperbarui" : "Jadwal dibuat", {
        description: `Konsultasi ${consultation.id} dijadwalkan pada ${date} pukul ${time} WITA.`,
      });
      onOpenChange(false);
      onScheduled?.();
    } catch {
      toast.error("Gagal menyimpan jadwal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {consultation.schedule ? "Ubah Jadwal Konsultasi" : "Buat Jadwal Konsultasi"}
          </DialogTitle>
          <DialogDescription>
            {consultation.title} — pemohon {consultation.requester_name} (
            {consultation.department}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jam (WITA) *</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Lokasi</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
            Pemohon akan menerima notifikasi jadwal setelah disimpan.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <CalendarPlus /> {saving ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

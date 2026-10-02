import { Badge } from "@/components/ui/badge";
import {
  CONSULTATION_STATUS,
  DOCUMENT_STATUS,
} from "@/lib/constants";
import type {
  ConsultationStatus,
  DocumentStatus,
  Priority,
} from "@/lib/types";

export function DocumentStatusBadge({
  status,
}: {
  status: DocumentStatus;
}) {
  const meta = DOCUMENT_STATUS[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function ConsultationStatusBadge({
  status,
}: {
  status: ConsultationStatus;
}) {
  const meta = CONSULTATION_STATUS[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

const PRIORITY_VARIANT: Record<Priority, "destructive" | "warning" | "secondary"> = {
  TINGGI: "destructive",
  SEDANG: "warning",
  RENDAH: "secondary",
};

const PRIORITY_TEXT: Record<Priority, string> = {
  TINGGI: "Prioritas Tinggi",
  SEDANG: "Prioritas Sedang",
  RENDAH: "Prioritas Rendah",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority]}>
      {PRIORITY_TEXT[priority]}
    </Badge>
  );
}

import type { ReactNode } from "react";

import { RoleGate } from "@/components/shared/role-gate";

/**
 * Seluruh modul dokumen hanya boleh diakses Divisi Hukum.
 */
export default function DocumentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RoleGate role="LEGAL_ADMIN">{children}</RoleGate>;
}

"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";

import { DocumentTable } from "@/components/documents/document-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Manajemen Dokumen"
        description="Database dokumen hukum rahasia Perumda — kontrak, perjanjian, perizinan, dan legal opinion."
        actions={
          <Button asChild>
            <Link href="/documents/upload">
              <UploadCloud /> Upload Dokumen
            </Link>
          </Button>
        }
      />
      <DocumentTable />
    </>
  );
}

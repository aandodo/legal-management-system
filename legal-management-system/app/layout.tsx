import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import { APP_NAME, COMPANY_NAME } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | ${COMPANY_NAME}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Sistem manajemen dokumen hukum dan konsultasi hukum internal Perumda Air Minum Tirta Hita Buleleng.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

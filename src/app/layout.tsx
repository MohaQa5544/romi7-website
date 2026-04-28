import type { Metadata, Viewport } from "next";
import { readexPro, ibmPlexArabic, inter } from "@/lib/fonts";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SITE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.teacherNameEn }],
  manifest: "/manifest.json",
  // Favicon + apple-touch-icon are picked up automatically from
  // src/app/icon.png and src/app/apple-icon.png via Next's file convention.
  openGraph: {
    type: "website",
    locale: "ar_QA",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#050E2E" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${readexPro.variable} ${ibmPlexArabic.variable} ${inter.variable}`}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
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
        {/* Top progress bar shown during every client-side navigation —
            same idea as the one YouTube/GitHub/Vercel use. Brand gold
            so it sits naturally with the rest of the UI. */}
        <NextTopLoader
          color="#F5C518"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #F5C518, 0 0 5px #F5C518"
          crawl
          crawlSpeed={200}
          speed={200}
          easing="ease"
          zIndex={9999}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

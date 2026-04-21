import { Readex_Pro, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

export const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-readex",
  display: "swap",
});

export const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-arabic",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

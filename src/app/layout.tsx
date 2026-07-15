import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Zen_Kaku_Gothic_New,
  Space_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ホームの AoiProjectCard（font-zen / font-space）用。
// /aoi 配下は src/app/aoi/layout.tsx が同じ変数を注入する。
const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
  variable: "--font-zen-kaku",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Yoichi Kaneko | Web Studio Wanderlust",
  description: "Web Studio Wanderlust — Freelance Engineer Yoichi Kaneko",
  icons: {
    icon: [{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${zenKaku.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import {
  Zen_Kaku_Gothic_New,
  Noto_Sans_JP,
  Space_Mono,
} from "next/font/google";

// 移植元では Google Fonts を <link> で読み込んでいたものを next/font に移行。
// subsets:["latin"] は preload 対象の指定で、日本語グリフを含む全サブセットは self-host される。
const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-zen-kaku",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "碧衣 — AOI | Web Studio Wanderlust",
  description:
    "登山アシスタント AI「碧衣」。アクティビティ駆動フレームワークの個人プロジェクト紹介ページ。",
};

export default function AoiLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // フォント用の CSS 変数を子孫に供給するラッパー。表示は移植ページ側がフルブリードで内包する。
  return (
    <div
      className={`${zenKaku.variable} ${notoSansJp.variable} ${spaceMono.variable}`}
    >
      {children}
    </div>
  );
}

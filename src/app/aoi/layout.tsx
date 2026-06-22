import type { Metadata } from "next";

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
  // 移植ページがフルブリードのレイアウトを内包しているため、ここはメタデータのみの薄いラッパー。
  return <>{children}</>;
}

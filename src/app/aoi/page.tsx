import type { Metadata } from "next";
import { PAGE_BG } from "@/config/aoi";
import { NightModeProvider } from "@/components/aoi/NightModeProvider";
import { Starfield } from "@/components/aoi/Starfield";
import { AoiNav } from "@/components/aoi/AoiNav";
import { AoiHero } from "@/components/aoi/AoiHero";
import { AboutSection } from "@/components/aoi/AboutSection";
import { FrameworkSection } from "@/components/aoi/FrameworkSection";
import { ServicesSection } from "@/components/aoi/ServicesSection";
import { MountainSection } from "@/components/aoi/MountainSection";
import { ModesSection } from "@/components/aoi/ModesSection";
import { CastSection } from "@/components/aoi/CastSection";
import { GenerateImageSection } from "@/components/aoi/GenerateImageSection";
import { AoiFooter } from "@/components/aoi/AoiFooter";
import { NightOverlay } from "@/components/aoi/NightOverlay";

export const metadata: Metadata = {
  title: "碧衣（あおい） | 登山アシスタント AI - Web Studio Wanderlust",
  description:
    "登山アシスタント AI「碧衣（あおい）」の紹介ページ。アクティビティ駆動フレームワークを軸に、予定・行動の記録・天候を読み解き、一日の始まりと終わりに LINE でそっと言葉を届ける個人プロジェクトです。",
  openGraph: {
    title: "碧衣（あおい） | 登山アシスタント AI - Web Studio Wanderlust",
    description:
      "登山アシスタント AI「碧衣（あおい）」の紹介ページ。アクティビティ駆動フレームワークを軸に、予定・行動の記録・天候を読み解き、一日の始まりと終わりに LINE でそっと言葉を届ける個人プロジェクトです。",
    type: "website",
    locale: "ja_JP",
    images: [{ url: "/images/aoi-og-img.png" }],
  },
};

/**
 * `item/碧衣の説明ページ/碧衣の説明ページ.dc.html` からの移植ページ。
 * インラインスタイルは Tailwind ユーティリティへ、画像は next/image、フォントは next/font（layout 側）に移行済み。
 *
 * セクションごとにコンポーネント分割し、本体はサーバーコンポーネントのシェルに徹する。
 * クライアント状態は夜モード（NightModeProvider）と時計（LiveModeWidget）の 2 か所だけに閉じ込めている。
 */
export default function AoiPage() {
  return (
    <NightModeProvider>
      <div
        className={`aoi-root relative min-h-screen w-full overflow-hidden font-noto text-[#dce7f5] ${PAGE_BG}`}
      >
        <Starfield />
        <AoiNav />
        <AoiHero />
        <AboutSection />
        <FrameworkSection />
        <ServicesSection />
        <MountainSection />
        <ModesSection />
        <CastSection />
        <GenerateImageSection />
        <AoiFooter />
        <NightOverlay />
      </div>
    </NightModeProvider>
  );
}

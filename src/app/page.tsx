import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudMoon } from "@fortawesome/free-solid-svg-icons";
import { BentoCard } from "@/components/BentoCard";
import { LifeLogClient } from "@/components/LifeLogClient";
import { AboutCard } from "@/components/cards/AboutCard";
import { GitHubCard } from "@/components/cards/GitHubCard";
import { TechStackCard } from "@/components/cards/TechStackCard";
import { SocialCard } from "@/components/cards/SocialCard";
import { RecentProjectsCard } from "@/components/cards/RecentProjectsCard";
import { LIFE_LOG_AUDIO_URL } from "@/config/audio";
import { LIFE_LOG_BACKGROUND_STYLE } from "@/config/lifeLog";

export const metadata: Metadata = {
  openGraph: {
    title: "Web Studio Wanderlust | Freelance Engineer / Yoichi Kaneko",
    description:
      "「Web Studio Wanderlust」金子陽一のポートフォリオ。PHP、Ruby、React、Next.js 等を用いたフルスタック開発を得意とし、「動くものをちゃんと作る」を信条とするフリーランスエンジニアです。",
    type: "website",
    locale: "ja_JP",
    images: [{ url: "/images/og-img.png" }],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">
            Web Studio <span className="text-blue-500">Wanderlust</span>
          </h1>
          <p className="text-gray-400">Freelance Engineer / Yoichi Kaneko</p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* About — col-span-2, row-span-2 */}
          <BentoCard className="md:col-span-2 md:row-span-2">
            <AboutCard />
          </BentoCard>

          {/* Tech Stack — col-span-1, row-span-2 */}
          <BentoCard className="md:row-span-2">
            <TechStackCard />
          </BentoCard>

          {/* GitHub Contributions — col-span-1 */}
          <BentoCard className="flex items-center justify-center min-h-40">
            <GitHubCard />
          </BentoCard>

          {/* Social — col-span-1 */}
          <BentoCard>
            <SocialCard />
          </BentoCard>

          {/* Recent Projects — col-span-2 */}
          <BentoCard className="md:col-span-2">
            <RecentProjectsCard />
          </BentoCard>

          {/* Life Log — col-span-2 */}
          <LifeLogClient
            audioUrl={LIFE_LOG_AUDIO_URL}
            backgroundStyle={LIFE_LOG_BACKGROUND_STYLE}
          />

          {/* Project Aoi — col-span-4 */}
          <Link href="/aoi" className="md:col-span-4">
            <BentoCard className="h-full">
              <h3 className="text-xl font-bold">
                <FontAwesomeIcon icon={faCloudMoon} className="w-4 h-4 mr-2" />
                Project Aoi
              </h3>
            </BentoCard>
          </Link>
        </div>
      </div>
    </div>
  );
}

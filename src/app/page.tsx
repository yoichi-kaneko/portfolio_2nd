import { Suspense } from "react";
import { BentoCard } from "@/components/BentoCard";
import { AboutCard } from "@/components/cards/AboutCard";
import { GitHubCard } from "@/components/cards/GitHubCard";
import { TechStackCard } from "@/components/cards/TechStackCard";
import { SocialCard } from "@/components/cards/SocialCard";
import { RecentProjectsCard } from "@/components/cards/RecentProjectsCard";
import { LifeLogCard } from "@/components/cards/LifeLogCard";

function GitHubCardSkeleton() {
  return (
    <div className="text-center animate-pulse w-full">
      <div className="h-2 w-32 bg-gray-800 rounded mx-auto mb-3" />
      <div className="h-12 bg-gray-800 rounded" />
      <div className="h-2 w-20 bg-gray-800 rounded mx-auto mt-3" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">
            Web Studio{" "}
            <span className="text-blue-500">Wanderlust</span>
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
            <Suspense fallback={<GitHubCardSkeleton />}>
              <GitHubCard />
            </Suspense>
          </BentoCard>

          {/* Social — col-span-1 */}
          <BentoCard>
            <SocialCard />
          </BentoCard>

          {/* Recent Projects — col-span-3 */}
          <BentoCard className="md:col-span-3">
            <RecentProjectsCard />
          </BentoCard>

          {/* Life Log — col-span-1 */}
          <BentoCard className="bg-gradient-to-br from-blue-900/20 to-[#161616]">
            <LifeLogCard />
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

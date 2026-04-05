"use client";

import { useEffect, useRef, useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { AudioOverlayVisualizer } from "@/components/AudioOverlayVisualizer";
import { AboutCard } from "@/components/cards/AboutCard";
import { GitHubCard } from "@/components/cards/GitHubCard";
import { TechStackCard } from "@/components/cards/TechStackCard";
import { SocialCard } from "@/components/cards/SocialCard";
import { RecentProjectsCard } from "@/components/cards/RecentProjectsCard";
import { LifeLogCard } from "@/components/cards/LifeLogCard";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const LIFE_LOG_AUDIO_URL =
  "https://res.cloudinary.com/damehnlii/video/upload/v1775359579/readout_u5ksqf.mp3";

export default function Home() {
  const { isPlaying, analyserNode, onToggle } = useAudioPlayer({
    audioUrl: LIFE_LOG_AUDIO_URL,
  });
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const lifeLogWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = lifeLogWrapperRef.current;
    if (!wrapper) return;

    const updateSize = () => {
      setCardSize({
        width: Math.max(1, Math.round(wrapper.clientWidth)),
        height: Math.max(1, Math.round(wrapper.clientHeight)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

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
          <div className="relative md:col-span-2" ref={lifeLogWrapperRef}>
            <BentoCard
              clipOverflow
              style={{
                backgroundImage: "url('/images/life-log-bg.jpg')",
                backgroundSize: "120%",
                backgroundPosition: "32% 30%",
                backgroundRepeat: "no-repeat",
              }}
            >
              {isPlaying && analyserNode && (
                <div className="pointer-events-none absolute inset-0 opacity-50">
                  <AudioOverlayVisualizer
                    analyserNode={analyserNode}
                    width={cardSize.width}
                    height={cardSize.height}
                  />
                </div>
              )}
              <LifeLogCard isPlaying={isPlaying} onToggle={onToggle} />
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  );
}

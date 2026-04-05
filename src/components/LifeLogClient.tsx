"use client";

import type { CSSProperties } from "react";
import { BentoCard } from "@/components/BentoCard";
import { AudioOverlayVisualizer } from "@/components/AudioOverlayVisualizer";
import { LifeLogCard } from "@/components/cards/LifeLogCard";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useElementSize } from "@/hooks/useElementSize";

type LifeLogClientProps = {
  audioUrl: string;
  backgroundStyle: CSSProperties;
};

export function LifeLogClient({
  audioUrl,
  backgroundStyle,
}: LifeLogClientProps) {
  const { isPlaying, analyserNode, onToggle } = useAudioPlayer({
    audioUrl,
  });
  const { ref: lifeLogWrapperRef, size: cardSize } =
    useElementSize<HTMLDivElement>();

  return (
    <div className="relative md:col-span-2" ref={lifeLogWrapperRef}>
      <BentoCard clipOverflow style={backgroundStyle}>
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
  );
}

"use client";

import { useNightMode } from "@/components/aoi/NightModeProvider";

export function NightOverlay() {
  const { night } = useNightMode();

  // 原典の `background: radial-gradient(...), rgba(4,6,14,0.72)` を再現。
  // gradient は background-image、単色の暗幕は background-color に分離する
  // （まとめると単色が無効な background-image 値になり暗転しない）。
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[radial-gradient(900px_600px_at_80%_12%,rgba(40,70,130,0.35),transparent_60%)] bg-[color:rgba(4,6,14,0.72)] transition-opacity duration-[1100ms] ${
        night ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="-translate-y-[30px] text-center">
        <div className="mb-[16px] text-[48px] text-[#bfe0ff] [text-shadow:0_0_30px_rgba(127,200,255,0.7)]">
          ☾
        </div>
        <div className="font-zen text-[22px] font-bold tracking-[0.04em] text-[#dceafb]">
          おやすみなさい。良い夢を。
        </div>
        <div className="mt-[8px] font-space text-[11px] tracking-[0.14em] text-[#7f9ac0]">
          — 灯りを落としました
        </div>
      </div>
    </div>
  );
}

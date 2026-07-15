"use client";

import { useTimeTravel } from "@/components/aoi/TimeTravelProvider";
import { AOI_MODE_ORDER, type AoiModeKey } from "@/lib/aoi/resolveMode";

// 時間旅行中、部屋の写真に刻の空の色を重ねるオーバーレイ。
// モードごとに 1 枚ずつ重ね、opacity のクロスフェードで切り替える。
const SKY: Record<AoiModeKey, string> = {
  akatsuki:
    "bg-[linear-gradient(180deg,rgba(255,178,102,0.24),rgba(255,120,90,0.10)_45%,rgba(8,14,28,0)_75%)]",
  nozomi:
    "bg-[linear-gradient(180deg,rgba(150,210,255,0.22),rgba(8,14,28,0)_60%)]",
  sayo: "bg-[linear-gradient(180deg,rgba(28,30,96,0.42),rgba(12,12,44,0.30))]",
};

export function SkyTintOverlay() {
  const { override } = useTimeTravel();

  return (
    <>
      {AOI_MODE_ORDER.map((key) => (
        <div
          key={key}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${SKY[key]} ${
            override === key ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}

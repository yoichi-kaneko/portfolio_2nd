"use client";

import { useNightMode } from "@/components/aoi/NightModeProvider";

// ナビ用とフッター用で見た目とラベルが異なるため variant で出し分ける。
const VARIANT_STYLES: Record<"nav" | "footer", string> = {
  nav: "border-[rgba(127,212,255,0.32)] px-[14px] py-[7px] text-[11px] tracking-[0.14em]",
  footer:
    "border-[rgba(127,212,255,0.3)] px-[12px] py-[6px] text-[10px] tracking-[0.1em]",
};

export function NightToggleButton({ variant }: { variant: "nav" | "footer" }) {
  const { night, toggleNight } = useNightMode();
  // ナビは状態に応じてラベルが変わる。フッターは固定の「おやすみ」。
  const label =
    variant === "nav" ? (night ? "灯りをつける" : "灯りを落とす") : "おやすみ";

  return (
    <button
      onClick={toggleNight}
      className={`cursor-pointer rounded-full border bg-[rgba(127,212,255,0.08)] font-space text-[#bfe0ff] hover:bg-[rgba(127,212,255,0.18)] ${VARIANT_STYLES[variant]}`}
    >
      ☾ {label}
    </button>
  );
}

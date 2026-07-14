"use client";

import { useTimeTravel } from "@/components/aoi/TimeTravelProvider";
import type { AoiModeKey } from "@/lib/aoi/resolveMode";

// ヒーロー画像に重ねて表示する「ただいまの判定モード」ウィジェット。
// 時刻 state は TimeTravelProvider に移動し、ここは表示に徹する。
// 時間旅行中は「臨時ダイヤ」スタンプと「ほんとうの今」荷札が Widget から
// はみ出して表示される（本体の高さは常に固定）。

const OVERRIDE_BORDER: Record<AoiModeKey, string> = {
  akatsuki: "border-dashed border-[rgba(232,201,138,0.6)]",
  nozomi: "border-dashed border-[rgba(143,210,255,0.6)]",
  sayo: "border-dashed border-[rgba(169,164,214,0.6)]",
};

const OVERRIDE_DOT: Record<AoiModeKey, string> = {
  akatsuki: "bg-[#e8c98a] shadow-[0_0_8px_#e8c98a]",
  nozomi: "bg-[#8fd2ff] shadow-[0_0_8px_#8fd2ff]",
  sayo: "bg-[#a9a4d6] shadow-[0_0_8px_#a9a4d6]",
};

const OVERRIDE_CLOCK: Record<AoiModeKey, string> = {
  akatsuki: "text-[#e8c98a]",
  nozomi: "text-[#8fd2ff]",
  sayo: "text-[#a9a4d6]",
};

export function LiveModeWidget() {
  const { resolved, override, scrambling } = useTimeTravel();
  const { clock, modeJp, modeYomi, modeLine, dateStr, realModeJp, realClock } =
    resolved;

  return (
    <div
      className={`absolute bottom-[-26px] left-[-18px] w-[248px] rounded-[15px] border ${
        override ? OVERRIDE_BORDER[override] : "border-[rgba(127,212,255,0.32)]"
      } bg-[linear-gradient(160deg,rgba(20,32,56,0.94),rgba(12,20,38,0.94))] px-[18px] py-[16px] shadow-[0_26px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur-[12px] transition-colors duration-300`}
    >
      {override && (
        <div className="absolute right-[-20px] top-[-24px] flex h-[76px] w-[76px] animate-[aoi-stamp-in_0.4s_ease_both] flex-col items-center justify-center gap-[1px] rounded-full border-[2.5px] border-[#e8c98a] bg-[rgba(12,20,38,0.75)] text-[#e8c98a] shadow-[0_0_24px_-6px_rgba(232,201,138,0.55)] backdrop-blur-[4px]">
          <span className="font-zen text-[12.5px] font-black tracking-[0.08em]">
            臨時ダイヤ
          </span>
          <span className="font-space text-[7px] tracking-[0.2em]">
            TIME TRAVEL
          </span>
        </div>
      )}
      <div className="mb-[10px] flex items-center justify-between">
        <span className="font-space text-[9.5px] tracking-[0.18em] text-[#6db4e6]">
          {"// ただいまの判定モード"}
        </span>
        <span
          className={`h-[6px] w-[6px] animate-[aoi-glow_1.8s_infinite] rounded-full ${
            override
              ? OVERRIDE_DOT[override]
              : "bg-[#7fd4ff] shadow-[0_0_8px_#7fd4ff]"
          }`}
        />
      </div>
      <div className="flex items-baseline gap-[10px]">
        <span className="font-zen text-[30px] font-black leading-none text-[#eaf5ff]">
          {modeJp}
        </span>
        <span className="text-[12px] text-[#8aa0c0]">{modeYomi}</span>
        <span
          className={`ml-auto font-space text-[17px] font-bold tracking-[0.04em] ${
            override ? OVERRIDE_CLOCK[override] : "text-[#9fd9ff]"
          } ${scrambling ? "blur-[1.2px]" : ""}`}
        >
          {clock}
        </span>
      </div>
      <div className="mt-[9px] text-[11.5px] leading-[1.6] text-[#9db1cf] text-pretty">
        {modeLine}
      </div>
      <div className="mt-[8px] font-space text-[9px] tracking-[0.08em] text-[#5f78a0]">
        JST {dateStr}
      </div>
      {override && (
        <div className="absolute bottom-[-15px] right-[12px] rotate-[-2deg] animate-[aoi-tag-in_0.35s_ease_both] whitespace-nowrap rounded-[4px] border border-dashed border-[rgba(232,201,138,0.6)] bg-[rgba(12,20,38,0.94)] px-[10px] py-[3px] font-space text-[8.5px] tracking-[0.08em] text-[#e8c98a] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.8)]">
          ほんとうの今 — {realModeJp}・{realClock}
        </div>
      )}
    </div>
  );
}

"use client";

import { useTimeTravel } from "@/components/aoi/TimeTravelProvider";
import {
  AOI_MODES,
  AOI_MODE_ORDER,
  type AoiModeKey,
} from "@/lib/aoi/resolveMode";

// 「時間旅行きっぷ」。行き先別の切符でモードを手動切替する。
// 現在時刻に対応する切符には緑の「いま」札が常時付き、時間旅行中に
// その切符へ乗り直すと現実の時刻に帰還する（専用の「戻る」ボタンは持たない）。

const TICKET_ACTIVE: Record<AoiModeKey, string> = {
  akatsuki:
    "border-[#e8c98a] bg-[rgba(232,201,138,0.2)] shadow-[0_0_16px_rgba(232,201,138,0.45)]",
  nozomi:
    "border-[#8fd2ff] bg-[rgba(143,210,255,0.2)] shadow-[0_0_16px_rgba(143,210,255,0.45)]",
  sayo: "border-[#a9a4d6] bg-[rgba(169,164,214,0.2)] shadow-[0_0_16px_rgba(169,164,214,0.45)]",
};

const TICKET_IDLE =
  "border-[rgba(127,212,255,0.22)] bg-[rgba(127,212,255,0.05)]";

const pad2 = (n: number) => String(n).padStart(2, "0");
const depTime = (startSec: number) =>
  `${pad2(Math.floor(startSec / 3600))}:${pad2(Math.floor(startSec / 60) % 60)}`;

export function TimeTravelTickets() {
  const { resolved, override, travelTo } = useTimeTravel();

  return (
    <div className="mt-[56px] flex gap-[10px] pl-[8px]">
      {AOI_MODE_ORDER.map((key) => {
        const mode = AOI_MODES[key];
        const active = override
          ? override === key
          : resolved.realModeKey === key;
        const isNow = resolved.realModeKey === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => travelTo(key)}
            aria-pressed={active}
            className={`relative flex-1 cursor-pointer rounded-[6px] border border-l-4 px-[12px] py-[8px] pr-[20px] text-left transition-all duration-300 ${
              active ? TICKET_ACTIVE[key] : TICKET_IDLE
            }`}
          >
            <div className="mb-[2px] font-space text-[7px] tracking-[0.18em] text-[#5f78a0]">
              AOI LINE ・ TIME TRAVEL
            </div>
            <div
              className={`font-zen text-[15px] font-black leading-[1.2] ${
                active ? "text-[#f2f8ff]" : "text-[#8aa0c0]"
              }`}
            >
              {mode.jp}ゆき
            </div>
            <div className="mt-[2px] font-space text-[9px] text-[#8aa0c0]">
              {depTime(mode.startSec)} 発
            </div>
            {active && (
              <span className="absolute right-[7px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full border border-dashed border-[#8aa0c0] bg-[#0a1124]" />
            )}
            {isNow && (
              <span className="absolute left-[8px] top-[-8px] inline-flex items-center gap-[4px] rounded-full border border-[rgba(101,230,168,0.5)] bg-[#0d1830] px-[8px] py-[2px] font-space text-[7.5px] tracking-[0.12em] text-[#65e6a8]">
                <span className="h-[4px] w-[4px] animate-[aoi-glow_1.6s_infinite] rounded-full bg-[#65e6a8] shadow-[0_0_6px_#65e6a8]" />
                いま
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { resolveMode } from "@/lib/aoi/resolveMode";

// ヒーロー画像に重ねて表示する「ただいまの判定モード」ウィジェット。
// ページ内で時刻 state を必要とするのはここだけなので、クライアント境界をこの葉に閉じ込める。
export function LiveModeWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // マウント後にクライアント側の時刻を反映する（SSR とのハイドレーション不一致を避けるため初期値は null）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { clock, modeJp, modeYomi, modeLine, dateStr } = resolveMode(now);

  return (
    <div className="absolute bottom-[-26px] left-[-18px] w-[248px] rounded-[15px] border border-[rgba(127,212,255,0.32)] bg-[linear-gradient(160deg,rgba(20,32,56,0.94),rgba(12,20,38,0.94))] px-[18px] py-[16px] shadow-[0_26px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur-[12px]">
      <div className="mb-[10px] flex items-center justify-between">
        <span className="font-space text-[9.5px] tracking-[0.18em] text-[#6db4e6]">
          {"// ただいまの判定モード"}
        </span>
        <span className="h-[6px] w-[6px] animate-[aoiGlow_1.8s_infinite] rounded-full bg-[#7fd4ff] shadow-[0_0_8px_#7fd4ff]" />
      </div>
      <div className="flex items-baseline gap-[10px]">
        <span className="font-zen text-[30px] font-black leading-none text-[#eaf5ff]">
          {modeJp}
        </span>
        <span className="text-[12px] text-[#8aa0c0]">{modeYomi}</span>
        <span className="ml-auto font-space text-[17px] font-bold tracking-[0.04em] text-[#9fd9ff]">
          {clock}
        </span>
      </div>
      <div className="mt-[9px] text-[11.5px] leading-[1.6] text-[#9db1cf] text-pretty">
        {modeLine}
      </div>
      <div className="mt-[8px] font-space text-[9px] tracking-[0.08em] text-[#5f78a0]">
        JST {dateStr}
      </div>
    </div>
  );
}

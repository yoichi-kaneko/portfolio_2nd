"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// 1b案「一枚の時間旅行きっぷ」。
// ホーム Bento Grid の col-span-4 に置く /aoi ゆきの切符型カード。
// ホバー演出は親 Link の `group` クラス起点（JS 不要）。発車時刻のみ client で現在時刻を表示。

const pad2 = (n: number) => String(n).padStart(2, "0");

/** 現在時刻 "HH:MM"。SSR/hydration 差異を避けるため mount 後に確定する。 */
function useDepartureTime(): string | null {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(`${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/**
 * 縦スクロールがページ末尾に到達しているか。
 * ホバー不可なモバイルでの演出トリガーに使う（上に戻ると false に戻る）。
 */
function useAtPageBottom(threshold = 24): boolean {
  const [atBottom, setAtBottom] = useState(false);
  useEffect(() => {
    const check = () => {
      const doc = document.documentElement;
      setAtBottom(
        window.innerHeight + window.scrollY >= doc.scrollHeight - threshold,
      );
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [threshold]);
  return atBottom;
}

export function AoiProjectCard() {
  const depTime = useDepartureTime();
  const atBottom = useAtPageBottom();

  return (
    <div
      data-testid="aoi-project-card"
      className="relative flex h-full overflow-hidden rounded-2xl border border-[#262626] border-l-[5px] border-l-blue-500 bg-[#161616] transition-all duration-300 group-hover:border-blue-500 group-hover:border-l-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
    >
      {/* 夜空のトーン（右上にごく薄く） */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_70%_-30%,rgba(40,86,150,0.22),transparent_60%)]" />

      {/* ===== 本券 ===== */}
      <div className="relative min-w-0 flex-1 p-6">
        <div className="flex items-start justify-between">
          <div className="font-space text-[9px] tracking-[0.22em] text-[#5f78a0]">
            AOI LINE ・ TIME TRAVEL TICKET
          </div>
          <div className="font-space text-[9px] tracking-[0.14em] text-[#5f78a0]">
            NO. 001 / PERSONAL PROJECT
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-4">
          <h3 className="m-0 text-xl font-bold">Project Aoi</h3>
          <span className="font-zen text-[26px] font-black text-[#f1f7fd]">
            碧衣
            <span className="ml-2 text-[12px] font-bold text-[#8fd2ff]">
              あおい
            </span>
          </span>
          <span className="text-xs text-gray-400">
            登山アシスタント AI / アクティビティ駆動フレームワーク
          </span>
        </div>

        {/* FROM → TO */}
        <div className="mt-4 flex items-center gap-3.5">
          <div className="text-center">
            <div className="font-space text-[8px] tracking-[0.16em] text-[#5f78a0]">
              FROM
            </div>
            <div className="font-zen text-sm font-black text-[#bcd2ec]">
              ホーム
            </div>
          </div>
          <div className="relative h-px max-w-[220px] flex-1 bg-[repeating-linear-gradient(90deg,#3b5a82_0_6px,transparent_6px_12px)]">
            <span className="absolute right-[-2px] top-[-5px] text-[10px] text-[#8fd2ff]">
              ▶
            </span>
          </div>
          <div className="text-center">
            <div className="font-space text-[8px] tracking-[0.16em] text-[#5f78a0]">
              TO
            </div>
            <div className="font-zen text-sm font-black text-[#8fd2ff]">
              /aoi ・ 高層階の部屋
            </div>
          </div>
          <span className="ml-2.5 font-space text-[9px] text-[#8aa0c0]">
            本日 {depTime ?? "--:--"} 発 ・ 全モード停車
          </span>
        </div>

        {/* 改札スタンプ（ホバー、または半券非表示幅ではスクロール末尾到達で押される） */}
        <div
          className={`pointer-events-none absolute left-[44%] top-[18px] rotate-12 scale-[1.6] rounded-[10px] border-[2.5px] border-[rgba(143,210,255,0.75)] px-3.5 py-1.5 font-zen text-base font-black tracking-[0.1em] text-[rgba(143,210,255,0.85)] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.5,0.64,1)] group-hover:scale-100 group-hover:opacity-100${
            atBottom ? " max-md:scale-100 max-md:opacity-100" : ""
          }`}
        >
          いってらっしゃい
        </div>
      </div>

      {/* ===== ミシン目（モバイルでは半券ごと非表示） ===== */}
      <div className="relative hidden w-px flex-shrink-0 bg-[repeating-linear-gradient(180deg,#31415c_0_7px,transparent_7px_14px)] md:block">
        <span className="absolute left-[-7px] top-[-7px] h-3.5 w-3.5 rounded-full border border-[#262626] bg-[#0a0a0a]" />
        <span className="absolute bottom-[-7px] left-[-7px] h-3.5 w-3.5 rounded-full border border-[#262626] bg-[#0a0a0a]" />
      </div>

      {/* ===== 半券 ===== */}
      <div className="relative hidden w-[250px] flex-shrink-0 bg-[rgba(127,212,255,0.03)] p-6 md:block">
        <span className="absolute right-3.5 top-2.5 animate-[aoi-float_5s_ease-in-out_infinite] text-[20px] text-[#8fdcff] [text-shadow:0_0_18px_rgba(127,212,255,0.8)]">
          ✧
        </span>
        <div className="mb-3 font-space text-[8px] tracking-[0.2em] text-[#5f78a0]">
          STUB ・ 半券
        </div>
        <div className="flex gap-[18px]">
          <div>
            <div className="font-space text-[19px] font-bold text-[#9fd9ff]">
              15+
            </div>
            <div className="text-[10px] text-[#7e90ad]">連携サービス</div>
          </div>
          <div className="w-px bg-[rgba(127,212,255,0.14)]" />
          <div>
            <div className="font-space text-[19px] font-bold text-[#9fd9ff]">
              6
            </div>
            <div className="text-[10px] text-[#7e90ad]">実行モード</div>
          </div>
          <div className="w-px bg-[rgba(127,212,255,0.14)]" />
          <div>
            <div className="font-space text-[19px] font-bold text-[#9fd9ff]">
              1
            </div>
            <div className="text-[10px] text-[#7e90ad]">人で制作中</div>
          </div>
        </div>
      </div>

      {/* 碧衣のひょっこり（ホバー、または半券非表示幅ではスクロール末尾到達で下から現れる）。
          半券が hidden になる幅でも表示できるよう、カード直下に配置している。 */}
      <Image
        src="/aoi/face_peek.png"
        alt="碧衣"
        // 実ファイルの寸法（縦横比が違うと Next.js が警告を出す）。表示幅は className の w-[76px] で決まる
        width={140}
        height={270}
        className={`pointer-events-none absolute bottom-[-4px] right-6 h-auto w-[76px] translate-y-[115%] transition-transform duration-[380ms] ease-[cubic-bezier(0.34,1.4,0.64,1)] [filter:drop-shadow(0_0_14px_rgba(127,212,255,0.35))] group-hover:translate-y-[6%] group-hover:-rotate-3 md:right-14${
          atBottom ? " max-md:translate-y-[6%] max-md:-rotate-3" : ""
        }`}
      />
    </div>
  );
}

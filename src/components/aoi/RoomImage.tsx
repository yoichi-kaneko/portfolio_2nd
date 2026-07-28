"use client";

import Image from "next/image";
import { useState } from "react";
import { useTimeTravel } from "@/components/aoi/TimeTravelProvider";
import { AOI_MODE_ORDER, type AoiModeKey } from "@/lib/aoi/resolveMode";

// 表示中のモード（時間旅行中は行き先モード）に合わせて部屋の写真を切り替える。
// SkyTintOverlay と同じく、モードごとに 1 枚ずつ重ねて opacity のクロスフェードで
// 切り替える。非表示の 2 枚は aria-hidden にして、支援技術からは常に 1 枚に見せる。
//
// ただし初回だけは例外で、3 枚すべての読み込みとクライアント時刻の確定が揃うまで
// プレースホルダを被せる。resolveMode は時刻未確定のあいだ既定値の暁を返すため、
// 素直に描画すると room_morning が一瞬見えてから実モードへフェードしてしまう。
const ROOM_SRC: Record<AoiModeKey, string> = {
  akatsuki: "/aoi/room_morning.png",
  nozomi: "/aoi/room_noon.png",
  sayo: "/aoi/room_night.png",
};

const ROOM_LABEL: Record<AoiModeKey, string> = {
  akatsuki: "ROOM_MORNING.PNG",
  nozomi: "ROOM_NOON.PNG",
  sayo: "ROOM_NIGHT.PNG",
};

export function RoomImage() {
  const { resolved } = useTimeTravel();
  const current = resolved.modeKey;

  const [loaded, setLoaded] = useState<Partial<Record<AoiModeKey, true>>>({});
  // 読み込み失敗も「待ち終わり」として扱う。1 枚でも落ちたまま待つと永久にローディングになる
  const markSettled = (key: AoiModeKey) =>
    setLoaded((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  // realModeKey は now が確定するまで null。時刻が入るまで待って初めて実モードが分かる
  const ready =
    resolved.realModeKey !== null && AOI_MODE_ORDER.every((key) => loaded[key]);

  return (
    <>
      {AOI_MODE_ORDER.map((key, i) => (
        <Image
          key={key}
          src={ROOM_SRC[key]}
          alt="碧衣のプライベートルーム"
          aria-hidden={!ready || key !== current}
          // 実ファイルの寸法。3 枚を重ねるため、元画像は同寸に揃えてある
          width={1280}
          height={854}
          sizes="(min-width: 768px) 50vw, 100vw"
          // ファーストビューの LCP 候補。3 枚ともクロスフェードで使うため即時読み込みする
          loading="eager"
          onLoad={() => markSettled(key)}
          onError={() => markSettled(key)}
          className={`block h-auto w-full ${
            // 準備完了の瞬間だけは即時に出したいので、それまで transition を持たせない。
            // 変化前のスタイルに transition-property が無ければフェードは走らない
            ready ? "transition-opacity duration-700" : "transition-none"
          } ${
            // 先頭の 1 枚がフレームの高さを決め、残りはその上に重ねる
            i === 0 ? "" : "absolute inset-0"
          } ${ready && key === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {!ready && (
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden bg-[linear-gradient(140deg,#0a1224_0%,#101f38_50%,#0a1224_100%)]"
        >
          <div className="absolute inset-0 animate-[aoi-room-sweep_1.8s_ease-in-out_infinite] bg-[linear-gradient(100deg,transparent_35%,rgba(127,212,255,0.16)_50%,transparent_65%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]">
            <span className="h-[10px] w-[10px] animate-[aoi-glow_1.2s_infinite] rounded-full bg-[#65e6a8] shadow-[0_0_10px_#65e6a8]" />
            <span className="font-space text-[10px] tracking-[0.22em] text-[#7fd4ff]">
              LOADING ROOM…
            </span>
          </div>
        </div>
      )}
      {/* ファイル名バッジ。後続のオーバーレイより上に描画する */}
      <div className="absolute top-[12px] left-[14px] z-[1] flex items-center gap-[7px] rounded-[7px] border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.55)] px-[9px] py-[5px] font-space text-[10px] tracking-[0.16em] text-[#9fd9ff] backdrop-blur-[4px]">
        <span className="h-[6px] w-[6px] animate-[aoi-glow_1.6s_infinite] rounded-full bg-[#65e6a8] shadow-[0_0_8px_#65e6a8]" />
        {ready ? ROOM_LABEL[current] : "SYNCING…"} — 碧衣の部屋
      </div>
    </>
  );
}

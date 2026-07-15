"use client";

import Image from "next/image";
import { useTimeTravel } from "@/components/aoi/TimeTravelProvider";
import { AOI_MODE_ORDER, type AoiModeKey } from "@/lib/aoi/resolveMode";

// 表示中のモード（時間旅行中は行き先モード）に合わせて部屋の写真を切り替える。
// SkyTintOverlay と同じく、モードごとに 1 枚ずつ重ねて opacity のクロスフェードで
// 切り替える。非表示の 2 枚は aria-hidden にして、支援技術からは常に 1 枚に見せる。
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

  return (
    <>
      {AOI_MODE_ORDER.map((key, i) => (
        <Image
          key={key}
          src={ROOM_SRC[key]}
          alt="碧衣のプライベートルーム"
          aria-hidden={key !== current}
          width={1536}
          height={1024}
          sizes="(min-width: 768px) 50vw, 100vw"
          className={`block h-auto w-full transition-opacity duration-700 ${
            // 先頭の 1 枚がフレームの高さを決め、残りはその上に重ねる
            i === 0 ? "" : "absolute inset-0"
          } ${key === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {/* ファイル名バッジ。後続のオーバーレイより上に描画する */}
      <div className="absolute top-[12px] left-[14px] z-[1] flex items-center gap-[7px] rounded-[7px] border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.55)] px-[9px] py-[5px] font-space text-[10px] tracking-[0.16em] text-[#9fd9ff] backdrop-blur-[4px]">
        <span className="h-[6px] w-[6px] animate-[aoi-glow_1.6s_infinite] rounded-full bg-[#65e6a8] shadow-[0_0_8px_#65e6a8]" />
        {ROOM_LABEL[current]} — 碧衣の部屋
      </div>
    </>
  );
}

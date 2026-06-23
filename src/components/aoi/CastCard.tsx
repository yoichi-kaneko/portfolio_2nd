import Image from "next/image";
import type { CastAccent, CastMember } from "@/data/aoi/cast";

// accent ごとのカード枠線・タグ・名前・肩書・本文の配色
// （完全なクラス文字列リテラルなので Tailwind がスキャンできる）。
const CAST_STYLES: Record<
  CastAccent,
  { card: string; tag: string; name: string; role: string; body: string }
> = {
  cyan: {
    card: "border-[rgba(127,212,255,0.22)]",
    tag: "border-[rgba(127,212,255,0.3)] text-[#9fd9ff]",
    name: "text-[#eaf5ff]",
    role: "text-[#8aa0c0]",
    body: "text-[#93a6c4]",
  },
  purple: {
    card: "border-[rgba(190,160,230,0.24)]",
    tag: "border-[rgba(190,160,230,0.34)] text-[#d8c6ff]",
    name: "text-[#f0eaff]",
    role: "text-[#b6a8d6]",
    body: "text-[#a99fc4]",
  },
};

export function CastCard({ member }: { member: CastMember }) {
  const s = CAST_STYLES[member.accent];

  return (
    <div
      className={`overflow-hidden rounded-[16px] border bg-[rgba(16,26,46,0.5)] ${s.card}`}
    >
      <div className="relative h-[230px] overflow-hidden bg-[#0c1426]">
        <Image
          src={member.img}
          alt={member.alt}
          fill
          sizes="(min-width: 768px) 380px, 100vw"
          className={`object-cover ${member.objectPosition}`}
        />
        <div
          className={`absolute top-[10px] left-[10px] rounded-[6px] border bg-[rgba(8,14,28,0.6)] px-[8px] py-[4px] font-space text-[9px] tracking-[0.12em] ${s.tag}`}
        >
          {member.tag}
        </div>
      </div>
      <div className="p-[18px]">
        <div className="mb-[8px] flex items-baseline gap-[8px]">
          <span className={`font-zen text-[21px] font-black ${s.name}`}>
            {member.name}
          </span>
          <span className={`text-[11px] ${s.role}`}>{member.role}</span>
        </div>
        <p className={`m-0 text-[12.5px] leading-[1.8] text-pretty ${s.body}`}>
          {member.body}
        </p>
      </div>
    </div>
  );
}

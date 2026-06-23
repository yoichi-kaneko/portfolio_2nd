import { NightToggleButton } from "@/components/aoi/NightToggleButton";

const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: "#about", label: "これは何か" },
  { href: "#framework", label: "フレームワーク" },
  { href: "#services", label: "連携" },
  { href: "#mountain", label: "登山×天気" },
  { href: "#cast", label: "登場人物" },
];

export function AoiNav() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-[linear-gradient(180deg,rgba(8,12,22,0.92),rgba(8,12,22,0.0))] px-[40px] py-[14px] backdrop-blur-[10px]">
      <div className="flex items-center gap-[12px]">
        <span className="animate-[aoiGlow_3s_ease-in-out_infinite] text-[18px] text-[#8fdcff] [text-shadow:0_0_14px_rgba(127,212,255,0.7)]">
          ✦
        </span>
        <span className="font-zen text-[19px] font-black tracking-[0.05em] text-[#eaf3fb]">
          碧衣
        </span>
        <span className="font-space text-[11px] font-bold tracking-[0.28em] text-[#6db4e6]">
          AOI
        </span>
      </div>
      <nav className="flex items-center gap-[24px]">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[13px] text-[#9fb2cc] transition-colors hover:text-[#cfe6ff]"
          >
            {link.label}
          </a>
        ))}
        <NightToggleButton variant="nav" />
      </nav>
    </header>
  );
}

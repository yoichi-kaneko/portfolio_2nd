import { SECTION } from "@/config/aoi";
import { NightToggleButton } from "@/components/aoi/NightToggleButton";

export function AoiFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${SECTION} px-[40px] pt-[54px] pb-[70px]`}>
      <div className="rounded-[20px] border border-[rgba(127,212,255,0.20)] bg-[linear-gradient(160deg,rgba(20,32,56,0.6),rgba(12,18,34,0.7))] px-[38px] py-[36px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mb-[16px] flex items-center gap-[10px]">
          <span className="animate-[aoi-glow_3s_infinite] text-[16px] text-[#8fdcff]">
            ✦
          </span>
          <span className="font-space text-[10.5px] tracking-[0.2em] text-[#6db4e6]">
            PERSONAL · NON-COMMERCIAL · BUILT FOR FUN
          </span>
        </div>
        <p className="m-0 mb-[14px] font-zen text-[22px] font-bold leading-[1.6] text-[#dceafb] text-pretty">
          プロダクトとして売る予定は、ありません。
          <br />
          「こういうものを、個人で勝手に作っている」—
          ただ、それだけのページです。
        </p>
        <p className="m-0 mb-[22px] max-w-[620px] text-[13.5px] leading-[1.9] text-[#8aa0c0] text-pretty">
          採算も KPI
          も、ロードマップもありません。あるのは、夜景の見える部屋と、水色の相棒と、空の機嫌を読む小さな仕組みだけ。気が向いたときに、少しずつ育てています。
        </p>
        <div className="flex flex-wrap items-center justify-between gap-[16px] border-t border-[rgba(127,212,255,0.12)] pt-[20px]">
          <div className="font-zen text-[14px] italic text-[#9fb6d4]">
            「このページも、私の部屋の片隅から。」
            <span className="ml-[6px] text-[#7fd4ff]">— 碧衣</span>
          </div>
          <div className="flex items-center gap-[16px] font-space text-[11px] tracking-[0.06em] text-[#5f78a0]">
            <span>MIT License</span>
            <span className="text-[#3a4a64]">|</span>
            <span>© {currentYear} kaneko</span>
            <NightToggleButton variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

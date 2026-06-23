import { SECTION, SECTION_LABEL, H2, LEAD_P } from "@/config/aoi";
import { CAST } from "@/data/aoi/cast";
import { CastCard } from "@/components/aoi/CastCard";

export function CastSection() {
  return (
    <section
      id="cast"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 06 — CAST"}</div>
      <h2 className={H2}>登場人物</h2>
      <p className={`${LEAD_P} m-0 mb-[30px] max-w-[620px]`}>
        …という設定まで作り込んでいます。設定資料の現物を、そのまま置いておきます。
      </p>
      <div className="grid grid-cols-3 gap-[18px]">
        {CAST.map((member) => (
          <CastCard key={member.name} member={member} />
        ))}
      </div>
    </section>
  );
}

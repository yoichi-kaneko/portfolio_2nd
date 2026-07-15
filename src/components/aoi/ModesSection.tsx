import { SECTION, SECTION_LABEL, H2, LEAD_P } from "@/config/aoi";
import { MODES } from "@/data/aoi/modes";

export function ModesSection() {
  return (
    <section
      id="flow"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 05 — A DAY IN MODES"}</div>
      <h2 className={H2}>一日を、6つのモードで歩く</h2>
      <p className={`${LEAD_P} m-0 mb-[30px] max-w-[640px]`}>
        時間帯と状況に応じて、碧衣は表情を変えます。朝・昼・夜の定期モードに、登山と創作の特別モード。それぞれ和の名前を持っています。
      </p>
      <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => (
          <div
            key={m.en}
            className={`rounded-[15px] border px-[22px] py-[22px] ${m.card}`}
          >
            <div className="mb-[10px] flex items-baseline justify-between">
              <span className={`font-zen text-[26px] font-black ${m.name}`}>
                {m.jp}
                <span className={`ml-[8px] text-[12px] ${m.yomiCls}`}>
                  {m.yomi}
                </span>
              </span>
              <span className={`font-space text-[10px] ${m.monoCls}`}>
                {m.en}
              </span>
            </div>
            <div
              className={`mb-[10px] text-[11px] tracking-[0.04em] ${m.timeCls}`}
            >
              {m.time}
            </div>
            <p className="m-0 text-[12.5px] leading-[1.8] text-[#b9c4d6] text-pretty">
              {m.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

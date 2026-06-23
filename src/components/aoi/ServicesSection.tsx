import { SECTION, SECTION_LABEL, H2, LEAD_P } from "@/config/aoi";
import { SERVICES, SVC_STYLES } from "@/data/aoi/services";

export function ServicesSection() {
  return (
    <section
      id="services"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 03 — INTEGRATIONS"}</div>
      <h2 className={H2}>多様なサービスと、横断的に連携</h2>
      <p className={`${LEAD_P} m-0 mb-[18px] max-w-[660px]`}>
        外部サービスへのアクセスは、ほぼすべて専用スキルを通じて行います。入力・出力・基盤の三層で、これだけの相手とつながっています。
      </p>
      <div className="mb-[22px] flex gap-[18px] text-[12px]">
        <span className="inline-flex items-center gap-[7px] text-[#9fc4e6]">
          <span className="h-[10px] w-[10px] rounded-[3px] bg-[#6db4e6]" />
          入力 ／ 情報収集
        </span>
        <span className="inline-flex items-center gap-[7px] text-[#9fd9c8]">
          <span className="h-[10px] w-[10px] rounded-[3px] bg-[#7fd8c0]" />
          出力 ／ 生成・送信
        </span>
        <span className="inline-flex items-center gap-[7px] text-[#c6b8ff]">
          <span className="h-[10px] w-[10px] rounded-[3px] bg-[#b3a0ff]" />
          基盤 ／ データ・実行
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-[14px]">
        {SERVICES.map((svc) => (
          <div
            key={svc.name}
            className={`rounded-[13px] border bg-[rgba(18,28,48,0.5)] p-[16px] transition-colors ${SVC_STYLES[svc.color].card}`}
          >
            <div className="mb-[7px] flex items-center justify-between">
              <span className="font-space text-[14px] font-bold text-[#e6f1fb]">
                {svc.name}
              </span>
              <span
                className={`h-[8px] w-[8px] rounded-[2px] ${SVC_STYLES[svc.color].dot}`}
              />
            </div>
            <div className="text-[12px] leading-[1.6] text-[#90a4c2]">
              {svc.desc}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-[16px] mb-0 font-space text-[11.5px] tracking-[0.04em] text-[#5f78a0]">
        ※ Google Gemini も画像生成で連携（現在は OpenAI を主に使用）。
      </p>
    </section>
  );
}

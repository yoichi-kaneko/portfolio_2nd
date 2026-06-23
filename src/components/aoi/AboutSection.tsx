import { SECTION, SECTION_LABEL, H2, LEAD_P } from "@/config/aoi";

export function AboutSection() {
  return (
    <section
      id="about"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[64px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 01 — WHAT IS THIS"}</div>
      <h2 className={H2}>これは、何なのか</h2>
      <p className={`${LEAD_P} m-0 mb-[34px] max-w-[640px]`}>
        碧衣は、2つのレイヤーで捉えると分かりやすい存在です。表向きは登山に寄り添う
        AI。けれど、その下には「人間の活動そのもの」を扱う、もっと汎用的な仕組みが流れています。
      </p>
      <div className="grid grid-cols-2 gap-[22px]">
        <div className="relative rounded-[18px] border border-[rgba(127,212,255,0.20)] bg-[linear-gradient(160deg,rgba(22,34,58,0.6),rgba(14,22,40,0.6))] p-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[8px]">
          <div className="mb-[12px] font-space text-[10px] tracking-[0.18em] text-[#7fd4ff]">
            UPPER LAYER ／ 運用目的
          </div>
          <h3 className="m-0 mb-[12px] font-zen text-[23px] font-black text-[#eaf5ff]">
            登山アシスタント AI
          </h3>
          <p className="m-0 text-[13.5px] leading-[1.85] text-[#9db1cf] text-pretty">
            登山計画・登山中・下山後のサポートを通じて、ユーザーの山行体験を支える。空の機嫌から現地のコンディションを推し量り、歩む道を健やかに整える役割。
          </p>
        </div>
        <div className="relative rounded-[18px] border border-[rgba(179,160,255,0.26)] bg-[linear-gradient(160deg,rgba(34,28,62,0.62),rgba(18,16,38,0.62))] p-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[8px]">
          <div className="mb-[12px] font-space text-[10px] tracking-[0.18em] text-[#c6b8ff]">
            LOWER LAYER ／ 設計思想
          </div>
          <h3 className="m-0 mb-[12px] font-zen text-[23px] font-black text-[#f0eaff]">
            アクティビティ駆動フレームワーク
          </h3>
          <p className="m-0 text-[13.5px] leading-[1.85] text-[#b6abd4] text-pretty">
            スケジュールや行動履歴といった「アクティビティ情報」を収集・解析し、それに基づいて自律的に動く仕組み。登山はあくまで最初の応用先で、土台はもっと広い。
          </p>
        </div>
      </div>
    </section>
  );
}

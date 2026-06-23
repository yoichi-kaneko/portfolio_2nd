import Image from "next/image";
import { H2, LEAD_P, SECTION, SECTION_LABEL } from "@/config/aoi";

// 後ほど動的に表示を切り替える予定。現状は仮画像（thumbnail.png）を 3 枚横並びに置くだけ。
export function GenerateImageSection() {
  return (
    <section
      id="generate-image"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 07 — GENERATE IMAGE"}</div>
      <h2 className={H2}>画像生成</h2>
      <p className={`${LEAD_P} m-0 mb-[30px] max-w-[620px]`}>
        毎日、その日のアクティビティに応じた情景の画像を生成します。
      </p>
      <div className="grid grid-cols-3 gap-[18px]">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-[16px] border border-[rgba(127,212,255,0.22)] bg-[#0c1426]"
          >
            <Image
              src="/aoi/thumbnail.png"
              alt=""
              fill
              sizes="380px, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

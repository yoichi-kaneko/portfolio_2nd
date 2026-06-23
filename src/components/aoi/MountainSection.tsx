import Image from "next/image";
import { SECTION, SECTION_LABEL, H2 } from "@/config/aoi";
import { MOUNTAIN_FEATURES } from "@/data/aoi/mountainFeatures";

export function MountainSection() {
  return (
    <section
      id="mountain"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 04 — MOUNTAIN & WEATHER"}</div>
      <div className="grid grid-cols-[0.92fr_1.08fr] items-center gap-[40px]">
        <div className="relative h-[340px] overflow-hidden rounded-[18px] border border-[rgba(127,212,255,0.24)] shadow-[0_36px_80px_-42px_rgba(0,0,0,0.9)]">
          <Image
            src="/aoi/outfit_b.png"
            alt="碧衣 登山装備の設定資料"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover object-[18%_30%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,28,0.0)_60%,rgba(8,12,22,0.6)_100%)]" />
          <div className="absolute bottom-[12px] left-[14px] rounded-[7px] border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.55)] px-[9px] py-[5px] font-space text-[10px] tracking-[0.14em] text-[#9fd9ff]">
            OUTFIT_B — 登山装備
          </div>
        </div>
        <div>
          <h2 className={`${H2} mb-[14px]`}>
            登山と天気に、<span className="text-[#8fd2ff]">強い</span>。
          </h2>
          <p className="m-0 mb-[22px] text-[14.5px] leading-[1.9] text-[#93a6c4] text-pretty">
            碧衣は、登山と空の機嫌を強く結び付けて見守る性質を持っています。山行のある日は専用のモードが立ち上がり、天気予報からコンディションを推し量って、入山前から下山後まで言葉を添えます。
          </p>
          <div className="flex flex-col gap-[12px]">
            {MOUNTAIN_FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-[14px] rounded-[13px] border border-[rgba(127,212,255,0.18)] bg-[rgba(18,30,50,0.5)] px-[16px] py-[15px]"
              >
                <span className="text-[20px] leading-[1.2]">{f.icon}</span>
                <div>
                  <div className="mb-[3px] text-[14px] font-bold text-[#dcebfb]">
                    {f.title}
                  </div>
                  <div className="text-[12.5px] leading-[1.7] text-[#93a6c4] text-pretty">
                    {f.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

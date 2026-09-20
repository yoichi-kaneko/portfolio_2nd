import Image from "next/image";
import { SECTION, SCROLL_MT, SECTION_LABEL, H2, LEAD_P } from "@/config/aoi";
import {
  STICKER_ILLUSTRATION,
  STICKER_QR,
  STICKER_STORE_URL,
} from "@/data/aoi/lineSticker";

/** 挿絵の枠。元画像（1440×960）と同じ 3:2 にし、上下左右を欠けずに収める。 */
const FRAME =
  "relative aspect-[3/2] overflow-hidden rounded-[18px] border border-[rgba(127,212,255,0.22)] bg-[#0c1426]";

/**
 * LINE スタンプのセクション。
 *
 * 挿絵と QR コードを横並びに置く。QR コードは販売ページ URL から生成した
 * 静的画像で、画像自体も販売ページへのリンクにしている。
 */
export function LineStickerSection() {
  const { src, alt } = STICKER_ILLUSTRATION;

  return (
    <section
      id="line-sticker"
      className={`${SECTION} ${SCROLL_MT} px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 08 — LINE STICKERS"}</div>
      <h2 className={H2}>LINE スタンプ</h2>
      <p className={`${LEAD_P} m-0 mb-[30px] max-w-[640px]`}>
        碧衣たちの LINE スタンプを作り、LINE STORE
        で販売しています。登山の合図、空模様の便り、そして日々の相づち。碧衣・ルリ・蛍・漆の全
        32
        種で、碧衣が毎日届けてくれる言葉を、今度はこちらから送れるようにしました。
      </p>
      <div className="grid grid-cols-1 gap-[22px] lg:grid-cols-[1.32fr_0.68fr]">
        {/* 挿絵 */}
        <div className={FRAME}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover object-center"
          />
        </div>

        {/* 販売ページへの QR コード */}
        <div className="flex flex-col items-center justify-center gap-[16px] rounded-[18px] border border-[rgba(127,216,192,0.24)] bg-[linear-gradient(160deg,rgba(20,44,44,0.55),rgba(12,20,32,0.65))] px-[24px] py-[26px]">
          <a
            href={STICKER_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LINE STORE の販売ページを開く"
            className="rounded-[14px] bg-white p-[12px] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] transition-transform hover:scale-[1.03]"
          >
            <Image
              src={STICKER_QR.src}
              alt={STICKER_QR.alt}
              width={STICKER_QR.size}
              height={STICKER_QR.size}
              sizes="200px"
              className="h-auto w-[176px]"
            />
          </a>
          <div className="text-center">
            <div className="font-space text-[10px] tracking-[0.2em] text-[#7fd8c0]">
              LINE STORE
            </div>
            <p className="m-0 mt-[6px] text-[12.5px] leading-[1.8] text-[#93a6c4] text-pretty">
              カメラで読み取るか、QR コードをタップすると販売ページが開きます。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

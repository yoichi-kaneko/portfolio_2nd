import Image from "next/image";
import { LiveModeWidget } from "@/components/aoi/LiveModeWidget";

export function AoiHero() {
  return (
    <section className="relative z-[2] mx-auto grid max-w-[1180px] grid-cols-[1.04fr_0.96fr] items-center gap-[46px] px-[40px] pt-[64px] pb-[36px]">
      <div>
        <div className="mb-[24px] inline-flex items-center gap-[9px] rounded-full border border-[rgba(179,160,255,0.34)] bg-[rgba(70,60,120,0.18)] px-[13px] py-[6px]">
          <span className="font-space text-[10.5px] tracking-[0.2em] text-[#c6b8ff]">
            PERSONAL PROJECT
          </span>
          <span className="h-[4px] w-[4px] rounded-full bg-[#8b7fd6]" />
          <span className="text-[11px] text-[#bcaee8]">非売品・個人用途</span>
        </div>
        <h1 className="m-0 mb-[8px] font-zen text-[64px] font-black leading-[1.04] tracking-[0.01em] text-[#f1f7fd]">
          碧衣
          <span className="ml-[14px] text-[26px] font-bold tracking-[0.04em] text-[#8fd2ff]">
            あおい
          </span>
        </h1>
        <p className="m-0 mb-[20px] font-zen text-[21px] font-bold leading-[1.5] text-[#bcd2ec] text-pretty">
          登山アシスタント AI。
          <br />
          その根っこは、
          <span className="text-[#8fd2ff]">
            アクティビティ駆動フレームワーク
          </span>
          。
        </p>
        <p className="m-0 mb-[30px] max-w-[480px] text-[15px] leading-[1.95] text-[#93a6c4] text-pretty">
          予定・行動の記録・空の機嫌を静かに読み解いて、一日の始まりと終わりに、LINE
          でそっと言葉を届ける。知的で落ち着いた、夜景の見える高層階の住人。—
          そんな相棒を、個人の趣味で勝手に育てています。
        </p>
        <div className="flex flex-wrap gap-[14px]">
          <a
            href="#framework"
            className="inline-flex items-center gap-[8px] rounded-[11px] bg-[linear-gradient(135deg,#5fb6f0,#6f8cf0)] px-[22px] py-[13px] text-[14px] font-bold text-[#06101f] shadow-[0_14px_34px_-14px_rgba(95,182,240,0.8)] hover:brightness-[1.08]"
          >
            ✦ 仕組みを見る
          </a>
          <a
            href="#cast"
            className="inline-flex items-center gap-[8px] rounded-[11px] border border-[rgba(127,212,255,0.30)] bg-[rgba(127,212,255,0.06)] px-[22px] py-[13px] text-[14px] font-bold text-[#cfe6ff] hover:bg-[rgba(127,212,255,0.14)]"
          >
            登場人物を見る
          </a>
        </div>
        <div className="mt-[34px] flex gap-[30px]">
          <div>
            <div className="font-space text-[26px] font-bold text-[#9fd9ff]">
              15+
            </div>
            <div className="text-[11.5px] tracking-[0.04em] text-[#7e90ad]">
              連携サービス
            </div>
          </div>
          <div className="w-px bg-[rgba(127,212,255,0.14)]" />
          <div>
            <div className="font-space text-[26px] font-bold text-[#9fd9ff]">
              6
            </div>
            <div className="text-[11.5px] tracking-[0.04em] text-[#7e90ad]">
              実行モード
            </div>
          </div>
          <div className="w-px bg-[rgba(127,212,255,0.14)]" />
          <div>
            <div className="font-space text-[26px] font-bold text-[#9fd9ff]">
              1
            </div>
            <div className="text-[11.5px] tracking-[0.04em] text-[#7e90ad]">
              人で制作中
            </div>
          </div>
        </div>
      </div>

      {/* hero visual */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-[18px] border border-[rgba(127,212,255,0.28)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(127,212,255,0.06),inset_0_1px_0_rgba(255,255,255,0.05)] [transform:perspective(1400px)_rotateY(-5deg)_rotateX(2deg)]">
          <Image
            src="/aoi/room.png"
            alt="碧衣のプライベートルーム"
            width={1536}
            height={1024}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="block h-auto w-full"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,28,0.0)_55%,rgba(8,12,22,0.55)_100%)]" />
          <div className="absolute top-[12px] left-[14px] flex items-center gap-[7px] rounded-[7px] border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.55)] px-[9px] py-[5px] font-space text-[10px] tracking-[0.16em] text-[#9fd9ff] backdrop-blur-[4px]">
            <span className="h-[6px] w-[6px] animate-[aoiGlow_1.6s_infinite] rounded-full bg-[#65e6a8] shadow-[0_0_8px_#65e6a8]" />
            ROOM.PNG — 碧衣の部屋
          </div>
        </div>

        {/* live mode widget */}
        <LiveModeWidget />

        {/* ruri star deco */}
        <div className="absolute top-[-22px] right-[-10px] animate-[aoiFloat_5s_ease-in-out_infinite] text-[30px] text-[#8fdcff] [text-shadow:0_0_18px_rgba(127,212,255,0.8)]">
          ✧
        </div>
      </div>
    </section>
  );
}

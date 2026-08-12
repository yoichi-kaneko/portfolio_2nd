import { TimeTravelProvider } from "@/components/aoi/TimeTravelProvider";
import { RoomImage } from "@/components/aoi/RoomImage";
import { SkyTintOverlay } from "@/components/aoi/SkyTintOverlay";
import { LiveModeWidget } from "@/components/aoi/LiveModeWidget";
import { TimeTravelTickets } from "@/components/aoi/TimeTravelTickets";

export function AoiHero() {
  return (
    <section className="relative z-[2] mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-[46px] px-[24px] pt-[64px] pb-[36px] lg:grid-cols-[1.04fr_0.96fr] lg:px-[40px]">
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
              8
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

      {/* hero visual — 時間旅行きっぷの状態はこのカラム内だけで完結する */}
      <TimeTravelProvider>
        <div>
          {/* 画像フレームとウィジェットの位置基準はこのラッパー。
              切符を外に置くことで、ウィジェットが画像の左下に張り付いたままになる */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[18px] border border-[rgba(127,212,255,0.28)] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(127,212,255,0.06),inset_0_1px_0_rgba(255,255,255,0.05)] [transform:perspective(1400px)_rotateY(-5deg)_rotateX(2deg)]">
              <RoomImage />
              <SkyTintOverlay />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,28,0.0)_55%,rgba(8,12,22,0.55)_100%)]" />
            </div>

            {/* live mode widget */}
            <LiveModeWidget />

            {/* ruri star deco */}
            <div className="absolute top-[-22px] right-[-10px] animate-[aoi-float_5s_ease-in-out_infinite] text-[30px] text-[#8fdcff] [text-shadow:0_0_18px_rgba(127,212,255,0.8)]">
              ✧
            </div>
          </div>

          {/* time travel tickets */}
          <TimeTravelTickets />
        </div>
      </TimeTravelProvider>
    </section>
  );
}

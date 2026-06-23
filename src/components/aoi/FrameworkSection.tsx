import { SECTION, SECTION_LABEL, H2, LEAD_P } from "@/config/aoi";

// 収集 / 出力ステップで列挙するチップ（このセクション専用なのでローカルに保持）。
const COLLECT_ITEMS = [
  "📅 Google カレンダーの予定",
  "✓ Todoist のタスク",
  "📍 Swarm のチェックイン",
  "⛰ YAMAP の活動記録",
  "☂ OpenWeatherMap の天気",
];

const OUTPUT_ITEMS = [
  "💬 テキストメッセージ",
  "🖼 その日の情景を描いた画像",
  "🎵 一週間から綴る楽曲",
];

export function FrameworkSection() {
  return (
    <section
      id="framework"
      className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
    >
      <div className={SECTION_LABEL}>{"// 02 — ACTIVITY-DRIVEN FRAMEWORK"}</div>
      <h2 className={H2}>
        アクティビティ駆動
        <span className="text-[#8fd2ff]">フレームワーク</span>
      </h2>
      <p className={`${LEAD_P} m-0 mb-[14px] max-w-[680px]`}>
        受け身のチャットボットではなく、
        <span className="text-[#bcd2ec]">一日の時間軸やイベントの発生</span>
        （登山開始・下山など）をトリガーに、自律的に動く。データ収集 → 解析 →
        出力 までを、ひとつの「仕組み」として備えています。
      </p>

      <div className="mt-[30px] grid grid-cols-1 gap-[12px] md:grid-cols-3 md:gap-[14px]">
        {/* collect */}
        <div className="rounded-[16px] border border-[rgba(109,180,230,0.28)] bg-[linear-gradient(160deg,rgba(20,38,58,0.6),rgba(12,22,38,0.6))] px-[22px] py-[24px]">
          <div className="mb-[6px] font-space text-[10px] tracking-[0.16em] text-[#6db4e6]">
            STEP 01 ／ 収集
          </div>
          <h3 className="m-0 mb-[14px] font-zen text-[18px] font-black text-[#eaf5ff]">
            アクティビティを集める
          </h3>
          <div className="flex flex-col gap-[8px]">
            {COLLECT_ITEMS.map((t) => (
              <span
                key={t}
                className="rounded-[8px] border border-[rgba(109,180,230,0.16)] bg-[rgba(109,180,230,0.08)] px-[11px] py-[7px] text-[12.5px] text-[#a7bdd9]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden items-center justify-center px-[14px] text-[26px] text-[#5fa8e0] md:flex">
          →
        </div>
        {/* analyze */}
        <div className="rounded-[16px] border border-[rgba(179,160,255,0.30)] bg-[linear-gradient(160deg,rgba(34,28,62,0.62),rgba(18,16,38,0.62))] px-[22px] py-[24px]">
          <div className="mb-[6px] font-space text-[10px] tracking-[0.16em] text-[#c6b8ff]">
            STEP 02 ／ 解析
          </div>
          <h3 className="m-0 mb-[14px] font-zen text-[18px] font-black text-[#f0eaff]">
            人格をもって読み解く
          </h3>
          <p className="m-0 mb-[12px] text-[12.5px] leading-[1.8] text-[#b6abd4] text-pretty">
            集めた情報を、ペルソナを持つエージェント「碧衣」が解釈。移動距離や予定の性質から
            <span className="text-[#d8ccff]">「明日の重要度」</span>
            まで推し量る。
          </p>
          <div className="rounded-[8px] border border-[rgba(179,160,255,0.18)] bg-[rgba(179,160,255,0.08)] px-[11px] py-[9px] text-[11.5px] leading-[1.6] text-[#9a8fc4]">
            🔥 Firestore でモード間を引き継ぎ。前日の夜から翌朝へ、
            <span className="text-[#cabbf2]">日跨ぎ</span>
            でコンテキストを渡す。
          </div>
        </div>
        <div className="hidden items-center justify-center px-[14px] text-[26px] text-[#5fa8e0] md:flex">
          →
        </div>
        {/* output */}
        <div className="rounded-[16px] border border-[rgba(127,216,192,0.28)] bg-[linear-gradient(160deg,rgba(20,44,46,0.6),rgba(12,26,30,0.6))] px-[22px] py-[24px]">
          <div className="mb-[6px] font-space text-[10px] tracking-[0.16em] text-[#7fd8c0]">
            STEP 03 ／ 出力
          </div>
          <h3 className="m-0 mb-[14px] font-zen text-[18px] font-black text-[#eafff8]">
            言葉・絵・歌で還す
          </h3>
          <div className="flex flex-col gap-[8px]">
            {OUTPUT_ITEMS.map((t) => (
              <span
                key={t}
                className="rounded-[8px] border border-[rgba(127,216,192,0.16)] bg-[rgba(127,216,192,0.08)] px-[11px] py-[7px] text-[12.5px] text-[#a7d9cd]"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-[12px] text-right font-space text-[10px] tracking-[0.1em] text-[#6fb8a8]">
            → LINE へ届く
          </div>
        </div>
      </div>
    </section>
  );
}

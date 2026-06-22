"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * `item/碧衣の説明ページ/碧衣の説明ページ.dc.html` からの移植ページ。
 * インラインスタイルは Tailwind ユーティリティへ、画像は next/image、フォントは next/font（layout 側）に移行済み。
 * 複雑なグラデーション等は Tailwind の任意値（arbitrary value）で表現している。
 */

// ---- starfield（位置・色・点滅は固定値なので静的クラスで列挙） ----
const STARS = [
  "top-[8%] left-[14%] text-[#bfe6ff] text-[13px] animate-[aoiTwinkle_3.4s_ease-in-out_infinite]",
  "top-[18%] left-[62%] text-[#9fd4ff] text-[9px] animate-[aoiTwinkle_4.1s_ease-in-out_infinite_.6s]",
  "top-[12%] left-[88%] text-[#cfe6ff] text-[11px] animate-[aoiTwinkle_2.9s_ease-in-out_infinite_1.2s]",
  "top-[34%] left-[6%] text-[#a9dcff] text-[8px] animate-[aoiTwinkle_3.7s_ease-in-out_infinite_.3s]",
  "top-[46%] left-[46%] text-[#bfe6ff] text-[7px] animate-[aoiTwinkle_4.6s_ease-in-out_infinite_.9s]",
  "top-[58%] left-[80%] text-[#9fd4ff] text-[10px] animate-[aoiTwinkle_3.1s_ease-in-out_infinite_1.6s]",
  "top-[66%] left-[22%] text-[#cfeaff] text-[9px] animate-[aoiTwinkle_3.9s_ease-in-out_infinite_.5s]",
  "top-[74%] left-[54%] text-[#a9dcff] text-[7px] animate-[aoiTwinkle_4.3s_ease-in-out_infinite_1.1s]",
  "top-[84%] left-[90%] text-[#bfe6ff] text-[10px] animate-[aoiTwinkle_3.3s_ease-in-out_infinite_.8s]",
  "top-[88%] left-[34%] text-[#9fd4ff] text-[8px] animate-[aoiTwinkle_4.0s_ease-in-out_infinite_1.4s]",
  "top-[26%] left-[30%] text-[#e7f4ff] text-[6px] animate-[aoiTwinkle_2.7s_ease-in-out_infinite_.2s]",
  "top-[52%] left-[14%] text-[#cfeaff] text-[6px] animate-[aoiTwinkle_3.6s_ease-in-out_infinite_1.9s]",
];

// ---- integrations ----
type SvcColor = "blue" | "teal" | "purple";
const SERVICES: Array<{ name: string; desc: string; color: SvcColor }> = [
  {
    name: "LINE Messaging API",
    desc: "メッセージ・画像・音声の送受信と Webhook 取り込み",
    color: "teal",
  },
  {
    name: "Google Calendar",
    desc: "スケジュールの読み込み。情報収集の中核",
    color: "blue",
  },
  {
    name: "Google Drive",
    desc: "予定に添付されたファイルの取得",
    color: "blue",
  },
  {
    name: "Todoist",
    desc: "TODO タスクの読み込み・作成・コメント取得",
    color: "blue",
  },
  {
    name: "Swarm",
    desc: "チェックイン履歴から行動の足取りを読む",
    color: "blue",
  },
  {
    name: "YAMAP",
    desc: "登山計画・活動記録のスクレイピング取得",
    color: "blue",
  },
  {
    name: "OpenWeatherMap",
    desc: "地点名・住所から天気予報を取得",
    color: "blue",
  },
  {
    name: "Google Maps",
    desc: "住所・地点名のジオコーディング",
    color: "blue",
  },
  { name: "OpenAI", desc: "碧衣のキャラクターに沿った画像生成", color: "teal" },
  { name: "Mureka", desc: "歌詞の生成と作曲。週に一度の一曲", color: "teal" },
  {
    name: "Cloudinary",
    desc: "画像・音声を公開 URL としてホスティング",
    color: "teal",
  },
  {
    name: "Firebase / Firestore",
    desc: "メモ・記録の保存とモード間の引き継ぎ",
    color: "purple",
  },
  {
    name: "AWS Systems Manager",
    desc: "Cloud Functions から EC2 の処理を起動",
    color: "purple",
  },
  {
    name: "Fetch MCP Server",
    desc: "Web ページを取得する MCP ツール",
    color: "purple",
  },
];

// 各色のカード枠線・ホバー・ドット色（完全なクラス文字列リテラルなので Tailwind がスキャンできる）
const SVC_STYLES: Record<SvcColor, { card: string; dot: string }> = {
  blue: {
    card: "border-[rgba(109,180,230,0.22)] hover:border-[rgba(109,180,230,0.5)] hover:bg-[rgba(22,36,52,0.6)]",
    dot: "bg-[#6db4e6]",
  },
  teal: {
    card: "border-[rgba(127,216,192,0.22)] hover:border-[rgba(127,216,192,0.5)] hover:bg-[rgba(22,36,52,0.6)]",
    dot: "bg-[#7fd8c0]",
  },
  purple: {
    card: "border-[rgba(179,160,255,0.22)] hover:border-[rgba(179,160,255,0.5)] hover:bg-[rgba(28,30,52,0.6)]",
    dot: "bg-[#b3a0ff]",
  },
};

// ---- daily modes ----
const MODES: Array<{
  jp: string;
  yomi: string;
  en: string;
  time: string;
  desc: string;
  card: string;
  name: string;
  yomiCls: string;
  monoCls: string;
  timeCls: string;
}> = [
  {
    jp: "暁",
    yomi: "あかつき",
    en: "morning",
    time: "☀ 朝",
    desc: "前日の振り返りを受け取り、今日と明日の予定を確認。タスクを整え、天気を読み、一日の出発を導く。",
    card: "bg-[linear-gradient(165deg,rgba(40,40,30,0.42),rgba(16,20,34,0.55))] border-[rgba(230,200,130,0.24)]",
    name: "text-[#f3ead2]",
    yomiCls: "text-[#c9b68a]",
    monoCls: "text-[#c9b68a]",
    timeCls: "text-[#a89a78]",
  },
  {
    jp: "望",
    yomi: "のぞみ",
    en: "noon",
    time: "☁ 昼（13:30 頃）",
    desc: "近日の登山計画を起点に、山中・計画中・平穏を判定。今の状況に合う、短く静かな言葉をひとつ。",
    card: "bg-[linear-gradient(165deg,rgba(30,42,52,0.5),rgba(16,20,34,0.55))] border-[rgba(127,200,230,0.24)]",
    name: "text-[#dceefb]",
    yomiCls: "text-[#8fb6cf]",
    monoCls: "text-[#8fb6cf]",
    timeCls: "text-[#7d99ac]",
  },
  {
    jp: "小夜",
    yomi: "さよ",
    en: "night",
    time: "☾ 夜",
    desc: "一日の振り返りと記録から、夜の報告と一枚の画像を生成。翌朝の暁へ、日跨ぎで引き継ぐ。",
    card: "bg-[linear-gradient(165deg,rgba(26,30,58,0.55),rgba(14,16,32,0.6))] border-[rgba(150,150,230,0.26)]",
    name: "text-[#e6e2fb]",
    yomiCls: "text-[#a9a4d6]",
    monoCls: "text-[#a9a4d6]",
    timeCls: "text-[#8983b8]",
  },
  {
    jp: "門灯",
    yomi: "もんとう",
    en: "up_mountain",
    time: "🏮 登山日・入山直前",
    desc: "登山計画と天気を集め、家族 LINE グループへ登山開始を通知する特別モード。ユーザー個人へは送らない。",
    card: "bg-[linear-gradient(165deg,rgba(36,30,24,0.5),rgba(16,18,30,0.55))] border-[rgba(220,160,110,0.26)]",
    name: "text-[#f3dcc6]",
    yomiCls: "text-[#d0a888]",
    monoCls: "text-[#d0a888]",
    timeCls: "text-[#b08e72]",
  },
  {
    jp: "帰灯",
    yomi: "きとう",
    en: "off_mountain",
    time: "🏮 登山日・下山直後",
    desc: "山行を振り返り、無事の下山を確かめる言葉を届ける。画像を添えて、ユーザーと家族グループへ。",
    card: "bg-[linear-gradient(165deg,rgba(24,40,38,0.5),rgba(14,20,28,0.55))] border-[rgba(127,216,192,0.26)]",
    name: "text-[#d6f3e8]",
    yomiCls: "text-[#8fcdb8]",
    monoCls: "text-[#8fcdb8]",
    timeCls: "text-[#73a392]",
  },
  {
    jp: "調べ",
    yomi: "しらべ",
    en: "song",
    time: "🎵 週に一度",
    desc: "一週間の出来事・場所・天気からインスピレーションを受け、碧衣がプライベートに一曲を綴って届ける。",
    card: "bg-[linear-gradient(165deg,rgba(34,26,50,0.5),rgba(16,16,30,0.55))] border-[rgba(190,160,230,0.26)]",
    name: "text-[#ecdcf6]",
    yomiCls: "text-[#bb9fd6]",
    monoCls: "text-[#bb9fd6]",
    timeCls: "text-[#9a82b8]",
  },
];

// ---- mountain features ----
const MOUNTAIN_FEATURES = [
  {
    icon: "🪶",
    title: "ルリが、数日先の空を偵察",
    body: "相棒の妖精ルリは「先遣観測員」。尾羽の星を数日後の空の座標と共鳴させ、少し先の現地の様子を覗いてきます。— あくまで「可能性の偵察」。外れることもあります。",
  },
  {
    icon: "🏮",
    title: "門灯・帰灯 — 入山と下山の灯り",
    body: "「登山開始」「下山」の一言が、LINE Webhook 経由でモードを起動。入山直前には家族グループへ通知し、下山直後には山行を振り返って無事を確かめます。",
  },
  {
    icon: "☁",
    title: "空模様から、コンディションを推察",
    body: "天気が芳しくない日は、窓越しに空を見上げ、地図を広げて思案する。多少の推し量りの誤りより、日常に彩りと安心を添える姿勢を優先します。",
  },
];

// 繰り返し使うクラス
const SECTION = "relative z-[2] mx-auto max-w-[1180px]";
const SECTION_LABEL =
  "mb-[12px] font-space text-[11px] tracking-[0.22em] text-[#6db4e6]";
const H2 = "m-0 mb-[10px] font-zen font-black text-[36px] text-[#eef5fc]";
const LEAD_P = "text-[15px] leading-[1.9] text-[#90a4c2] text-pretty";
const PAGE_BG =
  "bg-[radial-gradient(1200px_700px_at_78%_-8%,rgba(40,86,150,0.42),transparent_60%),radial-gradient(900px_600px_at_12%_18%,rgba(58,52,128,0.30),transparent_60%),linear-gradient(180deg,#0a1124_0%,#080c18_45%,#070a13_100%)]";

export default function AoiPage() {
  const [now, setNow] = useState<Date | null>(null);
  const [night, setNight] = useState(true); // startInNightMode default

  useEffect(() => {
    // マウント後にクライアント側の時刻を反映する（SSR とのハイドレーション不一致を避けるため初期値は null）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleNight = () => setNight((v) => !v);

  // ---- renderVals 相当 ----
  let clock = "--:--:--";
  let modeJp = "暁";
  let modeYomi = "あかつき";
  let modeLine =
    "おはようございます。今日の空と予定を、私の方で整えておきました。";
  let dateStr = "";

  if (now) {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const get = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
    let hh = get("hour");
    if (hh === "24") hh = "00";
    const mm = get("minute");
    const ss = get("second");
    const hourNum = parseInt(hh, 10);

    if (hourNum >= 4 && hourNum < 11) {
      modeJp = "暁";
      modeYomi = "あかつき";
      modeLine =
        "おはようございます。今日の空と予定を、私の方で整えておきました。";
    } else if (hourNum >= 11 && hourNum < 16) {
      modeJp = "望";
      modeYomi = "のぞみ";
      modeLine = "お昼ですね。今のあなたに、短い言葉をひとつだけ。";
    } else {
      modeJp = "小夜";
      modeYomi = "さよ";
      modeLine =
        "一日、おつかれさまでした。今日の景色を、一枚だけ残しておきます。";
    }

    clock = `${hh}:${mm}:${ss}`;
    dateStr = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(now);
  }

  const nightLabel = night ? "灯りをつける" : "灯りを落とす";

  return (
    <div
      className={`aoi-root relative min-h-screen w-full overflow-hidden font-noto text-[#dce7f5] ${PAGE_BG}`}
    >
      {/* starfield */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {STARS.map((cls, i) => (
          <span key={i} className={`absolute ${cls}`}>
            ✦
          </span>
        ))}
      </div>

      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[linear-gradient(180deg,rgba(8,12,22,0.92),rgba(8,12,22,0.0))] px-[40px] py-[14px] backdrop-blur-[10px]">
        <div className="flex items-center gap-[12px]">
          <span className="animate-[aoiGlow_3s_ease-in-out_infinite] text-[18px] text-[#8fdcff] [text-shadow:0_0_14px_rgba(127,212,255,0.7)]">
            ✦
          </span>
          <span className="font-zen text-[19px] font-black tracking-[0.05em] text-[#eaf3fb]">
            碧衣
          </span>
          <span className="font-space text-[11px] font-bold tracking-[0.28em] text-[#6db4e6]">
            AOI
          </span>
        </div>
        <nav className="flex items-center gap-[24px]">
          <a
            href="#about"
            className="text-[13px] text-[#9fb2cc] transition-colors hover:text-[#cfe6ff]"
          >
            これは何か
          </a>
          <a
            href="#framework"
            className="text-[13px] text-[#9fb2cc] transition-colors hover:text-[#cfe6ff]"
          >
            フレームワーク
          </a>
          <a
            href="#services"
            className="text-[13px] text-[#9fb2cc] transition-colors hover:text-[#cfe6ff]"
          >
            連携
          </a>
          <a
            href="#mountain"
            className="text-[13px] text-[#9fb2cc] transition-colors hover:text-[#cfe6ff]"
          >
            登山×天気
          </a>
          <a
            href="#cast"
            className="text-[13px] text-[#9fb2cc] transition-colors hover:text-[#cfe6ff]"
          >
            登場人物
          </a>
          <button
            onClick={toggleNight}
            className="cursor-pointer rounded-full border border-[rgba(127,212,255,0.32)] bg-[rgba(127,212,255,0.08)] px-[14px] py-[7px] font-space text-[11px] tracking-[0.14em] text-[#bfe0ff] hover:bg-[rgba(127,212,255,0.18)]"
          >
            ☾ {nightLabel}
          </button>
        </nav>
      </header>

      {/* ============ HERO ============ */}
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

          {/* live mode widget (showModeClock = true) */}
          <div className="absolute bottom-[-26px] left-[-18px] w-[248px] rounded-[15px] border border-[rgba(127,212,255,0.32)] bg-[linear-gradient(160deg,rgba(20,32,56,0.94),rgba(12,20,38,0.94))] px-[18px] py-[16px] shadow-[0_26px_60px_-28px_rgba(0,0,0,0.9)] backdrop-blur-[12px]">
            <div className="mb-[10px] flex items-center justify-between">
              <span className="font-space text-[9.5px] tracking-[0.18em] text-[#6db4e6]">
                {"// ただいまの判定モード"}
              </span>
              <span className="h-[6px] w-[6px] animate-[aoiGlow_1.8s_infinite] rounded-full bg-[#7fd4ff] shadow-[0_0_8px_#7fd4ff]" />
            </div>
            <div className="flex items-baseline gap-[10px]">
              <span className="font-zen text-[30px] font-black leading-none text-[#eaf5ff]">
                {modeJp}
              </span>
              <span className="text-[12px] text-[#8aa0c0]">{modeYomi}</span>
              <span className="ml-auto font-space text-[17px] font-bold tracking-[0.04em] text-[#9fd9ff]">
                {clock}
              </span>
            </div>
            <div className="mt-[9px] text-[11.5px] leading-[1.6] text-[#9db1cf] text-pretty">
              {modeLine}
            </div>
            <div className="mt-[8px] font-space text-[9px] tracking-[0.08em] text-[#5f78a0]">
              JST {dateStr}
            </div>
          </div>

          {/* ruri star deco */}
          <div className="absolute top-[-22px] right-[-10px] animate-[aoiFloat_5s_ease-in-out_infinite] text-[30px] text-[#8fdcff] [text-shadow:0_0_18px_rgba(127,212,255,0.8)]">
            ✧
          </div>
        </div>
      </section>

      {/* ============ ABOUT / 二層モデル ============ */}
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

      {/* ============ FRAMEWORK ============ */}
      <section
        id="framework"
        className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
      >
        <div className={SECTION_LABEL}>
          {"// 02 — ACTIVITY-DRIVEN FRAMEWORK"}
        </div>
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

        <div className="mt-[30px] grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-0">
          {/* collect */}
          <div className="rounded-[16px] border border-[rgba(109,180,230,0.28)] bg-[linear-gradient(160deg,rgba(20,38,58,0.6),rgba(12,22,38,0.6))] px-[22px] py-[24px]">
            <div className="mb-[6px] font-space text-[10px] tracking-[0.16em] text-[#6db4e6]">
              STEP 01 ／ 収集
            </div>
            <h3 className="m-0 mb-[14px] font-zen text-[18px] font-black text-[#eaf5ff]">
              アクティビティを集める
            </h3>
            <div className="flex flex-col gap-[8px]">
              {[
                "📅 Google カレンダーの予定",
                "✓ Todoist のタスク",
                "📍 Swarm のチェックイン",
                "⛰ YAMAP の活動記録",
                "☂ OpenWeatherMap の天気",
              ].map((t) => (
                <span
                  key={t}
                  className="rounded-[8px] border border-[rgba(109,180,230,0.16)] bg-[rgba(109,180,230,0.08)] px-[11px] py-[7px] text-[12.5px] text-[#a7bdd9]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center px-[14px] text-[26px] text-[#5fa8e0]">
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
          <div className="flex items-center justify-center px-[14px] text-[26px] text-[#5fa8e0]">
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
              {[
                "💬 テキストメッセージ",
                "🖼 その日の情景を描いた画像",
                "🎵 一週間から綴る楽曲",
              ].map((t) => (
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

      {/* ============ SERVICES ============ */}
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

      {/* ============ MOUNTAIN x WEATHER ============ */}
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

      {/* ============ DAILY FLOW / MODES ============ */}
      <section
        id="flow"
        className={`${SECTION} scroll-mt-[84px] px-[40px] pt-[60px] pb-[30px]`}
      >
        <div className={SECTION_LABEL}>{"// 05 — A DAY IN MODES"}</div>
        <h2 className={H2}>一日を、6つのモードで歩く</h2>
        <p className={`${LEAD_P} m-0 mb-[30px] max-w-[640px]`}>
          時間帯と状況に応じて、碧衣は表情を変えます。朝・昼・夜の定期モードに、登山と創作の特別モード。それぞれ和の名前を持っています。
        </p>
        <div className="grid grid-cols-3 gap-[16px]">
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

      {/* ============ CAST ============ */}
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
          {/* 碧衣 */}
          <div className="overflow-hidden rounded-[16px] border border-[rgba(127,212,255,0.22)] bg-[rgba(16,26,46,0.5)]">
            <div className="relative h-[230px] overflow-hidden bg-[#0c1426]">
              <Image
                src="/aoi/base.png"
                alt="碧衣 設定資料"
                fill
                sizes="(min-width: 768px) 380px, 100vw"
                className="object-cover object-[38%_22%]"
              />
              <div className="absolute top-[10px] left-[10px] rounded-[6px] border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.6)] px-[8px] py-[4px] font-space text-[9px] tracking-[0.12em] text-[#9fd9ff]">
                BASE.PNG
              </div>
            </div>
            <div className="p-[18px]">
              <div className="mb-[8px] flex items-baseline gap-[8px]">
                <span className="font-zen text-[21px] font-black text-[#eaf5ff]">
                  碧衣
                </span>
                <span className="text-[11px] text-[#8aa0c0]">あおい ／ 主</span>
              </div>
              <p className="m-0 text-[12.5px] leading-[1.8] text-[#93a6c4] text-pretty">
                水色の長い髪と瞳。星のモチーフがシグネチャー。知的で冷静、けれど優しい。文末に「！」は使わない、静かな話し方の主人公。
              </p>
            </div>
          </div>
          {/* ルリ */}
          <div className="overflow-hidden rounded-[16px] border border-[rgba(127,212,255,0.22)] bg-[rgba(16,26,46,0.5)]">
            <div className="relative h-[230px] overflow-hidden bg-[#0c1426]">
              <Image
                src="/aoi/ruri.png"
                alt="ルリ 設定資料"
                fill
                sizes="(min-width: 768px) 380px, 100vw"
                className="object-cover object-[8%_38%]"
              />
              <div className="absolute top-[10px] left-[10px] rounded-[6px] border border-[rgba(127,212,255,0.3)] bg-[rgba(8,14,28,0.6)] px-[8px] py-[4px] font-space text-[9px] tracking-[0.12em] text-[#9fd9ff]">
                RURI.PNG
              </div>
            </div>
            <div className="p-[18px]">
              <div className="mb-[8px] flex items-baseline gap-[8px]">
                <span className="font-zen text-[21px] font-black text-[#eaf5ff]">
                  ルリ
                </span>
                <span className="text-[11px] text-[#8aa0c0]">
                  先遣観測員 ／ 相棒
                </span>
              </div>
              <p className="m-0 text-[12.5px] leading-[1.8] text-[#93a6c4] text-pretty">
                アビエーターゴーグルとショルダーバッグの水色の小鳥。好奇心旺盛でやんちゃ。空から偵察し、現地の空気をカバンに詰めて持ち帰る。
              </p>
            </div>
          </div>
          {/* 蛍 */}
          <div className="overflow-hidden rounded-[16px] border border-[rgba(190,160,230,0.24)] bg-[rgba(16,26,46,0.5)]">
            <div className="relative h-[230px] overflow-hidden bg-[#0c1426]">
              <Image
                src="/aoi/hotaru.png"
                alt="蛍 設定資料"
                fill
                sizes="(min-width: 768px) 380px, 100vw"
                className="object-cover object-[6%_24%]"
              />
              <div className="absolute top-[10px] left-[10px] rounded-[6px] border border-[rgba(190,160,230,0.34)] bg-[rgba(8,14,28,0.6)] px-[8px] py-[4px] font-space text-[9px] tracking-[0.12em] text-[#d8c6ff]">
                HOTARU.PNG
              </div>
            </div>
            <div className="p-[18px]">
              <div className="mb-[8px] flex items-baseline gap-[8px]">
                <span className="font-zen text-[21px] font-black text-[#f0eaff]">
                  蛍
                </span>
                <span className="text-[11px] text-[#b6a8d6]">
                  ほたる ／ デジタルの友人
                </span>
              </div>
              <p className="m-0 text-[12.5px] leading-[1.8] text-[#a99fc4] text-pretty">
                ライムグリーンのツインテールとデジタルな瞳。表情豊かなサイバーポップ少女。碧衣の部屋にはホログラムで時折ふらりと現れる。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER / playful ============ */}
      <footer className={`${SECTION} px-[40px] pt-[54px] pb-[70px]`}>
        <div className="rounded-[20px] border border-[rgba(127,212,255,0.20)] bg-[linear-gradient(160deg,rgba(20,32,56,0.6),rgba(12,18,34,0.7))] px-[38px] py-[36px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="mb-[16px] flex items-center gap-[10px]">
            <span className="animate-[aoiGlow_3s_infinite] text-[16px] text-[#8fdcff]">
              ✦
            </span>
            <span className="font-space text-[10.5px] tracking-[0.2em] text-[#6db4e6]">
              PERSONAL · NON-COMMERCIAL · BUILT FOR FUN
            </span>
          </div>
          <p className="m-0 mb-[14px] font-zen text-[22px] font-bold leading-[1.6] text-[#dceafb] text-pretty">
            プロダクトとして売る予定は、ありません。
            <br />
            「こういうものを、個人で勝手に作っている」—
            ただ、それだけのページです。
          </p>
          <p className="m-0 mb-[22px] max-w-[620px] text-[13.5px] leading-[1.9] text-[#8aa0c0] text-pretty">
            採算も KPI
            も、ロードマップもありません。あるのは、夜景の見える部屋と、水色の相棒と、空の機嫌を読む小さな仕組みだけ。気が向いたときに、少しずつ育てています。
          </p>
          <div className="flex flex-wrap items-center justify-between gap-[16px] border-t border-[rgba(127,212,255,0.12)] pt-[20px]">
            <div className="font-zen text-[14px] italic text-[#9fb6d4]">
              「このページも、私の部屋の片隅から。」
              <span className="ml-[6px] text-[#7fd4ff]">— 碧衣</span>
            </div>
            <div className="flex items-center gap-[16px] font-space text-[11px] tracking-[0.06em] text-[#5f78a0]">
              <span>MIT License</span>
              <span className="text-[#3a4a64]">|</span>
              <span>© 2026 kaneko</span>
              <button
                onClick={toggleNight}
                className="cursor-pointer rounded-full border border-[rgba(127,212,255,0.3)] bg-[rgba(127,212,255,0.08)] px-[12px] py-[6px] font-space text-[10px] tracking-[0.1em] text-[#bfe0ff] hover:bg-[rgba(127,212,255,0.18)]"
              >
                ☾ おやすみ
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* night overlay */}
      <div
        className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[radial-gradient(900px_600px_at_80%_12%,rgba(40,70,130,0.35),transparent_60%),rgba(4,6,14,0.72)] transition-opacity duration-[1100ms] ${
          night ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="-translate-y-[30px] text-center">
          <div className="mb-[16px] text-[48px] text-[#bfe0ff] [text-shadow:0_0_30px_rgba(127,200,255,0.7)]">
            ☾
          </div>
          <div className="font-zen text-[22px] font-bold tracking-[0.04em] text-[#dceafb]">
            おやすみなさい。良い夢を。
          </div>
          <div className="mt-[8px] font-space text-[11px] tracking-[0.14em] text-[#7f9ac0]">
            — 灯りを落としました
          </div>
        </div>
      </div>
    </div>
  );
}

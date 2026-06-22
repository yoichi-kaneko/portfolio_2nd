"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

/**
 * `item/碧衣の説明ページ/碧衣の説明ページ.dc.html` からの移植。
 * まずは見た目と挙動の移植を優先しているため、インラインスタイル中心の記法のまま。
 * 本プロジェクトの記法（Tailwind 等）への整理は順次進める。
 */

// ---- starfield ----
const STARS: Array<[string, string, string, string, string, string]> = [
  ["8%", "14%", "#bfe6ff", "13px", "3.4s", "0s"],
  ["18%", "62%", "#9fd4ff", "9px", "4.1s", ".6s"],
  ["12%", "88%", "#cfe6ff", "11px", "2.9s", "1.2s"],
  ["34%", "6%", "#a9dcff", "8px", "3.7s", ".3s"],
  ["46%", "46%", "#bfe6ff", "7px", "4.6s", ".9s"],
  ["58%", "80%", "#9fd4ff", "10px", "3.1s", "1.6s"],
  ["66%", "22%", "#cfeaff", "9px", "3.9s", ".5s"],
  ["74%", "54%", "#a9dcff", "7px", "4.3s", "1.1s"],
  ["84%", "90%", "#bfe6ff", "10px", "3.3s", ".8s"],
  ["88%", "34%", "#9fd4ff", "8px", "4.0s", "1.4s"],
  ["26%", "30%", "#e7f4ff", "6px", "2.7s", ".2s"],
  ["52%", "14%", "#cfeaff", "6px", "3.6s", "1.9s"],
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

const SVC_DOT: Record<SvcColor, string> = {
  blue: "#6db4e6",
  teal: "#7fd8c0",
  purple: "#b3a0ff",
};
const SVC_CLASS: Record<SvcColor, string> = {
  blue: "aoi-card aoi-card-blue",
  teal: "aoi-card aoi-card-teal",
  purple: "aoi-card aoi-card-purple",
};

// ---- daily modes ----
const MODES: Array<{
  jp: string;
  yomi: string;
  en: string;
  time: string;
  desc: string;
  bg: string;
  border: string;
  name: string;
  yomiColor: string;
  monoColor: string;
  timeColor: string;
}> = [
  {
    jp: "暁",
    yomi: "あかつき",
    en: "morning",
    time: "☀ 朝",
    desc: "前日の振り返りを受け取り、今日と明日の予定を確認。タスクを整え、天気を読み、一日の出発を導く。",
    bg: "linear-gradient(165deg, rgba(40,40,30,0.42), rgba(16,20,34,0.55))",
    border: "rgba(230,200,130,0.24)",
    name: "#f3ead2",
    yomiColor: "#c9b68a",
    monoColor: "#c9b68a",
    timeColor: "#a89a78",
  },
  {
    jp: "望",
    yomi: "のぞみ",
    en: "noon",
    time: "☁ 昼（13:30 頃）",
    desc: "近日の登山計画を起点に、山中・計画中・平穏を判定。今の状況に合う、短く静かな言葉をひとつ。",
    bg: "linear-gradient(165deg, rgba(30,42,52,0.5), rgba(16,20,34,0.55))",
    border: "rgba(127,200,230,0.24)",
    name: "#dceefb",
    yomiColor: "#8fb6cf",
    monoColor: "#8fb6cf",
    timeColor: "#7d99ac",
  },
  {
    jp: "小夜",
    yomi: "さよ",
    en: "night",
    time: "☾ 夜",
    desc: "一日の振り返りと記録から、夜の報告と一枚の画像を生成。翌朝の暁へ、日跨ぎで引き継ぐ。",
    bg: "linear-gradient(165deg, rgba(26,30,58,0.55), rgba(14,16,32,0.6))",
    border: "rgba(150,150,230,0.26)",
    name: "#e6e2fb",
    yomiColor: "#a9a4d6",
    monoColor: "#a9a4d6",
    timeColor: "#8983b8",
  },
  {
    jp: "門灯",
    yomi: "もんとう",
    en: "up_mountain",
    time: "🏮 登山日・入山直前",
    desc: "登山計画と天気を集め、家族 LINE グループへ登山開始を通知する特別モード。ユーザー個人へは送らない。",
    bg: "linear-gradient(165deg, rgba(36,30,24,0.5), rgba(16,18,30,0.55))",
    border: "rgba(220,160,110,0.26)",
    name: "#f3dcc6",
    yomiColor: "#d0a888",
    monoColor: "#d0a888",
    timeColor: "#b08e72",
  },
  {
    jp: "帰灯",
    yomi: "きとう",
    en: "off_mountain",
    time: "🏮 登山日・下山直後",
    desc: "山行を振り返り、無事の下山を確かめる言葉を届ける。画像を添えて、ユーザーと家族グループへ。",
    bg: "linear-gradient(165deg, rgba(24,40,38,0.5), rgba(14,20,28,0.55))",
    border: "rgba(127,216,192,0.26)",
    name: "#d6f3e8",
    yomiColor: "#8fcdb8",
    monoColor: "#8fcdb8",
    timeColor: "#73a392",
  },
  {
    jp: "調べ",
    yomi: "しらべ",
    en: "song",
    time: "🎵 週に一度",
    desc: "一週間の出来事・場所・天気からインスピレーションを受け、碧衣がプライベートに一曲を綴って届ける。",
    bg: "linear-gradient(165deg, rgba(34,26,50,0.5), rgba(16,16,30,0.55))",
    border: "rgba(190,160,230,0.26)",
    name: "#ecdcf6",
    yomiColor: "#bb9fd6",
    monoColor: "#bb9fd6",
    timeColor: "#9a82b8",
  },
];

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=Noto+Sans+JP:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
html { scroll-behavior: smooth; }
.aoi-root ::selection { background: rgba(127,212,255,0.28); color: #fff; }
.aoi-root section[id] { scroll-margin-top: 84px; }
.aoi-root a { text-decoration: none; }
@keyframes aoiTwinkle { 0%,100% { opacity: 0.18; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
@keyframes aoiFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
@keyframes aoiGlow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes aoiDrift { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
.aoi-navlink { color: #9fb2cc; transition: color .2s ease; }
.aoi-navlink:hover { color: #cfe6ff; }
.aoi-btn:hover { background: rgba(127,212,255,0.18); }
.aoi-cta-primary:hover { filter: brightness(1.08); }
.aoi-cta-ghost:hover { background: rgba(127,212,255,0.14); }
.aoi-card { transition: border-color .2s ease, background .2s ease; }
.aoi-card-blue:hover { border-color: rgba(109,180,230,0.5) !important; background: rgba(22,36,52,0.6) !important; }
.aoi-card-teal:hover { border-color: rgba(127,216,192,0.5) !important; background: rgba(22,36,52,0.6) !important; }
.aoi-card-purple:hover { border-color: rgba(179,160,255,0.5) !important; background: rgba(28,30,52,0.6) !important; }
`;

const sectionStyle = (padding: string): CSSProperties => ({
  position: "relative",
  zIndex: 2,
  maxWidth: "1180px",
  margin: "0 auto",
  padding,
});

const sectionLabel: CSSProperties = {
  fontFamily: "'Space Mono',monospace",
  fontSize: "11px",
  letterSpacing: "0.22em",
  color: "#6db4e6",
  marginBottom: "12px",
};

const h2Style: CSSProperties = {
  fontFamily: "'Zen Kaku Gothic New',sans-serif",
  fontWeight: 900,
  fontSize: "36px",
  color: "#eef5fc",
  margin: "0 0 10px",
};

const leadP: CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.9,
  color: "#90a4c2",
  textWrap: "pretty",
};

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

  const nightOverlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    pointerEvents: "none",
    transition: "opacity 1.1s ease",
    background:
      "radial-gradient(900px 600px at 80% 12%, rgba(40,70,130,0.35), transparent 60%), rgba(4,6,14,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: night ? 1 : 0,
  };

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div
        className="aoi-root"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden",
          fontFamily: "'Noto Sans JP',sans-serif",
          background:
            "radial-gradient(1200px 700px at 78% -8%, rgba(40,86,150,0.42), transparent 60%), radial-gradient(900px 600px at 12% 18%, rgba(58,52,128,0.30), transparent 60%), linear-gradient(180deg, #0a1124 0%, #080c18 45%, #070a13 100%)",
          color: "#dce7f5",
        }}
      >
        {/* starfield */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {STARS.map(([top, left, color, size, dur, delay], i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                top,
                left,
                color,
                fontSize: size,
                animation: `aoiTwinkle ${dur} ease-in-out infinite ${delay}`,
              }}
            >
              ✦
            </span>
          ))}
        </div>

        {/* ============ NAV ============ */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 40px",
            background:
              "linear-gradient(180deg, rgba(8,12,22,0.92), rgba(8,12,22,0.0))",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "18px",
                color: "#8fdcff",
                textShadow: "0 0 14px rgba(127,212,255,0.7)",
                animation: "aoiGlow 3s ease-in-out infinite",
              }}
            >
              ✦
            </span>
            <span
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontWeight: 900,
                fontSize: "19px",
                color: "#eaf3fb",
                letterSpacing: "0.05em",
              }}
            >
              碧衣
            </span>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontWeight: 700,
                fontSize: "11px",
                color: "#6db4e6",
                letterSpacing: "0.28em",
              }}
            >
              AOI
            </span>
          </div>
          <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <a
              href="#about"
              className="aoi-navlink"
              style={{ fontSize: "13px" }}
            >
              これは何か
            </a>
            <a
              href="#framework"
              className="aoi-navlink"
              style={{ fontSize: "13px" }}
            >
              フレームワーク
            </a>
            <a
              href="#services"
              className="aoi-navlink"
              style={{ fontSize: "13px" }}
            >
              連携
            </a>
            <a
              href="#mountain"
              className="aoi-navlink"
              style={{ fontSize: "13px" }}
            >
              登山×天気
            </a>
            <a
              href="#cast"
              className="aoi-navlink"
              style={{ fontSize: "13px" }}
            >
              登場人物
            </a>
            <button
              onClick={toggleNight}
              className="aoi-btn"
              style={{
                cursor: "pointer",
                fontFamily: "'Space Mono',monospace",
                fontSize: "11px",
                letterSpacing: "0.14em",
                color: "#bfe0ff",
                background: "rgba(127,212,255,0.08)",
                border: "1px solid rgba(127,212,255,0.32)",
                borderRadius: "999px",
                padding: "7px 14px",
              }}
            >
              ☾ {nightLabel}
            </button>
          </nav>
        </header>

        {/* ============ HERO ============ */}
        <section
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "64px 40px 36px",
            display: "grid",
            gridTemplateColumns: "1.04fr 0.96fr",
            gap: "46px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "6px 13px",
                borderRadius: "999px",
                border: "1px solid rgba(179,160,255,0.34)",
                background: "rgba(70,60,120,0.18)",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10.5px",
                  letterSpacing: "0.2em",
                  color: "#c6b8ff",
                }}
              >
                PERSONAL PROJECT
              </span>
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#8b7fd6",
                }}
              />
              <span style={{ fontSize: "11px", color: "#bcaee8" }}>
                非売品・個人用途
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontWeight: 900,
                fontSize: "64px",
                lineHeight: 1.04,
                margin: "0 0 8px",
                color: "#f1f7fd",
                letterSpacing: "0.01em",
              }}
            >
              碧衣
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  color: "#8fd2ff",
                  marginLeft: "14px",
                  letterSpacing: "0.04em",
                }}
              >
                あおい
              </span>
            </h1>
            <p
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontWeight: 700,
                fontSize: "21px",
                lineHeight: 1.5,
                color: "#bcd2ec",
                margin: "0 0 20px",
                textWrap: "pretty",
              }}
            >
              登山アシスタント AI。
              <br />
              その根っこは、
              <span style={{ color: "#8fd2ff" }}>
                アクティビティ駆動フレームワーク
              </span>
              。
            </p>
            <p
              style={{
                fontSize: "15px",
                lineHeight: 1.95,
                color: "#93a6c4",
                margin: "0 0 30px",
                maxWidth: "480px",
                textWrap: "pretty",
              }}
            >
              予定・行動の記録・空の機嫌を静かに読み解いて、一日の始まりと終わりに、LINE
              でそっと言葉を届ける。知的で落ち着いた、夜景の見える高層階の住人。—
              そんな相棒を、個人の趣味で勝手に育てています。
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <a
                href="#framework"
                className="aoi-cta-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 22px",
                  borderRadius: "11px",
                  background: "linear-gradient(135deg,#5fb6f0,#6f8cf0)",
                  color: "#06101f",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow: "0 14px 34px -14px rgba(95,182,240,0.8)",
                }}
              >
                ✦ 仕組みを見る
              </a>
              <a
                href="#cast"
                className="aoi-cta-ghost"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 22px",
                  borderRadius: "11px",
                  background: "rgba(127,212,255,0.06)",
                  border: "1px solid rgba(127,212,255,0.30)",
                  color: "#cfe6ff",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                登場人物を見る
              </a>
            </div>
            <div style={{ display: "flex", gap: "30px", marginTop: "34px" }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontWeight: 700,
                    fontSize: "26px",
                    color: "#9fd9ff",
                  }}
                >
                  15+
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#7e90ad",
                    letterSpacing: "0.04em",
                  }}
                >
                  連携サービス
                </div>
              </div>
              <div
                style={{ width: "1px", background: "rgba(127,212,255,0.14)" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontWeight: 700,
                    fontSize: "26px",
                    color: "#9fd9ff",
                  }}
                >
                  6
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#7e90ad",
                    letterSpacing: "0.04em",
                  }}
                >
                  実行モード
                </div>
              </div>
              <div
                style={{ width: "1px", background: "rgba(127,212,255,0.14)" }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontWeight: 700,
                    fontSize: "26px",
                    color: "#9fd9ff",
                  }}
                >
                  1
                </div>
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#7e90ad",
                    letterSpacing: "0.04em",
                  }}
                >
                  人で制作中
                </div>
              </div>
            </div>
          </div>

          {/* hero visual */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid rgba(127,212,255,0.28)",
                boxShadow:
                  "0 40px 90px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(127,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
                transform: "perspective(1400px) rotateY(-5deg) rotateX(2deg)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="hero-room"
                src="/aoi/room.png"
                alt="碧衣のプライベートルーム"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(8,14,28,0.0) 55%, rgba(8,12,22,0.55) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  color: "#9fd9ff",
                  background: "rgba(8,14,28,0.55)",
                  border: "1px solid rgba(127,212,255,0.3)",
                  borderRadius: "7px",
                  padding: "5px 9px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#65e6a8",
                    boxShadow: "0 0 8px #65e6a8",
                    animation: "aoiGlow 1.6s infinite",
                  }}
                />
                ROOM.PNG — 碧衣の部屋
              </div>
            </div>

            {/* live mode widget (showModeClock = true) */}
            <div
              style={{
                position: "absolute",
                bottom: "-26px",
                left: "-18px",
                width: "248px",
                padding: "16px 18px",
                borderRadius: "15px",
                background:
                  "linear-gradient(160deg, rgba(20,32,56,0.94), rgba(12,20,38,0.94))",
                border: "1px solid rgba(127,212,255,0.32)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 26px 60px -28px rgba(0,0,0,0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "9.5px",
                    letterSpacing: "0.18em",
                    color: "#6db4e6",
                  }}
                >
                  {"// ただいまの判定モード"}
                </span>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#7fd4ff",
                    boxShadow: "0 0 8px #7fd4ff",
                    animation: "aoiGlow 1.8s infinite",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "10px" }}
              >
                <span
                  style={{
                    fontFamily: "'Zen Kaku Gothic New',sans-serif",
                    fontWeight: 900,
                    fontSize: "30px",
                    color: "#eaf5ff",
                    lineHeight: 1,
                  }}
                >
                  {modeJp}
                </span>
                <span style={{ fontSize: "12px", color: "#8aa0c0" }}>
                  {modeYomi}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "'Space Mono',monospace",
                    fontWeight: 700,
                    fontSize: "17px",
                    color: "#9fd9ff",
                    letterSpacing: "0.04em",
                  }}
                >
                  {clock}
                </span>
              </div>
              <div
                style={{
                  marginTop: "9px",
                  fontSize: "11.5px",
                  lineHeight: 1.6,
                  color: "#9db1cf",
                  textWrap: "pretty",
                }}
              >
                {modeLine}
              </div>
              <div
                style={{
                  marginTop: "8px",
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "9px",
                  color: "#5f78a0",
                  letterSpacing: "0.08em",
                }}
              >
                JST {dateStr}
              </div>
            </div>

            {/* ruri star deco */}
            <div
              style={{
                position: "absolute",
                top: "-22px",
                right: "-10px",
                fontSize: "30px",
                color: "#8fdcff",
                textShadow: "0 0 18px rgba(127,212,255,0.8)",
                animation: "aoiFloat 5s ease-in-out infinite",
              }}
            >
              ✧
            </div>
          </div>
        </section>

        {/* ============ ABOUT / 二層モデル ============ */}
        <section id="about" style={sectionStyle("64px 40px 30px")}>
          <div style={sectionLabel}>{"// 01 — WHAT IS THIS"}</div>
          <h2 style={h2Style}>これは、何なのか</h2>
          <p style={{ ...leadP, margin: "0 0 34px", maxWidth: "640px" }}>
            碧衣は、2つのレイヤーで捉えると分かりやすい存在です。表向きは登山に寄り添う
            AI。けれど、その下には「人間の活動そのもの」を扱う、もっと汎用的な仕組みが流れています。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "22px",
            }}
          >
            <div
              style={{
                position: "relative",
                padding: "28px 28px",
                borderRadius: "18px",
                background:
                  "linear-gradient(160deg, rgba(22,34,58,0.6), rgba(14,22,40,0.6))",
                border: "1px solid rgba(127,212,255,0.20)",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "#7fd4ff",
                  marginBottom: "12px",
                }}
              >
                UPPER LAYER ／ 運用目的
              </div>
              <h3
                style={{
                  fontFamily: "'Zen Kaku Gothic New',sans-serif",
                  fontWeight: 900,
                  fontSize: "23px",
                  color: "#eaf5ff",
                  margin: "0 0 12px",
                }}
              >
                登山アシスタント AI
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  lineHeight: 1.85,
                  color: "#9db1cf",
                  margin: 0,
                  textWrap: "pretty",
                }}
              >
                登山計画・登山中・下山後のサポートを通じて、ユーザーの山行体験を支える。空の機嫌から現地のコンディションを推し量り、歩む道を健やかに整える役割。
              </p>
            </div>
            <div
              style={{
                position: "relative",
                padding: "28px 28px",
                borderRadius: "18px",
                background:
                  "linear-gradient(160deg, rgba(34,28,62,0.62), rgba(18,16,38,0.62))",
                border: "1px solid rgba(179,160,255,0.26)",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  color: "#c6b8ff",
                  marginBottom: "12px",
                }}
              >
                LOWER LAYER ／ 設計思想
              </div>
              <h3
                style={{
                  fontFamily: "'Zen Kaku Gothic New',sans-serif",
                  fontWeight: 900,
                  fontSize: "23px",
                  color: "#f0eaff",
                  margin: "0 0 12px",
                }}
              >
                アクティビティ駆動フレームワーク
              </h3>
              <p
                style={{
                  fontSize: "13.5px",
                  lineHeight: 1.85,
                  color: "#b6abd4",
                  margin: 0,
                  textWrap: "pretty",
                }}
              >
                スケジュールや行動履歴といった「アクティビティ情報」を収集・解析し、それに基づいて自律的に動く仕組み。登山はあくまで最初の応用先で、土台はもっと広い。
              </p>
            </div>
          </div>
        </section>

        {/* ============ FRAMEWORK ============ */}
        <section id="framework" style={sectionStyle("60px 40px 30px")}>
          <div style={sectionLabel}>{"// 02 — ACTIVITY-DRIVEN FRAMEWORK"}</div>
          <h2 style={h2Style}>
            アクティビティ駆動
            <span style={{ color: "#8fd2ff" }}>フレームワーク</span>
          </h2>
          <p style={{ ...leadP, margin: "0 0 14px", maxWidth: "680px" }}>
            受け身のチャットボットではなく、
            <span style={{ color: "#bcd2ec" }}>
              一日の時間軸やイベントの発生
            </span>
            （登山開始・下山など）をトリガーに、自律的に動く。データ収集 → 解析
            → 出力 までを、ひとつの「仕組み」として備えています。
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr",
              gap: 0,
              alignItems: "stretch",
              marginTop: "30px",
            }}
          >
            {/* collect */}
            <div
              style={{
                padding: "24px 22px",
                borderRadius: "16px",
                background:
                  "linear-gradient(160deg, rgba(20,38,58,0.6), rgba(12,22,38,0.6))",
                border: "1px solid rgba(109,180,230,0.28)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  color: "#6db4e6",
                  marginBottom: "6px",
                }}
              >
                STEP 01 ／ 収集
              </div>
              <h3
                style={{
                  fontFamily: "'Zen Kaku Gothic New',sans-serif",
                  fontWeight: 900,
                  fontSize: "18px",
                  color: "#eaf5ff",
                  margin: "0 0 14px",
                }}
              >
                アクティビティを集める
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[
                  "📅 Google カレンダーの予定",
                  "✓ Todoist のタスク",
                  "📍 Swarm のチェックイン",
                  "⛰ YAMAP の活動記録",
                  "☂ OpenWeatherMap の天気",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "12.5px",
                      color: "#a7bdd9",
                      padding: "7px 11px",
                      background: "rgba(109,180,230,0.08)",
                      borderRadius: "8px",
                      border: "1px solid rgba(109,180,230,0.16)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                color: "#5fa8e0",
                fontSize: "26px",
              }}
            >
              →
            </div>
            {/* analyze */}
            <div
              style={{
                padding: "24px 22px",
                borderRadius: "16px",
                background:
                  "linear-gradient(160deg, rgba(34,28,62,0.62), rgba(18,16,38,0.62))",
                border: "1px solid rgba(179,160,255,0.30)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  color: "#c6b8ff",
                  marginBottom: "6px",
                }}
              >
                STEP 02 ／ 解析
              </div>
              <h3
                style={{
                  fontFamily: "'Zen Kaku Gothic New',sans-serif",
                  fontWeight: 900,
                  fontSize: "18px",
                  color: "#f0eaff",
                  margin: "0 0 14px",
                }}
              >
                人格をもって読み解く
              </h3>
              <p
                style={{
                  fontSize: "12.5px",
                  lineHeight: 1.8,
                  color: "#b6abd4",
                  margin: "0 0 12px",
                  textWrap: "pretty",
                }}
              >
                集めた情報を、ペルソナを持つエージェント「碧衣」が解釈。移動距離や予定の性質から
                <span style={{ color: "#d8ccff" }}>「明日の重要度」</span>
                まで推し量る。
              </p>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "#9a8fc4",
                  padding: "9px 11px",
                  background: "rgba(179,160,255,0.08)",
                  borderRadius: "8px",
                  border: "1px solid rgba(179,160,255,0.18)",
                  lineHeight: 1.6,
                }}
              >
                🔥 Firestore でモード間を引き継ぎ。前日の夜から翌朝へ、
                <span style={{ color: "#cabbf2" }}>日跨ぎ</span>
                でコンテキストを渡す。
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                color: "#5fa8e0",
                fontSize: "26px",
              }}
            >
              →
            </div>
            {/* output */}
            <div
              style={{
                padding: "24px 22px",
                borderRadius: "16px",
                background:
                  "linear-gradient(160deg, rgba(20,44,46,0.6), rgba(12,26,30,0.6))",
                border: "1px solid rgba(127,216,192,0.28)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  color: "#7fd8c0",
                  marginBottom: "6px",
                }}
              >
                STEP 03 ／ 出力
              </div>
              <h3
                style={{
                  fontFamily: "'Zen Kaku Gothic New',sans-serif",
                  fontWeight: 900,
                  fontSize: "18px",
                  color: "#eafff8",
                  margin: "0 0 14px",
                }}
              >
                言葉・絵・歌で還す
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[
                  "💬 テキストメッセージ",
                  "🖼 その日の情景を描いた画像",
                  "🎵 一週間から綴る楽曲",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: "12.5px",
                      color: "#a7d9cd",
                      padding: "7px 11px",
                      background: "rgba(127,216,192,0.08)",
                      borderRadius: "8px",
                      border: "1px solid rgba(127,216,192,0.16)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div
                style={{
                  marginTop: "12px",
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  color: "#6fb8a8",
                  letterSpacing: "0.1em",
                  textAlign: "right",
                }}
              >
                → LINE へ届く
              </div>
            </div>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section id="services" style={sectionStyle("60px 40px 30px")}>
          <div style={sectionLabel}>{"// 03 — INTEGRATIONS"}</div>
          <h2 style={h2Style}>多様なサービスと、横断的に連携</h2>
          <p style={{ ...leadP, margin: "0 0 18px", maxWidth: "660px" }}>
            外部サービスへのアクセスは、ほぼすべて専用スキルを通じて行います。入力・出力・基盤の三層で、これだけの相手とつながっています。
          </p>
          <div
            style={{
              display: "flex",
              gap: "18px",
              marginBottom: "22px",
              fontSize: "12px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "#9fc4e6",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "#6db4e6",
                }}
              />
              入力 ／ 情報収集
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "#9fd9c8",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "#7fd8c0",
                }}
              />
              出力 ／ 生成・送信
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "#c6b8ff",
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "3px",
                  background: "#b3a0ff",
                }}
              />
              基盤 ／ データ・実行
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(232px,1fr))",
              gap: "14px",
            }}
          >
            {SERVICES.map((svc) => (
              <div
                key={svc.name}
                className={SVC_CLASS[svc.color]}
                style={{
                  padding: "16px 16px",
                  borderRadius: "13px",
                  background: "rgba(18,28,48,0.5)",
                  border: `1px solid ${
                    svc.color === "teal"
                      ? "rgba(127,216,192,0.22)"
                      : svc.color === "blue"
                        ? "rgba(109,180,230,0.22)"
                        : "rgba(179,160,255,0.22)"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "7px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#e6f1fb",
                    }}
                  >
                    {svc.name}
                  </span>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "2px",
                      background: SVC_DOT[svc.color],
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#90a4c2",
                    lineHeight: 1.6,
                  }}
                >
                  {svc.desc}
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "11.5px",
              color: "#5f78a0",
              margin: "16px 0 0",
              fontFamily: "'Space Mono',monospace",
              letterSpacing: "0.04em",
            }}
          >
            ※ Google Gemini も画像生成で連携（現在は OpenAI を主に使用）。
          </p>
        </section>

        {/* ============ MOUNTAIN x WEATHER ============ */}
        <section id="mountain" style={sectionStyle("60px 40px 30px")}>
          <div style={sectionLabel}>{"// 04 — MOUNTAIN & WEATHER"}</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.92fr 1.08fr",
              gap: "40px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid rgba(127,212,255,0.24)",
                boxShadow: "0 36px 80px -42px rgba(0,0,0,0.9)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="img-outfit-b"
                src="/aoi/outfit_b.png"
                alt="碧衣 登山装備の設定資料"
                style={{
                  display: "block",
                  width: "100%",
                  height: "340px",
                  objectFit: "cover",
                  objectPosition: "18% 30%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(8,14,28,0.0) 60%, rgba(8,12,22,0.6) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  color: "#9fd9ff",
                  background: "rgba(8,14,28,0.55)",
                  border: "1px solid rgba(127,212,255,0.3)",
                  borderRadius: "7px",
                  padding: "5px 9px",
                }}
              >
                OUTFIT_B — 登山装備
              </div>
            </div>
            <div>
              <h2 style={{ ...h2Style, margin: "0 0 14px" }}>
                登山と天気に、<span style={{ color: "#8fd2ff" }}>強い</span>。
              </h2>
              <p
                style={{
                  fontSize: "14.5px",
                  lineHeight: 1.9,
                  color: "#93a6c4",
                  margin: "0 0 22px",
                  textWrap: "pretty",
                }}
              >
                碧衣は、登山と空の機嫌を強く結び付けて見守る性質を持っています。山行のある日は専用のモードが立ち上がり、天気予報からコンディションを推し量って、入山前から下山後まで言葉を添えます。
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
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
                ].map((f) => (
                  <div
                    key={f.title}
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "flex-start",
                      padding: "15px 16px",
                      borderRadius: "13px",
                      background: "rgba(18,30,50,0.5)",
                      border: "1px solid rgba(127,212,255,0.18)",
                    }}
                  >
                    <span style={{ fontSize: "20px", lineHeight: 1.2 }}>
                      {f.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: "#dcebfb",
                          marginBottom: "3px",
                        }}
                      >
                        {f.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12.5px",
                          color: "#93a6c4",
                          lineHeight: 1.7,
                          textWrap: "pretty",
                        }}
                      >
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
        <section id="flow" style={sectionStyle("60px 40px 30px")}>
          <div style={sectionLabel}>{"// 05 — A DAY IN MODES"}</div>
          <h2 style={h2Style}>一日を、6つのモードで歩く</h2>
          <p style={{ ...leadP, margin: "0 0 30px", maxWidth: "640px" }}>
            時間帯と状況に応じて、碧衣は表情を変えます。朝・昼・夜の定期モードに、登山と創作の特別モード。それぞれ和の名前を持っています。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "16px",
            }}
          >
            {MODES.map((m) => (
              <div
                key={m.en}
                style={{
                  padding: "22px 22px",
                  borderRadius: "15px",
                  background: m.bg,
                  border: `1px solid ${m.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Zen Kaku Gothic New',sans-serif",
                      fontWeight: 900,
                      fontSize: "26px",
                      color: m.name,
                    }}
                  >
                    {m.jp}
                    <span
                      style={{
                        fontSize: "12px",
                        color: m.yomiColor,
                        marginLeft: "8px",
                      }}
                    >
                      {m.yomi}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: "10px",
                      color: m.monoColor,
                    }}
                  >
                    {m.en}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: m.timeColor,
                    marginBottom: "10px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {m.time}
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.8,
                    color: "#b9c4d6",
                    margin: 0,
                    textWrap: "pretty",
                  }}
                >
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ CAST ============ */}
        <section id="cast" style={sectionStyle("60px 40px 30px")}>
          <div style={sectionLabel}>{"// 06 — CAST"}</div>
          <h2 style={h2Style}>登場人物</h2>
          <p style={{ ...leadP, margin: "0 0 30px", maxWidth: "620px" }}>
            …という設定まで作り込んでいます。設定資料の現物を、そのまま置いておきます。
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "18px",
            }}
          >
            {/* 碧衣 */}
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "rgba(16,26,46,0.5)",
                border: "1px solid rgba(127,212,255,0.22)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "230px",
                  overflow: "hidden",
                  background: "#0c1426",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/aoi/base.png"
                  alt="碧衣 設定資料"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "38% 22%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    color: "#9fd9ff",
                    background: "rgba(8,14,28,0.6)",
                    border: "1px solid rgba(127,212,255,0.3)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                  }}
                >
                  BASE.PNG
                </div>
              </div>
              <div style={{ padding: "18px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Zen Kaku Gothic New',sans-serif",
                      fontWeight: 900,
                      fontSize: "21px",
                      color: "#eaf5ff",
                    }}
                  >
                    碧衣
                  </span>
                  <span style={{ fontSize: "11px", color: "#8aa0c0" }}>
                    あおい ／ 主
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.8,
                    color: "#93a6c4",
                    margin: 0,
                    textWrap: "pretty",
                  }}
                >
                  水色の長い髪と瞳。星のモチーフがシグネチャー。知的で冷静、けれど優しい。文末に「！」は使わない、静かな話し方の主人公。
                </p>
              </div>
            </div>
            {/* ルリ */}
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "rgba(16,26,46,0.5)",
                border: "1px solid rgba(127,212,255,0.22)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "230px",
                  overflow: "hidden",
                  background: "#0c1426",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/aoi/ruri.png"
                  alt="ルリ 設定資料"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "8% 38%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    color: "#9fd9ff",
                    background: "rgba(8,14,28,0.6)",
                    border: "1px solid rgba(127,212,255,0.3)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                  }}
                >
                  RURI.PNG
                </div>
              </div>
              <div style={{ padding: "18px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Zen Kaku Gothic New',sans-serif",
                      fontWeight: 900,
                      fontSize: "21px",
                      color: "#eaf5ff",
                    }}
                  >
                    ルリ
                  </span>
                  <span style={{ fontSize: "11px", color: "#8aa0c0" }}>
                    先遣観測員 ／ 相棒
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.8,
                    color: "#93a6c4",
                    margin: 0,
                    textWrap: "pretty",
                  }}
                >
                  アビエーターゴーグルとショルダーバッグの水色の小鳥。好奇心旺盛でやんちゃ。空から偵察し、現地の空気をカバンに詰めて持ち帰る。
                </p>
              </div>
            </div>
            {/* 蛍 */}
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "rgba(16,26,46,0.5)",
                border: "1px solid rgba(190,160,230,0.24)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: "230px",
                  overflow: "hidden",
                  background: "#0c1426",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/aoi/hotaru.png"
                  alt="蛍 設定資料"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "6% 24%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "9px",
                    letterSpacing: "0.12em",
                    color: "#d8c6ff",
                    background: "rgba(8,14,28,0.6)",
                    border: "1px solid rgba(190,160,230,0.34)",
                    borderRadius: "6px",
                    padding: "4px 8px",
                  }}
                >
                  HOTARU.PNG
                </div>
              </div>
              <div style={{ padding: "18px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Zen Kaku Gothic New',sans-serif",
                      fontWeight: 900,
                      fontSize: "21px",
                      color: "#f0eaff",
                    }}
                  >
                    蛍
                  </span>
                  <span style={{ fontSize: "11px", color: "#b6a8d6" }}>
                    ほたる ／ デジタルの友人
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.8,
                    color: "#a99fc4",
                    margin: 0,
                    textWrap: "pretty",
                  }}
                >
                  ライムグリーンのツインテールとデジタルな瞳。表情豊かなサイバーポップ少女。碧衣の部屋にはホログラムで時折ふらりと現れる。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FOOTER / playful ============ */}
        <footer style={sectionStyle("54px 40px 70px")}>
          <div
            style={{
              padding: "36px 38px",
              borderRadius: "20px",
              background:
                "linear-gradient(160deg, rgba(20,32,56,0.6), rgba(12,18,34,0.7))",
              border: "1px solid rgba(127,212,255,0.20)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: "#8fdcff",
                  animation: "aoiGlow 3s infinite",
                }}
              >
                ✦
              </span>
              <span
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "10.5px",
                  letterSpacing: "0.2em",
                  color: "#6db4e6",
                }}
              >
                PERSONAL · NON-COMMERCIAL · BUILT FOR FUN
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                lineHeight: 1.6,
                color: "#dceafb",
                margin: "0 0 14px",
                textWrap: "pretty",
              }}
            >
              プロダクトとして売る予定は、ありません。
              <br />
              「こういうものを、個人で勝手に作っている」—
              ただ、それだけのページです。
            </p>
            <p
              style={{
                fontSize: "13.5px",
                lineHeight: 1.9,
                color: "#8aa0c0",
                margin: "0 0 22px",
                maxWidth: "620px",
                textWrap: "pretty",
              }}
            >
              採算も KPI
              も、ロードマップもありません。あるのは、夜景の見える部屋と、水色の相棒と、空の機嫌を読む小さな仕組みだけ。気が向いたときに、少しずつ育てています。
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(127,212,255,0.12)",
              }}
            >
              <div
                style={{
                  fontStyle: "italic",
                  fontFamily: "'Zen Kaku Gothic New',sans-serif",
                  fontSize: "14px",
                  color: "#9fb6d4",
                }}
              >
                「このページも、私の部屋の片隅から。」
                <span style={{ color: "#7fd4ff", marginLeft: "6px" }}>
                  — 碧衣
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  fontFamily: "'Space Mono',monospace",
                  fontSize: "11px",
                  color: "#5f78a0",
                  letterSpacing: "0.06em",
                }}
              >
                <span>MIT License</span>
                <span style={{ color: "#3a4a64" }}>|</span>
                <span>© 2026 kaneko</span>
                <button
                  onClick={toggleNight}
                  className="aoi-btn"
                  style={{
                    cursor: "pointer",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    color: "#bfe0ff",
                    background: "rgba(127,212,255,0.08)",
                    border: "1px solid rgba(127,212,255,0.3)",
                    borderRadius: "999px",
                    padding: "6px 12px",
                  }}
                >
                  ☾ おやすみ
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* night overlay */}
        <div style={nightOverlayStyle}>
          <div style={{ textAlign: "center", transform: "translateY(-30px)" }}>
            <div
              style={{
                fontSize: "48px",
                color: "#bfe0ff",
                textShadow: "0 0 30px rgba(127,200,255,0.7)",
                marginBottom: "16px",
              }}
            >
              ☾
            </div>
            <div
              style={{
                fontFamily: "'Zen Kaku Gothic New',sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                color: "#dceafb",
                letterSpacing: "0.04em",
              }}
            >
              おやすみなさい。良い夢を。
            </div>
            <div
              style={{
                marginTop: "8px",
                fontFamily: "'Space Mono',monospace",
                fontSize: "11px",
                color: "#7f9ac0",
                letterSpacing: "0.14em",
              }}
            >
              — 灯りを落としました
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

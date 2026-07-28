// ---- integrations ----
export type SvcColor = "blue" | "teal" | "purple";

export interface Service {
  name: string;
  desc: string;
  color: SvcColor;
}

export const SERVICES: Service[] = [
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
    name: "Twitter (X) API",
    desc: "代筆した登山レポートを画像付きで投稿",
    color: "teal",
  },
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
export const SVC_STYLES: Record<SvcColor, { card: string; dot: string }> = {
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

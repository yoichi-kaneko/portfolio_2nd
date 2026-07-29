// ---- daily modes ----
// jp/yomi/en/time/desc は表示テキスト、card/name/yomiCls/monoCls/timeCls は
// それぞれの和名に合わせた配色クラス（完全なリテラルなので Tailwind がスキャンできる）。
export interface DailyMode {
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
}

export const MODES: DailyMode[] = [
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
    jp: "継灯",
    yomi: "けいとう",
    en: "stay_mountain",
    time: "🏮 宿泊登山・山小屋到着時",
    desc: "宿泊を伴う山行の途中、その日の行動を終えた合図を家族グループへ。下山はまだ先で、灯りは翌日へ続く。",
    card: "bg-[linear-gradient(165deg,rgba(42,26,26,0.5),rgba(16,16,28,0.55))] border-[rgba(230,140,120,0.26)]",
    name: "text-[#f7dad2]",
    yomiCls: "text-[#d69688]",
    monoCls: "text-[#d69688]",
    timeCls: "text-[#b57a6c]",
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
    jp: "綴葉",
    yomi: "つづりは",
    en: "scribe",
    time: "✍ 小夜の前・手動起動",
    desc: "ユーザーが綴った YAMAP の登山レポートを読み解き、代筆として SNS へ投稿。自身の想いは小夜へ託す。",
    card: "bg-[linear-gradient(165deg,rgba(26,40,28,0.5),rgba(14,20,26,0.55))] border-[rgba(160,206,120,0.26)]",
    name: "text-[#e6f3d8]",
    yomiCls: "text-[#a8cd8c]",
    monoCls: "text-[#a8cd8c]",
    timeCls: "text-[#8aa872]",
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

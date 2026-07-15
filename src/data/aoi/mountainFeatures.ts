// ---- mountain features ----
export interface MountainFeature {
  icon: string;
  title: string;
  body: string;
}

export const MOUNTAIN_FEATURES: MountainFeature[] = [
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

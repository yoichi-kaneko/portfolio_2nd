// ---- cast（登場人物）----
// 移植元では 3 枚のカードがベタ書きだったものを配列化。
// accent はカード/タグ/名前/肩書/本文の配色バリアント（CastCard 側で解決）。
export type CastAccent = "cyan" | "purple";

export interface CastMember {
  name: string;
  role: string;
  body: string;
  img: string;
  alt: string;
  tag: string;
  // 画像の表示位置（object-position の Tailwind 任意値クラス）
  objectPosition: string;
  accent: CastAccent;
}

export const CAST: CastMember[] = [
  {
    name: "碧衣",
    role: "あおい ／ 主",
    body: "水色の長い髪と瞳。星のモチーフがシグネチャー。知的で冷静、けれど優しい。文末に「！」は使わない、静かな話し方の主人公。",
    img: "/aoi/base.png",
    alt: "碧衣 設定資料",
    tag: "BASE.PNG",
    objectPosition: "object-[38%_22%]",
    accent: "cyan",
  },
  {
    name: "ルリ",
    role: "先遣観測員 ／ 相棒",
    body: "アビエーターゴーグルとショルダーバッグの水色の小鳥。好奇心旺盛でやんちゃ。空から偵察し、現地の空気をカバンに詰めて持ち帰る。",
    img: "/aoi/ruri.png",
    alt: "ルリ 設定資料",
    tag: "RURI.PNG",
    objectPosition: "object-[8%_38%]",
    accent: "cyan",
  },
  {
    name: "蛍",
    role: "ほたる ／ デジタルの友人",
    body: "ライムグリーンのツインテールとデジタルな瞳。表情豊かなサイバーポップ少女。碧衣の部屋にはホログラムで時折ふらりと現れる。",
    img: "/aoi/hotaru.png",
    alt: "蛍 設定資料",
    tag: "HOTARU.PNG",
    objectPosition: "object-[6%_24%]",
    accent: "purple",
  },
];

// ---- LINE スタンプ ----
// 販売ページの URL と、セクションに置く画像の参照先。

/** LINE STORE の販売ページ */
export const STICKER_STORE_URL = "https://line.me/S/sticker/36662592";

/** 販売ページへ飛ぶ QR コード（STICKER_STORE_URL から生成した静的画像） */
export const STICKER_QR = {
  src: "/aoi/line_stickers_qr.png",
  alt: "LINE スタンプ販売ページの QR コード",
  size: 480,
} as const;

export interface StickerIllustration {
  /** `public/` 配下の公開パス */
  src: string;
  alt: string;
}

/** セクションの挿絵。実ファイルは 1440×960 で、枠の縦横比もこの 3:2 に合わせている */
export const STICKER_ILLUSTRATION: StickerIllustration = {
  src: "/aoi/line.png",
  alt: "LINE スタンプの紹介イラスト。碧衣・ルリ・蛍のスタンプ 5 種を並べたもの",
};

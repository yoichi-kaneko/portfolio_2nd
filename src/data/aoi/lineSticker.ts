// ---- LINE スタンプ ----
// 販売ページの URL と、セクションに置く画像の参照先。
// 挿絵は後日差し替える前提のため、パスを持たせるまでは null にしておく。
// null の間は同じ縦横比の仮スペースを描画するので、差し替えてもレイアウトは動かない。

/** LINE STORE の販売ページ */
export const STICKER_STORE_URL = "https://line.me/S/sticker/36662592";

/** 販売ページへ飛ぶ QR コード（STICKER_STORE_URL から生成した静的画像） */
export const STICKER_QR = {
  src: "/aoi/line_stickers_qr.png",
  alt: "LINE スタンプ販売ページの QR コード",
  size: 480,
} as const;

export interface StickerIllustration {
  /** `public/` 配下の公開パス。null の間は仮スペースを表示する */
  src: string | null;
  alt: string;
}

/** 挿絵（差し替え待ち）。src を埋めるだけで画像に切り替わる */
export const STICKER_ILLUSTRATION: StickerIllustration = {
  src: null,
  alt: "碧衣の LINE スタンプ",
};

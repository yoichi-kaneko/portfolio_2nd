import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LineStickerSection } from "./LineStickerSection";
import { STICKER_STORE_URL } from "@/data/aoi/lineSticker";

// next/image は Next のランタイム前提の最適化を行うため、テストでは素の img に差し替える。
// fill は DOM 属性ではないため、img へは渡さない。
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    sizes,
    className,
  }: {
    src: string;
    alt: string;
    sizes?: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} sizes={sizes} className={className} />
  ),
}));

describe("LineStickerSection", () => {
  it("QR コードが販売ページへのリンクとして表示される", () => {
    render(<LineStickerSection />);

    const link = screen.getByRole("link", {
      name: "LINE STORE の販売ページを開く",
    });
    expect(link).toHaveAttribute("href", STICKER_STORE_URL);
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      screen.getByAltText("LINE スタンプ販売ページの QR コード"),
    ).toBeInTheDocument();
  });

  it("挿絵が公開パスと説明付きで表示される", () => {
    render(<LineStickerSection />);

    expect(screen.getByAltText(/LINE スタンプの紹介イラスト/)).toHaveAttribute(
      "src",
      "/aoi/line.png",
    );
  });
});

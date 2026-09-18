import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

// 挿絵は後日差し替える前提。差し替え前後の両方をこのモックで再現する。
const illustration = vi.hoisted(() => ({
  src: null as string | null,
  alt: "碧衣の LINE スタンプ",
}));

vi.mock("@/data/aoi/lineSticker", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/data/aoi/lineSticker")>();
  return { ...actual, STICKER_ILLUSTRATION: illustration };
});

const { LineStickerSection } = await import("./LineStickerSection");
const { STICKER_STORE_URL } = await import("@/data/aoi/lineSticker");

describe("LineStickerSection", () => {
  beforeEach(() => {
    illustration.src = null;
    illustration.alt = "碧衣の LINE スタンプ";
  });

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

  it("挿絵が未設定の間は仮スペースを表示する", () => {
    render(<LineStickerSection />);

    expect(
      screen.getByTestId("aoi-sticker-illustration-placeholder"),
    ).toBeInTheDocument();
    expect(screen.getByText("挿絵は準備中")).toBeInTheDocument();
  });

  it("挿絵のパスを入れると仮スペースが画像に差し替わる", () => {
    illustration.src = "/aoi/line_stickers_illustration.png";
    illustration.alt = "碧衣の LINE スタンプ";

    render(<LineStickerSection />);

    expect(
      screen.queryByTestId("aoi-sticker-illustration-placeholder"),
    ).not.toBeInTheDocument();
    expect(screen.getByAltText("碧衣の LINE スタンプ")).toHaveAttribute(
      "src",
      "/aoi/line_stickers_illustration.png",
    );
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageLightbox } from "./ImageLightbox";

const PROPS = {
  src: "https://res.cloudinary.com/demo/original/1.png",
  alt: "生成画像 1",
};

describe("ImageLightbox", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("Portal で body 直下に描画される（スタッキングコンテキストに閉じ込められない）", () => {
    // 親が z-index 付きのスタッキングコンテキストでも、Portal なら body 直下に出る
    render(
      <div style={{ position: "relative", zIndex: 2 }}>
        <ImageLightbox {...PROPS} onClose={vi.fn()} />
      </div>,
    );

    const backdrop = screen.getByTestId("aoi-lightbox-backdrop");
    expect(backdrop.parentElement).toBe(document.body);
  });

  it("開くと閉じるボタンにフォーカスが移り、背景スクロールがロックされる", () => {
    render(<ImageLightbox {...PROPS} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("閉じるとスクロールロックが解除され、元の要素にフォーカスが戻る", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "拡大表示";
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<ImageLightbox {...PROPS} onClose={vi.fn()} />);
    expect(trigger).not.toHaveFocus();

    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();

    trigger.remove();
  });

  it("Escape キーで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...PROPS} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("背景クリックで onClose が呼ばれ、ダイアログ内クリックでは呼ばれない", () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...PROPS} onClose={onClose} />);

    // ダイアログ内（画像枠）は stopPropagation で背景に届かない
    fireEvent.click(screen.getByTestId("aoi-lightbox"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("aoi-lightbox-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("✕ ボタンで onClose が呼ばれる", () => {
    const onClose = vi.fn();
    render(<ImageLightbox {...PROPS} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("WAI-ARIA ダイアログとしての属性を持つ", () => {
    render(<ImageLightbox {...PROPS} onClose={vi.fn()} />);

    const dialog = screen.getByRole("dialog", { name: "生成画像の拡大表示" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByAltText("生成画像 1")).toHaveAttribute("src", PROPS.src);
  });
});

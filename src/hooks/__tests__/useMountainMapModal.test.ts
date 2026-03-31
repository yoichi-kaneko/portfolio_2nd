import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMountainMapModal } from "../useMountainMapModal";

vi.mock("@/data/modules/mountains", () => ({
  mountains: [
    { name: "山A", date: "2021-01-01", url: "https://example.com/1", latitude: 35.0, longitude: 138.0 },
    { name: "山B", date: "2021-02-01", url: "https://example.com/2", latitude: 36.0, longitude: 139.0 },
    { name: "山C", date: "2021-03-01", url: "https://example.com/3", latitude: 37.0, longitude: 140.0 },
  ],
}));

describe("useMountainMapModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockReset();
  });

  describe("初期状態", () => {
    it("selectedIndex は null", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );
      expect(result.current.selectedIndex).toBeNull();
    });

    it("selected は null", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );
      expect(result.current.selected).toBeNull();
    });
  });

  describe("setSelectedIndex", () => {
    it("インデックスを指定すると selected が対応する山になる", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => {
        result.current.setSelectedIndex(1);
      });

      expect(result.current.selectedIndex).toBe(1);
      expect(result.current.selected?.name).toBe("山B");
    });
  });

  describe("handlePrev / handleNext", () => {
    it("handleNext でインデックスが進む", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(0); });
      act(() => { result.current.handleNext(); });

      expect(result.current.selectedIndex).toBe(1);
    });

    it("handlePrev でインデックスが戻る", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(2); });
      act(() => { result.current.handlePrev(); });

      expect(result.current.selectedIndex).toBe(1);
    });

    it("先頭で handlePrev を呼んでも 0 を下回らない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(0); });
      act(() => { result.current.handlePrev(); });

      expect(result.current.selectedIndex).toBe(0);
    });

    it("末尾で handleNext を呼んでも末尾を超えない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(2); });
      act(() => { result.current.handleNext(); });

      expect(result.current.selectedIndex).toBe(2);
    });

    it("selectedIndex が null の時 handlePrev は何もしない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.handlePrev(); });

      expect(result.current.selectedIndex).toBeNull();
    });

    it("selectedIndex が null の時 handleNext は何もしない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.handleNext(); });

      expect(result.current.selectedIndex).toBeNull();
    });
  });

  describe("キーボード操作", () => {
    it("isOpen=true の時、Escape キーで onClose が呼ばれる", () => {
      renderHook(() => useMountainMapModal({ isOpen: true, onClose }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("isOpen=false の時、Escape キーで onClose は呼ばれない", () => {
      renderHook(() => useMountainMapModal({ isOpen: false, onClose }));

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("ArrowRight キーで selectedIndex が進む", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(0); });
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      });

      expect(result.current.selectedIndex).toBe(1);
    });

    it("ArrowLeft キーで selectedIndex が戻る", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(2); });
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
      });

      expect(result.current.selectedIndex).toBe(1);
    });

    it("selectedIndex が null の時、ArrowRight は何もしない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      });

      expect(result.current.selectedIndex).toBeNull();
    });

    it("末尾で ArrowRight を押しても末尾を超えない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(2); });
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
      });

      expect(result.current.selectedIndex).toBe(2);
    });

    it("先頭で ArrowLeft を押しても 0 を下回らない", () => {
      const { result } = renderHook(() =>
        useMountainMapModal({ isOpen: true, onClose })
      );

      act(() => { result.current.setSelectedIndex(0); });
      act(() => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
      });

      expect(result.current.selectedIndex).toBe(0);
    });
  });
});

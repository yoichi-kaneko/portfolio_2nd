import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useElementSize } from "./useElementSize";

describe("useElementSize", () => {
  let resizeCallback: (() => void) | null = null;
  let disconnectSpy: ReturnType<typeof vi.fn>;
  let observeSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    disconnectSpy = vi.fn();
    observeSpy = vi.fn();
    resizeCallback = null;

    class MockResizeObserver {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
    }

    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      value: MockResizeObserver,
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      writable: true,
      value: MockResizeObserver,
    });
  });

  it("refに要素が渡されるとサイズを計測する", async () => {
    const { result } = renderHook(() => useElementSize<HTMLDivElement>());
    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", {
      value: 320,
      configurable: true,
    });
    Object.defineProperty(element, "clientHeight", {
      value: 180,
      configurable: true,
    });

    act(() => {
      result.current.ref(element);
    });

    await waitFor(() => {
      expect(result.current.size).toEqual({ width: 320, height: 180 });
    });
    expect(observeSpy).toHaveBeenCalledWith(element);
  });

  it("ResizeObserver更新でサイズを再計測する", async () => {
    const { result } = renderHook(() => useElementSize<HTMLDivElement>());
    const element = document.createElement("div");
    let width = 300;
    let height = 160;

    Object.defineProperty(element, "clientWidth", {
      get: () => width,
      configurable: true,
    });
    Object.defineProperty(element, "clientHeight", {
      get: () => height,
      configurable: true,
    });

    act(() => {
      result.current.ref(element);
    });

    await waitFor(() => {
      expect(result.current.size).toEqual({ width: 300, height: 160 });
    });

    width = 420;
    height = 210;
    act(() => {
      resizeCallback?.();
    });

    await waitFor(() => {
      expect(result.current.size).toEqual({ width: 420, height: 210 });
    });
  });

  it("unmount時にobserverを切断する", () => {
    const { result, unmount } = renderHook(() =>
      useElementSize<HTMLDivElement>(),
    );
    const element = document.createElement("div");
    Object.defineProperty(element, "clientWidth", {
      value: 1,
      configurable: true,
    });
    Object.defineProperty(element, "clientHeight", {
      value: 1,
      configurable: true,
    });

    act(() => {
      result.current.ref(element);
    });

    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});

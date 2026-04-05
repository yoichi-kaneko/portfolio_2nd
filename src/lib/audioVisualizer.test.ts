import { describe, expect, it } from "vitest";
import {
  AUDIO_VISUALIZER_BAR_GAP,
  AUDIO_VISUALIZER_BAR_WIDTH,
  AUDIO_VISUALIZER_MAX_ALPHA,
  AUDIO_VISUALIZER_MIN_ALPHA,
  AUDIO_VISUALIZER_MIN_BAR_HEIGHT,
} from "@/config/audio";
import { buildVisualizerBars } from "./audioVisualizer";

describe("buildVisualizerBars", () => {
  it("幅に応じた本数のバーを返す", () => {
    const bars = buildVisualizerBars({
      width: 40,
      height: 100,
      bufferLength: 32,
      dataArray: new Uint8Array(32),
    });
    const expectedCount = Math.floor(
      40 / (AUDIO_VISUALIZER_BAR_WIDTH + AUDIO_VISUALIZER_BAR_GAP),
    );

    expect(bars).toHaveLength(expectedCount);
  });

  it("バー高さは最小値を下回らない", () => {
    const bars = buildVisualizerBars({
      width: 16,
      height: 80,
      bufferLength: 8,
      dataArray: new Uint8Array(8).fill(0),
    });

    expect(
      bars.every((bar) => bar.barHeight >= AUDIO_VISUALIZER_MIN_BAR_HEIGHT),
    ).toBe(true);
  });

  it("alphaは設定レンジ内に収まる", () => {
    const bars = buildVisualizerBars({
      width: 16,
      height: 80,
      bufferLength: 8,
      dataArray: new Uint8Array([0, 64, 128, 255, 0, 0, 0, 0]),
    });

    expect(
      bars.every(
        (bar) =>
          bar.alpha >= AUDIO_VISUALIZER_MIN_ALPHA &&
          bar.alpha <= AUDIO_VISUALIZER_MAX_ALPHA,
      ),
    ).toBe(true);
  });

  it("barCountがbufferLengthを超えても右端バーが終端サンプルを参照する", () => {
    const bars = buildVisualizerBars({
      width: 64,
      height: 100,
      bufferLength: 4,
      dataArray: new Uint8Array([255, 255, 255, 128]),
    });

    const rightmostBar = bars.at(-1);

    expect(rightmostBar).toBeDefined();
    expect(rightmostBar?.barHeight).toBeCloseTo((128 / 255) * 100, 5);
  });
});

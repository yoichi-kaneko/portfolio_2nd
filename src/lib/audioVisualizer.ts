import {
  AUDIO_VISUALIZER_BAR_GAP,
  AUDIO_VISUALIZER_BAR_WIDTH,
  AUDIO_VISUALIZER_MAX_ALPHA,
  AUDIO_VISUALIZER_MIN_ALPHA,
  AUDIO_VISUALIZER_MIN_BAR_HEIGHT,
} from "@/config/audio";

type BuildVisualizerBarsInput = {
  width: number;
  height: number;
  bufferLength: number;
  dataArray: Uint8Array;
};

export type VisualizerBar = {
  x: number;
  barHeight: number;
  alpha: number;
};

export function buildVisualizerBars({
  width,
  height,
  bufferLength,
  dataArray,
}: BuildVisualizerBarsInput): VisualizerBar[] {
  const barCount = Math.max(
    1,
    Math.floor(width / (AUDIO_VISUALIZER_BAR_WIDTH + AUDIO_VISUALIZER_BAR_GAP)),
  );
  const step = Math.max(1, Math.floor(bufferLength / barCount));
  const alphaRange = AUDIO_VISUALIZER_MAX_ALPHA - AUDIO_VISUALIZER_MIN_ALPHA;

  return Array.from({ length: barCount }, (_, index) => {
    const value = dataArray[index * step] ?? 0;
    const normalized = value / 255;
    return {
      x: index * (AUDIO_VISUALIZER_BAR_WIDTH + AUDIO_VISUALIZER_BAR_GAP),
      barHeight: Math.max(AUDIO_VISUALIZER_MIN_BAR_HEIGHT, normalized * height),
      alpha: AUDIO_VISUALIZER_MIN_ALPHA + normalized * alphaRange,
    };
  });
}

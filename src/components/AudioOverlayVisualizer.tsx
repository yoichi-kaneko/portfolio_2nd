"use client";

import { useEffect, useRef } from "react";
import {
  AUDIO_VISUALIZER_BAR_COLOR_RGB,
  AUDIO_VISUALIZER_BAR_WIDTH,
} from "@/config/audio";
import { buildVisualizerBars } from "@/lib/audioVisualizer";

type AudioOverlayVisualizerProps = {
  analyserNode: AnalyserNode;
  width: number;
  height: number;
};

/**
 * AnalyserNode の周波数データをキャンバスにバー表示するオーバーレイ。
 */
export function AudioOverlayVisualizer({
  analyserNode,
  width,
  height,
}: AudioOverlayVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let frameId = 0;

    const draw = () => {
      analyserNode.getByteFrequencyData(dataArray);
      context.clearRect(0, 0, width, height);

      const bars = buildVisualizerBars({
        width,
        height,
        bufferLength,
        dataArray,
      });

      for (const bar of bars) {
        context.fillStyle = `rgba(${AUDIO_VISUALIZER_BAR_COLOR_RGB}, ${bar.alpha})`;
        context.fillRect(
          bar.x,
          height - bar.barHeight,
          AUDIO_VISUALIZER_BAR_WIDTH,
          bar.barHeight,
        );
      }

      frameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(frameId);
      context.clearRect(0, 0, width, height);
    };
  }, [analyserNode, width, height]);

  return <canvas ref={canvasRef} aria-hidden="true" className="block" />;
}

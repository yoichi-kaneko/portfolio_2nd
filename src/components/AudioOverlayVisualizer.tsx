"use client";

import { useEffect, useRef } from "react";

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

      const barWidth = 3;
      const gap = 1;
      const barCount = Math.max(1, Math.floor(width / (barWidth + gap)));
      const step = Math.max(1, Math.floor(bufferLength / barCount));
      let x = 0;

      for (let i = 0; i < barCount; i += 1) {
        const value = dataArray[i * step] ?? 0;
        const normalized = value / 255;
        const barHeight = Math.max(2, normalized * height);

        context.fillStyle = `rgba(59, 130, 246, ${0.2 + normalized * 0.8})`;
        context.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + gap;
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

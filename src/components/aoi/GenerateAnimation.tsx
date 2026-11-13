"use client";

import { JetBrains_Mono, Rajdhani } from "next/font/google";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { GenerateAnimationPlayer } from "@/lib/aoi/generateAnimation/player";
import { formatTimelineStatus } from "@/lib/aoi/generateAnimation/timeline";

// キャンバスに描くラベルのフォント。再生を始めたときにだけ使うため preload しない。
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  preload: false,
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "500",
  display: "swap",
  preload: false,
});

const FONTS = {
  label: `${rajdhani.style.fontFamily}, "Segoe UI", sans-serif`,
  mono: `${jetBrainsMono.style.fontFamily}, Consolas, monospace`,
};

/**
 * - idle: まだ一度も再生していない（three.js の読み込みも canvas もまだ無い）
 * - loading: three.js とフォントを読み込み、場面を組み立てている
 * - playing / paused: 再生中 / 一時停止中
 * - error: WebGL を使えないなどの理由で再生できなかった
 */
type Status = "idle" | "loading" | "playing" | "paused" | "error";

// URL の `?debug` は表示中に変わらないため、購読するものはない。
const subscribeNothing = () => () => {};
const readDebugFlag = () =>
  new URLSearchParams(window.location.search).has("debug");
const readDebugFlagOnServer = () => false;

/**
 * 画像生成プロセスを表す 3D アニメーション。
 *
 * アクセスしただけでは再生しない。中央の再生ボタンを押すと three.js を読み込んで再生を始め、
 * 再生中に表示要素をもう一度押すと一時停止する。URL に `?debug` を付けると、
 * ループ内の時刻と場面名（タイムライン）を左下に表示する。
 */
export function GenerateAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<GenerateAnimationPlayer | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const debug = useSyncExternalStore(
    subscribeNothing,
    readDebugFlag,
    readDebugFlagOnServer,
  );

  useEffect(
    () => () => {
      playerRef.current?.dispose();
      playerRef.current = null;
    },
    [],
  );

  useEffect(() => {
    // 再生を始めるまでは、0 秒で止まっている状態を表示しておく。以後は再生器が書き込む。
    if (debug && timelineRef.current && !playerRef.current) {
      timelineRef.current.textContent = formatTimelineStatus(0, true);
    }
  }, [debug]);

  // 再生ボタンが押されて canvas を置いたあとで、three.js を読み込んで場面を組み立て、再生を始める。
  useEffect(() => {
    if (status !== "loading") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    void (async () => {
      try {
        const { createGenerateAnimationPlayer } =
          await import("@/lib/aoi/generateAnimation/player");
        if (cancelled) return;
        const player = await createGenerateAnimationPlayer({
          canvas,
          fonts: FONTS,
          timeline: timelineRef.current,
        });
        if (cancelled) {
          player.dispose();
          return;
        }
        playerRef.current = player;
        player.play();
        setStatus("playing");
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleClick = () => {
    const player = playerRef.current;
    if (status === "idle") {
      setStatus("loading");
    } else if (status === "playing" && player) {
      player.pause();
      setStatus("paused");
    } else if (status === "paused" && player) {
      player.play();
      setStatus("playing");
    }
  };

  const playing = status === "playing";

  return (
    <div
      data-testid="aoi-generate-animation"
      data-state={status}
      className="relative mb-[18px] aspect-video w-full overflow-hidden rounded-[16px] border border-[rgba(127,212,255,0.22)] bg-[#02040b] bg-[radial-gradient(60%_70%_at_50%_52%,rgba(0,34,56,0.55),transparent_70%)]"
    >
      {/* アクセスしただけでは WebGL を使わないよう、canvas は再生ボタンを押してから置く */}
      {status !== "idle" && status !== "error" && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
        />
      )}

      {status === "error" ? (
        <p className="absolute inset-0 m-0 flex items-center justify-center p-[24px] text-center text-[13px] leading-[1.8] text-[#90a4c2]">
          この環境ではアニメーションを再生できませんでした。
        </p>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-label={
            playing
              ? "画像生成プロセスのアニメーションを一時停止"
              : "画像生成プロセスのアニメーションを再生"
          }
          aria-busy={status === "loading"}
          className="group absolute inset-0 z-[2] flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#7fd4ff]"
        >
          {playing ? (
            // 再生中は絵を隠さないよう、ホバー・フォーカス時だけ一時停止できることを示す
            <span
              aria-hidden="true"
              className="absolute top-[12px] right-[12px] flex size-[34px] items-center justify-center rounded-full border border-[rgba(127,212,255,0.4)] bg-[rgba(8,20,40,0.7)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              <svg viewBox="0 0 24 24" className="size-[14px] fill-[#cfefff]">
                <rect x="5" y="4" width="5" height="16" rx="1" />
                <rect x="14" y="4" width="5" height="16" rx="1" />
              </svg>
            </span>
          ) : (
            <>
              {status === "paused" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[rgba(2,4,11,0.35)]"
                />
              )}
              <span
                data-testid="aoi-generate-animation-play-icon"
                aria-hidden="true"
                className="relative flex size-[72px] items-center justify-center rounded-full border border-[rgba(127,212,255,0.55)] bg-[rgba(8,20,40,0.75)] shadow-[0_0_32px_rgba(95,227,255,0.3)] transition-transform group-hover:scale-[1.06] max-sm:size-[56px]"
              >
                {status === "loading" ? (
                  <span className="size-[26px] animate-spin rounded-full border-[3px] border-[rgba(127,212,255,0.25)] border-t-[#7fd4ff]" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-[4px] size-[28px] fill-[#cfefff]"
                  >
                    <path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5Z" />
                  </svg>
                )}
              </span>
              {status === "idle" && (
                <span
                  aria-hidden="true"
                  className="absolute top-[calc(50%+52px)] font-space text-[11px] tracking-[0.22em] text-[#8fc6ea] max-sm:top-[calc(50%+40px)] max-sm:text-[10px]"
                >
                  {"IMAGE GENERATION PROCESS — 40s"}
                </span>
              )}
            </>
          )}
        </button>
      )}

      {debug && (
        <div
          ref={timelineRef}
          data-testid="aoi-generate-animation-timeline"
          className="pointer-events-none absolute bottom-[12px] left-[12px] z-[3] max-w-[calc(100%-24px)] rounded-[6px] border border-[rgba(95,227,255,0.4)] bg-[rgba(2,8,20,0.7)] px-[10px] py-[6px] font-space text-[12px] leading-[1.4] whitespace-pre-wrap text-[#bfefff]"
        />
      )}
    </div>
  );
}

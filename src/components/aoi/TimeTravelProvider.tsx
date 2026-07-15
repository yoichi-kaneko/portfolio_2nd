"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  resolveMode,
  type AoiModeKey,
  type ResolvedMode,
} from "@/lib/aoi/resolveMode";

// 「時間旅行きっぷ」の状態。ウィジェット・切符・空のティントの 3 か所に跨るため、
// NightModeProvider と同じく context に閉じ込め、他のセクションはサーバーのまま保つ。
// Provider はヒーロー右カラム（画像＋ウィジェット＋切符）だけを包む。

const SCRAMBLE_MS = 700;

interface TimeTravelContextValue {
  /** 表示用の解決済み値（時間旅行中は clock が仮想時刻になる） */
  resolved: ResolvedMode;
  /** 手動で選ばれているモード。null = 現実の時刻に従う */
  override: AoiModeKey | null;
  /** 切替直後、時計の数字がカラカラ回っている演出中か */
  scrambling: boolean;
  /** 切符に乗る。現在時刻に対応するモードの切符を選ぶと現実に帰還する */
  travelTo: (key: AoiModeKey) => void;
}

const TimeTravelContext = createContext<TimeTravelContextValue | null>(null);

const randDigit = () => Math.floor(Math.random() * 10);
const randomClock = () =>
  `${randDigit()}${randDigit()}:${randDigit()}${randDigit()}:${randDigit()}${randDigit()}`;

export function TimeTravelProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [now, setNow] = useState<Date | null>(null);
  const [override, setOverride] = useState<AoiModeKey | null>(null);
  const [overrideStart, setOverrideStart] = useState(0);
  const [scrambleUntil, setScrambleUntil] = useState(0);
  const [, setScrambleTick] = useState(0);

  useEffect(() => {
    // マウント後にクライアント側の時刻を反映（初期値 null は SSR 不一致回避のため）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // スクランブル演出中だけ高頻度で再描画してランダム数字を回す
    if (!scrambleUntil) return;
    const t = setInterval(() => {
      setScrambleTick((v) => v + 1);
      if (Date.now() >= scrambleUntil) setScrambleUntil(0);
    }, 60);
    return () => clearInterval(t);
  }, [scrambleUntil]);

  const base = resolveMode(now, override, overrideStart);
  const scrambling = override !== null && scrambleUntil > 0;
  const resolved = scrambling ? { ...base, clock: randomClock() } : base;

  const travelTo = (key: AoiModeKey) => {
    if (key === base.realModeKey) {
      // 「いま」札の付いた切符 = 現実の時刻に帰還
      setOverride(null);
      setScrambleUntil(0);
      return;
    }
    // すでに乗車中の切符を再度クリックしても仮時刻はリセットしない
    if (key === override) return;
    setOverride(key);
    setOverrideStart(Date.now());
    setScrambleUntil(Date.now() + SCRAMBLE_MS);
  };

  return (
    <TimeTravelContext.Provider
      value={{ resolved, override, scrambling, travelTo }}
    >
      {children}
    </TimeTravelContext.Provider>
  );
}

export function useTimeTravel(): TimeTravelContextValue {
  const ctx = useContext(TimeTravelContext);
  if (!ctx) {
    throw new Error("useTimeTravel must be used within a TimeTravelProvider");
  }
  return ctx;
}

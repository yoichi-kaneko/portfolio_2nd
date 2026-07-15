"use client";

import { createContext, useContext, useState } from "react";

// 夜モード（灯りの ON/OFF）はナビ・フッター・夜オーバーレイの 3 か所に跨る唯一の
// クライアント状態。context で共有し、各セクションはサーバーコンポーネントのまま保つ。
interface NightModeContextValue {
  night: boolean;
  toggleNight: () => void;
}

const NightModeContext = createContext<NightModeContextValue | null>(null);

export function NightModeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // 移植元の `startInNightMode || false` 準拠。default:true はデザインツールの
  // プレビュー用 props であり、props 注入のない実ページでは灯り ON（false）が初期状態。
  const [night, setNight] = useState(false);
  const toggleNight = () => setNight((v) => !v);

  return (
    <NightModeContext.Provider value={{ night, toggleNight }}>
      {children}
    </NightModeContext.Provider>
  );
}

export function useNightMode(): NightModeContextValue {
  const ctx = useContext(NightModeContext);
  if (!ctx) {
    throw new Error("useNightMode must be used within a NightModeProvider");
  }
  return ctx;
}

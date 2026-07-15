import { describe, expect, it } from "vitest";
import { getModeKeyForHour, resolveMode } from "./resolveMode";

// JST の壁時計を直接指定して Date を作る（テスト実行環境のタイムゾーンに依存させない）
const jst = (iso: string) => new Date(`${iso}+09:00`);

describe("getModeKeyForHour", () => {
  it.each([
    [0, "sayo"],
    [3, "sayo"],
    [4, "akatsuki"],
    [10, "akatsuki"],
    [11, "nozomi"],
    [15, "nozomi"],
    [16, "sayo"],
    [23, "sayo"],
  ] as const)("%i 時 → %s", (hour, expected) => {
    expect(getModeKeyForHour(hour)).toBe(expected);
  });
});

describe("resolveMode（通常運行）", () => {
  it("now が null の間は初期表示用のデフォルト値を返す", () => {
    const r = resolveMode(null);
    expect(r.clock).toBe("--:--:--");
    expect(r.realClock).toBe("--:--:--");
    expect(r.realModeKey).toBeNull();
    expect(r.modeJp).toBe("暁");
    expect(r.dateStr).toBe("");
    expect(r.isOverride).toBe(false);
  });

  it("JST の実時刻から時計とモードを導出する", () => {
    const r = resolveMode(jst("2026-07-15T10:15:30"));
    expect(r.clock).toBe("10:15:30");
    expect(r.realClock).toBe("10:15:30");
    expect(r.realModeKey).toBe("akatsuki");
    expect(r.modeJp).toBe("暁");
    expect(r.isOverride).toBe(false);
  });

  it("UTC で渡しても JST に変換して判定する", () => {
    // 01:00 UTC = JST 10:00 → 暁
    const r = resolveMode(new Date("2026-07-15T01:00:00Z"));
    expect(r.clock).toBe("10:00:00");
    expect(r.realModeKey).toBe("akatsuki");
  });
});

describe("resolveMode（時間旅行 override）", () => {
  const start = jst("2026-07-15T10:00:00");

  it("切替直後は代表時刻（startSec）から始まる", () => {
    const r = resolveMode(start, "sayo", start.getTime());
    expect(r.clock).toBe("21:00:00");
    expect(r.modeJp).toBe("小夜");
    expect(r.isOverride).toBe(true);
  });

  it("切替から N 秒後は代表時刻 + N 秒になる", () => {
    const now = new Date(start.getTime() + 65_000);
    const r = resolveMode(now, "sayo", start.getTime());
    expect(r.clock).toBe("21:01:05");
  });

  it("仮想時刻は 24 時間でラップする", () => {
    // 小夜 21:00 発 + 4 時間 = 01:00
    const now = new Date(start.getTime() + 4 * 3600 * 1000);
    const r = resolveMode(now, "sayo", start.getTime());
    expect(r.clock).toBe("01:00:00");
  });

  it("override 中も実時刻・実モードを併記する", () => {
    const now = new Date(start.getTime() + 5_000);
    const r = resolveMode(now, "sayo", start.getTime());
    expect(r.clock).toBe("21:00:05");
    expect(r.realClock).toBe("10:00:05");
    expect(r.realModeKey).toBe("akatsuki");
    expect(r.realModeJp).toBe("暁");
  });

  it("overrideStart が now より未来でも経過時間が負にならない", () => {
    const r = resolveMode(start, "nozomi", start.getTime() + 10_000);
    expect(r.clock).toBe("13:30:00");
  });
});

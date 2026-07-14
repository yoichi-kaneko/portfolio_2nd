// 現在時刻（JST）から、碧衣の「ただいまの判定モード」ウィジェットに表示する値を導出する純関数。
// SSR とのハイドレーション不一致を避けるため、now が null のときは初期表示用のデフォルト値を返す。
//
// 時間旅行（手動モード切替）対応:
// override を指定すると、そのモードの代表時刻（startSec）から進み続ける「仮想時刻」を
// clock として返す。実時刻・実モードは realClock / realModeJp に常に併記される。

export type AoiModeKey = "akatsuki" | "nozomi" | "sayo";

export interface AoiModeDef {
  key: AoiModeKey;
  jp: string;
  yomi: string;
  line: string;
  /** 仮想時刻の出発点（0:00 からの秒数） */
  startSec: number;
}

export const AOI_MODES: Record<AoiModeKey, AoiModeDef> = {
  akatsuki: {
    key: "akatsuki",
    jp: "暁",
    yomi: "あかつき",
    line: "おはようございます。今日の空と予定を、私の方で整えておきました。",
    startSec: 7 * 3600, // 07:00 発
  },
  nozomi: {
    key: "nozomi",
    jp: "望",
    yomi: "のぞみ",
    line: "お昼ですね。今のあなたに、短い言葉をひとつだけ。",
    startSec: 13.5 * 3600, // 13:30 発
  },
  sayo: {
    key: "sayo",
    jp: "小夜",
    yomi: "さよ",
    line: "一日、おつかれさまでした。今日の景色を、一枚だけ残しておきます。",
    startSec: 21 * 3600, // 21:00 発
  },
};

export const AOI_MODE_ORDER: AoiModeKey[] = ["akatsuki", "nozomi", "sayo"];

export function getModeKeyForHour(hour: number): AoiModeKey {
  if (hour >= 4 && hour < 11) return "akatsuki";
  if (hour >= 11 && hour < 16) return "nozomi";
  return "sayo";
}

export interface ResolvedMode {
  clock: string;
  modeJp: string;
  modeYomi: string;
  modeLine: string;
  dateStr: string;
  /** now が null の間は null */
  realModeKey: AoiModeKey | null;
  realModeJp: string;
  realClock: string;
  isOverride: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function jstClockParts(now: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
  let hh = get("hour");
  if (hh === "24") hh = "00";
  return { hh, mm: get("minute"), ss: get("second"), hour: parseInt(hh, 10) };
}

export function resolveMode(
  now: Date | null,
  override: AoiModeKey | null = null,
  overrideStart = 0,
): ResolvedMode {
  let clock = "--:--:--";
  let mode = AOI_MODES.akatsuki;
  let dateStr = "";
  let realModeKey: AoiModeKey | null = null;
  let realClock = "--:--:--";

  if (now) {
    const { hh, mm, ss, hour } = jstClockParts(now);
    realModeKey = getModeKeyForHour(hour);
    realClock = `${hh}:${mm}:${ss}`;

    if (override) {
      // 仮想時刻: 代表時刻から、切替時点を起点に進み続ける
      const t =
        AOI_MODES[override].startSec +
        Math.max(0, Math.floor((now.getTime() - overrideStart) / 1000));
      clock = `${pad2(Math.floor(t / 3600) % 24)}:${pad2(Math.floor(t / 60) % 60)}:${pad2(t % 60)}`;
      mode = AOI_MODES[override];
    } else {
      clock = realClock;
      mode = AOI_MODES[realModeKey];
    }

    dateStr = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(now);
  }

  return {
    clock,
    modeJp: mode.jp,
    modeYomi: mode.yomi,
    modeLine: mode.line,
    dateStr,
    realModeKey,
    realModeJp: realModeKey ? AOI_MODES[realModeKey].jp : mode.jp,
    realClock,
    isOverride: override !== null,
  };
}

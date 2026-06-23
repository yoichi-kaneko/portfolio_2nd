// 現在時刻（JST）から、碧衣の「ただいまの判定モード」ウィジェットに表示する値を導出する純関数。
// SSR とのハイドレーション不一致を避けるため、now が null のときは初期表示用のデフォルト値を返す。

export interface ResolvedMode {
  clock: string;
  modeJp: string;
  modeYomi: string;
  modeLine: string;
  dateStr: string;
}

export function resolveMode(now: Date | null): ResolvedMode {
  let clock = "--:--:--";
  let modeJp = "暁";
  let modeYomi = "あかつき";
  let modeLine =
    "おはようございます。今日の空と予定を、私の方で整えておきました。";
  let dateStr = "";

  if (now) {
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
    const mm = get("minute");
    const ss = get("second");
    const hourNum = parseInt(hh, 10);

    if (hourNum >= 4 && hourNum < 11) {
      modeJp = "暁";
      modeYomi = "あかつき";
      modeLine =
        "おはようございます。今日の空と予定を、私の方で整えておきました。";
    } else if (hourNum >= 11 && hourNum < 16) {
      modeJp = "望";
      modeYomi = "のぞみ";
      modeLine = "お昼ですね。今のあなたに、短い言葉をひとつだけ。";
    } else {
      modeJp = "小夜";
      modeYomi = "さよ";
      modeLine =
        "一日、おつかれさまでした。今日の景色を、一枚だけ残しておきます。";
    }

    clock = `${hh}:${mm}:${ss}`;
    dateStr = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(now);
  }

  return { clock, modeJp, modeYomi, modeLine, dateStr };
}

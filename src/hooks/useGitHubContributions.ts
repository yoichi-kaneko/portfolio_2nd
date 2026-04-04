import { useEffect, useState } from "react";

type WeeklyContribution = {
  week: string;
  count: number;
};

export type GitHubChartData = {
  weekLabel: string;
  count: number;
};

/**
 * GitHub Contributions API から週次データを取得し、
 * 棒グラフ表示用の形式へ変換して返すカスタムフック。
 *
 * API は `W1`(直近) → `Wn`(最古) の順で返すため、
 * チャート表示に合わせて古い順(`Wn` → `W1`)へ並び替える。
 *
 * @returns `data` と `loading` 状態
 */
export function useGitHubContributions() {
  const [data, setData] = useState<GitHubChartData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github/contributions")
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json: { weekly: WeeklyContribution[] }) => {
        // W1=直近〜W5=最古 → チャートは左が古い順なので逆順にして表示
        const chartData = [...json.weekly].reverse().map((c) => {
          const weekNum = parseInt(c.week.replace("W", ""), 10);
          return {
            weekLabel: weekNum === 1 ? "1 week ago" : `${weekNum} weeks ago`,
            count: c.count,
          };
        });
        setData(chartData);
      })
      .catch(() => {
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

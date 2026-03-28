import { fetchWeeklyContributions } from "@/lib/github";
import { GitHubContributionChart } from "./GitHubContributionChart";

export async function GitHubCard() {
  let data: { weekLabel: string; count: number }[] | null = null;

  try {
    const contributions = await fetchWeeklyContributions();
    // W1=直近〜W5=最古 → チャートは左が古い順なので逆順にして表示
    data = [...contributions].reverse().map((c) => {
      const weekNum = parseInt(c.week.replace("W", ""), 10);
      return {
        weekLabel: weekNum === 1 ? "1 week ago" : `${weekNum} weeks ago`,
        count: c.count,
      };
    });
  } catch {
    // API失敗時は No Data 表示にフォールバック
  }

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
        GitHub Contributions
      </p>
      {data ? (
        <GitHubContributionChart data={data} />
      ) : (
        <p className="text-xs text-gray-600 h-12 flex items-center justify-center">
          No Data
        </p>
      )}
      <p className="text-xs mt-3 text-gray-400">yoichi-kaneko</p>
    </div>
  );
}

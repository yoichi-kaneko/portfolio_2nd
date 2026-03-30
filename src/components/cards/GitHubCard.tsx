"use client";

import { useEffect, useState } from "react";
import { GitHubContributionChart } from "./GitHubContributionChart";

type WeeklyContribution = {
  week: string;
  count: number;
};

type ChartData = { weekLabel: string; count: number };

function GitHubCardSkeleton() {
  return (
    <div className="text-center animate-pulse w-full" data-testid="github-card-skeleton">
      <div className="h-2 w-32 bg-gray-800 rounded mx-auto mb-3" />
      <div className="h-12 bg-gray-800 rounded" />
      <div className="h-2 w-20 bg-gray-800 rounded mx-auto mt-3" />
    </div>
  );
}

export function GitHubCard() {
  const [data, setData] = useState<ChartData[] | null>(null);
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

  if (loading) {
    return <GitHubCardSkeleton />;
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

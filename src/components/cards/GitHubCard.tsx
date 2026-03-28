import { fetchWeeklyContributions, type WeeklyContribution } from "@/lib/github";

export async function GitHubCard() {
  let weekly: WeeklyContribution[] = [];
  try {
    weekly = await fetchWeeklyContributions();
  } catch {
    // PAT未設定など開発中は空表示
  }

  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
        GitHub Contributions
      </p>
      {/* TODO: Replace with bar chart using weekly data */}
      <div className="flex gap-1 justify-center items-end h-12">
        {weekly.length === 0 ? (
          <p className="text-xs text-gray-600">No data</p>
        ) : (
          weekly.map(({ week, count }) => (
            <div
              key={week}
              className="w-3 bg-green-600 rounded-sm"
              style={{ height: `${Math.max(count * 4, 4)}px` }}
              title={`${week}: ${count}`}
            />
          ))
        )}
      </div>
      <p className="text-xs mt-3 text-gray-400">yoichi-kaneko</p>
    </div>
  );
}

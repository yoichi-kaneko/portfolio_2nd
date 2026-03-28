import { GitHubContributionChart } from "./GitHubContributionChart";

// 仮データ：4段階全ての色が確認できるパターン
const DUMMY_DATA = [
  { weekLabel: "5 weeks ago", count: 0 },   // gray-800
  { weekLabel: "4 weeks ago", count: 3 },   // green-900
  { weekLabel: "3 weeks ago", count: 10 },  // green-700
  { weekLabel: "2 weeks ago", count: 20 },  // green-500
  { weekLabel: "1 week ago", count: 5 },    // green-900
];

export async function GitHubCard() {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
        GitHub Contributions
      </p>
      <GitHubContributionChart data={DUMMY_DATA} />
      <p className="text-xs mt-3 text-gray-400">yoichi-kaneko</p>
    </div>
  );
}

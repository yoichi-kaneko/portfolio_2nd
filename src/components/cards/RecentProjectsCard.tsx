export function RecentProjectsCard() {
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">Recent Projects</h3>
        <a href="#" className="text-sm text-blue-400 hover:underline">
          View All
        </a>
      </div>
      {/* Phase 3 で data/projects.json と連携 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <p className="font-bold text-sm">株式会社カオナビ</p>
          <p className="text-xs text-gray-400 mt-1">
            人事開発システムの開発 (2020–2024)
          </p>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <p className="font-bold text-sm">筑波大学 研究室</p>
          <p className="text-xs text-gray-400 mt-1">
            シミュレーション受託開発
          </p>
        </div>
      </div>
    </>
  );
}

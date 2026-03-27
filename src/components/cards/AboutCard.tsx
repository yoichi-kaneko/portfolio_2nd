export function AboutCard() {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-400 leading-relaxed">
          10年の正社員経験を経て独立。PHP / Laravel を軸に、大規模人事システムから大学の研究開発まで幅広く対応します。
        </p>
      </div>
      {/* 稼働ステータス — Phase 2 スコープ */}
      <div className="mt-8">
        <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Available — スマレジ / 勤怠管理システム従事中
        </span>
      </div>
    </div>
  );
}

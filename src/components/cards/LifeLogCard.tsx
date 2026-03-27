export function LifeLogCard() {
  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">
        Life Log
      </h3>
      <p className="text-2xl font-bold">Mountaineering</p>
      {/* Phase 3 で登山データと連携 */}
      <div className="mt-4 text-xs text-gray-400">
        <p>最近の登頂: 谷川岳</p>
        <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-blue-500" />
        </div>
        <p className="mt-1 text-[10px] text-right">
          Goal to 100 Famous Mountains
        </p>
      </div>
    </>
  );
}

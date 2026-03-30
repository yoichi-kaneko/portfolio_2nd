"use client";

export function LifeLogCard() {
  return (
    <>
      {/* Header row */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Life Log
          </h3>
          <p className="text-2xl font-bold mt-1">Mountaineering</p>
        </div>
        {/* 音声リンク: 目立たせず右上に小さく配置 */}
        <button
          className="text-gray-600 hover:text-gray-400 transition-colors mt-1"
          title="なぜポートフォリオに登山？（音声で聞く）"
          onClick={() => {/* TODO: 音声再生 */}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 最近の登頂 */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">最近の登頂</p>
          <p className="text-sm font-semibold">谷川岳</p>
        </div>
        {/* レポート件数 */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">登山レポート</p>
          <p className="text-sm font-semibold">
            <span className="text-xl font-bold text-blue-400">142</span>
            <span className="text-gray-400 ml-1">件</span>
          </p>
        </div>
      </div>

      {/* Progress bar + Map link */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-[10px] text-gray-500">Goal to 100 Famous Mountains</p>
          <button
            className="text-[10px] text-blue-500 hover:text-blue-400 hover:underline transition-colors"
            onClick={() => {/* TODO: Mapモーダルを開く */}}
          >
            🗺️ Map
          </button>
        </div>
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-blue-500" />
        </div>
        <p className="mt-1 text-[10px] text-right text-gray-600">75 / 100</p>
      </div>
    </>
  );
}

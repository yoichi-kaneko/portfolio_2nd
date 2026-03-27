import { BentoCard } from "@/components/BentoCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">
            Web Studio{" "}
            <span className="text-blue-500">Wanderlust</span>
          </h1>
          <p className="text-gray-400">Freelance Engineer / Yoichi Kaneko</p>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* About — col-span-2, row-span-2 */}
          <BentoCard className="md:col-span-2 md:row-span-2 flex flex-col justify-between">
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
          </BentoCard>

          {/* GitHub Contributions — col-span-2 */}
          <BentoCard className="md:col-span-2 flex items-center justify-center min-h-40">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
                GitHub Contributions
              </p>
              {/* Phase 3 で実データに差し替え */}
              <div className="flex gap-1">
                {["bg-gray-800", "bg-green-900", "bg-green-700", "bg-green-500", "bg-gray-800"].map(
                  (color, i) => (
                    <div key={i} className={`w-3 h-3 ${color} rounded-sm`} />
                  )
                )}
              </div>
              <p className="text-xs mt-3 text-gray-400">yoichi-kaneko</p>
            </div>
          </BentoCard>

          {/* Tech Stack — col-span-1 */}
          <BentoCard>
            <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
              Tech Stack
            </h3>
            {/* Phase 3 で data/skills.json と連携 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>PHP / Laravel</span>
                <span className="text-blue-400">Expert</span>
              </div>
              <div className="flex justify-between">
                <span>Ruby / Rails</span>
                <span className="text-gray-400">Intermediate</span>
              </div>
              <div className="flex justify-between">
                <span>JavaScript / Vue</span>
                <span className="text-gray-400">Pro</span>
              </div>
            </div>
          </BentoCard>

          {/* Social — col-span-1 */}
          <BentoCard>
            <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
              Social
            </h3>
            {/* Phase 3 でリンク先を埋める */}
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Line
              </a>
            </div>
          </BentoCard>

          {/* Recent Projects — col-span-3 */}
          <BentoCard className="md:col-span-3">
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
          </BentoCard>

          {/* Life Log — col-span-1 */}
          <BentoCard className="bg-gradient-to-br from-blue-900/20 to-[#161616]">
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
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

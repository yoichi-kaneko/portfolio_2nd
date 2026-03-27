export function TechStackCard() {
  return (
    <>
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
    </>
  );
}

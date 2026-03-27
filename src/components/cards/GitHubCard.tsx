export function GitHubCard() {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest">
        GitHub Contributions
      </p>
      {/* Phase 3 で実データに差し替え */}
      <div className="flex gap-1 justify-center">
        {["bg-gray-800", "bg-green-900", "bg-green-700", "bg-green-500", "bg-gray-800"].map(
          (color, i) => (
            <div key={i} className={`w-3 h-3 ${color} rounded-sm`} />
          )
        )}
      </div>
      <p className="text-xs mt-3 text-gray-400">yoichi-kaneko</p>
    </div>
  );
}

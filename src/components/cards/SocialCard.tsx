export function SocialCard() {
  return (
    <>
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
    </>
  );
}

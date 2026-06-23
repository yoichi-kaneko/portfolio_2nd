import { STARS } from "@/data/aoi/stars";

export function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {STARS.map((cls, i) => (
        <span key={i} className={`absolute ${cls}`}>
          ✦
        </span>
      ))}
    </div>
  );
}

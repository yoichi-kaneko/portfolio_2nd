// count がこの値以下なら対応する color を使う（最後のエントリは上限なし）
export const BAR_COLOR_STEPS: { max: number; color: string }[] = [
  { max: 10, color: "#1f2937" },  // gray-800
  { max: 25, color: "#14532d" },  // green-900
  { max: 45, color: "#15803d" }, // green-700
  { max: Infinity, color: "#22c55e" }, // green-500
];

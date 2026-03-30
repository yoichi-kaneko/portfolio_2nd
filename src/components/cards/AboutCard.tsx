import status from "../../../data/status.json";

export function AboutCard() {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <p className="text-gray-400 leading-relaxed">
        バックエンドとフロントエンド、両方を自分の手で動かせるフルスタックエンジニアです。
        PHP / Laravel・Ruby / Rails によるAPI設計から、React を使ったインタラクティブな UI 実装まで幅広く対応。
        人事・教育・不動産・研究など多様な領域のプロダクト開発を経験し、現在はフリーランスとして稼働中。
        個人プロジェクトとして LINE と生成AI を組み合わせたチャットボットを開発・運用しています。
        「動くものをちゃんと作る」を信条に、実用的なプロダクト開発を続けています。
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {status.statuses.map((s) => (
          <span
            key={s.label}
            className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {s.label} — {s.description}
          </span>
        ))}
      </div>
    </div>
  );
}

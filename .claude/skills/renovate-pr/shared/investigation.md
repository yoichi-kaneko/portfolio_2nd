# 依存関係の更新内容の調査

renovate-pr と renovate-batch の両方から参照する共通の手順。どちらかのスキルを廃止するときは、この
`shared/` ディレクトリを残る側へ移し、参照しているリンクを書き換える。

パッケージごとに、旧版より後から新版までのすべての版を調べる（途中の版を飛ばさない）。調査の深さは
更新の大きさに合わせる。patch 更新なら変更点の確認と使用箇所の照合で足り、major 更新なら移行ガイド
まで読む。結果は作業ファイルに書き溜める。

## 調べること

1. 変更内容
   - リポジトリ: `pnpm view <pkg>@<新版> repository.url`、または PR 本文の source リンク
   - リリースノート: `gh api "repos/<owner>/<repo>/releases?per_page=100"` から該当するタグを探して
     本文を読む。モノレポではタグの付け方がパッケージごとに違う（`v16.3.6`、`<pkg>@1.2.3` など）。
   - リリースノートが空または見つからない場合は CHANGELOG を読む（`gh api repos/<owner>/<repo>/contents/<path>`）。
     それも無ければ `gh api repos/<owner>/<repo>/compare/<旧タグ>...<新タグ>` のコミット一覧から判断する。
   - 公開日時: `pnpm view <pkg> time --json`（lockfile を生成するときの公開日数制限の判断にも使う）
2. 互換性
   - `pnpm view <pkg>@<新版> engines peerDependencies --json` で、`engines.node` が `.nvmrc` の
     メジャーを満たすかと、peer の要求がこのリポジトリの版と合うかを確認する。
   - 破壊的変更（BREAKING CHANGES、非推奨化、既定値の変更、API の削除）を拾う。
3. このリポジトリでの使われ方
   - `src/` / `e2e/` / 設定ファイル（`*.config.*`、`eslint.config.mjs` など）で該当パッケージを
     import・参照している箇所を検索し、変更点が当たるかを照合する。
   - 次の「このリポジトリ固有の確認事項」に該当するものは必ず確認する。

## このリポジトリ固有の確認事項

- `typescript` / `typescript-eslint` / `@typescript-eslint/*` / `ts-api-utils` / `eslint-config-next`:
  `.pnpmfile.mjs` の条件（`typescript-eslint` と `@typescript-eslint/*` は `8.` で始まる版、
  `ts-api-utils` は `2.` で始まる版）と、置き換え先の `@typescript/typescript6@6.0.2` が更新後も
  成り立つか。メジャーが上がって条件から外れると、TypeScript 7 のもとで lint が壊れうる。
- `next` / `eslint-config-next`: 同じ版にそろっているか。minor 以上の更新では、AGENTS.md のとおり
  `node_modules/next/dist/docs/` で、使っている API の非推奨や変更を確認する。このドキュメントは
  新しい版を入れたあとでないと読めないので、lockfile を生成して依存を入れ直したあとに確認する。
- `react` / `react-dom` / `@types/react` / `@types/react-dom`、`tailwindcss` / `@tailwindcss/postcss`:
  組になるパッケージの版がそろっているか。
- `@types/node`: メジャーが `.nvmrc` の Node.js のメジャーと一致するか。
- `.nvmrc`（Node.js）: CI の `actions/setup-node` と、クラウドセッションの
  `.claude/hooks/session-start.sh` がこのファイルを読む。ローカルの `node --version` のメジャーが
  新しい版と違う場合、ローカル検証は旧い Node.js で行うことになるので、その旨を結果に記録し、新しい版
  での検証は CI に任せる。
- `pnpm`（`packageManager`）: CI の `pnpm/action-setup` はこの値を読む。設定の既定値の変更
  （`pnpm-workspace.yaml` の `allowBuilds` や `minimumReleaseAge` に関わるもの）が無いか。
- `@playwright/test`: AGENTS.md の E2E ブラウザ導入手順は、版ごとのブラウザの配布方法に依存する。
  版が変わるときは、lockfile を生成して依存を入れ直したあとに AGENTS.md に書いた
  `pnpm exec playwright install --dry-run chromium` で記述が古くなっていないかを確認し、ずれていれば
  調査結果で指摘する。E2E 自体はスキルでは実行せず、CI に任せる。

## リスクの判定

| 判定 | 基準                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 高   | 破壊的変更がこのリポジトリの使用箇所に当たる / 移行作業が必要 / ローカル検証（[lockfile.md](lockfile.md)）が失敗した                              |
| 中   | 破壊的変更や挙動の変更はあるが該当箇所は見当たらない / リリースノートが得られず判断しきれない / 実行時の依存（`dependencies`）の minor 以上の更新 |
| 低   | バグ修正のみで該当する懸念が無い / 開発用の依存で、検証が通った                                                                                   |

PR 全体の判定は、含まれるパッケージの判定のうち最も高いものとする。renovate-batch では、取り込む
Renovate PR ごとの判定と、作成する PR 全体の判定の両方をこの方法で決める。

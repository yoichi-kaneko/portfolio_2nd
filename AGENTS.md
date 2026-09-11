<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# E2E のブラウザは必要になった時点で導入する

クラウドセッション（Claude Code on the web）の `SessionStart` フックが用意するのは Node.js と
`pnpm install --frozen-lockfile` までで、Playwright のブラウザは入っていない。ブラウザの
ダウンロードは時間もディスクも大きく消費するため、E2E に触れないセッションでは導入しない。

## 導入して E2E を実行する条件

次のいずれかに該当する変更を行ったら、そのセッションで一度だけブラウザを導入し、`pnpm test:e2e`
まで実行してから作業を完了とする。

- `src/components/**` / `src/app/**` の UI を変更した
- `e2e/**` のテストを追加・変更した
- `playwright.config.ts` を変更した

データ更新のみ、ドキュメント修正のみといった画面の挙動に影響しない変更では導入しない。

## 手順

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

- `playwright.config.ts` の project は `chromium` と `mobile-chromium` の2つだが、どちらも
  Chromium（Desktop Chrome / Pixel 7 エミュレーション）なので、導入対象は `chromium` だけでよい。
- 導入済みなら再ダウンロードされないため、入っているか分からないときはそのまま実行してよい。
  ブラウザは `~/.cache/ms-playwright` に置かれ、`pnpm install` では消えない。
- `pnpm test:e2e` はポート3001に E2E 専用の開発サーバーを自前で起動する。事前に `pnpm dev` を
  起動する必要はなく、環境変数の指定も不要（`e2e/support/start-server.mjs` が組み立てる）。
- 実行方法の詳細と、テストを追加・変更するときの規約は `e2e/README.md` に従う。

## 共有ライブラリが不足して起動できない場合

CI（`.github/workflows/ci.yml`）は `pnpm exec playwright install --with-deps chromium` で OS
パッケージも導入しているが、これは apt の実行と root 権限を伴う。クラウドコンテナではまず
`--with-deps` なしで試し、ブラウザの起動が共有ライブラリ不足で失敗したときだけ次を試す。

```sh
pnpm exec playwright install-deps chromium
```

権限が無く導入できない場合は、E2E を通すこと自体を目的にして設定を歪めない。実行できなかった
事実と失敗内容を PR に記載し、E2E の検証は CI に委ねる。

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
  導入済みのブラウザと置き場所は `pnpm exec playwright install --list` で確認できる。出力は
  Playwright のバージョンごとに分かれるので、`@playwright/test` のバージョンの側を見る。
  別バージョンの Playwright がブラウザを持っていても、要求リビジョンが違えばダウンロードは走る。
- ブラウザは `pnpm install` では消えない。置き場所は `PLAYWRIGHT_BROWSERS_PATH` が設定されて
  いればそのディレクトリ、無ければ OS ごとの既定のキャッシュで、Linux は
  `~/.cache/ms-playwright`、macOS は `~/Library/Caches/ms-playwright`、Windows は
  `%LOCALAPPDATA%\ms-playwright`。
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

## ネットワークポリシーで拒否される場合

クラウドセッションの外向き通信はネットワークポリシーを通る。ネットワークアクセスが「カスタム」の
環境では、許可ドメインに `*.playwright.dev` が必要になる。これが無いと `playwright install` は
`403 request blocked: no rule or allowlist entry allows host "cdn.playwright.dev"` となり、
ダウンロードそのものに到達できない。

あわせて「一般的なパッケージマネージャーのデフォルトリストも含める」も有効にしておく。無効だと
`registry.npmjs.org` が拒否され、`pnpm install` も `pnpm exec` も `ERR_PNPM_FETCH_403` で
止まる。ブラウザの配布元が通っていても `pnpm exec playwright install chromium` はその手前で
失敗するため、E2E 以前にセッションの準備自体が成立しない。`.nvmrc` の Node.js を `nvm` で導入
する `SessionStart` フックは `nodejs.org` も使う。

### 途中の 403 は失敗ではない

許可ドメインが `*.playwright.dev` だけでもブラウザは取得できる。Playwright は配布元を次の順に
試し、前半2つが拒否されても3つ目で成功するためである。

1. `https://cdn.playwright.dev/dbazure/download/playwright/builds/...`
   → `playwright.download.prss.microsoft.com` へ 307 リダイレクトするので拒否される
2. `https://playwright.download.prss.microsoft.com/dbazure/download/playwright/builds/...`
   → 同じホストなので拒否される
3. `https://cdn.playwright.dev/builds/...`
   → リダイレクトが無く `*.playwright.dev` の範囲に収まるので取得できる

つまり、次の 403 が2回続いた直後にダウンロードの進捗バーが出るのが正常な流れである。この 403 を
見て中断したり、ダウンロードできないものとして扱ったりしてはいけない。

```
Error: Download failed: server returned code 403 body 'request blocked: no rule or allowlist entry
allows host "playwright.download.prss.microsoft.com"'.
```

この 403 を出さずに1つ目で取得させたい場合は、許可ドメインに `*.prss.microsoft.com` を追加する。
必須ではない。

### 3つ目まで拒否された場合

本当にダウンロードできないのは、3つ目の `cdn.playwright.dev/builds/...` まで 403 になったとき
だけである。再試行しても結果は変わらず、プロキシを迂回してもいけない。この場合は共有ライブラリの
ときと同様に、失敗した事実とエラー内容を PR に記載し、E2E の検証は CI に委ねる。

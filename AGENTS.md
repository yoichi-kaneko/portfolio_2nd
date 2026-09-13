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
環境では次の2つを両方そろえる。片方だけでは E2E に到達しない。

- 許可ドメインに `*.playwright.dev` を追加する
- 「一般的なパッケージマネージャーのデフォルトリストも含める」を有効にする

後者が無効だと `registry.npmjs.org` が拒否され、`packageManager` に書いた pnpm の自己導入が
`ERR_PNPM_FETCH_403` で失敗する。`pnpm install` も `pnpm exec` も動かないため、ブラウザの配布元が
通っていても E2E 以前にセッションの準備自体が成立しない。`.nvmrc` の Node.js を `nvm` で導入する
`SessionStart` フックもこのリストに依存する（`nodejs.org` を許可ドメインへ個別に足す必要は無い）。
なお `nvm install` の途中で `iojs.org` への 403 が記録されることがあるが、これはミラー候補を順に
試しているだけで、Node.js の導入そのものは成功する。

### chromium は Chrome for Testing なので `*.playwright.dev` だけでは足りない

`@playwright/test` 1.63.0 の `chromium` と `chromium-headless-shell` は Chrome for Testing（CfT）
のビルドで、配布元を1つしか持たない（`playwright-core` の `cftUrl()`）。そしてその URL は
`*.playwright.dev` の外へリダイレクトする。

```
https://cdn.playwright.dev/builds/cft/<version>/linux64/chrome-linux64.zip
  → 307 https://storage.googleapis.com/chrome-for-testing-public/<version>/linux64/chrome-linux64.zip
```

そのため `storage.googleapis.com` も通っている必要がある。上記の2つをそろえた環境では追加設定なしで
取得できることを確認済みなので、通常は何もしなくてよい。デフォルトリストを無効にする運用へ変える
場合だけ、許可ドメインへ `storage.googleapis.com` を明示的に足す。

この経路はリダイレクトが1回だけで 403 を出さない。**chromium の導入では 403 が出ないのが正常**で、
いきなり進捗バーが出る。

### 403 が2回出るのは chromium 以外

3段のフォールバック（`playwright-core` の `PLAYWRIGHT_CDN_MIRRORS`）を使うのは firefox / webkit /
ffmpeg といった CfT 以外のビルドで、chromium はここを通らない。このプロジェクトが導入するのは
chromium だけなので通常は目にしないが、目にした場合は次の順に試されている。

1. `https://cdn.playwright.dev/dbazure/download/playwright/builds/...`
   → `playwright.download.prss.microsoft.com` へ 307 リダイレクトするので拒否される
2. `https://playwright.download.prss.microsoft.com/dbazure/download/playwright/builds/...`
   → 同じホストなので拒否される
3. `https://cdn.playwright.dev/builds/...`
   → リダイレクトが無く `*.playwright.dev` の範囲に収まるので取得できる

このときは次の 403 が2回続いた直後に進捗バーが出るのが正常な流れである。この 403 を見て中断したり、
ダウンロードできないものとして扱ったりしてはいけない。

```
Error: Download failed: server returned code 403 body 'request blocked: no rule or allowlist entry
allows host "playwright.download.prss.microsoft.com"'.
```

この 403 を出さずに1つ目で取得させたい場合は、許可ドメインに `*.prss.microsoft.com` を追加する。
必須ではない。

### 本当にダウンロードできない場合

chromium ならリダイレクト先まで、CfT 以外なら3つ目の `cdn.playwright.dev/builds/...` まで拒否
されたときだけである。再試行しても結果は変わらず、プロキシを迂回してもいけない。この場合は共有
ライブラリのときと同様に、失敗した事実とエラー内容を PR に記載し、E2E の検証は CI に委ねる。

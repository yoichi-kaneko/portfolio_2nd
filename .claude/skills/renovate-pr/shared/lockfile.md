# lockfile の生成とローカル検証

renovate-pr と renovate-batch の両方から参照する共通の手順。どちらかのスキルを廃止するときは、この
`shared/` ディレクトリを残る側へ移し、参照しているリンクを書き換える。

## なぜ作り直すのか

Renovate は lockfile を生成するときに `.pnpmfile.mjs` を実行しない。そのため Renovate が作った
`pnpm-lock.yaml` は次の2点でこのリポジトリの規約とずれ、CI の `pnpm install --frozen-lockfile` が
`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`（`pnpmfileChecksum` の不一致）で失敗する。

- lockfile から `pnpmfileChecksum` が消える
- `readPackage` フックによる置き換え（typescript-eslint 8 系 / ts-api-utils 2 系が要求する
  `typescript` を `@typescript/typescript6` に差し替える）が反映されない

ローカルで `pnpm install` をやり直せば、両方とも正しく生成される。

## 生成する

`packageManager`（pnpm の版）を変えた場合は、先に次を実行し、新しい版が表示されることを確かめる。
pnpm は `package.json` の `packageManager` を読んで実行する版を切り替えるので、旧い版が表示されたら
旧い pnpm で lockfile を作ることになる。その場合は中断してユーザーに伝える。

```sh
pnpm --version
```

```sh
pnpm install --no-frozen-lockfile
```

## 失敗したとき

設定を独断で緩めず、原因ごとに次のとおり対応する。呼び出し元のスキルが選択肢を加えている場合は、
それも含めて尋ねる。

- `ERR_PNPM_NO_MATURE_MATCHING_VERSION`（公開から `minimumReleaseAge` の既定値 1440 分が経っていない版）:
  該当する版と公開日時（`pnpm view <pkg> time --json`）を示し、次のどちらにするかを AskUserQuestion で尋ねる。
  - `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に `<pkg>@<版>` を追記して続行する
    （推移的な依存が引っかかった場合も、その依存の版を追記する）
  - 中断し、公開から1日経ってから再実行する
- ビルドスクリプトの許可を求められた（`allowBuilds` に無いパッケージが新たに入った）: 供給網の
  リスクに関わるので独断で許可しない。該当パッケージを示してユーザーに判断を仰ぐ。
- その他のエラー: エラー内容を伝えて中断する。

## 成功したとき

```sh
git status --porcelain
grep -n '^pnpmfileChecksum:' pnpm-lock.yaml
pnpm install --frozen-lockfile
```

- `pnpm install` が書き換えたのが `pnpm-lock.yaml`（除外を追記した場合は `pnpm-workspace.yaml` も）
  だけであること。呼び出し元のスキルが自分で書き換えたファイル（renovate-batch の `package.json` など）
  は、`git diff <file>` がその書き換えだけであることを確かめる。想定外のファイルや差分があれば中断する。
- lockfile に `pnpmfileChecksum` があること。
- CI と同じ `pnpm install --frozen-lockfile` が通ること。

この時点で新しい版の依存が `node_modules` に入るので、[investigation.md](investigation.md) のうち
依存を入れ直したあとに行う確認（`next` のドキュメント、`@playwright/test` の dry-run）をここで行う。

## ローカルで検証する

```sh
pnpm lint
pnpm test --run
pnpm build
```

- E2E（`pnpm test:e2e`）は実行せず、CI に任せる。
- 検証で追跡対象のファイル（`tsconfig.json` など）が書き換わったら、その内容を調査結果に記録し、
  `git restore <file>` で戻す（コミットには含めない）。
- 失敗したときの扱いは、呼び出し元のスキルの手順に従う。

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
PNPM_CONFIG_MINIMUM_RELEASE_AGE_STRICT=true pnpm install --no-frozen-lockfile
```

環境変数を外さない。このリポジトリは `minimumReleaseAge` を明示しておらず（pnpm の既定値 1440 分に
任せている）、その場合は `minimumReleaseAgeStrict` の既定値が `false` になる。この非厳格モードの pnpm は、
公開から 1440 分経っていない版をエラーにせず、`pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に
自分で追記してそのまま続行する（`Added 1 entry to minimumReleaseAgeExclude in pnpm-workspace.yaml ...` の
ように表示する。複数なら `entries`）。
これでは公開日数の制限を緩めるかどうかをユーザーが判断できないので、厳格モードにして
`ERR_PNPM_NO_MATURE_MATCHING_VERSION` で止まるようにする。

- pnpm 12.21.0 / 12.23.0 で、環境変数が無いと自動で追記され、あると止まることを確認済み。
- この環境変数は lockfile の内容を変えない。CI は環境変数なしで `pnpm install --frozen-lockfile` を
  実行するが、生成した lockfile はそのまま通る。
- `pnpm-workspace.yaml` に `minimumReleaseAgeStrict: true` を書く方法もあるが、開発者の `pnpm add` などの
  挙動まで変わるので、この手順では環境変数で済ませる。

## 失敗したとき

設定を独断で緩めず、原因ごとに次のとおり対応する。呼び出し元のスキルが選択肢を加えている場合は、
それも含めて尋ねる。

- `ERR_PNPM_NO_MATURE_MATCHING_VERSION`（公開から `minimumReleaseAge` の既定値 1440 分が経っていない版）:
  エラーは推移的な依存も含めて該当する版を公開日時とともにすべて列挙するので、それを示し、次のどちらに
  するかを AskUserQuestion で尋ねる。
  - `pnpm-workspace.yaml` の `minimumReleaseAgeExclude` に、列挙された `<pkg>@<版>` をすべて追記し、
    「生成する」の同じコマンドで再実行する（一部だけを追記すると、残りの版で再び止まる）
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

- `pnpm install` が書き換えたのが `pnpm-lock.yaml` だけであること。呼び出し元のスキルが自分で
  書き換えたファイル（renovate-batch の `package.json`、「失敗したとき」で除外を追記した
  `pnpm-workspace.yaml` など）は、`git diff <file>` がその書き換えだけであることを確かめる。想定外の
  ファイルや差分があれば中断する。
- 特に、出力に `Added ... to minimumReleaseAgeExclude` の行があった場合や、自分で追記していない
  `minimumReleaseAgeExclude` の行が増えていた場合は、環境変数が効いておらず pnpm が独断で制限を緩めている。
  `git restore pnpm-workspace.yaml pnpm-lock.yaml` で戻し（自分で追記した除外があれば、戻したあとに
  書き直す）、追記されていた版を `ERR_PNPM_NO_MATURE_MATCHING_VERSION` で列挙されたものとして「失敗したとき」に
  従う。あわせて、pnpm の設定名が変わった可能性があるので、「生成する」の環境変数の見直しをユーザーに提案する。
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

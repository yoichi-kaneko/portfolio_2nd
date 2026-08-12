# Web Studio Wanderlust — Portfolio

フリーランスエンジニア・金子陽一のポートフォリオサイトです。
Next.js 16 (App Router) + Tailwind CSS v4 で構築された、Bento Grid レイアウトのシングルページアプリケーションです。

## 技術スタック

| 要素                 | 採用技術                 |
| -------------------- | ------------------------ |
| フレームワーク       | Next.js 16 (App Router)  |
| 言語                 | TypeScript               |
| スタイリング         | Tailwind CSS v4          |
| ユニットテスト       | Vitest / Testing Library |
| E2E テスト           | Playwright               |
| 画像配信             | Cloudinary               |
| キャッシュ           | Redis                    |
| パッケージマネージャ | pnpm 11.9.0              |

## 主なページ

- `/`: Bento Grid 形式のポートフォリオトップ
- `/aoi`: 個人プロジェクト「碧衣（AOI）」の紹介ページ

トップページの「Project Aoi」カードから `/aoi` へ移動できます。

## 碧衣（AOI）ページ

登山アシスタント AI「碧衣」と、そのアクティビティ駆動フレームワークを紹介するページです。

### 主な機能

- プロジェクトの目的、処理フレームワーク、連携サービス、登山・天気機能の紹介
- 6つの実行モードと登場人物の紹介
- 現在の日本時間に応じたモード・部屋画像・時計表示
- 「時間旅行きっぷ」による暁・望・小夜モードのプレビュー
- ナビゲーションとフッターから切り替えられる夜モード
- Cloudinary から取得した最新生成画像3件の表示
- 生成画像の Lightbox 表示（フォーカス管理、Esc・背景クリック・閉じるボタンに対応）

ページ固有のクライアント状態は `NightModeProvider` と `TimeTravelProvider` で管理し、
各紹介セクションはサーバーコンポーネントを基本として構成しています。

## 開発サーバーの起動

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開くと確認できます。

## ビルド

```bash
pnpm build
```

## GitHub Contributions 集計ロジック

`src/lib/github.ts` の `fetchWeeklyContributions()` が実装している集計の仕様です。

### 取得期間

- **from**: 実行日の 35 日前 00:00:00 UTC
- **to**: 実行日の前日 23:59:59 UTC（当日は含まない）

### 週の区切り

GitHub の GraphQL API (`contributionsCollection`) は週を**日曜日始まり**で固定しているため、
任意の曜日始まりには対応できません。

そのため、API から取得した `contributionCalendar.weeks` を一度**日単位に平坦化**し、
「昨日から何日前か (`diffDays`)」をもとに以下のルールで再集計しています。

| weekIndex    | diffDays の範囲 | 対応する期間   |
| ------------ | --------------- | -------------- |
| 0 (W1・直近) | 0〜6            | 昨日〜7日前    |
| 1 (W2)       | 7〜13           | 8日前〜14日前  |
| 2 (W3)       | 14〜20          | 15日前〜21日前 |
| 3 (W4)       | 21〜27          | 22日前〜28日前 |
| 4 (W5・最古) | 28〜34          | 29日前〜35日前 |

```
weekIndex = Math.floor(diffDays / 7)
```

### 返却値

```ts
type WeeklyContribution = {
  week: string; // "W1"（直近）〜 "W5"（最古）
  count: number; // 該当週のコントリビューション合計数
};
```

チャート表示時は W5→W1 の順（古い順）に並べて棒グラフに渡します。

## 登山レポート件数 API ロジック

`src/app/api/mountains/report-count/route.ts` の `GET()` が実装している仕様です。

### エンドポイント

- `GET /api/mountains/report-count`
- 成功時: `{ "count": number }`
- 失敗時: `{ "error": string }`（HTTP 500）

### 取得フロー

1. `REDIS_URL` に接続し、`mountains:report_count` のキャッシュを参照
2. キャッシュがあればその値を返却
3. キャッシュがない場合は YAMAP の公開 API（`https://api.yamap.com/v3/users/1027860/activities`）を `fetch` し、`meta.total_count` を件数として取得
4. 取得した件数を Redis に 24 時間（`EX: 86400`）保存して返却
5. Redis の読み書きに失敗した場合でも、API の取得結果は返却する（フォールバック）

YAMAP のプロフィールページは件数をクライアント側で描画するため HTML には含まれません。
そのためページのスクレイピングではなく、ページが内部で参照している公開 API を直接取得しています。

### 件数表示（UI）

- `src/hooks/useMountainReportCount.ts` が `/api/mountains/report-count` を取得
- `src/components/cards/LifeLogCard.tsx` で件数を表示
- 取得中は Skeleton、取得失敗時は `???` を表示

## Cloudinary 最新画像 API

`src/app/api/cloudinary/images/route.ts` の `GET()` が、碧衣ページに表示する最新生成画像を返します。

### エンドポイント

- `GET /api/cloudinary/images`
- 成功時: `{ "images": [{ "originalUrl": string, "previewUrl": string }] }`
- 失敗時: `{ "error": string }`（HTTP 500）

### 取得フロー

1. `REDIS_URL` が設定されている場合、`cloudinary:latest_images` のキャッシュを参照
2. 12時間以内のキャッシュがあれば、その内容を返却
3. キャッシュがない場合は Cloudinary Search API で指定フォルダの最新画像3件を取得
4. オリジナル画像 URL と、高さ384pxのプレビュー URL を生成
5. 取得結果を Redis に12時間保存して返却
6. Redis が未設定または接続に失敗した場合は、Cloudinary から直接取得

### 環境変数

| キー                                | 説明                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_PAT`                        | GitHub Personal Access Token。ローカルは `.env.local`、本番は Vercel の Environment Variables に登録                   |
| `REDIS_URL`                         | アクセスするRedisのURL。ローカルは `.env.local`、本番は Vercel の Environment Variables に登録                         |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`   | Google MapsのAPIキー。ローカルは `.env.local`、本番は Vercel の Environment Variables に登録                           |
| `GOOGLE_MAPS_API_KEY`               | 開発専用CLI (`.agents/scripts/google_map/geocode.ts`) 用のキー。ローカル `.env.local` のみで使用し、本番には登録しない |
| `NEXT_PUBLIC_DISABLE_EXTERNAL_MAPS` | `1` の場合、Mountain Map で外部地図読込を無効化（主にE2E向け）                                                         |
| `CLOUDINARY_CLOUD_NAME`             | Cloudinary の Cloud name。碧衣ページの生成画像取得に使用                                                               |
| `CLOUDINARY_API_KEY`                | Cloudinary API key                                                                                                     |
| `CLOUDINARY_API_SECRET`             | Cloudinary API secret                                                                                                  |
| `CLOUDINARY_IMAGE_ASSET_FOLDER`     | 最新画像を検索する Cloudinary の Asset folder                                                                          |

## 開発専用 Agent/CLI

アプリ本体コードと分離するため、開発専用の資産は `/.agents` 配下に配置しています。

- スキル定義: [`.agents/skills/`](.agents/skills/)
- 実行スクリプト: [`.agents/scripts/`](.agents/scripts/)

住所から座標を取得するCLIは以下で実行できます。

```bash
npx tsx .agents/scripts/google_map/geocode.ts "東京都新宿区西新宿2-8-1"
```

---

## ユニットテスト（E2E 以外）

Vitest を使用したユニットテストを実装しています。

### テスト対象（概要）

- `src/hooks/*.test.ts`
  - カスタムフックの状態遷移、キーボード操作、APIレスポンスに応じた挙動を検証
- `src/components/**/*.test.tsx`
  - Context Provider、Lightbox、碧衣プロジェクトカードなどの状態・操作・アクセシビリティを検証
- `src/app/api/**/route.test.ts`
  - APIルートの正常系/異常系（キャッシュ、フォールバック、エラー処理）を検証
- `src/lib/**/*.test.ts`
  - 時刻に応じた碧衣モード判定、Cloudinary URL生成、Redisキャッシュ処理を検証
- `src/data/modules/*.test.ts`
  - データモジュールの生成処理・バリデーション（正常系/異常系）を検証

### 実行方法

全ユニットテストを実行:

```bash
pnpm test
```

特定ファイルのみ実行（例）:

```bash
pnpm test src/hooks/useProjectsModal.test.ts
```

---

## E2E テスト

Playwright を使用した E2E テストを実装しています。

### 初回セットアップ（ブラウザのインストール）

```bash
pnpm exec playwright install --with-deps chromium
```

### テスト実行

開発サーバーを起動した状態でテストを実行する場合：

```bash
pnpm test:e2e
```

`playwright.config.ts` の `webServer` 設定により、未起動の場合は自動的に `pnpm dev` が立ち上がります。

### UI モードで実行（デバッグ用）

```bash
pnpm test:e2e:ui
```

### テスト内容

#### Bento Grid 各要素の存在確認

| テスト                                  | 説明                                             |
| --------------------------------------- | ------------------------------------------------ |
| トップページが表示される                | ページタイトルに "Wanderlust" が含まれること     |
| ヘッダーが表示される                    | "Web Studio Wanderlust" の見出しが存在すること   |
| About カードが表示される                | "About" の見出しが存在すること                   |
| 稼働ステータスバッジが表示される        | "Available" テキストが存在すること               |
| GitHub Contributions カードが表示される | ラベルが存在すること                             |
| Tech Stack カードが表示される           | ラベルが存在すること                             |
| Social カードが表示される               | ラベルが存在すること                             |
| Recent Projects カードが表示される      | 見出しが存在すること                             |
| Project Aoi カードが表示される          | `/aoi` へのリンクと現在時刻の発車案内があること  |
| Project Aoi カードから遷移できる        | カードクリックで `/aoi` が表示されること         |
| Life Log カードが表示される             | ラベルと "Mountaineering" テキストが存在すること |

#### 碧衣（AOI）ページ

`e2e/aoi.spec.ts` では、以下を中心に検証しています。

- ナビゲーション、ヒーロー、各紹介セクション、フッターの表示
- 現在時刻に対応するモードと部屋画像の表示
- 時間旅行きっぷの選択、仮想時刻への切り替え、現在時刻への帰還
- Cloudinary API の成功・失敗時表示（外部通信はモック）
- 生成画像 Lightbox の表示、Portal のレイヤー順、Esc・閉じるボタンの操作
- 夜モードの切り替えと、ポートフォリオトップへの復帰

#### ProjectsModal の動作確認

| テスト                                        | 説明                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| View All ボタンをクリックするとモーダルが開く | "All Projects" の見出しが表示されること                         |
| モーダルにタブが4つ表示される                 | All / 業務委託・受託 / 正社員 / 個人開発 の各タブが存在すること |
| All タブでプロジェクトカードが複数表示される  | カードが2件以上存在すること                                     |
| タブ切り替えで表示件数が絞り込まれる          | 正社員タブに切り替えると全件より少なくなること                  |
| カードをクリックすると詳細パネルが表示される  | "Technologies" セクションが表示されること                       |
| 詳細パネルの ✕ で詳細が閉じる                 | "Technologies" セクションが非表示になること                     |
| ✕ ボタンでモーダルが閉じる                    | "All Projects" の見出しが非表示になること                       |
| Esc キーでモーダルが閉じる                    | キーボード操作でモーダルが閉じること                            |
| バックドロップクリックでモーダルが閉じる      | モーダル外クリックで閉じること                                  |

#### GitHubContributionChart の詳細確認

| テスト                                              | 説明                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| BarChart 要素が表示される                           | API モック使用時に recharts のグラフが表示されること                     |
| API通信で失敗した場合にNo Dataが表示される          | 500 エラー時にフォールバック表示されること                               |
| API通信中はSkeleton表示、完了後にグラフへ切り替わる | 遅延レスポンス中にスケルトンが表示され、完了後にグラフ表示へ遷移すること |

#### TechStackCard の詳細確認

| テスト                                                | 説明                                 |
| ----------------------------------------------------- | ------------------------------------ |
| Backend セクションがあり、説明項目が1つ以上ある       | セクションとスキル項目が存在すること |
| Frontend セクションがあり、説明項目が1つ以上ある      | セクションとスキル項目が存在すること |
| Infra & Tools セクションがあり、説明項目が1つ以上ある | セクションとスキル項目が存在すること |

#### 登山レポート件数の表示確認

| テスト                                                | 説明                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| API成功時に件数が表示される                           | `/api/mountains/report-count` 成功時に数値件数が表示されること |
| API失敗時に ??? が表示される                          | API 500 エラー時に `???` が表示されること                      |
| API通信中はSkeleton表示、完了後に件数表示へ切り替わる | 読み込み中にスケルトン表示され、完了後に件数表示へ遷移すること |

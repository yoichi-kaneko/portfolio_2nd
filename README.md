# Web Studio Wanderlust — Portfolio

フリーランスエンジニア・金子陽一のポートフォリオサイトです。
Next.js 16 (App Router) + Tailwind CSS v4 で構築された、Bento Grid レイアウトのシングルページアプリケーションです。

## 技術スタック

| 要素 | 採用技術 |
|---|---|
| フレームワーク | Next.js 16 (Static Export) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| E2E テスト | Playwright |
| パッケージマネージャ | pnpm |

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

| weekIndex | diffDays の範囲 | 対応する期間 |
|---|---|---|
| 0 (W1・直近) | 0〜6 | 昨日〜7日前 |
| 1 (W2) | 7〜13 | 8日前〜14日前 |
| 2 (W3) | 14〜20 | 15日前〜21日前 |
| 3 (W4) | 21〜27 | 22日前〜28日前 |
| 4 (W5・最古) | 28〜34 | 29日前〜35日前 |

```
weekIndex = Math.floor(diffDays / 7)
```

### 返却値

```ts
type WeeklyContribution = {
  week: string;  // "W1"（直近）〜 "W5"（最古）
  count: number; // 該当週のコントリビューション合計数
};
```

チャート表示時は W5→W1 の順（古い順）に並べて棒グラフに渡します。

### 環境変数

| キー | 説明 |
|---|---|
| `GITHUB_PAT` | GitHub Personal Access Token。ローカルは `.env.local`、本番は Vercel の Environment Variables に登録 |

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

| テスト | 説明 |
|---|---|
| トップページが表示される | ページタイトルに "Wanderlust" が含まれること |
| ヘッダーが表示される | "Web Studio Wanderlust" の見出しが存在すること |
| About カードが表示される | "About" の見出しが存在すること |
| 稼働ステータスバッジが表示される | "Available" テキストが存在すること |
| GitHub Contributions カードが表示される | ラベルが存在すること |
| Tech Stack カードが表示される | ラベルが存在すること |
| Social カードが表示される | ラベルが存在すること |
| Recent Projects カードが表示される | 見出しが存在すること |
| Life Log カードが表示される | ラベルと "Mountaineering" テキストが存在すること |

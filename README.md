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

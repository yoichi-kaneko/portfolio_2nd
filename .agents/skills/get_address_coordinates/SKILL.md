---
name: get_address_coordinates
description: 住所または地点名から Google Geocoding API を使って緯度・経度を取得する開発専用スキル。
---

# get_address_coordinates

住所・地点名を入力して、座標情報を取得する開発専用スキルです。

## 事前準備

- ルートの `.env.local` に `GOOGLE_MAPS_API_KEY` を設定してください。
- 本番環境ではこのスキルを使わないため、`GOOGLE_MAPS_API_KEY` は本番へ登録しません。

## 実行コマンド

```bash
cd {プロジェクトルートの絶対パス}
npx tsx .agents/scripts/google_map/geocode.ts "{住所または地点名}"
```

## 出力

以下の JSON を標準出力します。

```json
{
  "lat": 35.6895,
  "lng": 139.6917,
  "formatted_address": "日本、〒160-0023 東京都新宿区西新宿２丁目８−１",
  "place_id": "..."
}
```

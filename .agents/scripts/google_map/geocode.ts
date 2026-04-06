import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { resolve } from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env.local") });

interface GeocodeResponse {
  status: string;
  error_message?: string;
  results: Array<{
    geometry: { location: { lat: number; lng: number } };
    formatted_address: string;
    place_id: string;
  }>;
}

function getApiKey(): string {
  if (process.env.NODE_ENV === "production") {
    console.error("このCLIは開発専用です。production環境では実行できません。");
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("環境変数 GOOGLE_MAPS_API_KEY が設定されていません。");
    process.exit(1);
  }
  return apiKey;
}

async function geocode(address: string) {
  const apiKey = getApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.append("address", address);
  url.searchParams.append("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error(
      `Geocoding APIへのリクエストに失敗しました: ${response.status}`,
    );
    process.exit(1);
  }

  const data = (await response.json()) as GeocodeResponse;
  if (data.status !== "OK" || data.results.length === 0) {
    console.error(`Geocoding失敗: ${data.error_message ?? data.status}`);
    process.exit(1);
  }

  const firstResult = data.results[0];
  return {
    lat: firstResult.geometry.location.lat,
    lng: firstResult.geometry.location.lng,
    formatted_address: firstResult.formatted_address,
    place_id: firstResult.place_id,
  };
}

async function main() {
  const address = process.argv[2];
  if (!address) {
    console.error(
      "使用方法: npx tsx .agents/scripts/google_map/geocode.ts <住所>",
    );
    console.error(
      '例: npx tsx .agents/scripts/google_map/geocode.ts "東京都新宿区西新宿2-8-1"',
    );
    process.exit(1);
  }

  const result = await geocode(address);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("エラーが発生しました:", error);
  process.exit(1);
});

import { createClient } from "redis";
import { CONTRIBUTION_WEEKS } from "@/config/github";

const GITHUB_LOGIN = "yoichi-kaneko";

const GITHUB_GRAPHQL_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

const REDIS_KEY = "github:weekly_contributions";
const REDIS_TTL = 1 * 24 * 60 * 60; // 1日

type CachePayload = {
  date: string; // UTC date string (YYYY-MM-DD)
  result: WeeklyContribution[];
};

export type WeeklyContribution = {
  // 例: "2026-W1" (直近週が W1、最古週が W5)
  week: string;
  count: number;
};

/**
 * GitHub GraphQL API から直近 `CONTRIBUTION_WEEKS` 週分のコントリビューションを取得し、
 * 「昨日基準の7日区切り」で再集計して返す。
 *
 * GitHub の `contributionCalendar.weeks` は日曜始まり固定のため、
 * 日単位に平坦化して `diffDays` から週インデックスを算出する。
 *
 * @param pat GitHub GraphQL API 呼び出しに使用する Personal Access Token
 * @returns `W1`(直近) 〜 `Wn`(最古) の週次集計配列
 * @throws GitHub API 応答が非 2xx の場合
 */
async function fetchFromGraphQL(pat: string): Promise<WeeklyContribution[]> {
  // 今日を除いた昨日〜35日前を取得範囲とする
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // today の1秒前 = 昨日 23:59:59 UTC
  const to = new Date(today.getTime() - 1000);

  const from = new Date(today);
  from.setUTCDate(today.getUTCDate() - CONTRIBUTION_WEEKS * 7);

  const toISO = to.toISOString().replace(".999Z", "Z");
  const fromISO = from.toISOString().replace(".000Z", "Z");

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GITHUB_GRAPHQL_QUERY,
      variables: { login: GITHUB_LOGIN, from: fromISO, to: toISO },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const raw = await res.json();

  // contributionDays を日付順に平坦化
  const weeks =
    raw?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];
  const allDays: { date: string; contributionCount: number }[] = weeks.flatMap(
    (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
      w.contributionDays,
  );

  // 日付でソート（古い順）
  allDays.sort((a, b) => a.date.localeCompare(b.date));

  // 直近週 (W1) = yesterday〜7日前、W2 = 8〜14日前、...W5 = 29〜35日前
  // week インデックス: 各日が「昨日から何日前か」を求め、7で割って週番号を決定
  const yesterdayStr = to.toISOString().slice(0, 10);
  const yesterdayTime = new Date(yesterdayStr).getTime();

  const weekCounts: number[] = Array(CONTRIBUTION_WEEKS).fill(0); // index 0=W1, (CONTRIBUTION_WEEKS-1)=W5

  for (const day of allDays) {
    const dayTime = new Date(day.date).getTime();
    const diffDays = Math.round((yesterdayTime - dayTime) / 86400000);
    // diffDays: 0(昨日)〜34(35日前の翌日=34日前)
    const weekIndex = Math.floor(diffDays / 7); // 0〜4
    if (weekIndex >= 0 && weekIndex < CONTRIBUTION_WEEKS) {
      weekCounts[weekIndex] += day.contributionCount;
    }
  }

  return weekCounts.map((count, i) => ({
    week: `W${i + 1}`,
    count,
  }));
}

/**
 * 週次コントリビューションを取得する。
 *
 * まず Redis キャッシュを参照し、当日キャッシュがあればそれを返す。
 * キャッシュミスまたは Redis エラー時は GraphQL から取得し、
 * 取得成功時は TTL 付きで Redis に保存する。
 *
 * @returns `W1`(直近) 〜 `Wn`(最古) の週次集計配列
 * @throws `GITHUB_PAT` 未設定時
 */
export async function fetchWeeklyContributions(): Promise<
  WeeklyContribution[]
> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    throw new Error("GITHUB_PAT is not set");
  }

  const todayUTC = new Date().toISOString().slice(0, 10);
  const redisUrl = process.env.REDIS_URL;

  // REDIS_URL が未設定/空の場合は Redis を使わず直接 GraphQL 取得する
  if (!redisUrl) {
    return fetchFromGraphQL(pat);
  }

  // Redis キャッシュを試みる
  let redisClient;
  try {
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();

    const cached = await redisClient.get(REDIS_KEY);
    if (cached) {
      const payload: CachePayload = JSON.parse(cached);
      if (payload.date === todayUTC) {
        await redisClient.quit();
        return payload.result;
      }
    }
  } catch (err) {
    console.error("[github] Redis error, falling back to GraphQL:", err);
    try {
      await redisClient?.quit();
    } catch {
      // disconnect failure is ignorable
    }
    return fetchFromGraphQL(pat);
  }

  // GraphQL 実行 → キャッシュ保存
  const result = await fetchFromGraphQL(pat);

  try {
    const payload: CachePayload = { date: todayUTC, result };
    await redisClient.set(REDIS_KEY, JSON.stringify(payload), {
      EX: REDIS_TTL,
    });
  } catch (err) {
    console.error("[github] Redis write error (result not cached):", err);
  } finally {
    await redisClient.quit();
  }

  return result;
}

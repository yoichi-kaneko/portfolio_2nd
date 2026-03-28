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

export type WeeklyContribution = {
  // 例: "2026-W1" (直近週が W1、最古週が W5)
  week: string;
  count: number;
};

export async function fetchWeeklyContributions(): Promise<WeeklyContribution[]> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    throw new Error("GITHUB_PAT is not set");
  }

  // 今日を除いた昨日〜35日前を取得範囲とする
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // today の1秒前 = 昨日 23:59:59
  const to = new Date(today.getTime() - 1000);

  const from = new Date(today);
  from.setDate(today.getDate() - 35);

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
      w.contributionDays
  );

  // 日付でソート（古い順）
  allDays.sort((a, b) => a.date.localeCompare(b.date));

  // 直近週 (W1) = yesterday〜7日前、W2 = 8〜14日前、...W5 = 29〜35日前
  // week インデックス: 各日が「昨日から何日前か」を求め、7で割って週番号を決定
  const yesterdayStr = to.toISOString().slice(0, 10);
  const yesterdayTime = new Date(yesterdayStr).getTime();

  const weekCounts: number[] = [0, 0, 0, 0, 0]; // index 0=W1, 4=W5

  for (const day of allDays) {
    const dayTime = new Date(day.date).getTime();
    const diffDays = Math.round((yesterdayTime - dayTime) / 86400000);
    // diffDays: 0(昨日)〜34(35日前の翌日=34日前)
    const weekIndex = Math.floor(diffDays / 7); // 0〜4
    if (weekIndex >= 0 && weekIndex < 5) {
      weekCounts[weekIndex] += day.contributionCount;
    }
  }

  return weekCounts.map((count, i) => ({
    week: `W${i + 1}`,
    count,
  }));
}

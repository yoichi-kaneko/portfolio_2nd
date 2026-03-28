// TODO: Replace with actual GitHub GraphQL query for contributions
const GITHUB_GRAPHQL_QUERY = `
  query {
    viewer {
      login
    }
  }
`;

export type WeeklyContribution = {
  week: string;
  count: number;
};

export async function fetchWeeklyContributions(): Promise<WeeklyContribution[]> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    throw new Error("GITHUB_PAT is not set");
  }

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: GITHUB_GRAPHQL_QUERY }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const raw = await res.json();
  void raw;

  // TODO: Parse raw.data.user.contributionsCollection and aggregate by week
  return [{ week: "2025-W01", count: 0 }];
}

import { fetchWeeklyContributions } from "@/lib/github";

export async function GET() {
  try {
    const weekly = await fetchWeeklyContributions();
    return Response.json({ weekly });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

"use client";

import { BAR_COLOR_STEPS } from "@/config/chart";
import {
  BarChart,
  Bar,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
  type TooltipPayloadEntry,
} from "recharts";

type DataPoint = {
  weekLabel: string;
  count: number;
};

function getBarColor(count: number): string {
  return (BAR_COLOR_STEPS.find((step) => count <= step.max) ?? BAR_COLOR_STEPS[BAR_COLOR_STEPS.length - 1]).color;
}

function renderTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0] as TooltipPayloadEntry & { payload: DataPoint };
  return (
    <div className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200">
      {entry.payload.weekLabel}: {entry.payload.count}
    </div>
  );
}

export function GitHubContributionChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <BarChart data={data} barCategoryGap="20%">
        <Tooltip content={renderTooltip} cursor={false} />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.count)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

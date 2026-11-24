import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { treasurySeries, treasurySummary } from "@/data/demoData";

const series = treasurySummary.series;

/**
 * Simulated multi-series treasury line chart over one week. Static data only —
 * no live updates and no animated transitions. Rendered with explicit
 * dimensions so it needs no ResizeObserver.
 */
export default function TreasuryChart() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-stamp text-muted-foreground">Simulated treasury</p>
          <p
            data-ocid="dashboard.treasury_total"
            className="font-display text-3xl font-medium tracking-tight text-foreground"
          >
            {treasurySummary.totalLabel}
          </p>
        </div>
        <span className="badge-stage-demo">{treasurySummary.changeLabel}</span>
      </div>

      <div
        data-ocid="dashboard.treasury_chart"
        className="w-full overflow-hidden"
      >
        <LineChart
          width={640}
          height={224}
          data={treasurySeries}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          className="h-auto w-full"
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={false}
            content={<TreasuryTooltip />}
            wrapperStyle={{ outline: "none" }}
          />
          {series.map((entry) => (
            <Line
              key={entry.key}
              dataKey={entry.key}
              name={entry.label}
              type="monotone"
              stroke={entry.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </div>

      <ul className="flex flex-wrap items-center gap-4">
        {series.map((entry) => (
          <li
            key={entry.key}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-[2px]"
              style={{ backgroundColor: entry.color }}
            />
            {entry.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
}

/** Compact tooltip showing each series' value at the hovered day. */
function TreasuryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-elevated">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <ul className="space-y-0.5">
        {payload.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-2 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="text-tabular text-foreground">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

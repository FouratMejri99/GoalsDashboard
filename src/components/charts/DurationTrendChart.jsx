import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import ChartTooltip from "../ChartTooltip.jsx";

// Minutes trained per day vs the daily-equivalent of the weekly minutes
// goal (weeklyGoal / 7), drawn as a reference line — same pattern as the
// calorie trend chart's goal line.
export default function DurationTrendChart({ data, weeklyGoalMin }) {
  const dailyGoal = weeklyGoalMin ? Math.round(weeklyGoalMin / 7) : 0;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip content={<ChartTooltip unit=" min" />} />
        {dailyGoal > 0 && (
          <ReferenceLine
            y={dailyGoal}
            stroke="var(--text-muted)"
            strokeWidth={1}
            label={{ value: "Daily avg goal", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="durationMin"
          name="Duration"
          stroke="var(--series-4)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, stroke: "var(--surface-1)", fill: "var(--series-4)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

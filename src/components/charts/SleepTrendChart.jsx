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

// Hours slept per night vs the sleep goal, drawn as a reference line — same
// pattern as the calorie trend chart. Gaps (nights not logged) break the
// line rather than interpolating a fake reading.
export default function SleepTrendChart({ data, goalHours }) {
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
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
        <Tooltip content={<ChartTooltip unit="h" />} />
        {goalHours > 0 && (
          <ReferenceLine
            y={goalHours}
            stroke="var(--text-muted)"
            strokeWidth={1}
            label={{ value: "Goal", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="durationHours"
          name="Sleep"
          stroke="var(--series-5)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, stroke: "var(--surface-1)", fill: "var(--series-5)" }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

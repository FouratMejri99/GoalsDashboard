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

// Calories logged per day (line) against the daily calorie goal (reference
// line) — single measure, one axis, goal drawn as a dashed-free hairline
// per the mark spec (gridlines/reference lines stay solid, not dashed).
export default function CalorieTrendChart({ data, goal }) {
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
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<ChartTooltip unit=" kcal" />} />
        {goal > 0 && (
          <ReferenceLine
            y={goal}
            stroke="var(--text-muted)"
            strokeWidth={1}
            label={{ value: "Goal", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="calories"
          name="Calories"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface-1)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

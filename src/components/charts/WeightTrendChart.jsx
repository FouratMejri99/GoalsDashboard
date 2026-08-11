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

// Body weight over time vs the target weight goal. Gaps (days with no
// weigh-in) are left as nulls so Recharts breaks the line rather than
// interpolating a fake reading.
export default function WeightTrendChart({ data, goalWeightKg }) {
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
          domain={["auto", "auto"]}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<ChartTooltip unit=" kg" />} />
        {goalWeightKg > 0 && (
          <ReferenceLine
            y={goalWeightKg}
            stroke="var(--text-muted)"
            strokeWidth={1}
            label={{ value: "Target", position: "insideTopRight", fill: "var(--text-muted)", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weightKg"
          name="Weight"
          stroke="var(--series-5)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, stroke: "var(--surface-1)", fill: "var(--series-5)" }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

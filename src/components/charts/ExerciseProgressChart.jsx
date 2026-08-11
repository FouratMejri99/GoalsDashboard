import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import ChartTooltip from "../ChartTooltip.jsx";

// Top weight lifted per session for one exercise, oldest first — the
// strength-progression line. Estimated 1RM rides alongside as a second
// series in the same unit (kg), not a second axis.
export default function ExerciseProgressChart({ data }) {
  if (!data.length) {
    return <div className="empty-state">No sets logged for this exercise yet.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<ChartTooltip unit=" kg" />} />
        <Line
          type="monotone"
          dataKey="weightKg"
          name="Top set"
          stroke="var(--series-1)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, stroke: "var(--surface-1)", fill: "var(--series-1)" }}
        />
        <Line
          type="monotone"
          dataKey="oneRm"
          name="Est. 1RM"
          stroke="var(--series-5)"
          strokeWidth={2}
          strokeDasharray="0"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const EXERCISE_PROGRESS_LEGEND = [
  { key: "Top set", color: "var(--series-1)" },
  { key: "Est. 1RM", color: "var(--series-5)" },
];

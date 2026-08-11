import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import ChartTooltip from "../ChartTooltip.jsx";

// Total load moved per day (sets x reps x weight, summed across exercises) —
// single measure, single axis. Rest days render as a zero-height bar rather
// than a gap so the cadence of the week reads at a glance.
export default function VolumeTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 6, right: 12, left: -12, bottom: 0 }} barCategoryGap={4}>
        <CartesianGrid stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
        <Tooltip content={<ChartTooltip unit=" kg" />} />
        <Bar dataKey="volumeKg" name="Volume" fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

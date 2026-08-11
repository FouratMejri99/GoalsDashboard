import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import ChartTooltip from "../ChartTooltip.jsx";

// Stacked macro grams per day — categorical identity (protein/carbs/fat) in
// fixed hue order, legend carries identity so color isn't the only channel.
export default function MacroBarChart({ data }) {
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
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<ChartTooltip unit="g" />} />
        <Bar dataKey="protein" name="Protein" stackId="macros" fill="var(--series-2)" radius={0} maxBarSize={22} />
        <Bar dataKey="carbs" name="Carbs" stackId="macros" fill="var(--series-3)" radius={0} maxBarSize={22} />
        <Bar
          dataKey="fat"
          name="Fat"
          stackId="macros"
          fill="var(--series-4)"
          radius={[4, 4, 0, 0]}
          maxBarSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const MACRO_LEGEND = [
  { key: "Protein", color: "var(--series-2)" },
  { key: "Carbs", color: "var(--series-3)" },
  { key: "Fat", color: "var(--series-4)" },
];

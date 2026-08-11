import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from "recharts";
import { formatHourTick } from "../../lib/time.js";

// When during the day meals and workouts happen, over the last N days —
// one point per logged time, one fixed-color series per category (meal
// types + workout), both axes on a single natural scale (day index / hour
// of day) so nothing needs a second y-axis.
export default function DailyTimingChart({ dayList, series }) {
  const hasAnyPoints = series.some((s) => s.points.length > 0);
  if (!hasAnyPoints) {
    return <div className="empty-state">No meal or workout times logged yet — add a time when you log an entry.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          domain={[0, Math.max(dayList.length - 1, 1)]}
          ticks={dayList.map((d) => d.x).filter((_, i) => i % Math.ceil(dayList.length / 7) === 0)}
          tickFormatter={(x) => dayList[x]?.label ?? ""}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={[0, 24]}
          ticks={[0, 6, 12, 18, 24]}
          tickFormatter={formatHourTick}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <ZAxis range={[60, 60]} />
        <Tooltip content={<TimingPointTooltip />} cursor={{ strokeDasharray: "0" }} />
        {series.map((s) => (
          <Scatter key={s.key} name={s.key} data={s.points} fill={s.color} />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function TimingPointTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const point = p.payload;
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 12.5,
        color: "var(--text-primary)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ color: "var(--text-muted)", marginBottom: 4, fontSize: 11.5 }}>{point.label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block" }} />
        <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
        <strong>{formatHourTick(point.y)}</strong>
      </div>
      {point.name && <div style={{ color: "var(--text-muted)", marginTop: 2 }}>{point.name}</div>}
    </div>
  );
}

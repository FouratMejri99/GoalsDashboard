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
import { formatHourTick } from "../../lib/time.js";

// Bedtime and wake time over the last N nights — one axis (hour of day,
// extended to 30 so a post-midnight bedtime stays visually continuous),
// two series in fixed categorical order, legend carries identity.
export default function SleepTimingChart({ data, targetBedtimeHour }) {
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
          domain={[0, 30]}
          ticks={[0, 6, 12, 18, 24, 30]}
          tickFormatter={formatHourTick}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<TimingTooltip />} />
        {targetBedtimeHour != null && (
          <ReferenceLine y={targetBedtimeHour} stroke="var(--text-muted)" strokeWidth={1} />
        )}
        <Line
          type="monotone"
          dataKey="bedHour"
          name="Bedtime"
          stroke="var(--series-5)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, stroke: "var(--surface-1)", fill: "var(--series-5)" }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="wakeHour"
          name="Wake time"
          stroke="var(--series-4)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 2, stroke: "var(--surface-1)", fill: "var(--series-4)" }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TimingTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
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
      <div style={{ color: "var(--text-muted)", marginBottom: 4, fontSize: 11.5 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, lineHeight: 1.6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
          <strong style={{ fontVariantNumeric: "tabular-nums" }}>{formatHourTick(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export const SLEEP_TIMING_LEGEND = [
  { key: "Bedtime", color: "var(--series-5)" },
  { key: "Wake time", color: "var(--series-4)" },
];

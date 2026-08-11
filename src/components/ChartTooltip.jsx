// Shared Recharts tooltip styled like the rest of the panels — a small
// dark card with a swatch + label + value per series.
export default function ChartTooltip({ active, payload, label, unit = "" }) {
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
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
          <strong style={{ fontVariantNumeric: "tabular-nums" }}>
            {typeof p.value === "number" ? Math.round(p.value * 10) / 10 : p.value}
            {unit}
          </strong>
        </div>
      ))}
    </div>
  );
}

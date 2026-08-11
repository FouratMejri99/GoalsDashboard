import Panel from "./Panel.jsx";

// Grafana-style stat tile: label, big value, optional signed delta vs a
// named period, optional tiny sparkline of recent values.
export default function StatTile({ label, value, unit, delta, sparkline, color = "var(--series-1)" }) {
  const deltaClass =
    delta == null || delta.direction === "neutral"
      ? "delta-neutral"
      : delta.direction === "good"
      ? "delta-good"
      : "delta-bad";

  return (
    <Panel>
      <div className="stat-tile-label">{label}</div>
      <div className="stat-tile-value">
        {value}
        {unit && <span className="stat-tile-unit">{unit}</span>}
      </div>
      {delta && (
        <div className={`stat-tile-delta ${deltaClass}`}>
          {delta.text}
        </div>
      )}
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} color={color} />}
    </Panel>
  );
}

function Sparkline({ data, color }) {
  const w = 100;
  const h = 28;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: 28, marginTop: 10, display: "block" }}
      aria-hidden="true"
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

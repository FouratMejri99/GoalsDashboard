import { pct } from "../lib/nutrition.js";

// A goal-progress bar. `goalIsCeiling`:
//  - true  -> exceeding the goal is bad (e.g. a calorie limit) and the fill
//             shifts to warning/critical past 100%.
//  - false -> the goal is a minimum (e.g. protein, workouts) and the fill
//             turns "good" once it's met.
export default function Meter({ label, value, goal, unit = "", color = "var(--series-1)", goalIsCeiling = true }) {
  const percent = pct(value, goal);
  const fillPct = Math.min(percent, 100);

  let fillColor = color;
  if (goalIsCeiling) {
    if (percent > 115) fillColor = "var(--status-critical)";
    else if (percent > 100) fillColor = "var(--status-warning)";
  } else if (percent >= 100) {
    fillColor = "var(--status-good)";
  }

  return (
    <div>
      <div className="meter-head">
        <span className="meter-name">{label}</span>
        <span className="meter-values">
          {round(value)}
          {unit} <span className="of-goal">/ {round(goal)}{unit}</span>
        </span>
      </div>
      <div
        className="meter-track"
        style={{ background: `color-mix(in srgb, ${fillColor} 16%, var(--surface-2))` }}
      >
        <div className="meter-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
      </div>
      <div className="meter-pct">{percent}% of goal</div>
    </div>
  );
}

function round(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Math.round(n * 10) / 10;
}

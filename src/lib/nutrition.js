// Pure helpers for turning a flat list of meal entries into the aggregates
// the dashboard panels need (daily totals, trend series, streaks...).
// Kept dependency-free and side-effect-free so it's easy to reason about/test.

export function todayStr() {
  const d = new Date();
  return toDateStr(d);
}

export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ISO date string, `offset` days before today (offset=0 -> today).
export function daysAgoStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return toDateStr(d);
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const NUM_FIELDS = ["calories", "protein", "carbs", "fat"];

// One row per date: summed macros, last logged weight that day, and how
// many meals were logged.
export function groupByDate(entries) {
  const map = new Map();
  for (const e of entries) {
    if (!map.has(e.date)) {
      map.set(e.date, {
        date: e.date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealCount: 0,
        weightKg: null,
      });
    }
    const row = map.get(e.date);
    for (const f of NUM_FIELDS) {
      row[f] += Number(e[f]) || 0;
    }
    row.mealCount += 1;
    if (e.weightKg != null && e.weightKg !== "") row.weightKg = Number(e.weightKg);
  }
  return map;
}

export function dailyTotals(entries, date) {
  const map = groupByDate(entries);
  return (
    map.get(date) || {
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealCount: 0,
      weightKg: null,
    }
  );
}

// Chronological series for the last `days` days (oldest first), each row
// carrying the day's totals plus the goal values so charts can draw a
// reference/target line alongside the actual bars/line.
export function buildTrendSeries(entries, days, settings) {
  const map = groupByDate(entries);
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoStr(i);
    const row = map.get(date);
    out.push({
      date,
      label: formatShortDate(date),
      calories: row ? row.calories : 0,
      protein: row ? row.protein : 0,
      carbs: row ? row.carbs : 0,
      fat: row ? row.fat : 0,
      weightKg: row ? row.weightKg : null,
      logged: !!row,
      calorieGoal: settings.calorieGoal || 0,
      proteinGoal: settings.proteinGoal || 0,
      weightGoalKg: settings.weightGoalKg || null,
    });
  }
  return out;
}

// Consecutive days up to and including today that have at least one logged entry.
export function currentStreak(entries) {
  const map = groupByDate(entries);
  let streak = 0;
  for (let i = 0; ; i++) {
    const date = daysAgoStr(i);
    if (map.has(date)) {
      streak += 1;
    } else if (i === 0) {
      // Today not logged yet doesn't break a streak that ended yesterday.
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function latestWeight(entries) {
  const sorted = [...entries]
    .filter((e) => e.weightKg != null && e.weightKg !== "")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return sorted.length ? Number(sorted[0].weightKg) : null;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function pct(value, goal) {
  if (!goal) return 0;
  return clamp(Math.round((value / goal) * 100), 0, 999);
}

// How far along the body-weight goal the user is, direction-aware (works for
// both "lose weight" and "gain weight" goals since it compares signed deltas).
export function weightProgress(startWeightKg, goalWeightKg, currentWeightKg) {
  if (startWeightKg == null || goalWeightKg == null || currentWeightKg == null) {
    return null;
  }
  const totalDelta = goalWeightKg - startWeightKg; // signed: negative = goal is to lose
  const currentDelta = currentWeightKg - startWeightKg;
  if (totalDelta === 0) return { percent: 100, remainingKg: 0, movedKg: currentDelta };
  const percent = clamp(Math.round((currentDelta / totalDelta) * 100), -50, 150);
  const remainingKg = Math.round((goalWeightKg - currentWeightKg) * 10) / 10;
  return { percent, remainingKg, movedKg: Math.round(currentDelta * 10) / 10 };
}

export function formatCompact(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.round(n * 10) / 10 + "";
}

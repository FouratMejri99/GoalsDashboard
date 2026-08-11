// Turns meal + workout timestamps into the points a "when do I eat/train"
// scatter chart needs: one x per day in range, y = time of day in hours,
// grouped into fixed categorical series (meal types + workout).
import { daysAgoStr, formatShortDate } from "./nutrition.js";
import { timeToHour } from "./time.js";

export const TIMING_SERIES_DEF = [
  { key: "Breakfast", color: "var(--series-1)" },
  { key: "Lunch", color: "var(--series-2)" },
  { key: "Dinner", color: "var(--series-3)" },
  { key: "Snack", color: "var(--series-4)" },
  { key: "Workout", color: "var(--series-5)" },
];

export function buildTimingSeries(entries, workouts, days) {
  const dayList = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoStr(i);
    dayList.push({ date, label: formatShortDate(date), x: days - 1 - i });
  }
  const indexByDate = new Map(dayList.map((d) => [d.date, d.x]));

  const pointsByCategory = new Map(TIMING_SERIES_DEF.map((s) => [s.key, []]));

  for (const e of entries) {
    const hour = timeToHour(e.time);
    const x = indexByDate.get(e.date);
    if (hour == null || x == null || !pointsByCategory.has(e.mealType)) continue;
    pointsByCategory.get(e.mealType).push({ x, y: hour, label: formatShortDate(e.date), name: e.name });
  }
  for (const w of workouts) {
    const hour = timeToHour(w.time);
    const x = indexByDate.get(w.date);
    if (hour == null || x == null) continue;
    pointsByCategory.get("Workout").push({ x, y: hour, label: formatShortDate(w.date), name: w.exercise });
  }

  return {
    dayList,
    series: TIMING_SERIES_DEF.map((s) => ({ ...s, points: pointsByCategory.get(s.key) })),
  };
}

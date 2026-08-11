// Shared "HH:MM" clock-time helpers used by meals, workouts, and sleep.

// "HH:MM" -> decimal hour (e.g. "23:30" -> 23.5). Returns null for blank/bad input.
export function timeToHour(timeStr) {
  if (!timeStr) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(timeStr);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h + min / 60;
}

// A decimal hour -> clock-time label, for any "time of day" axis or
// tooltip (wraps past 24 back to 12am, so a 24-30 extended range for
// post-midnight bedtimes still reads right). Whole hours print without
// minutes (axis ticks); fractional hours include them (tooltips).
export function formatHourTick(hour) {
  const norm = ((hour % 24) + 24) % 24;
  const h = Math.floor(norm);
  const m = Math.round((norm - h) * 60);
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const period = h < 12 ? "am" : "pm";
  return m === 0 ? `${displayH}${period}` : `${displayH}:${String(m).padStart(2, "0")}${period}`;
}

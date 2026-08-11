// Pure helpers for the sleep log: bedtime/wake-time -> duration, trends,
// streaks. Mirrors nutrition.js / workouts.js in shape.
import { daysAgoStr, formatShortDate } from "./nutrition.js";
import { timeToHour } from "./time.js";

// Bedtimes are almost always evening-into-night. Hours before noon are
// treated as "after midnight" and pushed past 24 (00:30 -> 24.5) so a
// bedtime series stays visually continuous instead of wrapping to the
// bottom of a 0-24 axis.
export function bedtimeAxisHour(hour) {
  if (hour == null) return null;
  return hour < 12 ? hour + 24 : hour;
}

// Hours asleep between a bedtime and a wake time, handling the overnight
// wrap (bed 23:00 -> wake 07:00 = 8h, not -16h).
export function sleepDuration(bedTime, wakeTime) {
  const bed = timeToHour(bedTime);
  const wake = timeToHour(wakeTime);
  if (bed == null || wake == null) return null;
  let duration = wake - bed;
  if (duration <= 0) duration += 24;
  return Math.round(duration * 10) / 10;
}

function groupSleepByDate(sleepEntries) {
  const map = new Map();
  for (const s of sleepEntries) {
    // last entry logged for a date wins if there are duplicates
    map.set(s.date, s);
  }
  return map;
}

// Chronological series for the last `days` nights (oldest first).
export function buildSleepTrendSeries(sleepEntries, days) {
  const map = groupSleepByDate(sleepEntries);
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoStr(i);
    const row = map.get(date);
    const duration = row ? sleepDuration(row.bedTime, row.wakeTime) : null;
    out.push({
      date,
      label: formatShortDate(date),
      durationHours: duration,
      bedHour: row ? bedtimeAxisHour(timeToHour(row.bedTime)) : null,
      wakeHour: row ? timeToHour(row.wakeTime) : null,
      logged: !!row,
    });
  }
  return out;
}

export function averageSleep(sleepEntries, days) {
  const series = buildSleepTrendSeries(sleepEntries, days).filter((d) => d.durationHours != null);
  if (!series.length) return null;
  const total = series.reduce((sum, d) => sum + d.durationHours, 0);
  return Math.round((total / series.length) * 10) / 10;
}

export function latestSleep(sleepEntries) {
  const sorted = [...sleepEntries].sort((a, b) => (a.date < b.date ? 1 : -1));
  return sorted.length ? sorted[0] : null;
}

// Consecutive nights up to and including last night with a logged entry.
export function sleepStreak(sleepEntries) {
  const map = groupSleepByDate(sleepEntries);
  let streak = 0;
  for (let i = 0; ; i++) {
    const date = daysAgoStr(i);
    if (map.has(date)) {
      streak += 1;
    } else if (i === 0) {
      continue; // last night not logged yet doesn't break a streak ending the night before
    } else {
      break;
    }
  }
  return streak;
}

export const SLEEP_QUALITY = ["Poor", "Fair", "Good", "Great"];

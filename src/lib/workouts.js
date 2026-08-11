// Pure helpers for turning a flat list of workout-set entries into the
// aggregates the training panels need. Mirrors the shape of nutrition.js
// but for strength-training data: sets/reps/weight/duration per exercise.
import { daysAgoStr, formatShortDate } from "./nutrition.js";

// Total kg moved for one logged row: sets x reps x weight. Bodyweight-only
// work (no weight logged) contributes 0 load volume by design — track those
// sessions by duration instead.
export function loadVolume(w) {
  const sets = Number(w.sets) || 0;
  const reps = Number(w.reps) || 0;
  const weight = Number(w.weightKg) || 0;
  return sets * reps * weight;
}

// Epley estimated one-rep max for a single working set.
export function estimated1RM(w) {
  const weight = Number(w.weightKg) || 0;
  const reps = Number(w.reps) || 0;
  if (!weight || !reps) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function groupWorkoutsByDate(workouts) {
  const map = new Map();
  for (const w of workouts) {
    if (!map.has(w.date)) {
      map.set(w.date, { date: w.date, volumeKg: 0, durationMin: 0, setCount: 0, exercises: new Set() });
    }
    const row = map.get(w.date);
    row.volumeKg += loadVolume(w);
    row.durationMin += Number(w.durationMin) || 0;
    row.setCount += Number(w.sets) || 0;
    row.exercises.add(w.exercise);
  }
  return map;
}

// Chronological series for the last `days` days (oldest first) — volume,
// duration and whether that day counts as "trained" at all.
export function buildWorkoutTrendSeries(workouts, days) {
  const map = groupWorkoutsByDate(workouts);
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgoStr(i);
    const row = map.get(date);
    out.push({
      date,
      label: formatShortDate(date),
      volumeKg: row ? Math.round(row.volumeKg) : 0,
      durationMin: row ? row.durationMin : 0,
      trained: !!row,
    });
  }
  return out;
}

export function distinctExercises(workouts) {
  const names = new Set(workouts.map((w) => w.exercise).filter(Boolean));
  return [...names].sort((a, b) => a.localeCompare(b));
}

// Per-session best set for one exercise, oldest first — the series a
// progression chart plots (top weight lifted + its estimated 1RM per date).
export function exerciseProgress(workouts, exerciseName) {
  const rows = workouts
    .filter((w) => w.exercise === exerciseName)
    .reduce((byDate, w) => {
      const cur = byDate.get(w.date);
      const weight = Number(w.weightKg) || 0;
      if (!cur || weight > cur.weightKg) {
        byDate.set(w.date, { date: w.date, weightKg: weight, reps: Number(w.reps) || 0, oneRm: estimated1RM(w) });
      }
      return byDate;
    }, new Map());
  return [...rows.values()]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((r) => ({ ...r, label: formatShortDate(r.date) }));
}

// Consecutive days up to and including today with at least one workout row.
export function trainingStreak(workouts) {
  const map = groupWorkoutsByDate(workouts);
  let streak = 0;
  for (let i = 0; ; i++) {
    const date = daysAgoStr(i);
    if (map.has(date)) {
      streak += 1;
    } else if (i === 0) {
      continue; // today not logged yet doesn't break a streak ending yesterday
    } else {
      break;
    }
  }
  return streak;
}

export function daysTrainedThisWeek(workouts) {
  const map = groupWorkoutsByDate(workouts);
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  let count = 0;
  for (let i = 0; i <= dow; i++) {
    if (map.has(daysAgoStr(i))) count += 1;
  }
  return count;
}

export function minutesThisWeek(workouts) {
  const map = groupWorkoutsByDate(workouts);
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  let total = 0;
  for (let i = 0; i <= dow; i++) {
    const row = map.get(daysAgoStr(i));
    if (row) total += row.durationMin;
  }
  return total;
}

export function volumeThisWeek(workouts) {
  const map = groupWorkoutsByDate(workouts);
  const today = new Date();
  const dow = (today.getDay() + 6) % 7;
  let total = 0;
  for (let i = 0; i <= dow; i++) {
    const row = map.get(daysAgoStr(i));
    if (row) total += row.volumeKg;
  }
  return Math.round(total);
}

// The heaviest single working set ever logged for each exercise, and how
// many of the most-recent 7 days' worth of sessions beat the prior best —
// used for a "new PR this week" stat tile.
export function personalBests(workouts) {
  const bestByExercise = new Map();
  for (const w of workouts) {
    const weight = Number(w.weightKg) || 0;
    const cur = bestByExercise.get(w.exercise);
    if (!cur || weight > cur.weightKg) {
      bestByExercise.set(w.exercise, { exercise: w.exercise, weightKg: weight, date: w.date, reps: Number(w.reps) || 0 });
    }
  }
  return [...bestByExercise.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full body", "Other"];

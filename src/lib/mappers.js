// Supabase/Postgres columns are snake_case; the rest of the app (charts,
// forms, lib/nutrition.js etc.) speaks camelCase. These helpers are the only
// place that translation happens.

// Postgres `time` columns round-trip as "HH:MM:SS" — the app's <input
// type="time"> fields and chart helpers all expect "HH:MM".
function trimTime(t) {
  return t ? t.slice(0, 5) : t;
}

export function settingsFromRow(row) {
  if (!row) return null;
  return {
    goalName: row.goal_name ?? "",
    calorieGoal: row.calorie_goal ?? 0,
    proteinGoal: row.protein_goal ?? 0,
    carbsGoal: row.carbs_goal ?? 0,
    fatGoal: row.fat_goal ?? 0,
    startWeightKg: row.start_weight_kg,
    weightGoalKg: row.weight_goal_kg,
    workoutsPerWeekGoal: row.workouts_per_week_goal ?? 0,
    weeklyMinutesGoal: row.weekly_minutes_goal ?? 0,
    sleepGoalHours: row.sleep_goal_hours ?? 0,
    targetBedtime: row.target_bedtime ?? "23:00",
  };
}

export function settingsToRow(settings, userId) {
  return {
    user_id: userId,
    goal_name: settings.goalName ?? "",
    calorie_goal: settings.calorieGoal ?? 0,
    protein_goal: settings.proteinGoal ?? 0,
    carbs_goal: settings.carbsGoal ?? 0,
    fat_goal: settings.fatGoal ?? 0,
    start_weight_kg: settings.startWeightKg ?? null,
    weight_goal_kg: settings.weightGoalKg ?? null,
    workouts_per_week_goal: settings.workoutsPerWeekGoal ?? 0,
    weekly_minutes_goal: settings.weeklyMinutesGoal ?? 0,
    sleep_goal_hours: settings.sleepGoalHours ?? 0,
    target_bedtime: settings.targetBedtime ?? "23:00",
  };
}

export function entryFromRow(row) {
  return {
    id: row.id,
    date: row.date,
    time: trimTime(row.time),
    mealType: row.meal_type,
    name: row.name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    weightKg: row.weight_kg,
    notes: row.notes ?? "",
  };
}

export function entryToRow(entry, userId) {
  return {
    user_id: userId,
    date: entry.date,
    time: entry.time || null,
    meal_type: entry.mealType,
    name: entry.name,
    calories: entry.calories ?? 0,
    protein: entry.protein ?? 0,
    carbs: entry.carbs ?? 0,
    fat: entry.fat ?? 0,
    weight_kg: entry.weightKg ?? null,
    notes: entry.notes ?? "",
  };
}

export function workoutFromRow(row) {
  return {
    id: row.id,
    date: row.date,
    time: trimTime(row.time),
    exercise: row.exercise,
    muscleGroup: row.muscle_group,
    sets: row.sets,
    reps: row.reps,
    weightKg: row.weight_kg,
    durationMin: row.duration_min,
    notes: row.notes ?? "",
  };
}

export function workoutToRow(workout, userId) {
  return {
    user_id: userId,
    date: workout.date,
    time: workout.time || null,
    exercise: workout.exercise,
    muscle_group: workout.muscleGroup,
    sets: workout.sets ?? 0,
    reps: workout.reps ?? 0,
    weight_kg: workout.weightKg ?? 0,
    duration_min: workout.durationMin ?? null,
    notes: workout.notes ?? "",
  };
}

export function sleepFromRow(row) {
  return {
    id: row.id,
    date: row.date,
    bedTime: trimTime(row.bed_time),
    wakeTime: trimTime(row.wake_time),
    quality: row.quality,
    notes: row.notes ?? "",
  };
}

export function sleepToRow(sleep, userId) {
  return {
    user_id: userId,
    date: sleep.date,
    bed_time: sleep.bedTime,
    wake_time: sleep.wakeTime,
    quality: sleep.quality,
    notes: sleep.notes ?? "",
  };
}

// Fallback goal values used only until a signed-in user's `settings` row
// loads from Supabase (the row itself is created with these same defaults
// by the handle_new_user trigger — see supabase/schema.sql).
export const DEFAULT_SETTINGS = {
  goalName: "",
  calorieGoal: 2200,
  proteinGoal: 160,
  carbsGoal: 220,
  fatGoal: 70,
  startWeightKg: null,
  weightGoalKg: null,
  workoutsPerWeekGoal: 4,
  weeklyMinutesGoal: 240,
  sleepGoalHours: 8,
  targetBedtime: "23:00",
  // Goals-page calculator inputs (src/lib/calorieCalc.js) — remembered so the
  // calculator doesn't reset every visit.
  sex: null,
  age: null,
  heightCm: null,
  activityLevel: "moderate",
  goalType: "maintain",
  weeklyRateKg: 0.5,
};

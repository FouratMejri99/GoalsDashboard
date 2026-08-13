// Pure calorie/macro calculator for the Goals page. No React, no Supabase —
// just numbers in, numbers out, so it's easy to reason about and test.

export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary — little or no exercise", multiplier: 1.2 },
  { key: "light", label: "Lightly active — exercise 1-3 days/week", multiplier: 1.375 },
  { key: "moderate", label: "Moderately active — exercise 3-5 days/week", multiplier: 1.55 },
  { key: "active", label: "Very active — exercise 6-7 days/week", multiplier: 1.725 },
  { key: "very_active", label: "Extremely active — physical job + daily training", multiplier: 1.9 },
];

export const GOAL_TYPES = [
  { key: "lose", label: "Lose weight" },
  { key: "maintain", label: "Maintain weight" },
  { key: "gain", label: "Gain weight" },
];

// Sensible weekly rate choices (kg/week) for the "lose"/"gain" goal types —
// maintain always adjusts by 0. ~0.5-1%% of bodyweight/week is the commonly
// recommended range for a sustainable rate of change.
export const RATE_OPTIONS = {
  lose: [0.25, 0.5, 0.75, 1],
  gain: [0.1, 0.25, 0.5],
};

const KCAL_PER_KG = 7700; // approx. kcal per kg of bodyweight (fat) gained/lost

function activityMultiplier(activityLevel) {
  return ACTIVITY_LEVELS.find((a) => a.key === activityLevel)?.multiplier ?? 1.55;
}

// Mifflin-St Jeor equation — the most accurate widely-used BMR estimate that
// only needs sex/age/height/weight (no body-fat% measurement).
export function calculateBMR({ sex, age, heightCm, weightKg }) {
  if (!age || !heightCm || !weightKg) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "female" ? base - 161 : base + 5);
}

// Total Daily Energy Expenditure: BMR scaled by how active the person is.
export function calculateTDEE(bmr, activityLevel) {
  if (bmr == null) return null;
  return Math.round(bmr * activityMultiplier(activityLevel));
}

// Daily calorie target for the selected goal, derived from a weekly rate of
// bodyweight change. Clamped to a safe floor so a large deficit request
// never recommends starvation-level intake.
export function calculateCalorieGoal({ tdee, goalType, weeklyRateKg = 0, weightKg }) {
  if (tdee == null) return null;
  const dailyDelta = ((weeklyRateKg || 0) * KCAL_PER_KG) / 7;
  let target = tdee;
  if (goalType === "lose") target = tdee - dailyDelta;
  else if (goalType === "gain") target = tdee + dailyDelta;

  const floor = weightKg ? Math.max(1200, weightKg * 10) : 1200;
  return Math.round(Math.max(target, floor));
}

// Macro split for the target calories:
//  - protein pinned to bodyweight (higher on a cut, to protect muscle)
//  - fat as a percent of calories, with a hormone-health floor
//  - carbs take whatever calories are left
export function calculateMacros({ calories, weightKg, goalType }) {
  if (!calories || !weightKg) return null;

  const proteinPerKg = goalType === "lose" ? 2.2 : goalType === "gain" ? 1.8 : 2.0;
  const proteinG = Math.round(weightKg * proteinPerKg);

  const fatFromPercent = (calories * 0.25) / 9;
  const fatFloor = weightKg * 0.6;
  const fatG = Math.round(Math.max(fatFromPercent, fatFloor));

  const remainingKcal = Math.max(0, calories - proteinG * 4 - fatG * 9);
  const carbsG = Math.round(remainingKcal / 4);

  return { proteinG, carbsG, fatG };
}

// Whole-weeks estimate to close the gap between current and target weight at
// the chosen weekly rate. null when there isn't enough info to estimate.
export function weeksToGoal({ currentWeightKg, targetWeightKg, weeklyRateKg }) {
  if (currentWeightKg == null || targetWeightKg == null || !weeklyRateKg) return null;
  const gapKg = Math.abs(targetWeightKg - currentWeightKg);
  if (gapKg === 0) return 0;
  return Math.ceil(gapKg / weeklyRateKg);
}

// Runs the whole pipeline in one call — what the Goals page renders.
export function calculatePlan({ sex, age, heightCm, weightKg, activityLevel, goalType, weeklyRateKg, targetWeightKg }) {
  const bmr = calculateBMR({ sex, age, heightCm, weightKg });
  const tdee = calculateTDEE(bmr, activityLevel);
  const effectiveRate = goalType === "maintain" ? 0 : weeklyRateKg || 0;
  const calorieGoal = calculateCalorieGoal({ tdee, goalType, weeklyRateKg: effectiveRate, weightKg });
  const macros = calculateMacros({ calories: calorieGoal, weightKg, goalType });
  const weeks = weeksToGoal({ currentWeightKg: weightKg, targetWeightKg, weeklyRateKg: effectiveRate });

  return { bmr, tdee, calorieGoal, macros, weeks, effectiveRate };
}

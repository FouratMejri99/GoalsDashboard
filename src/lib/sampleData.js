import { daysAgoStr } from "./nutrition.js";
import { makeId } from "./ids.js";

export const DEFAULT_SETTINGS = {
  goalName: "Cut to 78kg",
  calorieGoal: 2200,
  proteinGoal: 160,
  carbsGoal: 220,
  fatGoal: 70,
  startWeightKg: 84,
  weightGoalKg: 78,
  workoutsPerWeekGoal: 4,
  weeklyMinutesGoal: 240,
  sleepGoalHours: 8,
  targetBedtime: "23:00",
};

const MEALS = [
  { mealType: "Breakfast", name: "Oats, whey & banana", calories: 480, protein: 35, carbs: 60, fat: 10, time: "07:15" },
  { mealType: "Lunch", name: "Chicken, rice & veg", calories: 650, protein: 50, carbs: 70, fat: 15, time: "12:45" },
  { mealType: "Dinner", name: "Salmon & sweet potato", calories: 600, protein: 42, carbs: 55, fat: 22, time: "19:30" },
  { mealType: "Snack", name: "Greek yogurt & almonds", calories: 280, protein: 20, carbs: 15, fat: 14, time: "16:00" },
];

// Shift a "HH:MM" time by up to `spreadMin` minutes either way.
function jitterTime(hhmm, spreadMin) {
  const [h, m] = hhmm.split(":").map(Number);
  let total = h * 60 + m + Math.round((Math.random() - 0.5) * 2 * spreadMin);
  total = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

// A believable 14-day slice of logged meals + body weight, so the dashboard
// has something to render before the user has entered their own data.
export function generateSampleEntries() {
  const entries = [];
  let weight = 84;
  for (let i = 13; i >= 0; i--) {
    const date = daysAgoStr(i);
    weight -= Math.random() * 0.18; // gentle downward trend
    const mealsToday = Math.random() > 0.15 ? MEALS : MEALS.slice(0, 3);
    mealsToday.forEach((m, idx) => {
      const jitter = () => Math.round((Math.random() - 0.5) * 40);
      entries.push({
        id: makeId(),
        date,
        time: jitterTime(m.time, 20),
        mealType: m.mealType,
        name: m.name,
        calories: Math.max(0, m.calories + jitter()),
        protein: Math.max(0, m.protein + Math.round(jitter() / 4)),
        carbs: Math.max(0, m.carbs + Math.round(jitter() / 3)),
        fat: Math.max(0, m.fat + Math.round(jitter() / 6)),
        weightKg: idx === 0 ? Math.round(weight * 10) / 10 : null,
        notes: "",
      });
    });
  }
  return entries;
}

// A simple push/pull/legs rotation with weights that creep up over the two
// weeks, so the exercise-progression chart has something to show.
const ROUTINE = {
  Push: [
    { exercise: "Bench Press", muscleGroup: "Chest", sets: 4, reps: 8, startWeight: 60 },
    { exercise: "Overhead Press", muscleGroup: "Shoulders", sets: 3, reps: 10, startWeight: 35 },
    { exercise: "Tricep Pushdown", muscleGroup: "Arms", sets: 3, reps: 12, startWeight: 25 },
  ],
  Pull: [
    { exercise: "Deadlift", muscleGroup: "Back", sets: 4, reps: 6, startWeight: 90 },
    { exercise: "Pull-up", muscleGroup: "Back", sets: 4, reps: 8, startWeight: 0 },
    { exercise: "Barbell Row", muscleGroup: "Back", sets: 3, reps: 10, startWeight: 50 },
  ],
  Legs: [
    { exercise: "Back Squat", muscleGroup: "Legs", sets: 4, reps: 6, startWeight: 80 },
    { exercise: "Leg Press", muscleGroup: "Legs", sets: 3, reps: 12, startWeight: 100 },
    { exercise: "Calf Raise", muscleGroup: "Legs", sets: 3, reps: 15, startWeight: 40 },
  ],
  Cardio: [{ exercise: "Rowing Machine", muscleGroup: "Cardio", sets: 1, reps: 1, startWeight: 0 }],
};
const SPLIT = ["Push", "Pull", "Legs", "Cardio", "Push", "Pull", "Legs"]; // rest implied on any day skipped

export function generateSampleWorkouts() {
  const workouts = [];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgoStr(i);
    const dayIndex = 13 - i;
    if (dayIndex % 7 === 6) continue; // one rest day per week
    const day = SPLIT[dayIndex % SPLIT.length];
    const weekNumber = Math.floor(dayIndex / 7); // progressive overload in week 2
    const exercises = ROUTINE[day];
    if (day === "Cardio") {
      workouts.push({
        id: makeId(),
        date,
        time: jitterTime("07:00", 30),
        exercise: "Rowing Machine",
        muscleGroup: "Cardio",
        sets: 1,
        reps: 1,
        weightKg: 0,
        durationMin: 25 + Math.round(Math.random() * 10),
        notes: "",
      });
      continue;
    }
    exercises.forEach((ex, idx) => {
      const progressed = ex.startWeight > 0 ? ex.startWeight + weekNumber * 2.5 + Math.round(Math.random() * 2) : 0;
      workouts.push({
        id: makeId(),
        date,
        // Session start time is logged once per day, on the first exercise —
        // same "one optional field, one row a day" pattern as meal body weight.
        time: idx === 0 ? jitterTime("18:00", 40) : null,
        exercise: ex.exercise,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets,
        reps: ex.reps,
        weightKg: progressed,
        durationMin: idx === 0 ? 45 + Math.round(Math.random() * 20) : null,
        notes: "",
      });
    });
  }
  return workouts;
}

const QUALITIES = ["Poor", "Fair", "Good", "Great"];

// 14 nights of sleep, roughly around a 23:00 bedtime / 07:00 wake, so the
// sleep-duration and bedtime-consistency charts have something to show.
export function generateSampleSleep() {
  const sleep = [];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgoStr(i);
    if (Math.random() < 0.08) continue; // the odd night not logged
    const quality = QUALITIES[Math.min(3, Math.floor(Math.random() * 4))];
    sleep.push({
      id: makeId(),
      date,
      bedTime: jitterTime("23:00", 45),
      wakeTime: jitterTime("07:00", 35),
      quality,
      notes: "",
    });
  }
  return sleep;
}

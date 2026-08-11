import { useEffect, useState } from "react";
import { useData } from "../context/DataContext.jsx";

export default function Settings() {
  const {
    settings,
    updateSettings,
    entries,
    clearAllEntries,
    workouts,
    clearAllWorkouts,
    sleepEntries,
    clearAllSleepEntries,
  } = useData();
  const [form, setForm] = useState(settings);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => setForm(settings), [settings]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateSettings({
      goalName: form.goalName.trim(),
      calorieGoal: num(form.calorieGoal),
      proteinGoal: num(form.proteinGoal),
      carbsGoal: num(form.carbsGoal),
      fatGoal: num(form.fatGoal),
      startWeightKg: num(form.startWeightKg),
      weightGoalKg: num(form.weightGoalKg),
      workoutsPerWeekGoal: num(form.workoutsPerWeekGoal),
      weeklyMinutesGoal: num(form.weeklyMinutesGoal),
      sleepGoalHours: num(form.sleepGoalHours),
      targetBedtime: form.targetBedtime,
    });
    setSavedAt(Date.now());
  }

  function handleClear() {
    const total = entries.length + workouts.length + sleepEntries.length;
    if (window.confirm(`Delete all ${total} logged entries (meals, exercise sets, and nights of sleep)? This can't be undone.`)) {
      clearAllEntries();
      clearAllWorkouts();
      clearAllSleepEntries();
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Set the goal you're working toward — the Dashboard measures your log against these numbers.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="panel">
          <p className="panel-title">
            <span>Goal</span>
          </p>
          <div className="form-grid">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="s-goalname">Goal name</label>
              <input
                id="s-goalname"
                type="text"
                placeholder="e.g. Cut to 78kg by December"
                value={form.goalName}
                onChange={(e) => set("goalName", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">
            <span>Daily nutrition targets</span>
          </p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="s-cal">Calorie goal (kcal)</label>
              <input id="s-cal" type="number" min="0" value={form.calorieGoal} onChange={(e) => set("calorieGoal", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="s-protein">Protein goal (g)</label>
              <input id="s-protein" type="number" min="0" value={form.proteinGoal} onChange={(e) => set("proteinGoal", e.target.value)} />
              <span className="field-hint">Treated as a minimum to hit</span>
            </div>
            <div className="field">
              <label htmlFor="s-carbs">Carbs goal (g)</label>
              <input id="s-carbs" type="number" min="0" value={form.carbsGoal} onChange={(e) => set("carbsGoal", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="s-fat">Fat goal (g)</label>
              <input id="s-fat" type="number" min="0" value={form.fatGoal} onChange={(e) => set("fatGoal", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">
            <span>Body weight goal</span>
          </p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="s-startw">Starting weight (kg)</label>
              <input id="s-startw" type="number" min="0" step="0.1" value={form.startWeightKg} onChange={(e) => set("startWeightKg", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="s-targetw">Target weight (kg)</label>
              <input id="s-targetw" type="number" min="0" step="0.1" value={form.weightGoalKg} onChange={(e) => set("weightGoalKg", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="s-workouts">Workouts / week goal</label>
              <input
                id="s-workouts"
                type="number"
                min="0"
                max="14"
                value={form.workoutsPerWeekGoal}
                onChange={(e) => set("workoutsPerWeekGoal", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="s-minutes">Weekly training minutes goal</label>
              <input
                id="s-minutes"
                type="number"
                min="0"
                value={form.weeklyMinutesGoal}
                onChange={(e) => set("weeklyMinutesGoal", e.target.value)}
              />
              <span className="field-hint">Total session minutes across the week</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">
            <span>Sleep goal</span>
          </p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="s-sleephours">Sleep goal (hours/night)</label>
              <input
                id="s-sleephours"
                type="number"
                min="0"
                max="16"
                step="0.5"
                value={form.sleepGoalHours}
                onChange={(e) => set("sleepGoalHours", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="s-bedtime">Target bedtime</label>
              <input id="s-bedtime" type="time" value={form.targetBedtime} onChange={(e) => set("targetBedtime", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card-row" style={{ alignItems: "center" }}>
          <button type="submit" className="btn btn-primary">
            Save goal
          </button>
          {savedAt && <span className="tag">Saved ✓</span>}
        </div>
      </form>

      <hr className="section-divider" />

      <div className="panel danger-zone">
        <p className="panel-title">
          <span>Data</span>
        </p>
        <p className="page-subtitle" style={{ marginBottom: 14 }}>
          Everything is stored in your Supabase project ({entries.length} meals, {workouts.length} exercise sets,{" "}
          {sleepEntries.length} nights of sleep logged) — visible only to you, via row-level security.
        </p>
        <div className="card-row">
          <button type="button" className="btn btn-danger" onClick={handleClear}>
            Clear all entries
          </button>
        </div>
      </div>
    </>
  );
}

function num(v) {
  const n = Number(v);
  return v === "" || Number.isNaN(n) ? 0 : n;
}

import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import Panel from "../components/Panel.jsx";
import StatTile from "../components/StatTile.jsx";
import { latestWeight } from "../lib/nutrition.js";
import { ACTIVITY_LEVELS, GOAL_TYPES, RATE_OPTIONS, calculatePlan } from "../lib/calorieCalc.js";

const MACRO_COLORS = { protein: "var(--series-2)", carbs: "var(--series-3)", fat: "var(--series-4)" };

export default function Goals() {
  const { settings, updateSettings, entries } = useData();

  const [form, setForm] = useState(() => ({
    sex: settings.sex || "male",
    age: settings.age ?? "",
    heightCm: settings.heightCm ?? "",
    weightKg: latestWeight(entries) ?? settings.startWeightKg ?? "",
    activityLevel: settings.activityLevel || "moderate",
    goalType: settings.goalType || "maintain",
    weeklyRateKg: settings.weeklyRateKg ?? 0.5,
    targetWeightKg: settings.weightGoalKg ?? "",
  }));
  const [appliedAt, setAppliedAt] = useState(null);

  function set(field, value) {
    setAppliedAt(null);
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setGoalType(goalType) {
    setAppliedAt(null);
    setForm((f) => ({
      ...f,
      goalType,
      // Land on a sane default rate for whichever side of maintenance they land on.
      weeklyRateKg: goalType === "maintain" ? f.weeklyRateKg : RATE_OPTIONS[goalType]?.[1] ?? f.weeklyRateKg,
    }));
  }

  const plan = useMemo(
    () =>
      calculatePlan({
        sex: form.sex,
        age: num(form.age),
        heightCm: num(form.heightCm),
        weightKg: num(form.weightKg),
        activityLevel: form.activityLevel,
        goalType: form.goalType,
        weeklyRateKg: num(form.weeklyRateKg),
        targetWeightKg: form.targetWeightKg === "" ? null : num(form.targetWeightKg),
      }),
    [form]
  );

  const ready = plan.bmr != null && plan.calorieGoal != null && plan.macros != null;
  const rateOptions = RATE_OPTIONS[form.goalType] || [];

  function handleApply(e) {
    e.preventDefault();
    if (!ready) return;
    updateSettings({
      sex: form.sex,
      age: num(form.age),
      heightCm: num(form.heightCm),
      activityLevel: form.activityLevel,
      goalType: form.goalType,
      weeklyRateKg: plan.effectiveRate,
      startWeightKg: num(form.weightKg),
      weightGoalKg: form.targetWeightKg === "" ? settings.weightGoalKg : num(form.targetWeightKg),
      calorieGoal: plan.calorieGoal,
      proteinGoal: plan.macros.proteinG,
      carbsGoal: plan.macros.carbsG,
      fatGoal: plan.macros.fatG,
    });
    setAppliedAt(Date.now());
  }

  const macroCalories = plan.macros
    ? { protein: plan.macros.proteinG * 4, carbs: plan.macros.carbsG * 4, fat: plan.macros.fatG * 9 }
    : null;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">
            Calculate the calories and macros for losing, maintaining, or gaining weight, then apply them to the
            Dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={handleApply}>
        <div className="panel" style={{ marginBottom: 16 }}>
          <p className="panel-title">
            <span>Your details</span>
          </p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="g-sex">Sex</label>
              <select id="g-sex" value={form.sex} onChange={(e) => set("sex", e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <span className="field-hint">Used by the BMR formula only</span>
            </div>
            <div className="field">
              <label htmlFor="g-age">Age</label>
              <input id="g-age" type="number" min="10" max="100" value={form.age} onChange={(e) => set("age", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="g-height">Height (cm)</label>
              <input
                id="g-height"
                type="number"
                min="0"
                step="0.1"
                value={form.heightCm}
                onChange={(e) => set("heightCm", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="g-weight">Current weight (kg)</label>
              <input
                id="g-weight"
                type="number"
                min="0"
                step="0.1"
                value={form.weightKg}
                onChange={(e) => set("weightKg", e.target.value)}
              />
              <span className="field-hint">Pre-filled from your last logged weight</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <p className="panel-title">
            <span>Activity level</span>
          </p>
          <div className="field">
            <label htmlFor="g-activity">How active are you, outside of dedicated training?</label>
            <select id="g-activity" value={form.activityLevel} onChange={(e) => set("activityLevel", e.target.value)}>
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 16 }}>
          <p className="panel-title">
            <span>Goal</span>
          </p>
          <div className="goal-type-row">
            {GOAL_TYPES.map((g) => (
              <button
                key={g.key}
                type="button"
                className={"btn goal-type-btn" + (form.goalType === g.key ? " btn-primary" : "")}
                onClick={() => setGoalType(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="form-grid" style={{ marginTop: 16 }}>
            {form.goalType !== "maintain" && (
              <div className="field">
                <label htmlFor="g-rate">
                  Rate of {form.goalType === "lose" ? "loss" : "gain"} (kg/week)
                </label>
                <select id="g-rate" value={form.weeklyRateKg} onChange={(e) => set("weeklyRateKg", e.target.value)}>
                  {rateOptions.map((r) => (
                    <option key={r} value={r}>
                      {r} kg/week
                    </option>
                  ))}
                </select>
                <span className="field-hint">Higher rates mean a bigger deficit/surplus</span>
              </div>
            )}
            <div className="field">
              <label htmlFor="g-target">Target weight (kg)</label>
              <input
                id="g-target"
                type="number"
                min="0"
                step="0.1"
                placeholder="optional"
                value={form.targetWeightKg}
                onChange={(e) => set("targetWeightKg", e.target.value)}
              />
              <span className="field-hint">Also becomes your Dashboard weight goal</span>
            </div>
          </div>
        </div>

        {!ready ? (
          <div className="panel">
            <div className="empty-state">Fill in age, height, and current weight to see your calorie and macro targets.</div>
          </div>
        ) : (
          <>
            <div className="dashboard-grid grid-stats" style={{ marginBottom: 16 }}>
              <StatTile
                label="BMR"
                value={plan.bmr}
                unit="kcal/day"
                color="var(--series-5)"
                delta={{ text: "Calories at total rest", direction: "neutral" }}
              />
              <StatTile
                label="Maintenance (TDEE)"
                value={plan.tdee}
                unit="kcal/day"
                color="var(--series-1)"
                delta={{ text: "BMR × activity level", direction: "neutral" }}
              />
              <StatTile
                label="Daily calorie goal"
                value={plan.calorieGoal}
                unit="kcal"
                color="var(--series-3)"
                delta={{
                  text:
                    form.goalType === "maintain"
                      ? "At maintenance"
                      : `${form.goalType === "lose" ? "−" : "+"}${Math.round(Math.abs(plan.calorieGoal - plan.tdee))} kcal vs maintenance`,
                  direction: "neutral",
                }}
              />
              <StatTile
                label="Est. time to target"
                value={plan.weeks != null ? plan.weeks : "—"}
                unit={plan.weeks != null ? (plan.weeks === 1 ? "week" : "weeks") : ""}
                color="var(--series-4)"
                delta={{
                  text: plan.weeks != null ? "At the selected rate" : "Set a target weight above",
                  direction: "neutral",
                }}
              />
            </div>

            <Panel title="Daily macro targets">
              <div className="macro-ratio-bar">
                <span style={{ width: `${pctOf(macroCalories.protein, plan.calorieGoal)}%`, background: MACRO_COLORS.protein }} />
                <span style={{ width: `${pctOf(macroCalories.carbs, plan.calorieGoal)}%`, background: MACRO_COLORS.carbs }} />
                <span style={{ width: `${pctOf(macroCalories.fat, plan.calorieGoal)}%`, background: MACRO_COLORS.fat }} />
              </div>
              <div className="macro-breakdown-row">
                <MacroFigure label="Protein" grams={plan.macros.proteinG} pct={pctOf(macroCalories.protein, plan.calorieGoal)} color={MACRO_COLORS.protein} />
                <MacroFigure label="Carbs" grams={plan.macros.carbsG} pct={pctOf(macroCalories.carbs, plan.calorieGoal)} color={MACRO_COLORS.carbs} />
                <MacroFigure label="Fat" grams={plan.macros.fatG} pct={pctOf(macroCalories.fat, plan.calorieGoal)} color={MACRO_COLORS.fat} />
              </div>
            </Panel>

            <div className="card-row" style={{ marginTop: 16, alignItems: "center" }}>
              <button type="submit" className="btn btn-primary">
                Apply to Dashboard goals
              </button>
              {appliedAt && <span className="tag">Applied to Settings ✓</span>}
            </div>
          </>
        )}
      </form>
    </>
  );
}

function MacroFigure({ label, grams, pct, color }) {
  return (
    <div className="macro-figure">
      <span className="legend-swatch" style={{ background: color }} />
      <div>
        <div className="macro-figure-label">{label}</div>
        <div className="macro-figure-value">
          {grams}g <span className="stat-tile-unit">· {pct}%</span>
        </div>
      </div>
    </div>
  );
}

function num(v) {
  const n = Number(v);
  return v === "" || v == null || Number.isNaN(n) ? null : n;
}

function pctOf(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

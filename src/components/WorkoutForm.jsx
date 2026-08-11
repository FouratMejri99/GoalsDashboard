import { useEffect, useState } from "react";
import { todayStr } from "../lib/nutrition.js";
import { MUSCLE_GROUPS } from "../lib/workouts.js";

const BLANK = {
  date: "",
  time: "",
  exercise: "",
  muscleGroup: "Chest",
  sets: "",
  reps: "",
  weightKg: "",
  durationMin: "",
  notes: "",
};

// Add/edit form for one exercise entry (one row = one exercise on one date,
// with its working sets/reps/weight). Mirrors EntryForm's shape/conventions.
export default function WorkoutForm({ initial, knownExercises = [], onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...BLANK, date: todayStr(), ...initial }));

  useEffect(() => {
    setForm({ ...BLANK, date: todayStr(), ...initial });
  }, [initial]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.exercise.trim()) return;
    onSubmit({
      date: form.date,
      time: form.time || null,
      exercise: form.exercise.trim(),
      muscleGroup: form.muscleGroup,
      sets: numOr(form.sets, 0),
      reps: numOr(form.reps, 0),
      weightKg: numOr(form.weightKg, 0),
      durationMin: form.durationMin === "" ? null : numOr(form.durationMin, null),
      notes: form.notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="wf-date">Date</label>
          <input id="wf-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="wf-time">Start time</label>
          <input id="wf-time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
        </div>

        <div className="field" style={{ gridColumn: "span 2" }}>
          <label htmlFor="wf-exercise">Exercise</label>
          <input
            id="wf-exercise"
            type="text"
            list="wf-exercise-options"
            placeholder="e.g. Bench Press"
            value={form.exercise}
            onChange={(e) => set("exercise", e.target.value)}
            required
          />
          <datalist id="wf-exercise-options">
            {knownExercises.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="field">
          <label htmlFor="wf-muscle">Muscle group</label>
          <select id="wf-muscle" value={form.muscleGroup} onChange={(e) => set("muscleGroup", e.target.value)}>
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="wf-sets">Sets</label>
          <input id="wf-sets" type="number" min="0" step="1" value={form.sets} onChange={(e) => set("sets", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="wf-reps">Reps per set</label>
          <input id="wf-reps" type="number" min="0" step="1" value={form.reps} onChange={(e) => set("reps", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="wf-weight">Weight (kg)</label>
          <input
            id="wf-weight"
            type="number"
            min="0"
            step="0.5"
            placeholder="0 for bodyweight"
            value={form.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="wf-duration">Session duration (min)</label>
          <input
            id="wf-duration"
            type="number"
            min="0"
            step="1"
            placeholder="optional"
            value={form.durationMin}
            onChange={(e) => set("durationMin", e.target.value)}
          />
          <span className="field-hint">Log once per session, e.g. on the first exercise</span>
        </div>

        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="wf-notes">Notes</label>
          <input id="wf-notes" type="text" placeholder="optional" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      <div className="card-row" style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-primary">
          {initial ? "Save changes" : "Add set"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function numOr(v, fallback) {
  const n = Number(v);
  return v === "" || Number.isNaN(n) ? fallback : n;
}

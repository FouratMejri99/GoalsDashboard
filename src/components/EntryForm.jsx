import { useEffect, useState } from "react";
import { todayStr } from "../lib/nutrition.js";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const BLANK = {
  date: "",
  time: "",
  mealType: "Breakfast",
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  weightKg: "",
  notes: "",
};

// Add/edit form for one meal entry. Controlled internally; calls onSubmit
// with a normalized entry object (numbers coerced, blanks -> null).
export default function EntryForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...BLANK, date: todayStr(), ...initial }));

  useEffect(() => {
    setForm({ ...BLANK, date: todayStr(), ...initial });
  }, [initial]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.name.trim()) return;
    onSubmit({
      date: form.date,
      time: form.time || null,
      mealType: form.mealType,
      name: form.name.trim(),
      calories: numOr(form.calories, 0),
      protein: numOr(form.protein, 0),
      carbs: numOr(form.carbs, 0),
      fat: numOr(form.fat, 0),
      weightKg: form.weightKg === "" ? null : numOr(form.weightKg, null),
      notes: form.notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="ef-date">Date</label>
          <input id="ef-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="ef-time">Time</label>
          <input id="ef-time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="ef-mealtype">Meal</label>
          <select id="ef-mealtype" value={form.mealType} onChange={(e) => set("mealType", e.target.value)}>
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "span 2" }}>
          <label htmlFor="ef-name">What did you eat</label>
          <input
            id="ef-name"
            type="text"
            placeholder="e.g. Chicken, rice & veg"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="ef-cal">Calories (kcal)</label>
          <input id="ef-cal" type="number" min="0" step="1" value={form.calories} onChange={(e) => set("calories", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ef-protein">Protein (g)</label>
          <input id="ef-protein" type="number" min="0" step="1" value={form.protein} onChange={(e) => set("protein", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ef-carbs">Carbs (g)</label>
          <input id="ef-carbs" type="number" min="0" step="1" value={form.carbs} onChange={(e) => set("carbs", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ef-fat">Fat (g)</label>
          <input id="ef-fat" type="number" min="0" step="1" value={form.fat} onChange={(e) => set("fat", e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="ef-weight">Body weight (kg)</label>
          <input
            id="ef-weight"
            type="number"
            min="0"
            step="0.1"
            placeholder="optional"
            value={form.weightKg}
            onChange={(e) => set("weightKg", e.target.value)}
          />
          <span className="field-hint">Log once a day, e.g. on your first meal</span>
        </div>

        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="ef-notes">Notes</label>
          <input id="ef-notes" type="text" placeholder="optional" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      <div className="card-row" style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-primary">
          {initial ? "Save changes" : "Add entry"}
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

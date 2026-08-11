import { useEffect, useState } from "react";
import { todayStr } from "../lib/nutrition.js";
import { sleepDuration, SLEEP_QUALITY } from "../lib/sleep.js";

const BLANK = {
  date: "",
  bedTime: "23:00",
  wakeTime: "07:00",
  quality: "Good",
  notes: "",
};

// Add/edit form for one night of sleep. `date` is the night you woke up on
// (so "last night" is logged against today), matching how people think
// about a night's sleep.
export default function SleepForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...BLANK, date: todayStr(), ...initial }));

  useEffect(() => {
    setForm({ ...BLANK, date: todayStr(), ...initial });
  }, [initial]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.date || !form.bedTime || !form.wakeTime) return;
    onSubmit({
      date: form.date,
      bedTime: form.bedTime,
      wakeTime: form.wakeTime,
      quality: form.quality,
      notes: form.notes.trim(),
    });
  }

  const preview = sleepDuration(form.bedTime, form.wakeTime);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="sf-date">Woke up on</label>
          <input id="sf-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="sf-bed">Bedtime</label>
          <input id="sf-bed" type="time" value={form.bedTime} onChange={(e) => set("bedTime", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="sf-wake">Wake time</label>
          <input id="sf-wake" type="time" value={form.wakeTime} onChange={(e) => set("wakeTime", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="sf-quality">Quality</label>
          <select id="sf-quality" value={form.quality} onChange={(e) => set("quality", e.target.value)}>
            {SLEEP_QUALITY.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="sf-notes">Notes</label>
          <input id="sf-notes" type="text" placeholder="optional" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      {preview != null && (
        <p className="field-hint" style={{ marginTop: 10 }}>
          That's {preview}h asleep.
        </p>
      )}

      <div className="card-row" style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-primary">
          {initial ? "Save changes" : "Add night"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

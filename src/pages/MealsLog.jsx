import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import Panel from "../components/Panel.jsx";
import EntryForm from "../components/EntryForm.jsx";
import { daysAgoStr, formatShortDate } from "../lib/nutrition.js";

const MEAL_ORDER = { Breakfast: 0, Lunch: 1, Dinner: 2, Snack: 3 };
const RANGE_OPTIONS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

export default function MealsLog() {
  const { entries, addEntry, updateEntry, deleteEntry } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [range, setRange] = useState("30");

  const visible = useMemo(() => {
    let rows = [...entries];
    if (range !== "all") {
      const cutoff = daysAgoStr(Number(range) - 1);
      rows = rows.filter((e) => e.date >= cutoff);
    }
    rows.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (MEAL_ORDER[a.mealType] ?? 9) - (MEAL_ORDER[b.mealType] ?? 9);
    });
    return rows;
  }, [entries, range]);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(entry) {
    setEditing(entry);
    setShowForm(true);
  }

  function handleSubmit(values) {
    if (editing) {
      updateEntry(editing.id, values);
    } else {
      addEntry(values);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Log</h1>
          <p className="page-subtitle">Log every meal — the Dashboard turns this into progress toward your goals.</p>
        </div>
        <div className="header-actions">
          {!showForm && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Add entry
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <Panel title={editing ? "Edit entry" : "New entry"} style={{ marginBottom: 16 }}>
          <EntryForm
            initial={editing || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </Panel>
      )}

      <Panel
        title="Meals"
        actions={
          <div className="card-row">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={"btn btn-sm" + (range === opt.key ? " btn-primary" : " btn-ghost")}
                onClick={() => setRange(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="empty-state">No entries in this range yet. Add your first meal above.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Meal</th>
                  <th className="col-name">Description</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Weight</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((e) => (
                  <tr key={e.id}>
                    <td>{formatShortDate(e.date)}</td>
                    <td>{e.time || "—"}</td>
                    <td>
                      <span className="meal-pill">{e.mealType}</span>
                    </td>
                    <td className="col-name">{e.name}</td>
                    <td>{e.calories} kcal</td>
                    <td>{e.protein} g</td>
                    <td>{e.carbs} g</td>
                    <td>{e.fat} g</td>
                    <td>{e.weightKg != null ? `${e.weightKg} kg` : "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(e)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => deleteEntry(e.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

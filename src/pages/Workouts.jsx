import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import Panel from "../components/Panel.jsx";
import WorkoutForm from "../components/WorkoutForm.jsx";
import { daysAgoStr, formatShortDate } from "../lib/nutrition.js";
import { distinctExercises, loadVolume } from "../lib/workouts.js";

const RANGE_OPTIONS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

export default function Workouts() {
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [range, setRange] = useState("30");
  const [exerciseFilter, setExerciseFilter] = useState("all");

  const exercises = useMemo(() => distinctExercises(workouts), [workouts]);

  const visible = useMemo(() => {
    let rows = [...workouts];
    if (range !== "all") {
      const cutoff = daysAgoStr(Number(range) - 1);
      rows = rows.filter((w) => w.date >= cutoff);
    }
    if (exerciseFilter !== "all") {
      rows = rows.filter((w) => w.exercise === exerciseFilter);
    }
    rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    return rows;
  }, [workouts, range, exerciseFilter]);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(workout) {
    setEditing(workout);
    setShowForm(true);
  }

  function handleSubmit(values) {
    if (editing) {
      updateWorkout(editing.id, values);
    } else {
      addWorkout(values);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">Log every exercise — sets, reps, weight and session time feed the training charts.</p>
        </div>
        <div className="header-actions">
          {!showForm && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Add set
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <Panel title={editing ? "Edit set" : "New set"} style={{ marginBottom: 16 }}>
          <WorkoutForm
            initial={editing || undefined}
            knownExercises={exercises}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </Panel>
      )}

      <Panel
        title="Exercise log"
        actions={
          <div className="card-row">
            <select
              className="btn btn-sm"
              value={exerciseFilter}
              onChange={(e) => setExerciseFilter(e.target.value)}
              style={{ paddingRight: 6 }}
            >
              <option value="all">All exercises</option>
              {exercises.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
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
          <div className="empty-state">No sets in this range yet. Add your first exercise above.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th className="col-name">Exercise</th>
                  <th>Group</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th>Weight</th>
                  <th>Volume</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((w) => (
                  <tr key={w.id}>
                    <td>{formatShortDate(w.date)}</td>
                    <td>{w.time || "—"}</td>
                    <td className="col-name">{w.exercise}</td>
                    <td>
                      <span className="meal-pill">{w.muscleGroup}</span>
                    </td>
                    <td>{w.sets}</td>
                    <td>{w.reps}</td>
                    <td>{w.weightKg} kg</td>
                    <td>{Math.round(loadVolume(w))} kg</td>
                    <td>{w.durationMin != null ? `${w.durationMin} min` : "—"}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(w)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => deleteWorkout(w.id)}>
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

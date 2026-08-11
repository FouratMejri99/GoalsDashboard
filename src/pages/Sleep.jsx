import { useMemo, useState } from "react";
import { useData } from "../context/DataContext.jsx";
import Panel from "../components/Panel.jsx";
import SleepForm from "../components/SleepForm.jsx";
import { daysAgoStr, formatShortDate } from "../lib/nutrition.js";
import { sleepDuration } from "../lib/sleep.js";

const RANGE_OPTIONS = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

export default function Sleep() {
  const { sleepEntries, addSleepEntry, updateSleepEntry, deleteSleepEntry } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [range, setRange] = useState("30");

  const visible = useMemo(() => {
    let rows = [...sleepEntries];
    if (range !== "all") {
      const cutoff = daysAgoStr(Number(range) - 1);
      rows = rows.filter((s) => s.date >= cutoff);
    }
    rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    return rows;
  }, [sleepEntries, range]);

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
      updateSleepEntry(editing.id, values);
    } else {
      addSleepEntry(values);
    }
    setShowForm(false);
    setEditing(null);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sleep</h1>
          <p className="page-subtitle">Log your bedtime and wake time each morning — the Dashboard tracks duration and consistency.</p>
        </div>
        <div className="header-actions">
          {!showForm && (
            <button className="btn btn-primary" onClick={openAdd}>
              + Add night
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <Panel title={editing ? "Edit night" : "New night"} style={{ marginBottom: 16 }}>
          <SleepForm
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
        title="Sleep log"
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
          <div className="empty-state">No nights in this range yet. Add last night above.</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Woke up</th>
                  <th>Bedtime</th>
                  <th>Wake time</th>
                  <th>Duration</th>
                  <th>Quality</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id}>
                    <td>{formatShortDate(s.date)}</td>
                    <td>{s.bedTime}</td>
                    <td>{s.wakeTime}</td>
                    <td>{sleepDuration(s.bedTime, s.wakeTime)} h</td>
                    <td>
                      <span className="meal-pill">{s.quality}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-ghost btn-danger" onClick={() => deleteSleepEntry(s.id)}>
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

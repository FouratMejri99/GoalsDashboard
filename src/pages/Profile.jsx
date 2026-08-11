import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useData } from "../context/DataContext.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { entries, workouts, sleepEntries } = useData();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [createdAt, setCreatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    supabase
      .from("profiles")
      .select("full_name, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted) return;
        setFullName(data?.full_name || "");
        setCreatedAt(data?.created_at || user.created_at);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { error: saveError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName.trim() });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
    } else {
      setSavedAt(Date.now());
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your account details for Goals Dashboard.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 480, marginBottom: 16 }}>
        <p className="panel-title">
          <span>Account</span>
        </p>
        <div className="form-grid" style={{ marginBottom: 6 }}>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Email</label>
            <input type="text" value={user?.email || ""} disabled />
          </div>
        </div>
        {!loading && createdAt && (
          <p className="tag" style={{ marginBottom: 0 }}>
            Member since {new Date(createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
      </div>

      <form className="panel" style={{ maxWidth: 480, marginBottom: 16 }} onSubmit={handleSave}>
        <p className="panel-title">
          <span>Display name</span>
        </p>
        {error && <p className="auth-error">{error}</p>}
        <div className="form-grid" style={{ marginBottom: 14 }}>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              placeholder="e.g. Alex Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <div className="card-row" style={{ alignItems: "center" }}>
          <button type="submit" className="btn btn-primary" disabled={loading || saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          {savedAt && <span className="tag">Saved ✓</span>}
        </div>
      </form>

      <div className="panel" style={{ maxWidth: 480, marginBottom: 16 }}>
        <p className="panel-title">
          <span>Your data</span>
        </p>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          {entries.length} meals · {workouts.length} exercise sets · {sleepEntries.length} nights of sleep logged in
          Supabase, visible only to you.
        </p>
      </div>

      <div className="card-row">
        <button type="button" className="btn btn-danger" onClick={handleSignOut}>
          Log out
        </button>
      </div>
    </>
  );
}

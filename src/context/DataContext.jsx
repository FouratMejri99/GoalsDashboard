import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "./AuthContext.jsx";
import { DEFAULT_SETTINGS } from "../lib/defaultSettings.js";
import {
  entryFromRow,
  entryToRow,
  settingsFromRow,
  settingsToRow,
  sleepFromRow,
  sleepToRow,
  workoutFromRow,
  workoutToRow,
} from "../lib/mappers.js";

const DataContext = createContext(null);

// Everything here is backed by Supabase (see supabase/schema.sql), scoped to
// the signed-in user via Row Level Security — there is no local/offline
// fallback and no seeded demo data. A signed-out user gets empty state.
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [entries, setEntries] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [sleepEntries, setSleepEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      setEntries([]);
      setWorkouts([]);
      setSleepEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [settingsRes, entriesRes, workoutsRes, sleepRes] = await Promise.all([
      supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("meal_entries").select("*").eq("user_id", user.id).order("date"),
      supabase.from("workouts").select("*").eq("user_id", user.id).order("date"),
      supabase.from("sleep_entries").select("*").eq("user_id", user.id).order("date"),
    ]);
    setSettings(settingsRes.data ? settingsFromRow(settingsRes.data) : DEFAULT_SETTINGS);
    setEntries((entriesRes.data || []).map(entryFromRow));
    setWorkouts((workoutsRes.data || []).map(workoutFromRow));
    setSleepEntries((sleepRes.data || []).map(sleepFromRow));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateSettings = useCallback(
    async (patch) => {
      if (!user) return;
      const next = { ...settings, ...patch };
      setSettings(next);
      const { error } = await supabase.from("settings").upsert(settingsToRow(next, user.id));
      if (error) console.error("Failed to save settings:", error.message);
    },
    [settings, user]
  );

  // --- meal entries --------------------------------------------------
  const addEntry = useCallback(
    async (entry) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("meal_entries")
        .insert(entryToRow(entry, user.id))
        .select()
        .single();
      if (error) return console.error("Failed to add entry:", error.message);
      setEntries((prev) => [...prev, entryFromRow(data)]);
    },
    [user]
  );

  const updateEntry = useCallback(
    async (id, patch) => {
      if (!user) return;
      const current = entries.find((e) => e.id === id);
      if (!current) return;
      const next = { ...current, ...patch };
      setEntries((prev) => prev.map((e) => (e.id === id ? next : e)));
      const { error } = await supabase.from("meal_entries").update(entryToRow(next, user.id)).eq("id", id);
      if (error) console.error("Failed to update entry:", error.message);
    },
    [entries, user]
  );

  const deleteEntry = useCallback(
    async (id) => {
      if (!user) return;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      const { error } = await supabase.from("meal_entries").delete().eq("id", id);
      if (error) console.error("Failed to delete entry:", error.message);
    },
    [user]
  );

  const clearAllEntries = useCallback(async () => {
    if (!user) return;
    setEntries([]);
    const { error } = await supabase.from("meal_entries").delete().eq("user_id", user.id);
    if (error) console.error("Failed to clear entries:", error.message);
  }, [user]);

  // --- workouts --------------------------------------------------------
  const addWorkout = useCallback(
    async (workout) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("workouts")
        .insert(workoutToRow(workout, user.id))
        .select()
        .single();
      if (error) return console.error("Failed to add workout:", error.message);
      setWorkouts((prev) => [...prev, workoutFromRow(data)]);
    },
    [user]
  );

  const updateWorkout = useCallback(
    async (id, patch) => {
      if (!user) return;
      const current = workouts.find((w) => w.id === id);
      if (!current) return;
      const next = { ...current, ...patch };
      setWorkouts((prev) => prev.map((w) => (w.id === id ? next : w)));
      const { error } = await supabase.from("workouts").update(workoutToRow(next, user.id)).eq("id", id);
      if (error) console.error("Failed to update workout:", error.message);
    },
    [workouts, user]
  );

  const deleteWorkout = useCallback(
    async (id) => {
      if (!user) return;
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) console.error("Failed to delete workout:", error.message);
    },
    [user]
  );

  const clearAllWorkouts = useCallback(async () => {
    if (!user) return;
    setWorkouts([]);
    const { error } = await supabase.from("workouts").delete().eq("user_id", user.id);
    if (error) console.error("Failed to clear workouts:", error.message);
  }, [user]);

  // --- sleep entries -----------------------------------------------------
  const addSleepEntry = useCallback(
    async (sleep) => {
      if (!user) return;
      const { data, error } = await supabase
        .from("sleep_entries")
        .insert(sleepToRow(sleep, user.id))
        .select()
        .single();
      if (error) return console.error("Failed to add sleep entry:", error.message);
      setSleepEntries((prev) => [...prev, sleepFromRow(data)]);
    },
    [user]
  );

  const updateSleepEntry = useCallback(
    async (id, patch) => {
      if (!user) return;
      const current = sleepEntries.find((s) => s.id === id);
      if (!current) return;
      const next = { ...current, ...patch };
      setSleepEntries((prev) => prev.map((s) => (s.id === id ? next : s)));
      const { error } = await supabase.from("sleep_entries").update(sleepToRow(next, user.id)).eq("id", id);
      if (error) console.error("Failed to update sleep entry:", error.message);
    },
    [sleepEntries, user]
  );

  const deleteSleepEntry = useCallback(
    async (id) => {
      if (!user) return;
      setSleepEntries((prev) => prev.filter((s) => s.id !== id));
      const { error } = await supabase.from("sleep_entries").delete().eq("id", id);
      if (error) console.error("Failed to delete sleep entry:", error.message);
    },
    [user]
  );

  const clearAllSleepEntries = useCallback(async () => {
    if (!user) return;
    setSleepEntries([]);
    const { error } = await supabase.from("sleep_entries").delete().eq("user_id", user.id);
    if (error) console.error("Failed to clear sleep entries:", error.message);
  }, [user]);

  const value = useMemo(
    () => ({
      loading,
      settings,
      updateSettings,
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      clearAllEntries,
      workouts,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      clearAllWorkouts,
      sleepEntries,
      addSleepEntry,
      updateSleepEntry,
      deleteSleepEntry,
      clearAllSleepEntries,
    }),
    [
      loading,
      settings,
      updateSettings,
      entries,
      addEntry,
      updateEntry,
      deleteEntry,
      clearAllEntries,
      workouts,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      clearAllWorkouts,
      sleepEntries,
      addSleepEntry,
      updateSleepEntry,
      deleteSleepEntry,
      clearAllSleepEntries,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "../lib/storage.js";
import { makeId } from "../lib/ids.js";
import {
  DEFAULT_SETTINGS,
  generateSampleEntries,
  generateSampleSleep,
  generateSampleWorkouts,
} from "../lib/sampleData.js";

const SETTINGS_KEY = "settings";
const ENTRIES_KEY = "entries";
const WORKOUTS_KEY = "workouts";
const SLEEP_KEY = "sleep";
const SEEDED_KEY = "seeded";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...loadJSON(SETTINGS_KEY, {}),
  }));
  const [entries, setEntries] = useState(() => {
    const stored = loadJSON(ENTRIES_KEY, null);
    if (stored) return stored;
    // First run on this browser: seed a couple of demo weeks so the
    // dashboard isn't a blank wall the very first time it's opened.
    return generateSampleEntries();
  });
  const [workouts, setWorkouts] = useState(() => {
    const stored = loadJSON(WORKOUTS_KEY, null);
    if (stored) return stored;
    return generateSampleWorkouts();
  });
  const [sleepEntries, setSleepEntries] = useState(() => {
    const stored = loadJSON(SLEEP_KEY, null);
    if (stored) return stored;
    return generateSampleSleep();
  });

  useEffect(() => {
    saveJSON(SETTINGS_KEY, settings);
  }, [settings]);

  useEffect(() => {
    saveJSON(ENTRIES_KEY, entries);
  }, [entries]);

  useEffect(() => {
    saveJSON(WORKOUTS_KEY, workouts);
  }, [workouts]);

  useEffect(() => {
    saveJSON(SLEEP_KEY, sleepEntries);
  }, [sleepEntries]);

  useEffect(() => {
    saveJSON(SEEDED_KEY, true);
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const addEntry = useCallback((entry) => {
    setEntries((prev) => [...prev, { ...entry, id: makeId() }]);
  }, []);

  const updateEntry = useCallback((id, patch) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAllEntries = useCallback(() => {
    setEntries([]);
  }, []);

  const addWorkout = useCallback((workout) => {
    setWorkouts((prev) => [...prev, { ...workout, id: makeId() }]);
  }, []);

  const updateWorkout = useCallback((id, patch) => {
    setWorkouts((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const deleteWorkout = useCallback((id) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const clearAllWorkouts = useCallback(() => {
    setWorkouts([]);
  }, []);

  const addSleepEntry = useCallback((sleep) => {
    setSleepEntries((prev) => [...prev, { ...sleep, id: makeId() }]);
  }, []);

  const updateSleepEntry = useCallback((id, patch) => {
    setSleepEntries((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteSleepEntry = useCallback((id) => {
    setSleepEntries((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAllSleepEntries = useCallback(() => {
    setSleepEntries([]);
  }, []);

  const loadSampleData = useCallback(() => {
    setEntries(generateSampleEntries());
    setWorkouts(generateSampleWorkouts());
    setSleepEntries(generateSampleSleep());
  }, []);

  const value = useMemo(
    () => ({
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
      loadSampleData,
    }),
    [
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
      loadSampleData,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}

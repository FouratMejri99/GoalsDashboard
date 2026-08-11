import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext.jsx";
import Panel from "../components/Panel.jsx";
import StatTile from "../components/StatTile.jsx";
import Meter from "../components/Meter.jsx";
import CalorieTrendChart from "../components/charts/CalorieTrendChart.jsx";
import MacroBarChart, { MACRO_LEGEND } from "../components/charts/MacroBarChart.jsx";
import WeightTrendChart from "../components/charts/WeightTrendChart.jsx";
import VolumeTrendChart from "../components/charts/VolumeTrendChart.jsx";
import DurationTrendChart from "../components/charts/DurationTrendChart.jsx";
import ExerciseProgressChart, { EXERCISE_PROGRESS_LEGEND } from "../components/charts/ExerciseProgressChart.jsx";
import SleepTrendChart from "../components/charts/SleepTrendChart.jsx";
import SleepTimingChart, { SLEEP_TIMING_LEGEND } from "../components/charts/SleepTimingChart.jsx";
import DailyTimingChart from "../components/charts/DailyTimingChart.jsx";
import {
  buildTrendSeries,
  currentStreak,
  dailyTotals,
  formatCompact,
  formatShortDate,
  latestWeight,
  todayStr,
  weightProgress,
} from "../lib/nutrition.js";
import {
  buildWorkoutTrendSeries,
  daysTrainedThisWeek,
  distinctExercises,
  exerciseProgress,
  minutesThisWeek,
  trainingStreak,
  volumeThisWeek,
} from "../lib/workouts.js";
import {
  averageSleep,
  bedtimeAxisHour,
  buildSleepTrendSeries,
  latestSleep,
  sleepDuration,
  sleepStreak,
} from "../lib/sleep.js";
import { timeToHour } from "../lib/time.js";
import { buildTimingSeries, TIMING_SERIES_DEF } from "../lib/timing.js";

export default function Dashboard() {
  const { settings, entries, workouts, sleepEntries } = useData();

  const today = dailyTotals(entries, todayStr());
  const trend14 = buildTrendSeries(entries, 14, settings);
  const trend30 = buildTrendSeries(entries, 30, settings);
  const streak = currentStreak(entries);
  const latestW = latestWeight(entries);
  const wProgress = weightProgress(settings.startWeightKg, settings.weightGoalKg, latestW);

  const calorieDelta = today.calories - (settings.calorieGoal || 0);
  const proteinDelta = today.protein - (settings.proteinGoal || 0);
  const calorieSpark = trend14.map((d) => d.calories);

  const workoutTrend14 = buildWorkoutTrendSeries(workouts, 14);
  const trainStreak = trainingStreak(workouts);
  const daysTrained = daysTrainedThisWeek(workouts);
  const minsThisWeek = minutesThisWeek(workouts);
  const volThisWeek = volumeThisWeek(workouts);
  const volumeSpark = workoutTrend14.map((d) => d.volumeKg);

  const exerciseList = useMemo(() => distinctExercises(workouts), [workouts]);
  const [selectedExercise, setSelectedExercise] = useState("");
  useEffect(() => {
    if (exerciseList.length && !exerciseList.includes(selectedExercise)) {
      setSelectedExercise(exerciseList[0]);
    }
  }, [exerciseList, selectedExercise]);
  const progressData = useMemo(
    () => (selectedExercise ? exerciseProgress(workouts, selectedExercise) : []),
    [workouts, selectedExercise]
  );

  const minutesDelta = minsThisWeek - (settings.weeklyMinutesGoal || 0);
  const daysTrainedDelta = daysTrained - (settings.workoutsPerWeekGoal || 0);

  const sleepTrend14 = buildSleepTrendSeries(sleepEntries, 14);
  const avgSleep14 = averageSleep(sleepEntries, 14);
  const lastNight = latestSleep(sleepEntries);
  const lastNightHours = lastNight ? sleepDuration(lastNight.bedTime, lastNight.wakeTime) : null;
  const sStreak = sleepStreak(sleepEntries);
  const sleepDelta = lastNightHours != null ? lastNightHours - (settings.sleepGoalHours || 0) : null;
  const targetBedHour = settings.targetBedtime ? bedtimeAxisHour(timeToHour(settings.targetBedtime)) : null;

  const timingData = useMemo(() => buildTimingSeries(entries, workouts, 14), [entries, workouts]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Goal: <strong>{settings.goalName || "No goal set"}</strong> ·{" "}
            <Link to="/settings">edit in Settings</Link>
          </p>
        </div>
      </div>

      <div className="dashboard-grid grid-stats" style={{ marginBottom: 14 }}>
        <StatTile
          label="Calories today"
          value={Math.round(today.calories)}
          unit="kcal"
          color="var(--series-1)"
          sparkline={calorieSpark}
          delta={{
            text:
              calorieDelta <= 0
                ? `${Math.abs(Math.round(calorieDelta))} kcal under goal`
                : `${Math.round(calorieDelta)} kcal over goal`,
            direction: calorieDelta <= 0 ? "good" : calorieDelta > 200 ? "bad" : "neutral",
          }}
        />
        <StatTile
          label="Protein today"
          value={Math.round(today.protein)}
          unit="g"
          color="var(--series-2)"
          delta={{
            text:
              proteinDelta >= 0
                ? `+${Math.round(proteinDelta)}g over target`
                : `${Math.round(proteinDelta)}g under target`,
            direction: proteinDelta >= 0 ? "good" : "bad",
          }}
        />
        <StatTile
          label="Logging streak"
          value={streak}
          unit={streak === 1 ? "day" : "days"}
          color="var(--series-3)"
          delta={{ text: "Consecutive days logged", direction: "neutral" }}
        />
        <StatTile
          label="Body weight"
          value={latestW != null ? latestW : "—"}
          unit={latestW != null ? "kg" : ""}
          color="var(--series-5)"
          delta={
            wProgress
              ? {
                  text: `${wProgress.remainingKg > 0 ? wProgress.remainingKg : Math.abs(wProgress.remainingKg)} kg to go · ${wProgress.percent}% there`,
                  direction: wProgress.percent >= 100 ? "good" : wProgress.percent >= 0 ? "neutral" : "bad",
                }
              : { text: "Log a weight to track progress", direction: "neutral" }
          }
        />
      </div>

      <div className="dashboard-grid grid-meters" style={{ marginBottom: 14 }}>
        <Panel title="Calories">
          <Meter label="Today" value={today.calories} goal={settings.calorieGoal} unit=" kcal" color="var(--series-1)" goalIsCeiling />
        </Panel>
        <Panel title="Protein">
          <Meter label="Today" value={today.protein} goal={settings.proteinGoal} unit="g" color="var(--series-2)" goalIsCeiling={false} />
        </Panel>
        <Panel title="Carbs">
          <Meter label="Today" value={today.carbs} goal={settings.carbsGoal} unit="g" color="var(--series-3)" goalIsCeiling />
        </Panel>
        <Panel title="Fat">
          <Meter label="Today" value={today.fat} goal={settings.fatGoal} unit="g" color="var(--series-4)" goalIsCeiling />
        </Panel>
      </div>

      <div className="dashboard-grid grid-2col" style={{ marginBottom: 14 }}>
        <Panel title="Calories — last 14 days">
          <CalorieTrendChart data={trend14} goal={settings.calorieGoal} />
        </Panel>
        <Panel title="Macros — last 14 days">
          <MacroBarChart data={trend14} />
          <div className="legend-row">
            {MACRO_LEGEND.map((l) => (
              <span className="legend-key" key={l.key}>
                <span className="legend-swatch" style={{ background: l.color }} />
                {l.key}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <div className="dashboard-grid grid-2col">
        <Panel title="Body weight — last 30 days">
          <WeightTrendChart data={trend30} goalWeightKg={settings.weightGoalKg} />
        </Panel>
        <Panel title="Weight goal">
          <div className="stat-tile-label">Starting weight</div>
          <div className="stat-tile-value" style={{ fontSize: 20 }}>
            {settings.startWeightKg ?? "—"} <span className="stat-tile-unit">kg</span>
          </div>
          <div className="tag" style={{ marginTop: 6, marginBottom: 14 }}>
            Target: {settings.weightGoalKg ?? "—"} kg
          </div>
          {wProgress && (
            <Meter
              label="Toward target"
              value={Math.max(wProgress.percent, 0)}
              goal={100}
              unit="%"
              color="var(--series-5)"
              goalIsCeiling={false}
            />
          )}
        </Panel>
      </div>

      <hr className="section-divider" />

      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: 17 }}>
            Training
          </h2>
          <p className="page-subtitle">
            From your <Link to="/workouts">Workouts</Link> log.
          </p>
        </div>
      </div>

      <div className="dashboard-grid grid-stats" style={{ marginBottom: 14 }}>
        <StatTile
          label="Trained this week"
          value={daysTrained}
          unit={`/ ${settings.workoutsPerWeekGoal || 0} days`}
          color="var(--series-3)"
          delta={{
            text: daysTrainedDelta >= 0 ? "Weekly goal met" : `${Math.abs(daysTrainedDelta)} day(s) to goal`,
            direction: daysTrainedDelta >= 0 ? "good" : "neutral",
          }}
        />
        <StatTile
          label="Training volume this week"
          value={formatCompact(volThisWeek)}
          unit="kg"
          color="var(--series-1)"
          sparkline={volumeSpark}
          delta={{ text: "Sets × reps × weight", direction: "neutral" }}
        />
        <StatTile
          label="Training streak"
          value={trainStreak}
          unit={trainStreak === 1 ? "day" : "days"}
          color="var(--series-2)"
          delta={{ text: "Consecutive days trained", direction: "neutral" }}
        />
        <StatTile
          label="Minutes this week"
          value={minsThisWeek}
          unit="min"
          color="var(--series-4)"
          delta={{
            text:
              minutesDelta >= 0
                ? `+${Math.round(minutesDelta)} min over goal`
                : `${Math.round(Math.abs(minutesDelta))} min under goal`,
            direction: minutesDelta >= 0 ? "good" : "neutral",
          }}
        />
      </div>

      <div className="dashboard-grid grid-2col" style={{ marginBottom: 14 }}>
        <Panel title="Training volume — last 14 days">
          <VolumeTrendChart data={workoutTrend14} />
        </Panel>
        <Panel title="Session duration — last 14 days">
          <DurationTrendChart data={workoutTrend14} weeklyGoalMin={settings.weeklyMinutesGoal} />
        </Panel>
      </div>

      <div className="dashboard-grid grid-full">
        <Panel
          title="Exercise progression"
          actions={
            exerciseList.length > 0 && (
              <select
                className="btn btn-sm"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {exerciseList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )
          }
        >
          <ExerciseProgressChart data={progressData} />
          {progressData.length > 0 && (
            <div className="legend-row">
              {EXERCISE_PROGRESS_LEGEND.map((l) => (
                <span className="legend-key" key={l.key}>
                  <span className="legend-swatch" style={{ background: l.color }} />
                  {l.key}
                </span>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <hr className="section-divider" />

      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: 17 }}>
            Sleep
          </h2>
          <p className="page-subtitle">
            From your <Link to="/sleep">Sleep</Link> log.
          </p>
        </div>
      </div>

      <div className="dashboard-grid grid-stats" style={{ marginBottom: 14 }}>
        <StatTile
          label="Last night"
          value={lastNightHours != null ? lastNightHours : "—"}
          unit={lastNightHours != null ? "h" : ""}
          color="var(--series-5)"
          delta={
            sleepDelta != null
              ? {
                  text: sleepDelta >= 0 ? `+${sleepDelta.toFixed(1)}h over goal` : `${Math.abs(sleepDelta).toFixed(1)}h under goal`,
                  direction: sleepDelta >= 0 ? "good" : "bad",
                }
              : { text: "Log last night's sleep", direction: "neutral" }
          }
        />
        <StatTile
          label="Avg sleep (14 days)"
          value={avgSleep14 != null ? avgSleep14 : "—"}
          unit={avgSleep14 != null ? "h" : ""}
          color="var(--series-4)"
          delta={{ text: `Goal: ${settings.sleepGoalHours || 0}h`, direction: "neutral" }}
        />
        <StatTile
          label="Sleep streak"
          value={sStreak}
          unit={sStreak === 1 ? "night" : "nights"}
          color="var(--series-3)"
          delta={{ text: "Consecutive nights logged", direction: "neutral" }}
        />
        <StatTile
          label="Last quality"
          value={lastNight ? lastNight.quality : "—"}
          unit=""
          color="var(--series-2)"
          delta={{ text: lastNight ? formatShortDate(lastNight.date) : "No nights logged yet", direction: "neutral" }}
        />
      </div>

      <div className="dashboard-grid grid-2col">
        <Panel title="Sleep duration — last 14 nights">
          <SleepTrendChart data={sleepTrend14} goalHours={settings.sleepGoalHours} />
        </Panel>
        <Panel title="Bedtime & wake time — last 14 nights">
          <SleepTimingChart data={sleepTrend14} targetBedtimeHour={targetBedHour} />
          <div className="legend-row">
            {SLEEP_TIMING_LEGEND.map((l) => (
              <span className="legend-key" key={l.key}>
                <span className="legend-swatch" style={{ background: l.color }} />
                {l.key}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <hr className="section-divider" />

      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="page-title" style={{ fontSize: 17 }}>
            Daily timing
          </h2>
          <p className="page-subtitle">
            When you eat and train, from your <Link to="/meals">Meals</Link> and <Link to="/workouts">Workouts</Link> logs.
          </p>
        </div>
      </div>

      <div className="dashboard-grid grid-full">
        <Panel title="Meal & workout timing — last 14 days">
          <DailyTimingChart dayList={timingData.dayList} series={timingData.series} />
          <div className="legend-row">
            {TIMING_SERIES_DEF.map((l) => (
              <span className="legend-key" key={l.key}>
                <span className="legend-swatch" style={{ background: l.color }} />
                {l.key}
              </span>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

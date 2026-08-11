import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import MealsLog from "./pages/MealsLog.jsx";
import Workouts from "./pages/Workouts.jsx";
import Sleep from "./pages/Sleep.jsx";
import Settings from "./pages/Settings.jsx";
import { loadJSON, saveJSON } from "./lib/storage.js";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "▦", end: true },
  { to: "/meals", label: "Meals", icon: "☰" },
  { to: "/workouts", label: "Workouts", icon: "🏋" },
  { to: "/sleep", label: "Sleep", icon: "☾" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export default function App() {
  const [theme, setTheme] = useState(() => loadJSON("theme", "dark"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveJSON("theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Goals Dashboard</span>
        </div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "☾ Dark mode" : "☀ Light mode"}
          </button>
        </div>
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meals" element={<MealsLog />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/sleep" element={<Sleep />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

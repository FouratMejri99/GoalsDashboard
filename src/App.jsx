import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import MealsLog from "./pages/MealsLog.jsx";
import Workouts from "./pages/Workouts.jsx";
import Sleep from "./pages/Sleep.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { loadJSON, saveJSON } from "./lib/storage.js";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "▦", end: true },
  { to: "/meals", label: "Meals", icon: "☰" },
  { to: "/workouts", label: "Workouts", icon: "🏋" },
  { to: "/sleep", label: "Sleep", icon: "☾" },
  { to: "/settings", label: "Settings", icon: "⚙" },
  { to: "/profile", label: "Profile", icon: "☺" },
];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// The authenticated app shell: sidebar nav + the actual pages. Split out from
// App() so /login and /signup never render the sidebar.
function AppShell() {
  const [theme, setTheme] = useState(() => loadJSON("theme", "dark"));
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveJSON("theme", theme);
  }, [theme]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

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
          {user && <div className="sidebar-user" title={user.email}>{user.email}</div>}
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? "☾ Dark mode" : "☀ Light mode"}
          </button>
          <button className="theme-toggle" onClick={handleSignOut} style={{ marginTop: 6 }}>
            ⎋ Log out
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
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

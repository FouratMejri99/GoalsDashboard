import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (session) {
    return <Navigate to={location.state?.from || "/"} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand auth-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Goals Dashboard</span>
        </div>
        <h1 className="auth-title">Log in</h1>
        <p className="auth-subtitle">Welcome back — pick up your goal where you left it.</p>

        {error && <p className="auth-error">{error}</p>}

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>

        <p className="auth-switch">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}

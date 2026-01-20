import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/auth";

const Login = () => {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setUser(null);

    if (!formState.email || !formState.password) {
      setStatus("error");
      setMessage("Email and password are required.");
      return;
    }

    setStatus("loading");

    try {
      const data = await loginUser({
        email: formState.email,
        password: formState.password,
      });
      setUser(data);
      setMessage(data.message || "Login successful.");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="container auth-grid">
        <div className="auth-intro">
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to keep planning together.</h1>
          <p className="lead">
            Access your shared itineraries, budgets, and group updates in one place.
          </p>
          <ul className="auth-list">
            <li>Pick up exactly where your group left off.</li>
            <li>See real-time updates and booking statuses.</li>
            <li>Stay aligned with automated reminders.</li>
          </ul>
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>Log in</h2>
            <p className="muted">Use the email you registered with.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@team.com"
                autoComplete="email"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={formState.password}
                onChange={handleChange}
                required
              />
            </div>
            {message && (
              <div
                className={`message ${status === "error" ? "error" : "success"}`}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </div>
            )}
            <button className="btn primary full" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Signing in..." : "Log in"}
            </button>
          </form>
          {user && (
            <div className="auth-meta">
              <p>
                Signed in as <strong>{user.email}</strong>
              </p>
            </div>
          )}
          <p className="auth-footer">
            New to Waypoint? <Link to="/register">Create an account</Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;

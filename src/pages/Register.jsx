import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/auth";

const Register = () => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    if (formState.password !== formState.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");

    try {
      const data = await registerUser({
        email: formState.email,
        password: formState.password,
      });
      setUser(data);
      setMessage("Account created. You can now log in.");
      setStatus("success");
      setFormState((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="container auth-grid">
        <div className="auth-intro">
          <p className="eyebrow">Start planning</p>
          <h1>Create your Waypoint account.</h1>
          <p className="lead">
            Set up your trip hub, invite travelers, and keep every plan in sync.
          </p>
          <ul className="auth-list">
            <li>Organize itineraries, budgets, and checklists.</li>
            <li>Keep every traveler aligned with real-time updates.</li>
            <li>Move from idea to booked in one workspace.</li>
          </ul>
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create account</h2>
            <p className="muted">Use your work email to get started.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
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
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                value={formState.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-confirm-password">Confirm password</label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                value={formState.confirmPassword}
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
              {status === "loading" ? "Creating account..." : "Create account"}
            </button>
          </form>
          {user && (
            <div className="auth-meta">
              <p>
                Account created for <strong>{user.email}</strong>
              </p>
              {user.createdAt && (
                <p className="muted">
                  Created at {new Date(user.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in</Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginUser, setStoredUser } from "../services/auth";
import { fetchProfile, saveProfile } from "../services/profile";

const Login = () => {
  const { t, i18n } = useTranslation();
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
      setMessage(t("auth.messages.required"));
      return;
    }

    setStatus("loading");

    try {
      const data = await loginUser({
        email: formState.email,
        password: formState.password,
      });
      setUser(data);
      setStoredUser(data);
      setMessage(t("auth.messages.loginSuccess"));
      setStatus("success");
      try {
        const profile = await fetchProfile(data.id);
        saveProfile(profile);
        if (profile.language) {
          i18n.changeLanguage(profile.language);
        }
      } catch (error) {
        // Ignore profile failures for login.
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="container auth-grid">
        <div className="auth-intro">
          <p className="eyebrow">{t("auth.login.eyebrow")}</p>
          <h1>{t("auth.login.title")}</h1>
          <p className="lead">{t("auth.login.subtitle")}</p>
          <ul className="auth-list">
            {t("auth.login.list", { returnObjects: true }).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t("auth.login.formTitle")}</h2>
            <p className="muted">{t("auth.login.formSubtitle")}</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">{t("auth.login.emailLabel")}</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder={t("profile.placeholders.email")}
                autoComplete="email"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">{t("auth.login.passwordLabel")}</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder={t("auth.login.passwordLabel")}
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
              {status === "loading" ? t("auth.login.loading") : t("auth.login.button")}
            </button>
          </form>
          {user && (
            <div className="auth-meta">
              <p>{t("auth.login.signedInAs", { email: user.email })}</p>
              <Link className="btn ghost full" to="/profile">
                {t("auth.login.profileCta")}
              </Link>
            </div>
          )}
          <p className="auth-footer">
            {t("auth.login.footer")} <Link to="/register">{t("auth.login.footerLink")}</Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerUser, setStoredUser } from "../services/auth";
import { fetchProfile, saveProfile } from "../services/profile";

const Register = () => {
  const { t, i18n } = useTranslation();
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
      setMessage(t("auth.messages.required"));
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setStatus("error");
      setMessage(t("auth.messages.passwordMismatch"));
      return;
    }

    setStatus("loading");

    try {
      const data = await registerUser({
        email: formState.email,
        password: formState.password,
      });
      setUser(data);
      setStoredUser(data);
      setMessage(t("auth.messages.profileHint"));
      setStatus("success");
      setFormState((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      try {
        const profile = await fetchProfile(data.id);
        saveProfile(profile);
        if (profile.language) {
          i18n.changeLanguage(profile.language);
        }
      } catch (error) {
        // Ignore profile fetch failures after registration.
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
          <p className="eyebrow">{t("auth.register.eyebrow")}</p>
          <h1>{t("auth.register.title")}</h1>
          <p className="lead">{t("auth.register.subtitle")}</p>
          <ul className="auth-list">
            {t("auth.register.list", { returnObjects: true }).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t("auth.register.formTitle")}</h2>
            <p className="muted">{t("auth.register.formSubtitle")}</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="register-email">{t("auth.register.emailLabel")}</label>
              <input
                id="register-email"
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
              <label htmlFor="register-password">{t("auth.register.passwordLabel")}</label>
              <input
                id="register-password"
                name="password"
                type="password"
                placeholder={t("auth.register.passwordLabel")}
                autoComplete="new-password"
                value={formState.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-confirm-password">
                {t("auth.register.confirmLabel")}
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder={t("auth.register.confirmLabel")}
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
              {status === "loading" ? t("auth.register.loading") : t("auth.register.button")}
            </button>
          </form>
          {user && (
            <div className="auth-meta">
              <p>{t("auth.messages.profileHint")}</p>
              <Link className="btn ghost full" to="/profile">
                {t("auth.register.profileCta")}
              </Link>
            </div>
          )}
          <p className="auth-footer">
            {t("auth.register.footer")} <Link to="/login">{t("auth.register.footerLink")}</Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStoredUser, registerUser, setStoredUser } from "../services/auth";
import { fetchProfile, saveProfile } from "../services/profile";

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
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
      navigate("/profile", { replace: true });
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <main className="auth-page">
      <section className="container auth-centered">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t("auth.register.title")}</h2>
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
          <p className="auth-footer">
            {t("auth.register.footer")} <Link to="/login">{t("auth.register.footerLink")}</Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;

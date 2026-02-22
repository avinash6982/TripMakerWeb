import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStoredUser, loginUser, setStoredUser } from "../services/auth";
import { fetchProfile, saveProfile } from "../services/profile";

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate("/home", { replace: true });
      return;
    }
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      setMessage(t("auth.messages.sessionExpired"));
      setStatus("error");
      setSearchParams({}, { replace: true });
    }
  }, [navigate, searchParams, setSearchParams, t]);

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

    setStatus("loading");

    try {
      const data = await loginUser({
        email: formState.email,
        password: formState.password,
      });
      setStoredUser(data);
      try {
        const profile = await fetchProfile(data.id);
        saveProfile(profile);
        if (profile.language) {
          i18n.changeLanguage(profile.language);
        }
      } catch (error) {
        // Ignore profile failures for login.
      }
      navigate("/home", { replace: true, state: { welcomeBack: true } });
    } catch (error) {
      setStatus("error");
      const msg = error?.message || "";
      setMessage(
        /incorrect|invalid|credentials|wrong password/i.test(msg)
          ? t("auth.messages.invalidCredentials")
          : msg
      );
    }
  };

  return (
    <main className="auth-page">
      <section className="container auth-centered">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{t("auth.login.title")}</h2>
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
                aria-live={status === "error" ? "assertive" : "polite"}
              >
                {message}
              </div>
            )}
            <button
              className="btn primary full"
              type="submit"
              disabled={status === "loading"}
              aria-busy={status === "loading"}
            >
              {status === "loading" ? t("auth.login.loading") : t("auth.login.button")}
            </button>
          </form>
          <p className="auth-footer">
            {t("auth.login.footer")} <Link to="/register">{t("auth.login.footerLink")}</Link>.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;

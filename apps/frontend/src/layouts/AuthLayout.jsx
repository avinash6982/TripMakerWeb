import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getStoredUser } from "../services/auth";

const languageOptions = [
  { code: "en", labelKey: "languages.en" },
  { code: "hi", labelKey: "languages.hi" },
  { code: "ml", labelKey: "languages.ml" },
  { code: "ar", labelKey: "languages.ar" },
  { code: "es", labelKey: "languages.es" },
  { code: "de", labelKey: "languages.de" },
];

const LogoIcon = () => (
  <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

const TabIconFeed = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

/**
 * Minimal app bar when logged out: Discover (home), Log in, Register.
 * No Home / My Trips / Profile — those appear only when logged in (SiteLayout).
 */
const AuthLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="auth-shell">
      <header className="auth-header auth-header-full">
        <div className="container nav">
          <Link className="logo" to="/feed">
            <LogoIcon />
            {t("appName")}
          </Link>
          <nav className="nav-links auth-nav-links" aria-label="Primary">
            <NavLink
              to="/feed"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <span className="nav-link-icon"><TabIconFeed /></span>
              {t("nav.feed")}
            </NavLink>
          </nav>
          <div className="nav-actions">
            <label className="language-select">
              <span className="language-select-label">
                <svg className="language-select-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden width="18" height="18" />
                {t("labels.language")}
              </span>
              <select value={i18n.language} onChange={handleLanguageChange}>
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            <Link className="btn ghost btn-sm" to="/login">
              {t("auth.login.button")}
            </Link>
            <Link className="btn secondary" to="/register">
              {t("auth.register.button")}
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default AuthLayout;

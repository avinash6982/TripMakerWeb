import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getStoredUser } from "../services/auth";
import LanguageSwitch from "../components/LanguageSwitch";

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
  const { pathname } = useLocation();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

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
            <LanguageSwitch />
            {!isLoginPage && (
              <Link className="btn ghost btn-sm auth-header-login" to="/login" aria-label={t("auth.login.button")} title={t("auth.login.button")}>
                <span className="auth-header-btn-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
                <span className="auth-header-btn-text">{t("auth.login.button")}</span>
              </Link>
            )}
            {!isRegisterPage && (
              <Link className="btn secondary auth-header-register" to="/register" aria-label={t("auth.register.button")} title={t("auth.register.button")}>
              <span className="auth-header-btn-icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </span>
              <span className="auth-header-btn-text">{t("auth.register.button")}</span>
            </Link>
            )}
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default AuthLayout;

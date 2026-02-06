import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearStoredUser, getStoredUser } from "../services/auth";
import { clearStoredProfile } from "../services/profile";
import LanguageSwitch from "../components/LanguageSwitch";

/* Paper plane logo icon (teal, matches prototype) */
const LogoIcon = () => (
  <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

/* Inline SVG icons for header nav and bottom tab bar (no extra dependency) */
const TabIconHome = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const TabIconTrips = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const TabIconFeed = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const TabIconProfile = () => (
  <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navConfig = (t) => [
  { to: "/home", label: t("nav.home"), icon: TabIconHome },
  { to: "/trips", label: t("nav.trips"), icon: TabIconTrips, end: true }, /* end: true so trip detail (/trips/:id) doesn't highlight My Trips */
  { to: "/feed", label: t("nav.feed"), icon: TabIconFeed },
  { to: "/profile", label: t("nav.profile"), icon: TabIconProfile },
];

const SiteLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getStoredUser());
  const navLinks = navConfig(t);

  /* Discover is active when on /feed or when on trip detail opened from Discover */
  const isDiscoverActive = (link) => {
    if (link.to !== "/feed") return null;
    const onTripDetail = /^\/trips\/[^/]+$/.test(location.pathname);
    const fromFeed = location.state?.from === "feed";
    return onTripDetail && fromFeed;
  };

  /* Trip detail/gallery: use split layout, no page scroll (only main content scrolls) */
  const isTripSplitLayout = /^\/trips\/[^/]+(\/gallery)?$/.test(location.pathname);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("authchange", handleAuthChange);
    return () => window.removeEventListener("authchange", handleAuthChange);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    clearStoredProfile();
    navigate("/");
  };

  return (
    <div className={`app${isTripSplitLayout ? " app--trip-split" : ""}`}>
      <header className="site-header">
        <div className="container nav">
          <Link className="logo" to="/home">
            <LogoIcon />
            {t("appName")}
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const discoverActive = isDiscoverActive(link);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end ?? false}
                  className={({ isActive }) => (isActive || discoverActive ? "nav-link active" : "nav-link")}
                >
                  <span className="nav-link-icon"><Icon /></span>
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="nav-actions">
            <LanguageSwitch />
            {user && (
              <button
                className="btn secondary nav-logout-btn"
                type="button"
                onClick={handleLogout}
                aria-label={t("actions.logout")}
                title={t("actions.logout")}
              >
                <span className="nav-logout-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span className="nav-logout-text">{t("actions.logout")}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-content">
        <Outlet />
      </div>
      <nav className="mobile-nav" aria-label="Primary navigation">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const discoverActive = isDiscoverActive(link);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end ?? false}
              className={({ isActive }) =>
                isActive || discoverActive ? "mobile-nav-link active" : "mobile-nav-link"
              }
            >
              <Icon />
              <span className="mobile-nav-label">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default SiteLayout;

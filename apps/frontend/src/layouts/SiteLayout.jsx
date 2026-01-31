import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clearStoredUser, getStoredUser } from "../services/auth";
import { clearStoredProfile } from "../services/profile";

const languageOptions = [
  { code: "en", labelKey: "languages.en" },
  { code: "hi", labelKey: "languages.hi" },
  { code: "ml", labelKey: "languages.ml" },
  { code: "ar", labelKey: "languages.ar" },
  { code: "es", labelKey: "languages.es" },
  { code: "de", labelKey: "languages.de" },
];

const SiteLayout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("authchange", handleAuthChange);
    return () => window.removeEventListener("authchange", handleAuthChange);
  }, []);

  const navLinks = [
    { to: "/home", label: t("nav.home") },
    { to: "/trips", label: t("nav.trips") },
    { to: "/profile", label: t("nav.profile") },
  ];

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleLogout = () => {
    clearStoredUser();
    clearStoredProfile();
    navigate("/");
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="container nav">
          <Link className="logo" to="/">
            {t("appName")}
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <label className="language-select">
              <span className="sr-only">{t("labels.language")}</span>
              <select value={i18n.language} onChange={handleLanguageChange}>
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
            {user && (
              <button className="text-link" type="button" onClick={handleLogout}>
                {t("actions.logout")}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="app-content">
        <Outlet />
      </div>
      <nav className="mobile-nav" aria-label="Mobile">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "mobile-nav-link active" : "mobile-nav-link"
            }
          >
            <span className="mobile-nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default SiteLayout;

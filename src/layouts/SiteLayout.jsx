import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
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
    { href: "/#features", label: t("nav.features") },
    { href: "/#how", label: t("nav.how") },
    { href: "/#pricing", label: t("nav.pricing") },
    { href: "/#stories", label: t("nav.stories") },
  ];

  const footerColumns = [
    {
      title: t("footer.product"),
      links: [
        { href: "/#features", label: t("footer.links.features") },
        { href: "/#pricing", label: t("footer.links.pricing") },
        { href: "/#demo", label: t("footer.links.demo") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "#", label: t("footer.links.about") },
        { href: "#", label: t("footer.links.careers") },
        { href: "#", label: t("footer.links.contact") },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { href: "#", label: t("footer.links.support") },
        { href: "#", label: t("footer.links.guides") },
        { href: "#", label: t("footer.links.privacy") },
      ],
    },
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
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
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
            {user ? (
              <>
                <Link className="text-link" to="/profile">
                  {t("nav.profile")}
                </Link>
                <button className="text-link" type="button" onClick={handleLogout}>
                  {t("actions.logout")}
                </button>
              </>
            ) : (
              <>
                <Link className="text-link" to="/login">
                  {t("actions.login")}
                </Link>
                <Link className="btn small" to="/register">
                  {t("actions.startPlanning")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="logo">{t("appName")}</div>
            <p>{t("footer.blurb")}</p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="container footer-bottom">
          <p>{t("footer.bottom.copyright")}</p>
          <div className="footer-links">
            <a href="#">{t("footer.bottom.terms")}</a>
            <a href="#">{t("footer.bottom.privacy")}</a>
            <a href="#">{t("footer.bottom.security")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SiteLayout;

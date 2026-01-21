import { Link, Outlet, useNavigate } from "react-router-dom";
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
      <header className="auth-header">
        <div className="container auth-nav">
          <Link className="logo" to="/">
            {t("appName")}
          </Link>
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
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default AuthLayout;

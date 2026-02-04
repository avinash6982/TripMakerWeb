import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const languageOptions = [
  { code: "en", labelKey: "languages.en" },
  { code: "hi", labelKey: "languages.hi" },
  { code: "ml", labelKey: "languages.ml" },
  { code: "ar", labelKey: "languages.ar" },
  { code: "es", labelKey: "languages.es" },
  { code: "de", labelKey: "languages.de" },
];

/**
 * Single globe icon button that opens a dropdown menu to pick language.
 * Used in both SiteLayout and AuthLayout headers.
 */
const LanguageSwitch = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="language-switch" ref={ref}>
      <button
        type="button"
        className="btn ghost btn-sm language-switch-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("labels.language")}
        title={t("labels.language")}
      >
        <svg className="language-switch-globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </button>
      {open && (
        <div className="language-switch-dropdown" role="menu">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              role="menuitem"
              className={`language-switch-item ${i18n.language === option.code ? "language-switch-item-active" : ""}`}
              onClick={() => handleSelect(option.code)}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitch;

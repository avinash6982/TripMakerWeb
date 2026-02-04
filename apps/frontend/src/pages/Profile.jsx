import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStoredUser } from "../services/auth";
import {
  fetchProfile,
  getStoredProfile,
  saveProfile,
  updateProfile,
} from "../services/profile";

const currencyOptions = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

const countryOptions = [
  "United States",
  "India",
  "United Kingdom",
  "United Arab Emirates",
  "Spain",
  "Germany",
  "Canada",
  "Australia",
];

const languageOptions = [
  { code: "en", labelKey: "languages.en" },
  { code: "hi", labelKey: "languages.hi" },
  { code: "ml", labelKey: "languages.ml" },
  { code: "ar", labelKey: "languages.ar" },
  { code: "es", labelKey: "languages.es" },
  { code: "de", labelKey: "languages.de" },
];

const Profile = () => {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(() => getStoredUser());
  const [formState, setFormState] = useState({
    email: "",
    phone: "",
    country: "",
    language: "en",
    currencyType: "USD",
    interests: "",
    preferredDestinations: "",
    storageUsed: 0,
    limitBytes: 100 * 1024 * 1024,
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedProfile = getStoredProfile();
    if (storedProfile && storedProfile.id === user?.id) {
      setFormState({
        email: storedProfile.email || user.email,
        phone: storedProfile.phone || "",
        country: storedProfile.country || "",
        language: storedProfile.language || i18n.language,
        currencyType: storedProfile.currencyType || "USD",
        interests: Array.isArray(storedProfile.interests) ? storedProfile.interests.join(", ") : (storedProfile.interests || ""),
        preferredDestinations: Array.isArray(storedProfile.preferredDestinations) ? storedProfile.preferredDestinations.join(", ") : (storedProfile.preferredDestinations || ""),
        storageUsed: typeof storedProfile.storageUsed === "number" ? storedProfile.storageUsed : 0,
        limitBytes: typeof storedProfile.limitBytes === "number" ? storedProfile.limitBytes : 100 * 1024 * 1024,
      });
    }
  }, [i18n.language, user]);

  // Fetch profile only when user id changes (not on every re-render; i18n/t change often)
  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      return;
    }
    setStatus("loading");
    setMessage("");

    fetchProfile(userId)
      .then((profile) => {
        saveProfile(profile);
        setFormState({
          email: profile.email || user?.email || "",
          phone: profile.phone || "",
          country: profile.country || "",
          language: profile.language || i18n.language,
          currencyType: profile.currencyType || "USD",
          interests: Array.isArray(profile.interests) ? profile.interests.join(", ") : (profile.interests || ""),
          preferredDestinations: Array.isArray(profile.preferredDestinations) ? profile.preferredDestinations.join(", ") : (profile.preferredDestinations || ""),
          storageUsed: typeof profile.storageUsed === "number" ? profile.storageUsed : 0,
          limitBytes: typeof profile.limitBytes === "number" ? profile.limitBytes : 100 * 1024 * 1024,
        });
        if (profile.language) {
          i18n.changeLanguage(profile.language);
        }
        setStatus("ready");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message || t("profile.status.loadError"));
      });
  }, [userId]);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };
    window.addEventListener("authchange", handleAuthChange);
    return () => window.removeEventListener("authchange", handleAuthChange);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    setStatus("saving");
    setMessage("");

    try {
      const payload = {
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        country: formState.country.trim(),
        language: formState.language,
        currencyType: formState.currencyType,
        interests: formState.interests.trim() ? formState.interests.split(",").map((s) => s.trim()).filter(Boolean) : [],
        preferredDestinations: formState.preferredDestinations.trim() ? formState.preferredDestinations.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      const profile = await updateProfile(user.id, payload);
      saveProfile(profile);
      if (profile.language) {
        i18n.changeLanguage(profile.language);
      }
      setStatus("success");
      setMessage(t("profile.status.saved"));
    } catch (error) {
      setStatus("error");
      setMessage(error.message || t("profile.status.saveError"));
    }
  };

  const greeting = useMemo(() => {
    if (!user) {
      return null;
    }
    return user.email;
  }, [user]);

  if (!user) {
    return (
      <main className="profile-page">
        <section className="container profile-empty">
          <h1>{t("profile.empty.title")}</h1>
          <p>{t("profile.empty.copy")}</p>
          <Link className="btn primary" to="/login">
            {t("profile.empty.button")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="container">
        <header className="page-header">
          <Link to="/home" className="page-header-back" aria-label={t("nav.home")} title={t("nav.home")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="page-header-title">{t("profile.title")}</h1>
          <div className="page-header-actions">
            <button type="submit" form="profile-form" className="btn primary btn-sm" disabled={status === "saving"}>
              {status === "saving" ? t("profile.actions.saving") : t("profile.actions.save")}
            </button>
          </div>
        </header>
        <div className="profile-grid">
        <div className="profile-intro">
          <p className="lead">{t("profile.subtitle")}</p>
          <div className="profile-card">
            <h3>{t("profile.intro")}</h3>
            <p className="muted">{greeting}</p>
            <div className="profile-meta">
              <div>
                <span>{t("profile.form.currency")}</span>
                <strong>{formState.currencyType}</strong>
              </div>
              <div>
                <span>{t("profile.form.language")}</span>
                <strong>{t(`languages.${formState.language}`)}</strong>
              </div>
              {typeof formState.storageUsed === "number" && (
                <div>
                  <span>{t("profile.form.storage", "Storage")}</span>
                  <strong>
                    {t("profile.storage.used", "{{used}} MB / {{limit}} MB", {
                      used: (formState.storageUsed / (1024 * 1024)).toFixed(1),
                      limit: formState.limitBytes != null ? Math.round(formState.limitBytes / (1024 * 1024)) : 100,
                    })}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="profile-form-card">
          <form id="profile-form" className="profile-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="profile-email">{t("profile.form.email")}</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={formState.email}
                placeholder={t("profile.placeholders.email")}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="profile-phone">{t("profile.form.phone")}</label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={formState.phone}
                placeholder={t("profile.placeholders.phone")}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-country">{t("profile.form.country")}</label>
              <select
                id="profile-country"
                name="country"
                value={formState.country}
                onChange={handleChange}
              >
                <option value="">{t("profile.placeholders.country")}</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profile-language">{t("profile.form.language")}</label>
              <select
                id="profile-language"
                name="language"
                value={formState.language}
                onChange={handleChange}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profile-currency">{t("profile.form.currency")}</label>
              <select
                id="profile-currency"
                name="currencyType"
                value={formState.currencyType}
                onChange={handleChange}
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profile-interests">{t("profile.form.interests")}</label>
              <input
                id="profile-interests"
                name="interests"
                type="text"
                value={formState.interests}
                placeholder={t("profile.placeholders.interests")}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-preferredDestinations">{t("profile.form.preferredDestinations")}</label>
              <input
                id="profile-preferredDestinations"
                name="preferredDestinations"
                type="text"
                value={formState.preferredDestinations}
                placeholder={t("profile.placeholders.preferredDestinations")}
                onChange={handleChange}
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
            {status === "loading" && (
              <span className="muted">{t("labels.loading")}</span>
            )}
          </form>
        </div>
        </div>
      </section>
    </main>
  );
};

export default Profile;

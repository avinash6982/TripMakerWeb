import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchTrips, redeemInvite, getApiBaseUrl } from "../services/trips";

const Trips = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [tripsMenuOpen, setTripsMenuOpen] = useState(false);
  const tripsMenuRef = useRef(null);

  useEffect(() => {
    if (!tripsMenuOpen) return;
    const handleClickOutside = (e) => {
      if (tripsMenuRef.current && !tripsMenuRef.current.contains(e.target)) {
        setTripsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [tripsMenuOpen]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTrips();
        if (!cancelled) setTrips(data?.trips || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load trips.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRedeem = async (e) => {
    e?.preventDefault();
    const code = redeemCode.trim().toUpperCase();
    if (!code) {
      setRedeemError("Please enter the invite code.");
      return;
    }
    setRedeemLoading(true);
    setRedeemError("");
    try {
      const data = await redeemInvite(code);
      setShowRedeemModal(false);
      setRedeemCode("");
      const refresh = await fetchTrips();
      setTrips(refresh?.trips || []);
      if (data?.trip?.id) {
        navigate(`/trips/${data.trip.id}`);
      }
    } catch (err) {
      setRedeemError(err?.message || "Invalid or expired code.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const displayedTrips = showArchived
    ? trips
    : trips.filter((trip) => trip.status !== "archived");

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const tripCardGradient = (str) => {
    let n = 0;
    for (let i = 0; i < (str || "").length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
    const gradients = [
      "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
      "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
      "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      "linear-gradient(135deg, #ea580c 0%, #fb923c 100%)",
      "linear-gradient(135deg, #059669 0%, #34d399 100%)",
    ];
    return gradients[n % gradients.length];
  };

  const mediaUrl = (key) => `${getApiBaseUrl()}/media/${encodeURIComponent(key)}`;

  return (
    <main className="trips-page">
      <section className="container">
        <header className="page-header">
          <Link to="/home" className="page-header-back" aria-label={t("nav.home")} title={t("nav.home")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="page-header-title">{t("trips.title")}</h1>
          <div className="page-header-actions trips-header-actions" ref={tripsMenuRef}>
            <div className="trips-header-actions-secondary">
              <button type="button" className="btn ghost btn-sm trips-header-redeem-desktop" onClick={() => setShowRedeemModal(true)}>
                {t("trips.redeemCode")}
              </button>
              <button
                type="button"
                className="btn ghost btn-sm trips-header-archived-btn"
                onClick={() => setShowArchived(!showArchived)}
                aria-pressed={showArchived}
                aria-label={showArchived ? t("trips.hideArchived") : t("trips.showArchived")}
                title={showArchived ? t("trips.hideArchived") : t("trips.showArchived")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 8v13H3V8" />
                  <path d="M1 3h22v5H1z" />
                  <path d="M10 12h4" />
                </svg>
              </button>
            </div>
            <div className="trips-header-actions-menu-wrap">
              <button
                type="button"
                className="btn ghost btn-sm trips-header-menu-btn"
                onClick={(e) => { e.stopPropagation(); setTripsMenuOpen((o) => !o); }}
                aria-expanded={tripsMenuOpen}
                aria-haspopup="true"
                aria-label={t("trips.moreActions", "More actions")}
                title={t("trips.moreActions", "More actions")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                </svg>
              </button>
              {tripsMenuOpen && (
                <div className="trips-header-dropdown" role="menu">
                  <button type="button" className="trips-header-dropdown-item" role="menuitem" onClick={() => { setShowRedeemModal(true); setTripsMenuOpen(false); }}>
                    {t("trips.redeemCode")}
                  </button>
                  <button type="button" className="trips-header-dropdown-item" role="menuitem" onClick={() => { setShowArchived(!showArchived); setTripsMenuOpen(false); }}>
                    {showArchived ? t("trips.hideArchived") : t("trips.showArchived")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="trips-redeem-mobile">
          <button type="button" className="btn ghost btn-sm" onClick={() => setShowRedeemModal(true)}>
            {t("trips.redeemCode")}
          </button>
        </div>

        {loading && <p className="muted">{t("labels.loading")}</p>}
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && displayedTrips.length === 0 && (
          <div className="trips-empty">
            <p className="muted">{t("trips.empty")}</p>
            <p className="trips-empty-hint muted">{t("trips.emptyHint", "Plan and save a trip from Home.")}</p>
          </div>
        )}

        {!loading && !error && displayedTrips.length > 0 && (
          <ul className="trips-list">
            {displayedTrips.map((trip) => (
              <li key={trip.id} className="trip-card">
                <div className="trip-card-hero">
                  {trip.thumbnailKey ? (
                    <img src={mediaUrl(trip.thumbnailKey)} alt="" className="trip-card-hero-img" />
                  ) : (
                    <div className="trip-card-hero-placeholder" style={{ background: tripCardGradient(trip.destination || trip.name) }} aria-hidden />
                  )}
                </div>
                <div className="trip-card-main">
                  <h3 className="trip-card-name">{trip.name}</h3>
                  <p className="trip-card-destination muted">{trip.destination}</p>
                  <div className="trip-card-meta">
                    <span>{t("trips.days", { count: trip.days })}</span>
                    <span className="trip-status-badge" data-status={trip.status || "upcoming"}>
                      {t(`trips.status.${trip.status || "upcoming"}`)}
                    </span>
                    {trip.createdAt && (
                      <span className="muted">{formatDate(trip.createdAt)}</span>
                    )}
                  </div>
                </div>
                <div className="trip-card-actions">
                  <Link className="btn small primary" to={`/trips/${trip.id}`}>
                    {t("trips.view")}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showRedeemModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t("trips.redeemTitle")}</h2>
            <form onSubmit={handleRedeem}>
              <div className="field">
                <label htmlFor="redeem-code">{t("trips.redeemPlaceholder")}</label>
                <input
                  id="redeem-code"
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  placeholder="ABC123"
                  className="invite-code-input"
                  autoFocus
                  disabled={redeemLoading}
                />
              </div>
              {redeemError && (
                <p className="message error" role="alert">{redeemError}</p>
              )}
              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn primary"
                  disabled={redeemLoading}
                >
                  {redeemLoading ? t("labels.loading") : t("trips.redeemCode")}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setShowRedeemModal(false);
                    setRedeemCode("");
                    setRedeemError("");
                  }}
                >
                  {t("trips.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Trips;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchTrips, redeemInvite } from "../services/trips";

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

  return (
    <main className="trips-page">
      <section className="container">
        <div className="trips-header">
          <h1>{t("trips.title")}</h1>
          <div className="trips-header-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShowRedeemModal(true)}
            >
              {t("trips.redeemCode")}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? t("trips.hideArchived") : t("trips.showArchived")}
            </button>
            <Link className="btn primary" to="/home">
              {t("trips.createNew")}
            </Link>
          </div>
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
            <Link className="btn primary" to="/home">
              {t("trips.createNew")}
            </Link>
          </div>
        )}

        {!loading && !error && displayedTrips.length > 0 && (
          <ul className="trips-list">
            {displayedTrips.map((trip) => (
              <li key={trip.id} className="trip-card">
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

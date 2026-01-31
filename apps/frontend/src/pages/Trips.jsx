import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchTrips } from "../services/trips";

const Trips = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
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
    </main>
  );
};

export default Trips;

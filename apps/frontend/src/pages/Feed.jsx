import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchFeed } from "../services/trips";

const Feed = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = destinationFilter.trim()
          ? { destination: destinationFilter.trim(), limit: 20 }
          : { limit: 20 };
        const data = await fetchFeed(params);
        if (!cancelled) setTrips(data?.trips || []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Unable to load feed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [destinationFilter]);

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
    <main className="feed-page">
      <section className="container">
        <div className="feed-header">
          <h1>{t("feed.title")}</h1>
          <p className="feed-subtitle muted">{t("feed.subtitle")}</p>
          <form
            className="feed-filter"
            onSubmit={(e) => {
              e.preventDefault();
              const v = e.currentTarget.destination?.value ?? "";
              setDestinationFilter(v);
            }}
          >
            <input
              type="text"
              name="destination"
              placeholder={t("feed.filterPlaceholder")}
              className="feed-filter-input"
              aria-label={t("feed.filterPlaceholder")}
              key="feed-dest"
            />
            <button type="submit" className="btn small primary">
              {t("feed.filter")}
            </button>
          </form>
        </div>

        {loading && <p className="muted">{t("labels.loading")}</p>}
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="feed-empty">
            <p className="muted">{t("feed.empty")}</p>
            <p className="muted small">
              Share your own trips by opening a trip and clicking &ldquo;Make public&rdquo;.
            </p>
            <Link className="btn primary" to="/trips">
              {t("trips.title")}
            </Link>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <ul className="feed-list trips-list">
            {trips.map((trip) => (
              <li key={trip.id} className="trip-card feed-card">
                <div className="trip-card-main">
                  <h3 className="trip-card-name">{trip.name}</h3>
                  <p className="trip-card-destination muted">{trip.destination}</p>
                  <div className="trip-card-meta">
                    <span>{t("feed.days", { count: trip.days })}</span>
                    {trip.ownerEmail && (
                      <span className="muted">{t("feed.by")} {trip.ownerEmail}</span>
                    )}
                    {trip.updatedAt && (
                      <span className="muted">{formatDate(trip.updatedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="trip-card-actions">
                  <Link className="btn small primary" to={`/trips/${trip.id}`}>
                    {t("feed.view")}
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

export default Feed;

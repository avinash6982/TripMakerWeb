import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchFeed } from "../services/trips";

/** Stable gradient index from destination string for card hero */
function gradientIndex(str) {
  let n = 0;
  for (let i = 0; i < (str || "").length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return n % 6;
}

const FEED_HERO_GRADIENTS = [
  "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)",
  "linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)",
  "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)",
  "linear-gradient(135deg, #c026d3 0%, #d946ef 50%, #e879f9 100%)",
  "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
  "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
];

const Feed = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = destinationFilter.trim()
          ? { destination: destinationFilter.trim(), limit: 24 }
          : { limit: 24 };
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
      <section className="container feed-section">
        <header className="feed-header">
          <h1 className="feed-title">{t("feed.title")}</h1>
          <p className="feed-subtitle">{t("feed.subtitle")}</p>
          <form
            className="feed-search"
            onSubmit={(e) => {
              e.preventDefault();
              const v = (e.currentTarget.destination?.value ?? "").trim();
              setDestinationFilter(v);
              setSearchInput(v);
            }}
          >
            <input
              type="search"
              name="destination"
              placeholder={t("feed.filterPlaceholder")}
              className="feed-search-input"
              aria-label={t("feed.filterPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn primary feed-search-btn">
              {t("feed.filter")}
            </button>
          </form>
        </header>

        {loading && (
          <div className="feed-loading" aria-live="polite">
            <p className="muted">{t("labels.loading")}</p>
          </div>
        )}
        {error && (
          <p className="message error feed-message" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && trips.length === 0 && (
          <div className="feed-empty">
            <p className="feed-empty-title">{t("feed.empty")}</p>
            <p className="feed-empty-hint">
              Share your own trips by opening a trip and clicking &ldquo;Make public&rdquo;.
            </p>
            <Link className="btn primary" to="/trips">
              {t("trips.title")}
            </Link>
          </div>
        )}

        {!loading && !error && trips.length > 0 && (
          <ul className="feed-list" aria-label={t("feed.title")}>
            {trips.map((trip) => (
              <li key={trip.id} className="feed-card">
                <Link to={`/trips/${trip.id}`} className="feed-card-link">
                  <div
                    className="feed-card-hero"
                    style={{ background: FEED_HERO_GRADIENTS[gradientIndex(trip.destination)] }}
                    aria-hidden
                  />
                  <div className="feed-card-body">
                    <h3 className="feed-card-title">{trip.name}</h3>
                    <p className="feed-card-destination">{trip.destination}</p>
                    <div className="feed-card-meta">
                      <span className="feed-card-days">{t("feed.days", { count: trip.days })}</span>
                      {trip.ownerEmail && (
                        <span className="feed-card-by">{t("feed.by")} {trip.ownerEmail}</span>
                      )}
                      {trip.updatedAt && (
                        <span className="feed-card-date">{formatDate(trip.updatedAt)}</span>
                      )}
                    </div>
                    <span className="feed-card-cta">{t("feed.view")}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Feed;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchFeed,
  likeTrip,
  unlikeTrip,
  fetchTripComments,
  postTripComment,
  getUploadPresign,
  getApiBaseUrl,
} from "../services/trips";
import { getStoredUser } from "../services/auth";

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
  const user = getStoredUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [expandedCommentsId, setExpandedCommentsId] = useState(null);
  const [commentsByTripId, setCommentsByTripId] = useState({});
  const [commentInputByTripId, setCommentInputByTripId] = useState({});
  const [commentImageByTripId, setCommentImageByTripId] = useState({});
  const [loadingLikeId, setLoadingLikeId] = useState(null);
  const [loadingCommentId, setLoadingCommentId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const params = { limit: 24 };
        if (destinationFilter.trim()) params.destination = destinationFilter.trim();
        if (interestFilter.trim()) params.interest = interestFilter.trim();
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
  }, [destinationFilter, interestFilter]);

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

  const handleLikeClick = async (e, trip) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id || loadingLikeId) return;
    setLoadingLikeId(trip.id);
    try {
      if (trip.userLiked) {
        await unlikeTrip(trip.id);
        setTrips((prev) =>
          prev.map((t) =>
            t.id === trip.id
              ? { ...t, userLiked: false, likeCount: Math.max(0, (t.likeCount || 0) - 1) }
              : t
          )
        );
      } else {
        await likeTrip(trip.id);
        setTrips((prev) =>
          prev.map((t) =>
            t.id === trip.id
              ? { ...t, userLiked: true, likeCount: (t.likeCount || 0) + 1 }
              : t
          )
        );
      }
    } catch {
      // keep state unchanged
    } finally {
      setLoadingLikeId(null);
    }
  };

  const loadComments = async (tripId) => {
    if (commentsByTripId[tripId]) return;
    try {
      const data = await fetchTripComments(tripId, { limit: 30 });
      setCommentsByTripId((prev) => ({ ...prev, [tripId]: data?.comments || [] }));
    } catch {
      setCommentsByTripId((prev) => ({ ...prev, [tripId]: [] }));
    }
  };

  const handleToggleComments = (e, trip) => {
    e.preventDefault();
    e.stopPropagation();
    const next = expandedCommentsId === trip.id ? null : trip.id;
    setExpandedCommentsId(next);
    if (next) loadComments(trip.id);
  };

  const handleSubmitComment = async (e, trip) => {
    e.preventDefault();
    e.stopPropagation();
    const text = (commentInputByTripId[trip.id] ?? "").trim();
    const imageFile = commentImageByTripId[trip.id];
    if ((!text && !imageFile) || !user?.id || loadingCommentId) return;
    setLoadingCommentId(trip.id);
    try {
      let imageKey = null;
      if (imageFile && imageFile.size <= 5 * 1024 * 1024) {
        const { uploadUrl, key } = await getUploadPresign(imageFile.size, imageFile.type || "image/jpeg");
        await fetch(uploadUrl, { method: "PUT", body: imageFile, headers: { "Content-Type": imageFile.type || "image/jpeg" } });
        imageKey = key;
      }
      const newComment = await postTripComment(trip.id, { text, imageKey });
      setCommentInputByTripId((prev) => ({ ...prev, [trip.id]: "" }));
      setCommentImageByTripId((prev) => ({ ...prev, [trip.id]: null }));
      setCommentsByTripId((prev) => ({
        ...prev,
        [trip.id]: [{ ...newComment, authorEmail: newComment.authorEmail || user.email }, ...(prev[trip.id] || [])],
      }));
      setTrips((prev) =>
        prev.map((t) =>
          t.id === trip.id ? { ...t, commentCount: (t.commentCount || 0) + 1 } : t
        )
      );
    } catch {
      // keep input
    } finally {
      setLoadingCommentId(null);
    }
  };

  const mediaUrl = (key) => `${getApiBaseUrl()}/media/${encodeURIComponent(key)}`;

  return (
    <main className="feed-page">
      <section className="container feed-section">
        <header className="page-header">
          <Link to="/home" className="page-header-back" aria-label={t("nav.home")} title={t("nav.home")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="page-header-title">{t("feed.title")}</h1>
          <span className="page-header-actions" />
        </header>
        <div className="feed-header-extra">
          <p className="feed-subtitle">{t("feed.subtitle")}</p>
          <form
            className="feed-search"
            onSubmit={(e) => {
              e.preventDefault();
              const dest = (e.currentTarget.destination?.value ?? "").trim();
              const interest = (e.currentTarget.interest?.value ?? "").trim();
              setDestinationFilter(dest);
              setSearchInput(dest);
              setInterestFilter(interest);
              setInterestInput(interest);
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
            <input
              type="search"
              name="interest"
              placeholder={t("feed.interestPlaceholder")}
              className="feed-search-input"
              aria-label={t("feed.interestPlaceholder")}
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
            />
            <button type="submit" className="btn primary feed-search-btn">
              {t("feed.filter")}
            </button>
          </form>
        </div>

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
                  <div className="feed-card-hero" aria-hidden>
                    {trip.thumbnailKey ? (
                      <img src={mediaUrl(trip.thumbnailKey)} alt="" className="feed-card-hero-img" />
                    ) : (
                      <div className="feed-card-hero-placeholder" style={{ background: FEED_HERO_GRADIENTS[gradientIndex(trip.destination)] }} />
                    )}
                  </div>
                  {(trip.galleryPreview?.length > 0) && (
                    <div className="feed-card-gallery-preview">
                      {trip.galleryPreview.slice(0, 4).map((key, idx) => (
                        <img key={key || idx} src={mediaUrl(key)} alt="" />
                      ))}
                    </div>
                  )}
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
                    <div className="feed-card-actions" onClick={(e) => e.preventDefault()}>
                      {user && (
                        <button
                          type="button"
                          className={`feed-card-like ${trip.userLiked ? "feed-card-liked" : ""}`}
                          onClick={(e) => handleLikeClick(e, trip)}
                          disabled={loadingLikeId === trip.id}
                          aria-pressed={trip.userLiked}
                          title={trip.userLiked ? t("feed.unlike") : t("feed.like")}
                        >
                          <span className="feed-card-like-icon" aria-hidden>♥</span>
                          <span className="feed-card-like-count">{trip.likeCount ?? 0}</span>
                        </button>
                      )}
                      {!user && (trip.likeCount ?? 0) > 0 && (
                        <span className="feed-card-like-count-only">♥ {trip.likeCount}</span>
                      )}
                      <button
                        type="button"
                        className="feed-card-comments-btn"
                        onClick={(e) => handleToggleComments(e, trip)}
                        aria-expanded={expandedCommentsId === trip.id}
                      >
                        {t("feed.comments")} ({(trip.commentCount ?? 0)})
                      </button>
                    </div>
                    <span className="feed-card-cta">{t("feed.view")}</span>
                  </div>
                </Link>
                {expandedCommentsId === trip.id && (
                  <div className="feed-card-comments" onClick={(e) => e.stopPropagation()}>
                    <ul className="feed-card-comments-list">
                      {(commentsByTripId[trip.id] || []).length === 0 ? (
                        <li className="feed-card-comments-empty">{t("feed.noComments")}</li>
                      ) : (
                        (commentsByTripId[trip.id] || []).map((c) => (
                          <li key={c.id} className="feed-card-comment">
                            <strong>{c.authorEmail || t("feed.commentAuthor")}:</strong> {c.text}
                            {c.imageKey && (
                              <a href={mediaUrl(c.imageKey)} target="_blank" rel="noopener noreferrer" className="feed-card-comment-img-wrap">
                                <img src={mediaUrl(c.imageKey)} alt="" className="feed-card-comment-img" loading="lazy" />
                              </a>
                            )}
                            <span className="feed-card-comment-time">
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                    {user && (
                      <form
                        className="feed-card-comment-form"
                        onSubmit={(e) => handleSubmitComment(e, trip)}
                      >
                        {(commentImageByTripId[trip.id]) && (
                          <div className="feed-card-comment-attach-preview">
                            <span>{commentImageByTripId[trip.id].name}</span>
                            <button type="button" className="btn ghost btn-sm" onClick={() => setCommentImageByTripId((prev) => ({ ...prev, [trip.id]: null }))} aria-label={t("trips.removeImage", "Remove image")}>×</button>
                          </div>
                        )}
                        <div className="feed-card-comment-form-row">
                          <input
                            type="text"
                            className="feed-card-comment-input"
                            value={commentInputByTripId[trip.id] ?? ""}
                            onChange={(e) =>
                              setCommentInputByTripId((prev) => ({
                                ...prev,
                                [trip.id]: e.target.value,
                              }))
                            }
                            placeholder={t("feed.addComment")}
                            maxLength={500}
                            disabled={loadingCommentId === trip.id}
                            aria-label={t("feed.addComment")}
                          />
                          <label className="btn ghost btn-sm">
                            <span>{t("trips.attachImage", "Attach image")}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              className="sr-only"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f && f.size <= 5 * 1024 * 1024) setCommentImageByTripId((prev) => ({ ...prev, [trip.id]: f }));
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <button
                            type="submit"
                            className="btn primary btn-sm"
                            disabled={
                              loadingCommentId === trip.id ||
                              (!(commentInputByTripId[trip.id] ?? "").trim() && !commentImageByTripId[trip.id])
                            }
                          >
                            {loadingCommentId === trip.id ? t("labels.loading") : t("feed.postComment")}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default Feed;

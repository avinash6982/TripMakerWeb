import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchTrip,
  fetchGallery,
  postGalleryImage,
  likeGalleryImage,
  unlikeGalleryImage,
  fetchGalleryImageComments,
  postGalleryImageComment,
  getUploadPresign,
  getApiBaseUrl,
} from "../services/trips";
import { getStoredUser } from "../services/auth";

const TripGallery = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsByImageId, setCommentsByImageId] = useState({});
  const [expandedComments, setExpandedComments] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentImageFile, setCommentImageFile] = useState(null);
  const [postingComment, setPostingComment] = useState(false);
  const [likingId, setLikingId] = useState(null);
  const [galleryAddLoading, setGalleryAddLoading] = useState(false);

  const user = getStoredUser();
  const isOwner = trip && user?.id && trip.userId === user.id;
  const collab = trip?.collaborators?.find((c) => c.userId === user?.id);
  const isEditor = collab && collab.role === "editor";
  const canEdit = isOwner || isEditor;

  const loadTripAndGallery = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [tripData, galleryData] = await Promise.all([fetchTrip(id), fetchGallery(id)]);
      setTrip(tripData);
      setGallery(galleryData?.gallery || []);
      setCurrentIndex(0);
    } catch (err) {
      setError(err?.message || "Unable to load gallery.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripAndGallery();
  }, [id]);

   useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((i) => (i > 0 ? i - 1 : i));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) => (i < gallery.length - 1 ? i + 1 : i));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length]);

  const currentItem = gallery[currentIndex] || null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < gallery.length - 1 && gallery.length > 0;

  const goPrev = () => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  };
  const goNext = () => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  };
  const goToIndex = (idx) => {
    if (idx >= 0 && idx < gallery.length) setCurrentIndex(idx);
  };

  const handleAddToGallery = async (e) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024 || !id || galleryAddLoading) return;
    e.target.value = "";
    setGalleryAddLoading(true);
    try {
      const { uploadUrl, key } = await getUploadPresign(file.size, file.type || "image/jpeg");
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });
      await postGalleryImage(id, { imageKey: key });
      await loadTripAndGallery();
    } catch (err) {
      setError(err?.message || "Failed to add image.");
    } finally {
      setGalleryAddLoading(false);
    }
  };

  const loadComments = async (imageId) => {
    if (!id || !imageId) return;
    try {
      const data = await fetchGalleryImageComments(id, imageId, { limit: 50 });
      setCommentsByImageId((prev) => ({ ...prev, [imageId]: data?.comments || [] }));
    } catch {
      setCommentsByImageId((prev) => ({ ...prev, [imageId]: [] }));
    }
  };

  const toggleComments = (imageId) => {
    setExpandedComments((prev) => (prev === imageId ? null : imageId));
    if (expandedComments !== imageId && imageId) loadComments(imageId);
  };

  const handleLike = async (imageId) => {
    if (!user?.id || likingId) return;
    const item = gallery.find((i) => i.id === imageId);
    if (!item) return;
    setLikingId(imageId);
    try {
      if (item.likes?.includes(user.id)) {
        await unlikeGalleryImage(id, imageId);
        setGallery((prev) =>
          prev.map((i) =>
            i.id === imageId
              ? { ...i, likes: (i.likes || []).filter((uid) => uid !== user.id) }
              : i
          )
        );
      } else {
        await likeGalleryImage(id, imageId);
        setGallery((prev) =>
          prev.map((i) =>
            i.id === imageId ? { ...i, likes: [...(i.likes || []), user.id] } : i
          )
        );
      }
    } catch {
      // ignore
    } finally {
      setLikingId(null);
    }
  };

  const handlePostComment = async (imageId) => {
    const text = commentInput.trim();
    if (!text && !commentImageFile) return;
    if (!user?.id || postingComment) return;
    setPostingComment(true);
    try {
      let imageKey = null;
      if (commentImageFile && commentImageFile.size <= 5 * 1024 * 1024) {
        const { uploadUrl, key } = await getUploadPresign(commentImageFile.size, commentImageFile.type || "image/jpeg");
        await fetch(uploadUrl, {
          method: "PUT",
          body: commentImageFile,
          headers: { "Content-Type": commentImageFile.type || "image/jpeg" },
        });
        imageKey = key;
      }
      await postGalleryImageComment(id, imageId, { text, imageKey });
      setCommentInput("");
      setCommentImageFile(null);
      await loadComments(imageId);
      setGallery((prev) =>
        prev.map((i) =>
          i.id === imageId
            ? { ...i, comments: [...(i.comments || []), { id: "new", userId: user.id, text, imageKey, createdAt: new Date().toISOString(), authorEmail: user.email }] }
            : i
        )
      );
    } catch (err) {
      // show error in UI if needed
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <main className="trip-gallery-page">
        <div className="container">
          <p className="muted">{t("labels.loading", "Loading...")}</p>
        </div>
      </main>
    );
  }
  if (error || !trip) {
    return (
      <main className="trip-gallery-page">
        <div className="container">
          <p className="message error">{error || "Trip not found."}</p>
          <Link to="/trips" className="btn primary">
            {t("trips.backToTrips", "Back to Trips")}
          </Link>
        </div>
      </main>
    );
  }

  const mediaUrl = (key) => `${getApiBaseUrl()}/media/${encodeURIComponent(key)}`;

  return (
    <main className="trip-gallery-page">
      <div className="container">
        <header className="page-header">
          <Link
            to={`/trips/${id}`}
            className="page-header-back"
            aria-label={t("trips.backToTrip", "Back to trip")}
            title={t("trips.backToTrip", "Back to trip")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="page-header-title">{trip.name}</h1>
          {canEdit ? (
            <div className="page-header-actions">
            <label className={`page-header-action-round primary ${galleryAddLoading ? "is-loading" : ""}`} title={t("trips.addToGallery", "Add to gallery")} aria-label={t("trips.addToGallery", "Add to gallery")}>
              <span className="page-header-action-round-icon" aria-hidden>
                {galleryAddLoading ? (
                  <span className="page-header-action-round-spinner" aria-hidden />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                )}
              </span>
              <span className="sr-only">{galleryAddLoading ? t("labels.loading", "Loading...") : t("trips.addToGallery", "Add to gallery")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                disabled={galleryAddLoading}
                onChange={handleAddToGallery}
              />
            </label>
            </div>
          ) : (
            <span className="page-header-actions" />
          )}
        </header>

        {gallery.length === 0 ? (
          <div className="trip-gallery-empty-state">
            <div className="trip-gallery-empty-icon" aria-hidden>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <h2 className="trip-gallery-empty-title">{t("trips.galleryEmptyTitle", "No photos yet")}</h2>
            <p className="trip-gallery-empty-desc">{t("trips.galleryEmpty", "No images in this trip yet.")}</p>
            {galleryAddLoading && (
              <p className="trip-gallery-uploading" role="status">
                <span className="trip-gallery-uploading-spinner" aria-hidden />
                {t("trips.uploadingImage", "Uploading image...")}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="trip-gallery-carousel">
              <button
                type="button"
                className="btn ghost trip-gallery-nav trip-gallery-prev"
                onClick={goPrev}
                disabled={!hasPrev}
                aria-label={t("trips.prevImage", "Previous image")}
              >
                ‹
              </button>
              <div className="trip-gallery-current">
                {currentItem && (
                  <img
                    src={mediaUrl(currentItem.imageKey)}
                    alt=""
                    className="trip-gallery-img"
                  />
                )}
              </div>
              <button
                type="button"
                className="btn ghost trip-gallery-nav trip-gallery-next"
                onClick={goNext}
                disabled={!hasNext}
                aria-label={t("trips.nextImage", "Next image")}
              >
                ›
              </button>
            </div>
            <p className="trip-gallery-counter">
              {currentIndex + 1} / {gallery.length}
            </p>
            <div className="trip-gallery-thumbs" role="tablist" aria-label={t("trips.galleryThumbs", "Gallery thumbnails")}>
              {gallery.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === currentIndex}
                  className={`trip-gallery-thumb-btn ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => goToIndex(idx)}
                >
                  <img src={mediaUrl(item.imageKey)} alt="" />
                </button>
              ))}
            </div>

            {currentItem && (
              <div className="trip-gallery-meta">
                <div className="trip-gallery-actions">
                  <button
                    type="button"
                    className={`btn ghost btn-sm trip-gallery-like ${(currentItem.likes || []).includes(user?.id) ? "liked" : ""}`}
                    onClick={() => handleLike(currentItem.id)}
                    disabled={likingId === currentItem.id}
                  >
                    ♥ {(currentItem.likes || []).length}
                  </button>
                  <button
                    type="button"
                    className="btn ghost btn-sm"
                    onClick={() => toggleComments(currentItem.id)}
                  >
                    {t("trips.comments", "Comments")} ({(currentItem.comments || []).length})
                  </button>
                </div>
                {expandedComments === currentItem.id && (
                  <div className="trip-gallery-comments-panel">
                    <ul className="trip-gallery-comments-list">
                      {(commentsByImageId[currentItem.id] || currentItem.comments || []).map((c) => (
                        <li key={c.id}>
                          <strong>{c.authorEmail || "User"}</strong>: {c.text}
                          {c.imageKey && (
                            <a href={mediaUrl(c.imageKey)} target="_blank" rel="noopener noreferrer">
                              <img src={mediaUrl(c.imageKey)} alt="" className="trip-gallery-comment-img" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                    {user && (
                      <div className="trip-gallery-add-comment">
                        <input
                          type="text"
                          placeholder={t("trips.addComment", "Add a comment...")}
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handlePostComment(currentItem.id)}
                        />
                        <label className="btn ghost btn-sm">
                          <span>{t("trips.attachImage", "Attach image")}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f && f.size <= 5 * 1024 * 1024) setCommentImageFile(f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="btn primary btn-sm"
                          onClick={() => handlePostComment(currentItem.id)}
                          disabled={postingComment || (!commentInput.trim() && !commentImageFile)}
                        >
                          {t("trips.post", "Post")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default TripGallery;

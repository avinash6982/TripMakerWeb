import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [commentsByImageId, setCommentsByImageId] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentImageFile, setCommentImageFile] = useState(null);
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [likingId, setLikingId] = useState(null);
  const [galleryAddLoading, setGalleryAddLoading] = useState(false);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(true);
  const commentsDesktopRef = useRef(null);
  const panStartRef = useRef(null);

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
      setZoom(1);
      setPan({ x: 0, y: 0 });
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
        setZoom(1);
        setPan({ x: 0, y: 0 });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentIndex((i) => (i < gallery.length - 1 ? i + 1 : i));
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length]);

  const currentItem = gallery[currentIndex] || null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < gallery.length - 1 && gallery.length > 0;

  const goPrev = () => {
    if (hasPrev) {
      setCurrentIndex((i) => i - 1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };
  const goNext = () => {
    if (hasNext) {
      setCurrentIndex((i) => i + 1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };
  const goToIndex = (idx) => {
    if (idx >= 0 && idx < gallery.length) {
      setCurrentIndex(idx);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
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
    setCommentsLoading(true);
    try {
      const data = await fetchGalleryImageComments(id, imageId, { limit: 50 });
      setCommentsByImageId((prev) => ({ ...prev, [imageId]: data?.comments || [] }));
    } catch {
      setCommentsByImageId((prev) => ({ ...prev, [imageId]: [] }));
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (currentItem?.id && !commentsByImageId[currentItem.id]) loadComments(currentItem.id);
  }, [currentItem?.id]);

  useEffect(() => {
    setCommentInput("");
    setCommentImageFile(null);
  }, [currentItem?.id]);

  useEffect(() => {
    if (!commentsPanelOpen) return;
    const close = (e) => {
      const insideDesktop = commentsDesktopRef.current?.contains(e.target);
      if (!insideDesktop) setCommentsPanelOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [commentsPanelOpen]);

  const startPan = (clientX, clientY) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStartRef.current = {
      x: pan.x,
      y: pan.y,
      clientX,
      clientY,
    };
  };

  const movePan = (clientX, clientY) => {
    if (!isPanning || !panStartRef.current) return;
    const dx = clientX - panStartRef.current.clientX;
    const dy = clientY - panStartRef.current.clientY;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const endPan = () => {
    setIsPanning(false);
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

  const handlePostComment = async (e) => {
    e?.preventDefault();
    if (!currentItem?.id) return;
    const text = commentInput.trim();
    if (!text && !commentImageFile) return;
    if (!user?.id || postingComment) return;
    setPostingComment(true);
    setCommentError("");
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
      await postGalleryImageComment(id, currentItem.id, { text, imageKey });
      setCommentInput("");
      setCommentImageFile(null);
      await loadComments(currentItem.id);
    } catch (err) {
      setCommentError(err?.message || "Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const mediaUrl = (key) => `${getApiBaseUrl()}/media/${encodeURIComponent(key)}`;
  const currentComments = currentItem ? (commentsByImageId[currentItem.id] ?? currentItem.comments ?? []) : [];

  const commentsListContent = commentsLoading ? (
    <p className="muted">{t("labels.loading", "Loading...")}</p>
  ) : currentComments.length === 0 ? (
    <p className="muted">{t("feed.noComments", "No comments yet.")}</p>
  ) : (
    <ul className="trip-detail-comments-list">
      {currentComments.map((c) => (
        <li key={c.id} className="trip-detail-comment">
          <strong>{c.authorEmail || t("feed.commentAuthor", "Someone")}:</strong> {c.text}
          {c.imageKey && (
            <a href={mediaUrl(c.imageKey)} target="_blank" rel="noopener noreferrer" className="trip-detail-comment-img-wrap">
              <img src={mediaUrl(c.imageKey)} alt="" className="trip-detail-comment-img" loading="lazy" />
            </a>
          )}
          <span className="trip-detail-comment-time">
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
      ))}
    </ul>
  );

  const commentsFormContent = user ? (
    <form className="trip-detail-comment-form" onSubmit={handlePostComment}>
      {commentImageFile && (
        <div className="trip-detail-comment-attach-preview">
          <span>{commentImageFile.name}</span>
          <button type="button" className="btn ghost btn-sm" onClick={() => setCommentImageFile(null)} aria-label={t("trips.removeImage", "Remove image")}>×</button>
        </div>
      )}
      <div className="trip-detail-comment-form-row">
        <input
          type="text"
          className="trip-detail-comment-input"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder={t("feed.addComment", "Add a comment...")}
          maxLength={500}
          disabled={postingComment}
          aria-label={t("feed.addComment", "Add a comment...")}
        />
        <label className="trip-detail-comment-icon-btn trip-detail-comment-attach" title={t("trips.attachImage", "Attach image")} aria-label={t("trips.attachImage", "Attach image")}>
          <span className="trip-detail-comment-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </span>
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
          type="submit"
          className="trip-detail-comment-icon-btn trip-detail-comment-send"
          disabled={postingComment || (!commentInput.trim() && !commentImageFile)}
          title={t("feed.postComment", "Post")}
          aria-label={t("feed.postComment", "Post")}
        >
          <span className="trip-detail-comment-icon" aria-hidden>
            {postingComment ? (
              <span className="trip-detail-chat-loading">⋯</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            )}
          </span>
        </button>
      </div>
      {commentError && (
        <p className="message error trip-detail-comment-error" role="alert">{commentError}</p>
      )}
    </form>
  ) : null;

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

  return (
    <main className="trip-gallery-page">
      {gallery.length === 0 ? (
        <div className="container">
          <header className="page-header">
            <Link
              to={`/trips/${id}`}
              state={{ from: location.state?.from || "trips" }}
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
        </div>
      ) : (
        <div className="trip-gallery-layout">
          <div className="trip-gallery-main">
            <div className="container">
              <header className="page-header">
                <Link
                  to={`/trips/${id}`}
                  state={{ from: location.state?.from || "trips" }}
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
              {/* Fixed-height viewer with overlays */}
              <div className="trip-gallery-viewer">
                <div
                  className="trip-gallery-viewer-inner"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    startPan(e.clientX, e.clientY);
                  }}
                  onMouseMove={(e) => {
                    if (!isPanning) return;
                    e.preventDefault();
                    movePan(e.clientX, e.clientY);
                  }}
                  onMouseUp={() => {
                    endPan();
                  }}
                  onMouseLeave={() => {
                    endPan();
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length !== 1) return;
                    const t = e.touches[0];
                    startPan(t.clientX, t.clientY);
                  }}
                  onTouchMove={(e) => {
                    if (!isPanning || e.touches.length !== 1) return;
                    const t = e.touches[0];
                    movePan(t.clientX, t.clientY);
                  }}
                  onTouchEnd={() => {
                    endPan();
                  }}
                >
                  {currentItem && (
                    <img
                      src={mediaUrl(currentItem.imageKey)}
                      alt=""
                      className="trip-gallery-img"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "default",
                      }}
                      draggable={false}
                    />
                  )}
                </div>

                {currentItem && (
                  <>
                    <button
                      type="button"
                      className="trip-gallery-nav trip-gallery-prev"
                      onClick={goPrev}
                      disabled={!hasPrev}
                      aria-label={t("trips.prevImage", "Previous image")}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button
                      type="button"
                      className="trip-gallery-nav trip-gallery-next"
                      onClick={goNext}
                      disabled={!hasNext}
                      aria-label={t("trips.nextImage", "Next image")}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>

                    <div className="trip-gallery-viewer-overlays">
                      <button
                        type="button"
                        className={`trip-gallery-like-overlay ${(currentItem.likes || []).includes(user?.id) ? "liked" : ""}`}
                        onClick={() => handleLike(currentItem.id)}
                        disabled={likingId === currentItem.id}
                        aria-label={t("trips.like", "Like")}
                        title={t("trips.like", "Like")}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={currentItem.likes?.includes(user?.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>{(currentItem.likes || []).length}</span>
                      </button>
                      <div className="trip-gallery-zoom-controls">
                        <button
                          type="button"
                          className="trip-gallery-zoom-btn"
                          onClick={() => {
                            setZoom((z) => {
                              const next = Math.max(0.5, z - 0.25);
                              if (next <= 1) {
                                setPan({ x: 0, y: 0 });
                              }
                              return next;
                            });
                          }}
                          aria-label={t("trips.zoomOut", "Zoom out")}
                          disabled={zoom <= 0.5}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="trip-gallery-zoom-btn"
                          onClick={() => {
                            setZoom((z) => {
                              const next = Math.min(3, z + 0.25);
                              if (next <= 1) {
                                setPan({ x: 0, y: 0 });
                              }
                              return next;
                            });
                          }}
                          aria-label={t("trips.zoomIn", "Zoom in")}
                          disabled={zoom >= 3}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip + mobile-only comments */}
              <div className="trip-gallery-bottom">
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
                      <img src={mediaUrl(item.imageKey)} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>

                {/* Mobile: comments below thumbs. Desktop: comments in sidebar */}
                {currentItem && (
                  <section className="trip-gallery-comments trip-gallery-comments-mobile-only" aria-label={t("feed.comments", "Comments")}>
                    <h2 className="trip-gallery-comments-title">{t("feed.comments", "Comments")}</h2>
                    <div className="trip-gallery-comments-body">{commentsListContent}</div>
                    {commentsFormContent}
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: toggleable comments sidebar (same pattern as trip detail) */}
          {currentItem && (
            <div className="trip-detail-comments-desktop-wrap" ref={commentsDesktopRef}>
              <aside
                className="trip-detail-comments-sidebar"
                data-open={commentsPanelOpen}
                aria-hidden={!commentsPanelOpen}
                role="complementary"
                aria-label={t("feed.comments", "Comments")}
              >
                <button
                  type="button"
                  className="trip-detail-comments-sidebar-close-waterdrop"
                  onClick={() => setCommentsPanelOpen(false)}
                  title={t("trips.closeComments", "Close comments")}
                  aria-label={t("trips.closeComments", "Close comments")}
                  aria-hidden={!commentsPanelOpen}
                >
                  <span className="trip-detail-comments-waterdrop-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </span>
                </button>
                <div className="trip-detail-comments-sidebar-inner">
                  <div className="trip-detail-comments-sidebar-header">
                    <h2 className="trip-detail-comments-sidebar-title">{t("feed.comments", "Comments")}</h2>
                  </div>
                  <div className="trip-detail-comments-sidebar-body">
                    {commentsListContent}
                  </div>
                  <div className="trip-detail-comments-sidebar-footer">
                    {commentsFormContent}
                  </div>
                </div>
              </aside>
              <button
                type="button"
                className="trip-detail-comments-toggle-desktop"
                onClick={() => setCommentsPanelOpen((prev) => !prev)}
                aria-expanded={commentsPanelOpen}
                aria-label={commentsPanelOpen ? t("trips.closeComments", "Close comments") : t("feed.comments", "Comments")}
                title={commentsPanelOpen ? t("trips.closeComments", "Close comments") : t("feed.comments", "Comments")}
              >
                {commentsPanelOpen ? (
                  <span className="trip-detail-comments-toggle-icon" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </span>
                ) : (
                  <>
                    <span className="trip-detail-comments-toggle-icon" aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </span>
                    {currentComments.length > 0 && (
                      <span className="trip-detail-comments-toggle-count" aria-hidden>{currentComments.length > 99 ? "99+" : currentComments.length}</span>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default TripGallery;

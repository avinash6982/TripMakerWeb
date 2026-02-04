import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchTrip,
  updateTrip,
  deleteTrip,
  archiveTrip,
  unarchiveTrip,
  createInvite,
  removeCollaborator,
  fetchTripMessages,
  postTripMessage,
  getUploadPresign,
  getApiBaseUrl,
  fetchTripComments,
  postTripComment,
} from "../services/trips";
import { getStoredUser } from "../services/auth";
import { getTransportHubsForDestination } from "../data/transportHubs";
import MapView from "../components/MapView";
import {
  getDestinationCoordinates,
  geocodePlace,
  collectPlaceNamesByDay,
} from "../services/geocode";
import { useLocation } from "../hooks/useLocation";
import { getClosestStop } from "../utils/distance";
import { getDayRouteColor } from "../constants/dayRouteColors";

const TripDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", destination: "", days: 3 });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteExpiresAt, setInviteExpiresAt] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [itineraryMarkers, setItineraryMarkers] = useState([]);
  const [dayRoutes, setDayRoutes] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [showMyLocation, setShowMyLocation] = useState(false);
  const {
    position: currentLocationPosition,
    error: locationError,
    loading: locationLoading,
    isWatching,
    startWatching,
    stopWatching,
    clearError: clearLocationError,
  } = useLocation();
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatImageFile, setChatImageFile] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentImageFile, setCommentImageFile] = useState(null);
  const [commentPosting, setCommentPosting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [headerActionsUseOverflow, setHeaderActionsUseOverflow] = useState(true);
  const actionsMenuRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const commentsPanelRef = useRef(null);
  const commentsDesktopRef = useRef(null);
  const pageHeaderRef = useRef(null);

  const loadTrip = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchTrip(id);
      setTrip(data);
      setEditForm({
        name: data.name || "",
        destination: data.destination || "",
        days: data.days ?? 3,
      });
    } catch (err) {
      setError(err?.message || "Trip not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  useEffect(() => {
    if (!actionsMenuOpen) return;
    const close = (e) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target)) {
        setActionsMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [actionsMenuOpen]);

  useEffect(() => {
    if (!optionsMenuOpen) return;
    const close = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setOptionsMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [optionsMenuOpen]);

  // Dynamic overflow: collapse header actions into menu when header width is limited
  useEffect(() => {
    const el = pageHeaderRef.current;
    if (!el) return;
    const RO = new ResizeObserver(() => {
      setHeaderActionsUseOverflow(el.clientWidth < 600);
    });
    RO.observe(el);
    setHeaderActionsUseOverflow(el.clientWidth < 600);
    return () => RO.disconnect();
  }, [trip?.id]);

  useEffect(() => {
    if (!commentsPanelOpen) return;
    const close = (e) => {
      const insideMobile = commentsPanelRef.current?.contains(e.target);
      const insideDesktop = commentsDesktopRef.current?.contains(e.target);
      if (!insideMobile && !insideDesktop) setCommentsPanelOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [commentsPanelOpen]);

  const heroSlideCount = trip?.id ? 1 + (trip.gallery || []).length : 0;
  useEffect(() => {
    if (!trip?.id || heroSlideCount <= 1) return;
    const id = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlideCount);
    }, 4000);
    return () => clearInterval(id);
  }, [trip?.id, heroSlideCount]);

  useEffect(() => {
    if (trip?.id) setHeroSlideIndex(0);
  }, [trip?.id]);

  const handleCopyLink = async (closeMenu) => {
    if (!trip?.id) return;
    const url = `${window.location.origin}/trips/${trip.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2000);
      if (closeMenu) setActionsMenuOpen(false);
    } catch {
      setMessage(t("trips.copyLinkFailed"));
    }
  };

  // Load map: geocode destination + itinerary places by day for multi-day route (MVP2)
  useEffect(() => {
    if (!trip?.destination || !trip?.itinerary?.length) {
      setMapCenter(null);
      setItineraryMarkers([]);
      setDayRoutes([]);
      return;
    }
    let cancelled = false;
    setMapLoading(true);
    setItineraryMarkers([]);
    setDayRoutes([]);
    const run = async () => {
      try {
        const coords = await getDestinationCoordinates(trip.destination);
        if (cancelled || !coords) {
          setMapLoading(false);
          return;
        }
        const center = { lat: coords.lat, lon: coords.lon };
        setMapCenter(center);
        setMapLoading(false);
        const placesByDay = collectPlaceNamesByDay({ itinerary: trip.itinerary });
        const centerPos = [coords.lat, coords.lon];
        const routes = placesByDay.map(() => []);
        let reqIndex = 0;
        for (let dayIndex = 0; dayIndex < placesByDay.length; dayIndex++) {
          if (cancelled) return;
          const dayPlaces = placesByDay[dayIndex];
          for (let j = 0; j < dayPlaces.length; j++) {
            if (cancelled) return;
            await new Promise((r) => setTimeout(r, reqIndex === 0 ? 0 : 1100));
            if (cancelled) return;
            const place = dayPlaces[j];
            const placeCoords = await geocodePlace(place.name, trip.destination);
            reqIndex++;
            if (cancelled) return;
            if (placeCoords?.lat != null && placeCoords?.lng != null) {
              routes[dayIndex].push([placeCoords.lat, placeCoords.lng]);
              setItineraryMarkers((prev) =>
                prev.length < 15
                  ? [...prev, { ...placeCoords, name: place.name, category: place.category }]
                  : prev
              );
            }
          }
          setDayRoutes((prev) => {
            const next = prev.slice(0, dayIndex);
            next[dayIndex] = [centerPos, ...routes[dayIndex]];
            return next;
          });
        }
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [trip?.id, trip?.destination, trip?.itinerary]);

  // MVP3: Load and poll trip chat messages
  useEffect(() => {
    if (!trip?.id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchTripMessages(trip.id, { limit: 50 });
        if (!cancelled && data?.messages) setMessages(data.messages);
      } catch {
        if (!cancelled) setMessages([]);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [trip?.id]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if ((!text && !chatImageFile) || !trip?.id || chatLoading) return;
    setChatError("");
    setChatLoading(true);
    try {
      let imageKey = null;
      if (chatImageFile) {
        const { uploadUrl, key } = await getUploadPresign(chatImageFile.size, chatImageFile.type || "image/jpeg");
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: chatImageFile,
          headers: { "Content-Type": chatImageFile.type || "image/jpeg" },
        });
        if (!putRes.ok) throw new Error("Upload failed.");
        imageKey = key;
      }
      await postTripMessage(trip.id, { text, imageKey });
      setChatInput("");
      setChatImageFile(null);
      const data = await fetchTripMessages(trip.id, { limit: 50 });
      if (data?.messages) setMessages(data.messages);
    } catch (err) {
      setChatError(err?.message || "Failed to send.");
    } finally {
      setChatLoading(false);
    }
  };

  // Load feed comments (same as Discover) when viewing trip
  useEffect(() => {
    if (!trip?.id) return;
    let cancelled = false;
    setCommentsLoading(true);
    fetchTripComments(trip.id, { limit: 50 })
      .then((data) => {
        if (!cancelled && data?.comments) setComments(data.comments);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [trip?.id]);

  const handlePostComment = async (e) => {
    e?.preventDefault();
    const text = commentInput.trim();
    if ((!text && !commentImageFile) || !trip?.id || commentPosting) return;
    setCommentError("");
    setCommentPosting(true);
    try {
      let imageKey = null;
      if (commentImageFile && commentImageFile.size <= 5 * 1024 * 1024) {
        const { uploadUrl, key } = await getUploadPresign(commentImageFile.size, commentImageFile.type || "image/jpeg");
        await fetch(uploadUrl, { method: "PUT", body: commentImageFile, headers: { "Content-Type": commentImageFile.type || "image/jpeg" } });
        imageKey = key;
      }
      const newComment = await postTripComment(trip.id, { text, imageKey });
      setCommentInput("");
      setCommentImageFile(null);
      setComments((prev) => [{ ...newComment, authorEmail: newComment.authorEmail || currentUser?.email }, ...prev]);
    } catch (err) {
      setCommentError(err?.message || "Failed to post comment.");
    } finally {
      setCommentPosting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    if (!trip) return;
    setActionLoading(true);
    setMessage("");
    try {
      const updated = await updateTrip(trip.id, {
        name: editForm.name.trim(),
        destination: editForm.destination.trim(),
        days: Math.min(10, Math.max(1, Number(editForm.days) || 3)),
      });
      setTrip(updated);
      setEditMode(false);
      setMessage(t("trips.updateSuccess"));
    } catch (err) {
      setMessage(err?.message || "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!trip) return;
    setActionLoading(true);
    setMessage("");
    try {
      const updated = await updateTrip(trip.id, { status: newStatus });
      setTrip(updated);
      setMessage(
        newStatus === "archived"
          ? t("trips.archiveSuccess")
          : t("trips.updateSuccess")
      );
    } catch (err) {
      setMessage(err?.message || "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!trip) return;
    setActionLoading(true);
    setMessage("");
    try {
      await archiveTrip(trip.id);
      const updated = await fetchTrip(trip.id);
      setTrip(updated);
      setMessage(t("trips.archiveSuccess"));
    } catch (err) {
      setMessage(err?.message || "Archive failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnarchive = async () => {
    if (!trip) return;
    setActionLoading(true);
    setMessage("");
    try {
      await unarchiveTrip(trip.id);
      const updated = await fetchTrip(trip.id);
      setTrip(updated);
      setMessage(t("trips.unarchiveSuccess"));
    } catch (err) {
      setMessage(err?.message || "Unarchive failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!trip) return;
    setActionLoading(true);
    setMessage("");
    try {
      await deleteTrip(trip.id);
      navigate("/trips", { replace: true });
      return;
    } catch (err) {
      setMessage(err?.message || "Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="trip-detail-page">
        <section className="container">
          <p className="muted">{t("labels.loading")}</p>
        </section>
      </main>
    );
  }

  const currentUser = getStoredUser();
  const isOwner = trip && currentUser?.id && trip.userId === currentUser.id;
  const collab = trip?.collaborators?.find((c) => c.userId === currentUser?.id);
  const isEditor = collab && collab.role === "editor";
  const canEdit = isOwner || isEditor;

  const getInitials = (email) => {
    if (!email || typeof email !== "string") return "?";
    const local = email.split("@")[0] || "";
    if (local.length >= 2) return (local[0] + local[1]).toUpperCase();
    if (local.length === 1) return local[0].toUpperCase();
    const domain = (email.split("@")[1] || "")[0];
    return domain ? domain.toUpperCase() : "?";
  };

  const peopleOnTrip = trip
    ? [
        {
          id: "owner",
          email: trip.ownerEmail || (isOwner && currentUser?.email) || t("trips.owner", "Owner"),
          role: "owner",
        },
        ...(trip.collaborators || []).map((c) => ({
          id: c.userId,
          email: c.email || c.userId,
          role: c.role,
        })),
      ]
    : [];

  if (error || !trip) {
    return (
      <main className="trip-detail-page">
        <section className="container">
          <p className="message error" role="alert">
            {error || "Trip not found."}
          </p>
          <Link className="btn ghost" to="/trips">
            ← {t("trips.title")}
          </Link>
        </section>
      </main>
    );
  }

  const commentsListContent = (
    <>
      {commentsLoading ? (
        <p className="muted">{t("labels.loading")}</p>
      ) : comments.length === 0 ? (
        <p className="muted">{t("feed.noComments", "No comments yet.")}</p>
      ) : (
        <ul className="trip-detail-comments-list">
          {comments.map((c) => (
            <li key={c.id} className="trip-detail-comment">
              <strong>{c.authorEmail || t("feed.commentAuthor", "Someone")}:</strong> {c.text}
              {c.imageKey && (
                <a href={`${getApiBaseUrl()}/media/${encodeURIComponent(c.imageKey)}`} target="_blank" rel="noopener noreferrer" className="trip-detail-comment-img-wrap">
                  <img src={`${getApiBaseUrl()}/media/${encodeURIComponent(c.imageKey)}`} alt="" className="trip-detail-comment-img" loading="lazy" />
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
      )}
    </>
  );

  const commentsFormContent = currentUser && (
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
          disabled={commentPosting}
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
          disabled={commentPosting || (!commentInput.trim() && !commentImageFile)}
          title={t("feed.postComment", "Post")}
          aria-label={t("feed.postComment", "Post")}
        >
          <span className="trip-detail-comment-icon" aria-hidden>
            {commentPosting ? (
              <span className="trip-detail-comment-loading">⋯</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            )}
          </span>
        </button>
      </div>
      {commentError && (
        <p className="message error trip-detail-comment-error" role="alert">
          {commentError}
        </p>
      )}
    </form>
  );

  return (
    <main className="trip-detail-page">
      <div className="trip-detail-layout">
        <div className="trip-detail-main">
      <section className="container">
        <header className="page-header" ref={pageHeaderRef}>
          <Link to="/trips" className="page-header-back" aria-label={t("trips.title")} title={t("trips.title")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <div className="page-header-title-wrap">
            <h1 className="page-header-title">{editMode ? t("trips.editTrip", "Edit trip") : trip.name}</h1>
            {!editMode && (
              <span className="trip-status-badge trip-status-badge-header" data-status={trip.status || "upcoming"}>
                {t(`trips.status.${trip.status || "upcoming"}`)}
              </span>
            )}
          </div>
          {isOwner && editMode ? (
            <div className="page-header-actions">
              <button type="button" className="btn ghost btn-sm" onClick={() => { setEditMode(false); setEditForm({ name: trip.name, destination: trip.destination, days: trip.days }); }} disabled={actionLoading}>
                {t("trips.cancel")}
              </button>
              <button type="submit" form="trip-detail-edit-form" className="btn primary btn-sm" disabled={actionLoading}>
                {actionLoading ? t("labels.loading") : t("trips.saveChanges")}
              </button>
            </div>
          ) : (
            (isOwner || isEditor) && (
              <div className={`page-header-actions trip-detail-actions-wrap${!headerActionsUseOverflow ? " trip-detail-actions-expanded" : ""}`}>
                {!editMode && (isOwner || (trip.collaborators?.length > 0)) && (
                  <div className="trip-detail-people-header" role="group" aria-label={t("trips.peopleOnTrip", "People on this trip")}>
                    <div className="trip-detail-people-avatars">
                      {peopleOnTrip.map((person) => (
                        <div
                          key={person.id}
                          className={`trip-detail-avatar-wrap ${person.role === "owner" ? "trip-detail-avatar-owner" : ""}`}
                          title={`${person.email} · ${t(`trips.role.${person.role}`, person.role)}`}
                        >
                          <span className="trip-detail-avatar">
                            {getInitials(person.email)}
                          </span>
                          {canEdit && person.role !== "owner" && (isOwner || person.role === "viewer") && (
                            <button
                              type="button"
                              className="trip-detail-avatar-remove"
                              title={t("trips.removeCollaborator", "Remove from trip")}
                              onClick={async (e) => {
                                e.preventDefault();
                                if (removingUserId) return;
                                setRemovingUserId(person.id);
                                setMessage("");
                                try {
                                  await removeCollaborator(trip.id, person.id);
                                  const updated = await fetchTrip(trip.id);
                                  setTrip(updated);
                                  setMessage(t("trips.collaboratorRemoved", "Collaborator removed."));
                                } catch (err) {
                                  setMessage(err?.message || t("trips.removeCollaboratorFailed", "Could not remove."));
                                } finally {
                                  setRemovingUserId(null);
                                }
                              }}
                              disabled={removingUserId === person.id}
                              aria-label={t("trips.removeCollaborator", "Remove from trip")}
                            >
                              {removingUserId === person.id ? (
                                <span className="trip-detail-avatar-remove-spinner" aria-hidden />
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                      {canEdit && isOwner && (
                        <button
                          type="button"
                          className="trip-detail-avatar-invite"
                          onClick={() => { setShowInviteModal(true); setInviteCode(null); }}
                          aria-label={t("trips.invite")}
                          title={t("trips.invite")}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                          <span className="trip-detail-avatar-invite-label">{t("trips.invite")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="trip-detail-actions-desktop" aria-hidden={headerActionsUseOverflow}>
                  <button type="button" className="page-header-action-round" onClick={() => setEditMode(true)} disabled={actionLoading} title={t("trips.edit")} aria-label={t("trips.edit")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  {trip.status !== "archived" ? (
                    <button type="button" className="page-header-action-round" onClick={handleArchive} disabled={actionLoading} title={t("trips.archive")} aria-label={t("trips.archive")}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
                    </button>
                  ) : (
                    <button type="button" className="page-header-action-round" onClick={handleUnarchive} disabled={actionLoading} title={t("trips.unarchive")} aria-label={t("trips.unarchive")}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
                    </button>
                  )}
                  {isOwner && (
                    <button type="button" className="page-header-action-round trip-detail-action-delete" onClick={() => setShowDeleteConfirm(true)} disabled={actionLoading} title={t("trips.delete")} aria-label={t("trips.delete")}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  )}
                  <div className="trip-detail-actions-options-wrap" ref={optionsMenuRef}>
                    <button
                      type="button"
                      className="page-header-action-round"
                      onClick={(e) => { e.stopPropagation(); setOptionsMenuOpen((o) => !o); setActionsMenuOpen(false); }}
                      aria-expanded={optionsMenuOpen}
                      aria-haspopup="true"
                      aria-label={t("trips.moreActions", "More actions")}
                      title={t("trips.moreActions", "More actions")}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                    {optionsMenuOpen && (
                      <div className="trip-detail-actions-dropdown" role="menu">
                        {trip.status !== "completed" && <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => { handleStatusChange("completed"); setOptionsMenuOpen(false); }}>{t("trips.markComplete")}</button>}
                        <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={async () => { setActionLoading(true); setMessage(""); try { const updated = await updateTrip(trip.id, { isPublic: !trip.isPublic }); setTrip(updated); setMessage(updated.isPublic ? t("trips.makePublicSuccess") : t("trips.makePrivateSuccess")); } catch (err) { setMessage(err?.message || "Update failed."); } finally { setActionLoading(false); } setOptionsMenuOpen(false); }}>{trip.isPublic ? t("trips.makePrivate") : t("trips.makePublic")}</button>
                        <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => handleCopyLink(true)}>{shareLinkCopied ? t("trips.linkCopied") : t("trips.copyLink")}</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="trip-detail-actions-mobile" ref={actionsMenuRef} aria-hidden={!headerActionsUseOverflow}>
                  <button type="button" className="page-header-action-round" onClick={(e) => { e.stopPropagation(); setActionsMenuOpen((o) => !o); }} aria-expanded={actionsMenuOpen} aria-haspopup="true" aria-label={t("trips.tripActions", "Trip actions")} title={t("trips.tripActions", "Trip actions")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                  {actionsMenuOpen && (
                    <div className="trip-detail-actions-dropdown" role="menu">
                      <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => { setEditMode(true); setActionsMenuOpen(false); }}>{t("trips.edit")}</button>
                      {trip.status !== "completed" && <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => { handleStatusChange("completed"); setActionsMenuOpen(false); }}>{t("trips.markComplete")}</button>}
                      {trip.status !== "archived" ? <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => { handleArchive(); setActionsMenuOpen(false); }}>{t("trips.archive")}</button> : <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => { handleUnarchive(); setActionsMenuOpen(false); }}>{t("trips.unarchive")}</button>}
                      <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={async () => { setActionLoading(true); setMessage(""); try { const updated = await updateTrip(trip.id, { isPublic: !trip.isPublic }); setTrip(updated); setMessage(updated.isPublic ? t("trips.makePublicSuccess") : t("trips.makePrivateSuccess")); } catch (err) { setMessage(err?.message || "Update failed."); } finally { setActionLoading(false); } setActionsMenuOpen(false); }}>{trip.isPublic ? t("trips.makePrivate") : t("trips.makePublic")}</button>
                      {isOwner && <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => { setShowInviteModal(true); setInviteCode(null); setActionsMenuOpen(false); }}>{t("trips.invite")}</button>}
                      <button type="button" className="trip-detail-actions-dropdown-item" role="menuitem" onClick={() => handleCopyLink(true)}>{shareLinkCopied ? t("trips.linkCopied") : t("trips.copyLink")}</button>
                      {isOwner && <button type="button" className="trip-detail-actions-dropdown-item trip-detail-actions-dropdown-item-danger" role="menuitem" onClick={() => { setShowDeleteConfirm(true); setActionsMenuOpen(false); }}>{t("trips.delete")}</button>}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </header>

          {isOwner && editMode ? (
            <form id="trip-detail-edit-form" onSubmit={handleSaveEdit} className="trip-detail-edit-form">
              <div className="field">
                <label>{t("tripPlanner.saveTrip.nameLabel")}</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label>{t("tripPlanner.form.destinationLabel")}</label>
                <input
                  value={editForm.destination}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, destination: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="field">
                <label>{t("tripPlanner.form.daysLabel")}</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={editForm.days}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      days: Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                    }))
                  }
                />
              </div>
            </form>
          ) : (
            <>
              {!editMode && trip.id && (
                <div className="trip-detail-hero">
                  <div className="trip-detail-hero-carousel">
                    <div
                      className="trip-detail-hero-track"
                      style={{ transform: `translateX(-${heroSlideIndex * 100}%)` }}
                      role="list"
                      aria-label={t("trips.galleryTitle", "Gallery")}
                    >
                      <div className="trip-detail-hero-slide" role="listitem">
                        {trip.thumbnailKey ? (
                          <img
                            src={`${getApiBaseUrl()}/media/${encodeURIComponent(trip.thumbnailKey)}`}
                            alt=""
                            className="trip-detail-hero-img"
                          />
                        ) : (
                          <div className="trip-detail-hero-placeholder" aria-hidden />
                        )}
                      </div>
                      {(trip.gallery || []).map((item) => (
                        <div key={item.id} className="trip-detail-hero-slide" role="listitem">
                          <img
                            src={`${getApiBaseUrl()}/media/${encodeURIComponent(item.imageKey)}`}
                            alt=""
                            className="trip-detail-hero-img"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {heroSlideCount > 1 && (
                    <div className="trip-detail-hero-dots" role="tablist" aria-label={t("trips.carouselDots", "Carousel")}>
                      {Array.from({ length: heroSlideCount }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          role="tab"
                          aria-selected={heroSlideIndex === i}
                          aria-label={t("trips.goToSlide", { n: i + 1 }, "Go to slide {{n}}")}
                          className={`trip-detail-hero-dot ${heroSlideIndex === i ? "is-active" : ""}`}
                          onClick={() => setHeroSlideIndex(i)}
                        />
                      ))}
                    </div>
                  )}
                  <div className="trip-detail-hero-overlay" aria-hidden>
                    <p className="trip-detail-hero-destination">{trip.destination}</p>
                    <span className="trip-detail-hero-days">{t("trips.days", { count: trip.days })}</span>
                  </div>
                  <div className="trip-detail-hero-actions">
                    {(isOwner || isEditor) && (
                      <label
                        className="trip-detail-hero-action trip-detail-hero-edit-cover"
                        title={trip.thumbnailKey ? t("trips.editCoverPic", "Edit cover photo") : t("trips.addCover", "Add cover")}
                        aria-label={trip.thumbnailKey ? t("trips.editCoverPic", "Edit cover photo") : t("trips.addCover", "Add cover")}
                      >
                        <span className="trip-detail-hero-action-icon" aria-hidden>
                          {coverLoading ? (
                            <span className="trip-detail-hero-upload-spinner" aria-hidden />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          )}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="sr-only"
                          disabled={coverLoading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || file.size > 5 * 1024 * 1024) return;
                            e.target.value = "";
                            setCoverLoading(true);
                            setMessage("");
                            try {
                              const { uploadUrl, key } = await getUploadPresign(file.size, file.type || "image/jpeg");
                              await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "image/jpeg" } });
                              const updated = await updateTrip(trip.id, { thumbnailKey: key });
                              setTrip(updated);
                              setMessage(t("trips.coverUpdated", "Cover updated."));
                            } catch (err) {
                              setMessage(err?.message || "Failed to update cover.");
                            } finally {
                              setCoverLoading(false);
                            }
                          }}
                        />
                      </label>
                    )}
                    <Link
                      to={`/trips/${trip.id}/gallery`}
                      className="trip-detail-hero-action trip-detail-hero-gallery-link"
                      title={t("trips.viewGallery", "View gallery")}
                      aria-label={t("trips.viewGallery", "View gallery")}
                    >
                      <span className="trip-detail-hero-action-icon" aria-hidden>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </span>
                      <span className="trip-detail-hero-action-label">{t("trips.viewGallery", "View gallery")}</span>
                    </Link>
                  </div>
                </div>
              )}
              {!isOwner && trip.ownerEmail && (
                <p className="muted trip-detail-owner">{t("feed.by")} {trip.ownerEmail}</p>
              )}
            </>
          )}

          {message && (
            <p
              className={
                message.includes("failed") || message.includes("Error")
                  ? "message error"
                  : "message success"
              }
              role="status"
            >
              {message}
            </p>
          )}

        {!editMode && (() => {
          const hubs = getTransportHubsForDestination(trip.destination);
          const hasMap = !!mapCenter;
          const hasTransport = !!hubs;
          if (!hasMap && !hasTransport) return null;

          return (
            <div className="trip-detail-map-transport-grid">
              {hasMap && (
                <div className="trip-detail-map">
                  <div className="trip-detail-map-header">
                    <h2>{t("trips.map")}</h2>
                    <button
                      type="button"
                      className="btn ghost btn-sm"
                      onClick={() => {
                        if (showMyLocation) {
                          stopWatching();
                          setShowMyLocation(false);
                        } else {
                          clearLocationError();
                          startWatching();
                          setShowMyLocation(true);
                        }
                      }}
                      disabled={locationLoading}
                      aria-pressed={showMyLocation}
                      title={locationLoading ? t("trips.locationLoading") : showMyLocation ? t("trips.hideMyLocation") : t("trips.showMyLocation")}
                      aria-label={locationLoading ? t("trips.locationLoading") : showMyLocation ? t("trips.hideMyLocation") : t("trips.showMyLocation")}
                    >
                      {locationLoading
                        ? t("trips.locationLoading")
                        : showMyLocation
                          ? t("trips.hideMyLocation")
                          : t("trips.showMyLocation")}
                    </button>
                  </div>
                  {locationError && (
                    <p className="message error trip-detail-location-error" role="alert">
                      {locationError}
                    </p>
                  )}
                  {showMyLocation && currentLocationPosition && itineraryMarkers.length > 0 && (() => {
                    const closest = getClosestStop(currentLocationPosition, itineraryMarkers);
                    if (!closest) return null;
                    const { distanceKm, marker, estimatedMinutes } = closest;
                    const name = marker?.name || t("trips.nextStop", "Next stop");
                    if (distanceKm < 0.2) {
                      return (
                        <p className="trip-detail-eta trip-detail-eta-close" role="status">
                          {t("trips.youAreCloseTo", { name }, "Very close to {{name}}")}
                        </p>
                      );
                    }
                    return (
                      <>
                        <p className="trip-detail-eta" role="status">
                          {t("trips.etaToNext", { km: distanceKm, name, min: estimatedMinutes }, "~{{km}} km to {{name}} · ~{{min}} min")}
                        </p>
                        {distanceKm > 15 && (
                          <p className="trip-detail-eta-alert" role="status">
                            {t("trips.farFromNextStop", "Far from next stop — consider adjusting your schedule.")}
                          </p>
                        )}
                      </>
                    );
                  })()}
                  {mapLoading && (
                    <p className="muted trip-detail-map-loading">{t("labels.loading")}</p>
                  )}
                  {!mapLoading && (
                    <MapView
                      center={mapCenter}
                      destinationLabel={trip.destination}
                      itineraryMarkers={itineraryMarkers}
                      dayRoutes={dayRoutes}
                      currentLocation={showMyLocation ? currentLocationPosition : null}
                    />
                  )}
                </div>
              )}
              {hasTransport && (
                <div className="trip-detail-transport">
                  <h2>{t("trips.transportation")}</h2>
                  <ul className="transport-hubs-list">
                    <li>
                      <strong>{t("trips.nearestAirport")}:</strong> {hubs.airport?.name} — {hubs.airport?.distance}
                    </li>
                    <li>
                      <strong>{t("trips.nearestTrain")}:</strong> {hubs.train?.name} — {hubs.train?.distance}
                    </li>
                    <li>
                      <strong>{t("trips.nearestBus")}:</strong> {hubs.bus?.name} — {hubs.bus?.distance}
                    </li>
                  </ul>
                </div>
              )}
              {!editMode && trip.id && (
                <div className="trip-detail-at-a-glance">
                  <h2>{t("trips.atAGlance", "At a glance")}</h2>
                  <dl className="trip-detail-at-a-glance-list">
                    <div className="trip-detail-at-a-glance-row">
                      <dt>{t("trips.destination", "Destination")}</dt>
                      <dd>{trip.destination}</dd>
                    </div>
                    <div className="trip-detail-at-a-glance-row">
                      <dt>{t("trips.duration", "Duration")}</dt>
                      <dd>{t("trips.days", "{{count}} days", { count: trip.days })}</dd>
                    </div>
                    <div className="trip-detail-at-a-glance-row">
                      <dt>{t("trips.statusLabel", "Status")}</dt>
                      <dd><span className="trip-status-badge" data-status={trip.status || "upcoming"}>{t(`trips.status.${trip.status || "upcoming"}`)}</span></dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="btn ghost btn-sm trip-detail-at-a-glance-comments"
                    onClick={() => setCommentsPanelOpen(true)}
                    aria-label={t("feed.comments", "Comments")}
                  >
                    <span className="trip-detail-at-a-glance-comments-icon" aria-hidden>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </span>
                    {t("trips.viewComments", "View comments")}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {!editMode && trip.itinerary && trip.itinerary.length > 0 && (
          <div className="trip-detail-itinerary">
            <h2>Itinerary</h2>
            <p className="trip-detail-itinerary-map-hint muted">{t("trips.itineraryMapHint", "Day colors match the route lines on the map above.")}</p>
            {trip.itinerary.map((day, i) => (
              <article key={day.day || i} className="trip-day trip-day-colored">
                <span className="trip-day-color-bar" aria-hidden style={{ backgroundColor: getDayRouteColor(i) }} />
                <h3>{t("tripPlanner.results.dayLabel", { day: day.day })}</h3>
                {day.area && <p className="muted">{day.area}</p>}
                {day.slots?.map((slot) => (
                  <section key={slot.timeOfDay}>
                    <h4>{t(`tripPlanner.slots.${slot.timeOfDay}`)}</h4>
                    <ul>
                      {slot.items?.map((item, j) => (
                        <li key={j}>{item.name}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </article>
            ))}
          </div>
        )}
      </section>

        {!editMode && trip?.id && (
          <>
            <button
              type="button"
              className="trip-detail-chat-fab"
              onClick={() => setChatPanelOpen((open) => !open)}
              title={t("trips.chat", "Trip chat")}
              aria-label={t("trips.chat", "Trip chat")}
              aria-expanded={chatPanelOpen}
            >
              <span className="trip-detail-chat-fab-icon" aria-hidden>💬</span>
              {messages.length > 0 && (
                <span className="trip-detail-chat-fab-badge">{messages.length > 99 ? "99+" : messages.length}</span>
              )}
            </button>
            {chatPanelOpen && (
              <div className="trip-detail-chat-panel" role="dialog" aria-label={t("trips.chat", "Trip chat")}>
                <div className="trip-detail-chat-panel-inner">
                  <div className="trip-detail-chat-panel-header">
                    <h2 className="trip-detail-chat-panel-title">{t("trips.chat", "Trip chat")}</h2>
                    <button
                      type="button"
                      className="btn ghost btn-sm trip-detail-chat-panel-close"
                      onClick={() => setChatPanelOpen(false)}
                      title={t("trips.close", "Close")}
                      aria-label={t("trips.close", "Close")}
                    >
                      ×
                    </button>
                  </div>
                  <div className="trip-detail-chat-messages">
                    {messages.length === 0 ? (
                      <p className="muted">{t("trips.chatEmpty", "No messages yet. Say something!")}</p>
                    ) : (
                      [...messages].reverse().map((msg) => (
                        <div key={msg.id} className="trip-detail-chat-message">
                          <span className="trip-detail-chat-sender">
                            {msg.userId === currentUser?.id ? t("trips.chatYou", "You") : t("trips.chatMember", "Trip member")}:
                          </span>{" "}
                          {msg.imageKey && (
                            <a
                              href={`${getApiBaseUrl()}/media/${encodeURIComponent(msg.imageKey)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="trip-detail-chat-image-wrap"
                            >
                              <img
                                src={`${getApiBaseUrl()}/media/${encodeURIComponent(msg.imageKey)}`}
                                alt=""
                                className="trip-detail-chat-image"
                                loading="lazy"
                              />
                            </a>
                          )}
                          {msg.text && <span className="trip-detail-chat-text">{msg.text}</span>}
                          <span className="trip-detail-chat-time">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {canEdit && (
                    <form className="trip-detail-chat-form" onSubmit={handleSendMessage}>
                      {chatImageFile && (
                        <div className="trip-detail-chat-attach-preview">
                          <span>{chatImageFile.name}</span>
                          <button type="button" className="btn ghost btn-sm" onClick={() => setChatImageFile(null)} aria-label={t("trips.removeImage", "Remove image")}>
                            ×
                          </button>
                        </div>
                      )}
                      <div className="trip-detail-chat-form-row">
                        <input
                          type="text"
                          className="trip-detail-chat-input"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={t("trips.chatPlaceholder", "Type a message...")}
                          maxLength={500}
                          disabled={chatLoading}
                          aria-label={t("trips.chatPlaceholder", "Type a message...")}
                        />
                        <label className="trip-detail-chat-icon-btn trip-detail-chat-attach" title={t("trips.attachImage", "Attach image")}>
                          <span className="trip-detail-chat-icon" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size <= 5 * 1024 * 1024) setChatImageFile(file);
                              else if (file) setChatError(t("trips.imageTooLarge", "Image must be 5 MB or less."));
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <button type="submit" className="trip-detail-chat-icon-btn trip-detail-chat-send" disabled={chatLoading || (!chatInput.trim() && !chatImageFile)} aria-label={t("trips.chatSend", "Send")} title={t("trips.chatSend", "Send")}>
                          <span className="trip-detail-chat-icon" aria-hidden>
                            {chatLoading ? (
                              <span className="trip-detail-chat-loading">⋯</span>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                            )}
                          </span>
                        </button>
                      </div>
                    </form>
                  )}
                  {chatError && (
                    <p className="message error trip-detail-chat-error" role="alert">
                      {chatError}
                    </p>
                  )}
                </div>
              </div>
          )}
          </>
        )}
        </div>

        {!editMode && trip.id && (
          <div className="trip-detail-comments-desktop-wrap" ref={commentsDesktopRef}>
            <aside
              className="trip-detail-comments-sidebar"
              data-open={commentsPanelOpen}
              aria-hidden={!commentsPanelOpen}
              role="complementary"
              aria-label={t("feed.comments", "Comments")}
            >
              <div className="trip-detail-comments-sidebar-inner">
                <div className="trip-detail-comments-sidebar-header">
                  <h2 className="trip-detail-comments-sidebar-title">{t("feed.comments", "Comments")}</h2>
                  <button
                    type="button"
                    className="trip-detail-comments-sidebar-close"
                    onClick={() => setCommentsPanelOpen(false)}
                    title={t("trips.close", "Close")}
                    aria-label={t("trips.close", "Close")}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18l6-6-6-6"/></svg>
                  </button>
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
                  {comments.length > 0 && (
                    <span className="trip-detail-comments-toggle-count" aria-hidden>{comments.length > 99 ? "99+" : comments.length}</span>
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t("trips.inviteTitle")}</h2>
            {!inviteCode ? (
              <>
                <div className="field">
                  <label htmlFor="invite-role-select">{t("trips.inviteRole")}</label>
                  <select
                    id="invite-role-select"
                    className="invite-role-select"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    aria-label={t("trips.inviteRole")}
                  >
                    <option value="viewer">{t("trips.inviteRole.viewer")}</option>
                    <option value="editor">{t("trips.inviteRole.editor")}</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn primary"
                    disabled={actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const data = await createInvite(trip.id, inviteRole);
                        setInviteCode(data.code);
                        setInviteExpiresAt(data.expiresAt);
                      } catch (err) {
                        setMessage(err?.message || "Failed to create invite.");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                  >
                    {actionLoading ? t("labels.loading") : t("trips.createInvite")}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setShowInviteModal(false)}
                  >
                    {t("trips.cancel")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="invite-code-label">{t("trips.inviteCodeLabel")}</p>
                <p className="invite-code">{inviteCode}</p>
                <button
                  type="button"
                  className="btn small primary"
                  onClick={() => {
                    navigator.clipboard?.writeText(inviteCode);
                    setMessage(t("trips.inviteCopied"));
                  }}
                >
                  {t("trips.copyCode")}
                </button>
                {inviteExpiresAt && (
                  <p className="muted small">{t("trips.inviteExpires")}</p>
                )}
                <div className="modal-actions" style={{ marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteCode(null);
                    }}
                  >
                    {t("trips.close")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t("trips.confirmDelete")}</h2>
            <div className="modal-actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
                disabled={actionLoading}
              >
                {actionLoading ? t("labels.loading") : t("trips.delete")}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
              >
                {t("trips.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {!editMode && trip?.id && (
        <>
          <button
            type="button"
            className="trip-detail-comments-fab"
            onClick={() => setCommentsPanelOpen((open) => !open)}
            title={t("feed.comments", "Comments")}
            aria-label={t("feed.comments", "Comments")}
            aria-expanded={commentsPanelOpen}
          >
            <span className="trip-detail-comments-fab-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            {comments.length > 0 && (
              <span className="trip-detail-comments-fab-badge" aria-hidden>{comments.length > 99 ? "99+" : comments.length}</span>
            )}
          </button>
          {commentsPanelOpen && (
            <div className="trip-detail-comments-panel-mobile" ref={commentsPanelRef} role="dialog" aria-modal="true" aria-label={t("feed.comments", "Comments")}>
              <div className="trip-detail-comments-panel-inner">
                <div className="trip-detail-comments-panel-header">
                  <h2 className="trip-detail-comments-panel-title">{t("feed.comments", "Comments")}</h2>
                  <button
                    type="button"
                    className="btn ghost btn-sm trip-detail-comments-panel-close"
                    onClick={() => setCommentsPanelOpen(false)}
                    title={t("trips.close", "Close")}
                    aria-label={t("trips.close", "Close")}
                  >
                    ×
                  </button>
                </div>
                <div className="trip-detail-comments-panel-body">
                  {commentsListContent}
                </div>
                <div className="trip-detail-comments-panel-footer">
                  {commentsFormContent}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default TripDetail;

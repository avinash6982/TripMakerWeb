import { useEffect, useState } from "react";
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
  postGalleryImage,
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
  const [galleryAddLoading, setGalleryAddLoading] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

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

  return (
    <main className="trip-detail-page">
      <section className="container">
        <header className="page-header">
          <Link to="/trips" className="page-header-back" aria-label={t("trips.title")} title={t("trips.title")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="page-header-title">{editMode ? t("trips.editTrip", "Edit trip") : trip.name}</h1>
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
              <div className="page-header-actions">
                <button type="button" className="btn ghost btn-sm" onClick={() => setEditMode(true)} disabled={actionLoading}>
                  {t("trips.edit")}
                </button>
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
              <div className="trip-detail-meta-row">
              <p className="muted">{trip.destination}</p>
              <div className="trip-detail-meta">
                <span>{t("trips.days", { count: trip.days })}</span>
                <span
                  className="trip-status-badge"
                  data-status={trip.status || "upcoming"}
                >
                  {t(`trips.status.${trip.status || "upcoming"}`)}
                </span>
                <button
                  type="button"
                  className="btn small ghost trip-detail-copy-link"
                  onClick={async () => {
                    const url = `${window.location.origin}/trips/${trip.id}`;
                    try {
                      await navigator.clipboard.writeText(url);
                      setShareLinkCopied(true);
                      setTimeout(() => setShareLinkCopied(false), 2000);
                    } catch {
                      setMessage(t("trips.copyLinkFailed"));
                    }
                  }}
                  aria-live="polite"
                >
                  {shareLinkCopied ? t("trips.linkCopied") : t("trips.copyLink")}
                </button>
              </div>

              {(isOwner || isEditor) && (
              <div className="trip-detail-action-bar">
                {trip.status !== "completed" && (
                  <button
                    type="button"
                    className="btn small primary"
                    onClick={() => handleStatusChange("completed")}
                    disabled={actionLoading}
                  >
                    {t("trips.markComplete")}
                  </button>
                )}
                {trip.status !== "archived" ? (
                  <button
                    type="button"
                    className="btn small ghost"
                    onClick={handleArchive}
                    disabled={actionLoading}
                  >
                    {t("trips.archive")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn small ghost"
                    onClick={handleUnarchive}
                    disabled={actionLoading}
                  >
                    {t("trips.unarchive")}
                  </button>
                )}
                <button
                  type="button"
                  className={`btn small ${trip.isPublic ? "primary" : "ghost"}`}
                  onClick={async () => {
                    setActionLoading(true);
                    setMessage("");
                    try {
                      const updated = await updateTrip(trip.id, {
                        isPublic: !trip.isPublic,
                      });
                      setTrip(updated);
                      setMessage(
                        updated.isPublic
                          ? t("trips.makePublicSuccess")
                          : t("trips.makePrivateSuccess")
                      );
                    } catch (err) {
                      setMessage(err?.message || "Update failed.");
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                >
                  {trip.isPublic ? t("trips.makePrivate") : t("trips.makePublic")}
                </button>
                {isOwner && (
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={() => {
                    setShowInviteModal(true);
                    setInviteCode(null);
                  }}
                  disabled={actionLoading}
                >
                  {t("trips.invite")}
                </button>
                )}
                {isOwner && (
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={actionLoading}
                >
                  {t("trips.delete")}
                </button>
                )}
              </div>
              )}
              </div>
              {!isOwner && trip.ownerEmail && (
                <p className="muted trip-detail-owner">{t("feed.by")} {trip.ownerEmail}</p>
              )}

              {(isOwner || (trip.collaborators?.length > 0)) && (
                <div className="trip-detail-people">
                  <h3 className="trip-detail-people-title">{t("trips.peopleOnTrip", "People on this trip")}</h3>
                  <ul className="trip-detail-people-list" aria-label={t("trips.peopleOnTrip", "People on this trip")}>
                    <li className="trip-detail-people-item trip-detail-people-owner">
                      <span className="trip-detail-people-email">{trip.ownerEmail || (isOwner && currentUser?.email) || t("trips.owner", "Owner")}</span>
                      <span className="trip-detail-people-role">{t("trips.role.owner", "Owner")}</span>
                    </li>
                    {(trip.collaborators || []).map((c) => (
                      <li key={c.userId} className="trip-detail-people-item">
                        <span className="trip-detail-people-email">{c.email || c.userId}</span>
                        <span className="trip-detail-people-role">{t(`trips.role.${c.role}`, c.role)}</span>
                        {canEdit && (isOwner || c.role === "viewer") && (
                            <button
                              type="button"
                              className="btn ghost btn-sm trip-detail-people-remove"
                              onClick={async () => {
                                if (removingUserId) return;
                                setRemovingUserId(c.userId);
                                setMessage("");
                                try {
                                  await removeCollaborator(trip.id, c.userId);
                                  const updated = await fetchTrip(trip.id);
                                  setTrip(updated);
                                  setMessage(t("trips.collaboratorRemoved", "Collaborator removed."));
                                } catch (err) {
                                  setMessage(err?.message || t("trips.removeCollaboratorFailed", "Could not remove."));
                                } finally {
                                  setRemovingUserId(null);
                                }
                              }}
                              disabled={removingUserId === c.userId}
                              aria-label={t("trips.removeCollaborator", "Remove from trip")}
                            >
                              {removingUserId === c.userId ? t("labels.loading") : t("trips.remove", "Remove")}
                            </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
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

        {!editMode && trip.id && (
          <div className="trip-detail-gallery-section">
            <h2>{t("trips.galleryTitle", "Gallery")}</h2>
            {trip.thumbnailKey && (
              <div className="trip-detail-cover">
                <img
                  src={`${getApiBaseUrl()}/media/${encodeURIComponent(trip.thumbnailKey)}`}
                  alt=""
                  className="trip-detail-cover-img"
                />
              </div>
            )}
            {(isOwner || isEditor) && (
              <div className="trip-detail-cover-actions">
                <label className="btn ghost btn-sm">
                  <span>{trip.thumbnailKey ? t("trips.changeCover", "Change cover") : t("trips.addCover", "Add cover")}</span>
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
                <label className="btn ghost btn-sm">
                  <span>{t("trips.addToGallery", "Add to gallery")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="sr-only"
                    disabled={galleryAddLoading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || file.size > 5 * 1024 * 1024) return;
                      e.target.value = "";
                      setGalleryAddLoading(true);
                      setMessage("");
                      try {
                        const { uploadUrl, key } = await getUploadPresign(file.size, file.type || "image/jpeg");
                        await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "image/jpeg" } });
                        await postGalleryImage(trip.id, { imageKey: key });
                        const updated = await fetchTrip(trip.id);
                        setTrip(updated);
                        setMessage(t("trips.addedToGallery", "Added to gallery."));
                      } catch (err) {
                        setMessage(err?.message || "Failed to add to gallery.");
                      } finally {
                        setGalleryAddLoading(false);
                      }
                    }}
                  />
                </label>
              </div>
            )}
            <div className="trip-detail-gallery-row">
              {(trip.gallery || []).slice(0, 6).map((item) => (
                <a
                  key={item.id}
                  href={`${getApiBaseUrl()}/media/${encodeURIComponent(item.imageKey)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trip-detail-gallery-thumb"
                >
                  <img src={`${getApiBaseUrl()}/media/${encodeURIComponent(item.imageKey)}`} alt="" />
                </a>
              ))}
            </div>
            <Link to={`/trips/${trip.id}/gallery`} className="btn ghost btn-sm trip-detail-gallery-link">
              {t("trips.viewGallery", "View gallery")} ({(trip.gallery || []).length})
            </Link>
          </div>
        )}

        {!editMode && mapCenter && (
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

        {!editMode && (() => {
          const hubs = getTransportHubsForDestination(trip.destination);
          const transportMode = trip.transportMode || null;

          const handleTransportModeChange = async (mode) => {
            const next = mode === transportMode ? null : mode;
            setActionLoading(true);
            setMessage("");
            try {
              const updated = await updateTrip(trip.id, {
                transportMode: next === null ? null : next,
              });
              setTrip(updated);
              setMessage(t("trips.updateSuccess"));
            } catch (err) {
              setMessage(err?.message || "Update failed.");
            } finally {
              setActionLoading(false);
            }
          };

          if (!hubs) return null;
          const modeToHub = {
            flight: hubs.airport,
            train: hubs.train,
            bus: hubs.bus,
          };
          return (
            <div className="trip-detail-transport">
              <h2>{t("trips.transportation")}</h2>
              {canEdit && (
              <>
              <p className="trip-detail-transport-label">{t("trips.howAreYouGettingThere")}</p>
              <div className="transport-mode-chips">
                {["flight", "train", "bus"].map((mode) => {
                  const hub = modeToHub[mode];
                  if (!hub) return null;
                  const isSelected = transportMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      className={`chip ${isSelected ? "chip-selected" : ""}`}
                      onClick={() => handleTransportModeChange(mode)}
                      disabled={actionLoading}
                      aria-pressed={isSelected}
                    >
                      {t(`trips.transportMode.${mode}`)}
                    </button>
                  );
                })}
              </div>
              </>
              )}
              <ul className="transport-hubs-list">
                <li className={transportMode === "flight" ? "transport-hub-selected" : ""}>
                  <strong>{t("trips.nearestAirport")}:</strong> {hubs.airport?.name} — {hubs.airport?.distance}
                </li>
                <li className={transportMode === "train" ? "transport-hub-selected" : ""}>
                  <strong>{t("trips.nearestTrain")}:</strong> {hubs.train?.name} — {hubs.train?.distance}
                </li>
                <li className={transportMode === "bus" ? "transport-hub-selected" : ""}>
                  <strong>{t("trips.nearestBus")}:</strong> {hubs.bus?.name} — {hubs.bus?.distance}
                </li>
              </ul>
            </div>
          );
        })()}

        {!editMode && trip.id && (
          <div className="trip-detail-comments">
            <h2>{t("feed.comments", "Comments")}</h2>
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
            {currentUser && (
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
                    type="submit"
                    className="btn primary btn-sm"
                    disabled={commentPosting || (!commentInput.trim() && !commentImageFile)}
                  >
                    {commentPosting ? t("labels.loading") : t("feed.postComment", "Post")}
                  </button>
                </div>
              </form>
            )}
            {commentError && (
              <p className="message error trip-detail-comment-error" role="alert">
                {commentError}
              </p>
            )}
          </div>
        )}

        {!editMode && trip.itinerary && trip.itinerary.length > 0 && (
          <div className="trip-detail-itinerary">
            <h2>Itinerary</h2>
            {trip.itinerary.map((day, i) => (
              <article key={day.day || i} className="trip-day">
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
            className="trip-detail-chat-fab"
            onClick={() => setChatPanelOpen((open) => !open)}
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
    </main>
  );
};

export default TripDetail;

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
} from "../services/trips";
import { getStoredUser } from "../services/auth";
import { getTransportHubsForDestination } from "../data/transportHubs";

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
        <div className="trip-detail-header">
          <Link className="btn ghost back-link" to="/trips">
            ← {t("trips.title")}
          </Link>

          {isOwner && editMode ? (
            <form onSubmit={handleSaveEdit} className="trip-detail-edit-form">
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
              <div className="trip-detail-actions">
                <button
                  type="submit"
                  className="btn primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? t("labels.loading") : t("trips.saveChanges")}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setEditMode(false);
                    setEditForm({
                      name: trip.name,
                      destination: trip.destination,
                      days: trip.days,
                    });
                  }}
                  disabled={actionLoading}
                >
                  {t("trips.cancel")}
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1>{trip.name}</h1>
              <p className="muted">{trip.destination}</p>
              <div className="trip-detail-meta">
                <span>{t("trips.days", { count: trip.days })}</span>
                <span
                  className="trip-status-badge"
                  data-status={trip.status || "upcoming"}
                >
                  {t(`trips.status.${trip.status || "upcoming"}`)}
                </span>
              </div>

              {(isOwner || isEditor) && (
              <div className="trip-detail-action-bar">
                <button
                  type="button"
                  className="btn small ghost"
                  onClick={() => setEditMode(true)}
                  disabled={actionLoading}
                >
                  {t("trips.edit")}
                </button>
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
        </div>

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
    </main>
  );
};

export default TripDetail;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MapView from "../components/MapView";
import { getPlaceSuggestionsForDestination } from "../data/placeSuggestions";
import {
  buildOpenStreetMapLink,
  collectPlaceNamesFromPlan,
  DESTINATION_SUGGESTIONS,
  geocodePlace,
  getDestinationCoordinates,
} from "../services/geocode";
import { createTrip } from "../services/trips";
import { generateTripPlan } from "../services/tripPlanner";

const paceOptions = [
  { value: "relaxed", labelKey: "tripPlanner.pace.relaxed" },
  { value: "balanced", labelKey: "tripPlanner.pace.balanced" },
  { value: "fast", labelKey: "tripPlanner.pace.fast" },
];

const Home = () => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState({
    destination: "",
    days: 3,
    pace: "balanced",
  });
  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [mapState, setMapState] = useState({
    status: "idle",
    data: null,
    message: "",
  });
  const [editingDay, setEditingDay] = useState(null);
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [itineraryMarkers, setItineraryMarkers] = useState([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTripName, setSaveTripName] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "days") {
      const parsed = Number(value);
      const nextDays = Number.isFinite(parsed)
        ? Math.min(10, Math.max(1, Math.round(parsed)))
        : 1;
      setFormState((prev) => ({ ...prev, days: nextDays }));
      return;
    }
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedDestination = formState.destination.trim();
    if (!trimmedDestination) {
      setMessage(t("tripPlanner.status.missingDestination"));
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const payload = {
        destination: trimmedDestination,
        days: formState.days,
        pace: formState.pace,
        seed: Date.now(),
      };
      const result = await generateTripPlan(payload);
      setPlan(result);
      setEditingDay(null);
      setStatus("ready");
      loadMapForDestination(result.destination || trimmedDestination);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || t("tripPlanner.status.error"));
    }
  };

  const loadMapForDestination = async (destination) => {
    setMapState({ status: "loading", data: null, message: "" });
    setItineraryMarkers([]);
    try {
      const coordinates = await getDestinationCoordinates(destination);
      if (!coordinates) {
        setMapState({
          status: "empty",
          data: null,
          message: t("tripPlanner.map.noResults"),
        });
        return;
      }
      setMapState({
        status: "ready",
        data: {
          ...coordinates,
          link: buildOpenStreetMapLink(coordinates),
        },
        message: "",
      });
    } catch (error) {
      setMapState({
        status: "error",
        data: null,
        message: t("tripPlanner.map.error"),
      });
    }
  };

  // Geocode itinerary places for map markers (rate-limited: 1 req ~1.2s for Nominatim policy)
  useEffect(() => {
    if (!plan || mapState.status !== "ready" || !mapState.data) return;
    setItineraryMarkers([]);
    let cancelled = false;
    const places = collectPlaceNamesFromPlan(plan, 10);
    const run = async () => {
      for (let i = 0; i < places.length; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, i === 0 ? 0 : 1200));
        if (cancelled) return;
        const coords = await geocodePlace(places[i].name, plan.destination);
        if (cancelled) return;
        if (coords) {
          setItineraryMarkers((prev) => [
            ...prev,
            { ...coords, category: places[i].category },
          ]);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [plan, mapState.status, mapState.data]);

  const handleRegenerateDay = async (dayIndex) => {
    if (!plan) {
      return;
    }
    setRegeneratingDay(dayIndex);
    setMessage("");
    try {
      const refreshed = await generateTripPlan({
        destination: plan.destination,
        days: plan.days,
        pace: plan.pace,
        seed: Date.now() + dayIndex,
      });
      setPlan((prev) => {
        if (!prev) {
          return prev;
        }
        const itinerary = prev.itinerary.map((day, index) =>
          index === dayIndex ? refreshed.itinerary[index] || day : day
        );
        return {
          ...prev,
          itinerary,
          meta: refreshed.meta,
          generatedAt: refreshed.generatedAt,
          isFallback: refreshed.isFallback,
        };
      });
    } catch (error) {
      setMessage(error.message || t("tripPlanner.status.error"));
    } finally {
      setRegeneratingDay(null);
    }
  };

  const toggleEditDay = (dayIndex) => {
    setEditingDay((current) => (current === dayIndex ? null : dayIndex));
  };

  const handleItemChange = (dayIndex, slotIndex, itemIndex, value) => {
    setPlan((prev) => {
      if (!prev) {
        return prev;
      }
      const itinerary = prev.itinerary.map((day, dIndex) => {
        if (dIndex !== dayIndex) {
          return day;
        }
        const slots = day.slots.map((slot, sIndex) => {
          if (sIndex !== slotIndex) {
            return slot;
          }
          const items = slot.items.map((item, iIndex) =>
            iIndex === itemIndex ? { ...item, name: value } : item
          );
          return { ...slot, items };
        });
        return { ...day, slots };
      });
      return { ...prev, itinerary };
    });
  };

  const handleSaveTrip = async (e) => {
    e?.preventDefault();
    if (!plan) return;
    const name = String(saveTripName || "").trim();
    if (!name) {
      setSaveMessage(t("tripPlanner.saveTrip.nameLabel") + " is required.");
      return;
    }
    setSaveStatus("loading");
    setSaveMessage("");
    try {
      await createTrip({
        name,
        destination: plan.destination,
        itinerary: plan.itinerary,
        days: plan.days,
        pace: plan.pace,
      });
      setSaveStatus("success");
      setSaveMessage(t("tripPlanner.saveTrip.success"));
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage(err?.message || t("tripPlanner.status.error"));
    }
  };

  const closeSaveModal = () => {
    setSaveModalOpen(false);
    setSaveTripName(plan?.destination ? `${plan.destination} trip` : "");
    setSaveStatus("idle");
    setSaveMessage("");
  };

  const summary = useMemo(() => {
    if (!plan) {
      return null;
    }
    return {
      days: plan.days,
      destination: plan.destination,
      paceLabel: t(`tripPlanner.pace.${plan.pace}`),
      hours: plan.meta?.avgHoursPerDay ?? 0,
      stops: plan.meta?.totalStops ?? 0,
    };
  }, [plan, t]);

  return (
    <main className="home-page">
      <section className="container home-card planner-hero">
        <p className="eyebrow">{t("tripPlanner.eyebrow")}</p>
        <h1>{t("tripPlanner.title")}</h1>
        <p className="lead">{t("tripPlanner.subtitle")}</p>
      </section>
      <section className="container planner-grid">
        <div className="planner-form-card">
          <form className="planner-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="trip-destination">{t("tripPlanner.form.destinationLabel")}</label>
              <input
                id="trip-destination"
                name="destination"
                type="text"
                value={formState.destination}
                placeholder={t("tripPlanner.form.destinationPlaceholder")}
                onChange={handleChange}
                list="trip-destination-suggestions"
                required
              />
              <datalist id="trip-destination-suggestions">
                {DESTINATION_SUGGESTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <div className="planner-row">
              <div className="field">
                <label htmlFor="trip-days">{t("tripPlanner.form.daysLabel")}</label>
                <input
                  id="trip-days"
                  name="days"
                  type="number"
                  min="1"
                  max="10"
                  value={formState.days}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="trip-pace">{t("tripPlanner.form.paceLabel")}</label>
                <select id="trip-pace" name="pace" value={formState.pace} onChange={handleChange}>
                  {paceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {message && (
              <div
                className={`message ${status === "error" ? "error" : "success"}`}
                role={status === "error" ? "alert" : "status"}
              >
                {message}
              </div>
            )}
            <button className="btn primary full" type="submit" disabled={status === "loading"}>
              {status === "loading"
                ? t("tripPlanner.actions.generating")
                : plan
                  ? t("tripPlanner.actions.regenerate")
                  : t("tripPlanner.actions.generate")}
            </button>
            <p className="form-helper">{t("tripPlanner.helper")}</p>
          </form>
        </div>
        <div className="planner-output">
          {plan && summary ? (
            <>
              <div className="planner-summary">
                <div>
                  <h2>{t("tripPlanner.results.title")}</h2>
                  <p className="muted">
                    {t("tripPlanner.results.summary", {
                      days: summary.days,
                      destination: summary.destination,
                    })}
                  </p>
                </div>
                <div className="planner-summary-meta">
                  <span>{t("tripPlanner.results.pace", { pace: summary.paceLabel })}</span>
                  <span>
                    {t("tripPlanner.results.meta", {
                      hours: summary.hours,
                      stops: summary.stops,
                    })}
                  </span>
                </div>
              </div>
              {plan.isFallback && (
                <p className="planner-note">{t("tripPlanner.results.fallback")}</p>
              )}
              <div className="planner-save-row">
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => {
                    setSaveTripName(plan.destination ? `${plan.destination} trip` : "");
                    setSaveModalOpen(true);
                    setSaveMessage("");
                    setSaveStatus("idle");
                  }}
                >
                  {t("tripPlanner.actions.saveTrip")}
                </button>
              </div>
              <div className="planner-map-card">
                <div className="planner-map-header">
                  <h3>{t("tripPlanner.map.title")}</h3>
                  <span className="planner-map-source">{t("tripPlanner.map.source")}</span>
                </div>
                {mapState.status === "loading" && (
                  <p className="planner-note">{t("tripPlanner.map.loading")}</p>
                )}
                {mapState.status === "error" && (
                  <p className="message error" role="alert">
                    {mapState.message}
                  </p>
                )}
                {mapState.status === "empty" && (
                  <p className="planner-note">{mapState.message}</p>
                )}
                {mapState.status === "ready" && mapState.data && (
                  <>
                    <MapView
                      center={{ lat: mapState.data.lat, lon: mapState.data.lon }}
                      destinationLabel={
                        mapState.data.label || plan.destination
                      }
                      itineraryMarkers={itineraryMarkers}
                    />
                    <div className="planner-map-footer">
                      <span className="muted">{mapState.data.label}</span>
                      <a
                        href={mapState.data.link}
                        className="planner-map-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("tripPlanner.map.open")}
                      </a>
                    </div>
                  </>
                )}
              </div>
              <datalist id="activity-place-suggestions">
                {getPlaceSuggestionsForDestination(plan.destination).map((place) => (
                  <option key={place} value={place} />
                ))}
              </datalist>
              <div className="planner-days">
                {plan.itinerary.map((day, dayIndex) => (
                  <article className="planner-day" key={`day-${day.day}`}>
                    <header className="planner-day-header">
                      <div>
                        <h3>{t("tripPlanner.results.dayLabel", { day: day.day })}</h3>
                        <div className="planner-day-meta">
                          {day.area && (
                            <span>
                              {t("tripPlanner.results.focus", { area: day.area })}
                            </span>
                          )}
                          <span>
                            {t("tripPlanner.results.totalTime", { hours: day.totalHours })}
                          </span>
                        </div>
                      </div>
                      <div className="planner-day-actions">
                        <button
                          className="btn small ghost"
                          type="button"
                          onClick={() => handleRegenerateDay(dayIndex)}
                          disabled={regeneratingDay === dayIndex}
                        >
                          {regeneratingDay === dayIndex
                            ? t("tripPlanner.actions.regeneratingDay")
                            : t("tripPlanner.actions.regenerateDay")}
                        </button>
                        <button
                          className="btn small ghost"
                          type="button"
                          onClick={() => toggleEditDay(dayIndex)}
                        >
                          {editingDay === dayIndex
                            ? t("tripPlanner.actions.doneEditing")
                            : t("tripPlanner.actions.editDay")}
                        </button>
                      </div>
                    </header>
                    <div className="planner-slots">
                      {day.slots.map((slot, slotIndex) => (
                        <section className="planner-slot" key={`${day.day}-${slot.timeOfDay}`}>
                          <div className="planner-slot-header">
                            <h4>{t(`tripPlanner.slots.${slot.timeOfDay}`)}</h4>
                            <span className="planner-slot-hours">
                              {t("tripPlanner.results.hoursShort", {
                                hours: slot.totalHours,
                              })}
                            </span>
                          </div>
                          <ul className="planner-items">
                            {slot.items.map((item, itemIndex) => {
                              const categoryLabel = t(`tripPlanner.categories.${item.category}`, {
                                defaultValue: item.category,
                              });
                              return (
                                <li
                                  className="planner-item"
                                  key={`day-${day.day}-slot-${slot.timeOfDay}-item-${itemIndex}`}
                                >
                                  {editingDay === dayIndex ? (
                                    <input
                                      type="text"
                                      value={item.name}
                                      list="activity-place-suggestions"
                                      onChange={(event) =>
                                        handleItemChange(
                                          dayIndex,
                                          slotIndex,
                                          itemIndex,
                                          event.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    <span className="planner-item-name">{item.name}</span>
                                  )}
                                  <span className="planner-item-meta">
                                    {t("tripPlanner.results.itemMeta", {
                                      hours: item.durationHours,
                                      category: categoryLabel,
                                    })}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </section>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
              <p className="planner-note">{t("tripPlanner.results.generated")}</p>

              {saveModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="save-trip-title">
                  <div className="modal-card">
                    <h2 id="save-trip-title">{t("tripPlanner.saveTrip.title")}</h2>
                    {saveStatus === "success" ? (
                      <>
                        <p className="message success">{saveMessage}</p>
                        <div className="modal-actions">
                          <Link className="btn primary" to="/trips">
                            {t("tripPlanner.saveTrip.viewMyTrips")}
                          </Link>
                          <button className="btn ghost" type="button" onClick={closeSaveModal}>
                            {t("tripPlanner.actions.doneEditing")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={handleSaveTrip}>
                        <div className="field">
                          <label htmlFor="save-trip-name">{t("tripPlanner.saveTrip.nameLabel")}</label>
                          <input
                            id="save-trip-name"
                            type="text"
                            value={saveTripName}
                            onChange={(e) => setSaveTripName(e.target.value)}
                            placeholder={t("tripPlanner.saveTrip.namePlaceholder")}
                            disabled={saveStatus === "loading"}
                            autoFocus
                          />
                        </div>
                        {saveMessage && (
                          <p className={`message ${saveStatus === "error" ? "error" : "success"}`} role="alert">
                            {saveMessage}
                          </p>
                        )}
                        <div className="modal-actions">
                          <button
                            className="btn primary"
                            type="submit"
                            disabled={saveStatus === "loading"}
                          >
                            {saveStatus === "loading"
                              ? t("tripPlanner.saveTrip.saving")
                              : t("tripPlanner.actions.saveTrip")}
                          </button>
                          <button
                            className="btn ghost"
                            type="button"
                            onClick={closeSaveModal}
                            disabled={saveStatus === "loading"}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="planner-empty">
              <h2>{t("tripPlanner.empty.title")}</h2>
              <p className="muted">{t("tripPlanner.empty.copy")}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MapView from "../components/MapView";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import {
  buildOpenStreetMapLink,
  collectPlaceNamesByDay,
  DESTINATION_SUGGESTIONS,
  geocodePlace,
  getDestinationCoordinates,
} from "../services/geocode";
import { createTrip } from "../services/trips";
import { generateTripPlan } from "../services/tripPlanner";
import { chatWithTripAgent } from "../services/tripAgent";

const paceOptions = [
  { value: "relaxed", labelKey: "tripPlanner.pace.relaxed" },
  { value: "balanced", labelKey: "tripPlanner.pace.balanced" },
  { value: "fast", labelKey: "tripPlanner.pace.fast" },
];

const Home = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
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
  const [dayRoutes, setDayRoutes] = useState([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTripName, setSaveTripName] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [showAIChat, setShowAIChat] = useState(true);
  const [agentMessages, setAgentMessages] = useState([]);
  const [agentContext, setAgentContext] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentChatInput, setAgentChatInput] = useState("");
  const agentMessagesEndRef = useRef(null);

  useEffect(() => {
    agentMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages, agentLoading]);

  // Allow opening AI chat via URL for testing (e.g. /home?openAIChat=1&destination=Kochi)
  useEffect(() => {
    const open = searchParams.get("openAIChat");
    const dest = searchParams.get("destination")?.trim();
    if (open === "1" && dest) {
      setFormState((prev) => ({ ...prev, destination: dest }));
      const days = Math.min(10, Math.max(1, Number(searchParams.get("days")) || 3));
      const pace = searchParams.get("pace") || "balanced";
      setAgentContext({ destination: dest, days, pace });
      setAgentMessages([]);
      setShowAIChat(true);
      // Clear URL params after a tick so chat opens first (helps testing and avoids bookmarking params)
      const timeoutId = setTimeout(() => {
        setSearchParams((prev) => {
          prev.delete("openAIChat");
          prev.delete("destination");
          prev.delete("days");
          prev.delete("pace");
          return prev;
        }, { replace: true });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "days") {
      if (value === "") {
        setFormState((prev) => ({ ...prev, days: "" }));
        return;
      }
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return;
      const nextDays = Math.min(10, Math.max(1, Math.round(parsed)));
      setFormState((prev) => ({ ...prev, days: nextDays }));
      return;
    }
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDaysBlur = () => {
    setFormState((prev) => {
      if (prev.days === "" || prev.days == null) {
        return { ...prev, days: 1 };
      }
      const n = Number(prev.days);
      return { ...prev, days: Number.isFinite(n) ? Math.min(10, Math.max(1, Math.round(n))) : 1 };
    });
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
      const days = Math.min(10, Math.max(1, Number(formState.days) || 1));
      const payload = {
        destination: trimmedDestination,
        days,
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

  const startAIChat = () => {
    const trimmedDestination = formState.destination.trim();
    if (!trimmedDestination) {
      setMessage(t("tripPlanner.status.missingDestination"));
      setStatus("error");
      return;
    }
    const days = Math.min(10, Math.max(1, Number(formState.days) || 1));
    setAgentContext({
      destination: trimmedDestination,
      days,
      pace: formState.pace,
    });
    setAgentMessages([]);
    setShowAIChat(true);
    setMessage("");
    setStatus("idle");
  };

  const handleAgentSend = async (e, overrideText) => {
    e?.preventDefault();
    const text = (overrideText != null ? String(overrideText) : agentChatInput || "").trim();
    if (!text || agentLoading) return;
    const baseContext = agentContext || {
      destination: formState.destination.trim() || plan?.destination || "Your trip",
      days: Math.min(
        10,
        Math.max(1, Number(formState.days != null && formState.days !== "" ? formState.days : plan?.days || 3))
      ),
      pace: (plan?.pace || formState.pace || "balanced"),
    };
    const userMessage = { role: "user", content: text };
    const nextMessages = [...agentMessages, userMessage];
    setAgentMessages(nextMessages);
    setAgentChatInput("");
    setAgentLoading(true);
    setMessage("");
    try {
      const planResponse = await chatWithTripAgent({
        messages: nextMessages,
        context: {
          destination: plan?.destination ?? baseContext.destination,
          days: plan?.days ?? baseContext.days,
          pace: plan?.pace ?? baseContext.pace,
          currentItinerary: plan?.itinerary,
        },
      });
      setPlan(planResponse);
      setEditingDay(null);
      setAgentContext({
        destination: planResponse.destination || baseContext.destination,
        days: planResponse.days ?? baseContext.days,
        pace: planResponse.pace || baseContext.pace,
      });
      const assistantContent =
        (planResponse.assistantMessage && String(planResponse.assistantMessage).trim()) ||
        (planResponse.aiUnconfigured
          ? t("tripPlanner.results.aiUnconfigured")
          : planResponse.agentUnavailable
            ? t("tripPlanner.results.assistantFallback")
            : t("tripPlanner.results.assistantShortFallback"));
      setAgentMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
      if (planResponse.agentUnavailable) {
        setMessage(
          planResponse.assistantMessage && String(planResponse.assistantMessage).trim()
            ? t("tripPlanner.results.agentUnavailableWithReply")
            : t("tripPlanner.results.agentUnavailable")
        );
      }
      loadMapForDestination(planResponse.destination || agentContext.destination);
    } catch (error) {
      setMessage(error.message || t("tripPlanner.status.error"));
    } finally {
      setAgentLoading(false);
    }
  };

  const handleStartOver = () => {
    setPlan(null);
    setAgentMessages([]);
    setAgentContext(null);
    setAgentLoading(false);
    setAgentChatInput("");
    setMessage("");
    setStatus("idle");
    setMapState({ status: "idle", data: null, message: "" });
    setItineraryMarkers([]);
    setDayRoutes([]);
  };

  const loadMapForDestination = async (destination) => {
    setMapState({ status: "loading", data: null, message: "" });
    setItineraryMarkers([]);
    setDayRoutes([]);
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

  // Geocode itinerary places for markers + day routes (rate-limited: 1 req ~1.2s for Nominatim).
  // Prepend destination to each day's route so polyline always starts at destination (multi-day route visible).
  useEffect(() => {
    if (!plan || mapState.status !== "ready" || !mapState.data) return;
    setItineraryMarkers([]);
    setDayRoutes([]);
    let cancelled = false;
    const center = [mapState.data.lat, mapState.data.lon];
    const placesByDay = collectPlaceNamesByDay(plan);
    const seenNames = new Set();
    const run = async () => {
      let reqIndex = 0;
      const routes = placesByDay.map(() => []);
      for (let dayIndex = 0; dayIndex < placesByDay.length; dayIndex++) {
        if (cancelled) return;
        const dayPlaces = placesByDay[dayIndex];
        for (let j = 0; j < dayPlaces.length; j++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, reqIndex === 0 ? 0 : 1200));
          if (cancelled) return;
          const place = dayPlaces[j];
          const coords = await geocodePlace(place.name, plan.destination);
          reqIndex++;
          if (cancelled) return;
          if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
            routes[dayIndex].push([coords.lat, coords.lng]);
            if (!seenNames.has(place.name) && seenNames.size < 10) {
              seenNames.add(place.name);
              setItineraryMarkers((prev) => [
                ...prev,
                { ...coords, name: place.name, category: place.category },
              ]);
            }
          }
        }
        // Prepend destination so each day route is destination -> place1 -> place2 (visible polyline)
        setDayRoutes((prev) => {
          const next = prev.slice(0, dayIndex);
          next[dayIndex] = [center, ...routes[dayIndex]];
          return next;
        });
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

  const welcomeBack = location.state?.welcomeBack === true && !welcomeDismissed;
  const welcomeNew = location.state?.welcomeNew === true && !welcomeDismissed;
  const showWelcomeBanner = welcomeBack || welcomeNew;

  const dismissWelcome = () => {
    setWelcomeDismissed(true);
    navigate(location.pathname, { replace: true, state: {} });
  };

  return (
    <main className="home-page">
      {showWelcomeBanner && (
        <div className="home-welcome-banner" role="status">
          <span>
            {welcomeBack ? t("auth.messages.welcomeBack") : t("auth.messages.welcomeNew")}
          </span>
          <button
            type="button"
            className="home-welcome-banner-dismiss"
            onClick={dismissWelcome}
            aria-label={t("labels.close")}
          >
            ×
          </button>
        </div>
      )}
      <section className="home-hero">
        <div
          className={`container ${showAIChat ? "home-hero-ai-layout" : ""} ${showAIChat && plan ? "home-hero-ai-layout--with-plan" : ""}`}
        >
          {showAIChat ? (
            <>
              <div className="home-hero-card home-hero-chat">
                <h2>{t("tripPlanner.heroTitle")}</h2>
                <div className="trip-agent-chat">
                  <div className="trip-agent-chat-header">
                    <span className="trip-agent-chat-title">{t("tripPlanner.aiChat.title")}</span>
                    <button
                      type="button"
                      className="btn small ghost"
                      onClick={handleStartOver}
                      disabled={agentLoading}
                    >
                      {t("tripPlanner.aiChat.startOver")}
                    </button>
                  </div>
                  <p className="trip-agent-chat-intro">{t("tripPlanner.aiChat.intro")}</p>
                  {agentMessages.length === 0 && !agentContext && (
                    <p className="trip-agent-chat-first-hint" role="status">
                      {t("tripPlanner.aiChat.firstTimeHint")}
                    </p>
                  )}
                  <div className="home-hero-quick-start" aria-label={t("tripPlanner.quickStart")}>
                    <span className="home-hero-quick-start-label">{t("tripPlanner.quickStart")}</span>
                    <div className="home-hero-quick-start-pills">
                      <button
                        type="button"
                        className="home-hero-quick-pill"
                        onClick={() => handleAgentSend(null, "Make it family friendly")}
                        disabled={agentLoading}
                      >
                        {t("tripPlanner.quickStartPills.familyFriendly")}
                      </button>
                      <button
                        type="button"
                        className="home-hero-quick-pill"
                        onClick={() => handleAgentSend(null, "Keep it budget-friendly")}
                        disabled={agentLoading}
                      >
                        {t("tripPlanner.quickStartPills.budgetTravel")}
                      </button>
                      <button
                        type="button"
                        className="home-hero-quick-pill"
                        onClick={() => handleAgentSend(null, "Add hidden gems and local spots")}
                        disabled={agentLoading}
                      >
                        {t("tripPlanner.quickStartPills.hiddenGems")}
                      </button>
                      <button
                        type="button"
                        className="home-hero-quick-pill home-hero-quick-pill-custom"
                        onClick={() => document.getElementById("agent-chat-input")?.focus()}
                        aria-label={t("tripPlanner.quickStartPills.customFilter")}
                      >
                        {t("tripPlanner.quickStartPills.customFilter")}
                      </button>
                    </div>
                  </div>
                  {agentContext && (
                    <p className="muted trip-agent-chat-context">
                      {agentContext.destination} · {agentContext.days} {agentContext.days === 1 ? "day" : "days"} · {t(`tripPlanner.pace.${agentContext.pace}`)}
                    </p>
                  )}
                  <div className="trip-agent-chat-messages" role="log" aria-live="polite">
                    {agentMessages.map((m, i) => (
                      <div key={i} className={`trip-agent-msg trip-agent-msg-${m.role}`}>
                        <span className="trip-agent-msg-role">{m.role === "user" ? "You" : "AI"}</span>
                        <span className="trip-agent-msg-content">{m.content}</span>
                      </div>
                    ))}
                    {agentLoading && (
                      <div className="trip-agent-msg trip-agent-msg-assistant">
                        <span className="trip-agent-msg-role">AI</span>
                        <span className="trip-agent-msg-content">…</span>
                      </div>
                    )}
                    <div ref={agentMessagesEndRef} aria-hidden="true" />
                  </div>
                  <form className="trip-agent-chat-form" onSubmit={handleAgentSend}>
                    <input
                      id="agent-chat-input"
                      type="text"
                      value={agentChatInput}
                      onChange={(e) => setAgentChatInput(e.target.value)}
                      placeholder={agentContext ? t("tripPlanner.aiChat.refinePlaceholder") : t("tripPlanner.aiChat.placeholder")}
                      disabled={agentLoading}
                      aria-label={agentContext ? t("tripPlanner.aiChat.refinePlaceholder") : t("tripPlanner.aiChat.placeholder")}
                    />
                    <button
                      type="submit"
                      className="trip-detail-chat-icon-btn trip-detail-chat-send"
                      disabled={agentLoading || !agentChatInput.trim()}
                      aria-label={t("tripPlanner.aiChat.send")}
                      title={t("tripPlanner.aiChat.send")}
                    >
                      <span className="trip-detail-chat-icon" aria-hidden>
                        {agentLoading ? (
                          <span className="trip-detail-chat-loading">⋯</span>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        )}
                      </span>
                    </button>
                  </form>
                  {message && (
                    <p
                      className={`message ${message === t("tripPlanner.results.agentUnavailableWithReply") ? "info" : "error"}`}
                      role="alert"
                    >
                      {message}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`home-hero-plan-panel ${!(plan && summary) ? "home-hero-plan-panel--empty" : ""}`}
                aria-live="polite"
              >
                {plan && summary ? (
                  <div className="home-hero-plan-preview">
                    <h3 className="home-hero-plan-preview-title">
                      {t("tripPlanner.results.summary", {
                        days: summary.days,
                        destination: summary.destination,
                      })}
                    </h3>
                    <p className="muted">
                      {t("tripPlanner.results.pace", { pace: summary.paceLabel })} · {t("tripPlanner.results.meta", { hours: summary.hours, stops: summary.stops })}
                    </p>
                    <a href="#planner-output" className="btn ghost small home-hero-plan-scroll">
                      {t("tripPlanner.planPanel.previewCaption")}
                    </a>
                  </div>
                ) : (
                  <div className="home-hero-plan-empty" data-testid="home-itinerary-placeholder">
                    <h3 className="home-hero-plan-empty-title">{t("tripPlanner.planPanel.emptyTitle")}</h3>
                    <p className="home-hero-plan-empty-hint">{t("tripPlanner.planPanel.emptyHint")}</p>
                  </div>
                )}
              </div>
              {plan && (
                <aside className="home-hero-sidebar" aria-label={t("tripPlanner.trendingDestinations")}>
                  <section className="home-hero-sidebar-section">
                    <h3 className="home-hero-sidebar-title">{t("tripPlanner.routeOverview")}</h3>
                    <div className="home-hero-route-placeholder">
                      {mapState.data ? (
                        <a
                          href={buildOpenStreetMapLink(mapState.data)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="home-hero-map-link"
                        >
                          {t("tripPlanner.map.open")}
                        </a>
                      ) : (
                        <span className="muted">{mapState.message || t("tripPlanner.map.loading")}</span>
                      )}
                    </div>
                  </section>
                  <section className="home-hero-sidebar-section">
                    <h3 className="home-hero-sidebar-title">{t("tripPlanner.trendingDestinations")}</h3>
                    <ul className="home-hero-trending-list">
                      {["Paris", "Tokyo", "Kyoto", "Barcelona", "Rome", "Lisbon"].map((dest) => (
                        <li key={dest}>
                          <button
                            type="button"
                            className="home-hero-trending-item"
                            onClick={() => {
                              setAgentChatInput(`${plan.days || 3} days in ${dest}`);
                              document.getElementById("agent-chat-input")?.focus();
                            }}
                          >
                            {dest}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                </aside>
              )}
            </>
          ) : (
            <>
          <div className="home-hero-card">
            <h2>{t("tripPlanner.heroTitle")}</h2>
            <form className="planner-form" onSubmit={handleSubmit}>
              <div className="field planner-field-with-icon">
                <label htmlFor="trip-destination">{t("tripPlanner.form.destinationLabel")}</label>
                <span className="field-icon-wrap">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden width="20" height="20"><path d="M4 6h16M4 12h16M4 18h7" /></svg>
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
                </span>
                <datalist id="trip-destination-suggestions">
                  {DESTINATION_SUGGESTIONS.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
              <div className="planner-row">
                <div className="field planner-field-with-icon">
                  <label htmlFor="trip-days">{t("tripPlanner.form.daysLabel")}</label>
                  <span className="field-icon-wrap">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input
                      id="trip-days"
                      name="days"
                      type="number"
                      min={1}
                      max={10}
                      value={formState.days === "" ? "" : formState.days}
                      onChange={handleChange}
                      onBlur={handleDaysBlur}
                    />
                  </span>
                </div>
                <div className="field planner-field-with-icon">
                  <label htmlFor="trip-pace">{t("tripPlanner.form.paceLabel")}</label>
                  <span className="field-icon-wrap">
                    <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <select id="trip-pace" name="pace" value={formState.pace} onChange={handleChange}>
                      {paceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </option>
                      ))}
                    </select>
                  </span>
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
              <div className="planner-form-actions">
                <button className="btn btn-cta" type="submit" disabled={status === "loading"}>
                  {status === "loading"
                    ? t("tripPlanner.actions.generating")
                    : plan
                      ? t("tripPlanner.actions.regenerate")
                      : t("tripPlanner.actions.generate")}
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={startAIChat}
                  disabled={status === "loading"}
                >
                  {t("tripPlanner.aiChat.title")}
                </button>
              </div>
              <p className="form-helper">{t("tripPlanner.helper")}</p>
            </form>
          </div>
          <div className="home-hero-copy">
            <h2>{t("tripPlanner.heroCopyTitle")}</h2>
            <p>{t("tripPlanner.heroCopyBody")}</p>
            <div className="home-hero-illus" aria-hidden>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
            </div>
          </div>
            </>
          )}
        </div>
      </section>
      {plan && summary ? (
        <section id="planner-output" className="container planner-grid" tabIndex={-1}>
          <div className="planner-output" style={{ gridColumn: "1 / -1" }}>
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
              {plan.agentUnavailable && (
                <p className="planner-note">
                  {plan.assistantMessage && String(plan.assistantMessage).trim()
                    ? t("tripPlanner.results.agentUnavailableWithReply")
                    : t("tripPlanner.results.agentUnavailable")}
                </p>
              )}
              {plan.aiUnconfigured && (
                <p className="planner-note">{t("tripPlanner.results.aiUnconfigured")}</p>
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
                      dayRoutes={dayRoutes}
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
                                    <PlaceAutocomplete
                                      value={item.name}
                                      onChange={(value) =>
                                        handleItemChange(
                                          dayIndex,
                                          slotIndex,
                                          itemIndex,
                                          value
                                        )
                                      }
                                      destination={plan.destination}
                                      aria-label={t("tripPlanner.results.placeName", "Place name")}
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
          </div>
        </section>
      ) : !showAIChat ? (
        <section className="container planner-grid" tabIndex={-1}>
          <div className="planner-output" style={{ gridColumn: "1 / -1" }}>
            <div className="planner-empty">
              <h2>{t("tripPlanner.empty.title")}</h2>
              <p className="muted">{t("tripPlanner.empty.copy")}</p>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default Home;

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotificationStore } from "../stores/notifications";

export default function NotificationBell() {
  const { t } = useTranslation();
  const { items, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="notification-bell-wrap" ref={panelRef}>
      <button
        type="button"
        className="page-header-action-round notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("notifications.title", "Notifications")}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="notification-bell-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </span>
        {unreadCount > 0 && (
          <span className="notification-bell-badge" aria-hidden>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="notification-bell-panel" role="menu" aria-label={t("notifications.title", "Notifications")}>
          <div className="notification-bell-panel-header">
            <h3>{t("notifications.title", "Notifications")}</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn ghost small"
                onClick={markAllRead}
                aria-label={t("notifications.markAllRead", "Mark all read")}
              >
                {t("notifications.markAllRead", "Mark all read")}
              </button>
            )}
          </div>
          <ul className="notification-bell-list">
            {items.length === 0 ? (
              <li className="notification-bell-empty">{t("notifications.empty", "No notifications yet.")}</li>
            ) : (
              items.slice(0, 15).map((n) => (
                <li key={n.id} className={`notification-bell-item ${n.read ? "notification-bell-item--read" : ""}`}>
                  <Link
                    to={n.link || "#"}
                    className="notification-bell-item-link"
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    <span className="notification-bell-item-text">{n.title || n.text}</span>
                    {n.subtitle && <span className="notification-bell-item-subtitle">{n.subtitle}</span>}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

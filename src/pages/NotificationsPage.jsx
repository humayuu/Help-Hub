import { useMemo, useState } from "react";
import {
  getNotifications,
  setNotificationRead,
  markAllNotificationsRead,
} from "../lib/notificationsStorage.js";

function formatWhen(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function typeLabel(type) {
  const m = {
    request: "Request",
    help: "Match",
    status: "Status",
    info: "Insight",
  };
  return m[type] ?? "Update";
}

export default function NotificationsPage() {
  const [, bump] = useState(0);
  const list = useMemo(() => getNotifications(), [bump]);

  function refresh() {
    bump((x) => x + 1);
  }

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Notifications</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            Stay updated on requests, helpers, and trust signals.
          </h1>
          <p>Live events from actions across the demo — stored in LocalStorage on this browser.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-kicker">Live updates</p>
            <h2>Notification feed</h2>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              markAllNotificationsRead();
              refresh();
            }}
          >
            Mark all read
          </button>
        </div>

        <div className="notif-list">
          {list.length === 0 ? (
            <p>No notifications yet — publish a request or join as a helper.</p>
          ) : (
            list.map((n) => (
              <article key={n.id} className="notif-item">
                <div>
                  <strong style={{ color: "var(--text)" }}>{n.title}</strong>
                  <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                    {typeLabel(n.type)} • {formatWhen(n.createdAt)}
                  </p>
                  {n.body ? <p style={{ marginTop: 8 }}>{n.body}</p> : null}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flexShrink: 0 }}
                  onClick={() => {
                    setNotificationRead(n.id, !n.read);
                    refresh();
                  }}
                >
                  {n.read ? "Mark unread" : "Mark read"}
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

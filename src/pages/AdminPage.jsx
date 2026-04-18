import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getRequests,
  deleteRequest,
  setRequestModerationHidden,
} from "../lib/requestsStorage.js";
import { appendNotification } from "../lib/notificationsStorage.js";

export default function AdminPage() {
  const [, bump] = useState(0);
  const all = useMemo(() => getRequests(), [bump]);

  const analytics = useMemo(() => {
    const total = all.length;
    const hidden = all.filter((r) => r.moderationHidden).length;
    const open = all.filter((r) => r.status !== "solved").length;
    const solved = all.filter((r) => r.status === "solved").length;
    const byCat = {};
    for (const r of all) {
      const c = r.category || "General";
      byCat[c] = (byCat[c] || 0) + 1;
    }
    const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { total, hidden, open, solved, topCat };
  }, [all]);

  function refresh() {
    bump((x) => x + 1);
  }

  function handleDelete(id, title) {
    if (!window.confirm(`Delete request “${title}”? This cannot be undone in the demo.`)) return;
    deleteRequest(id);
    appendNotification({
      type: "status",
      title: "Admin: request removed",
      body: `“${title}” was deleted from LocalStorage.`,
    });
    refresh();
  }

  function handleToggleHide(r) {
    const next = !r.moderationHidden;
    setRequestModerationHidden(r.id, next);
    appendNotification({
      type: "status",
      title: next ? "Admin: hidden from feed" : "Admin: restored to feed",
      body: `“${r.title}”`,
    });
    refresh();
  }

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Admin panel</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            Manage requests, moderate the feed, and skim analytics.
          </h1>
          <p>Bonus scope — all changes persist in this browser’s LocalStorage.</p>
        </div>
      </section>

      <p className="feed-line" style={{ marginBottom: 16 }}>
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to dashboard
        </Link>
      </p>

      <section className="mini-grid section">
        <div className="stat-card">
          <p className="eyebrow">Total</p>
          <div className="stat-value">{analytics.total}</div>
          <p>All requests including hidden.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Open / solved</p>
          <div className="stat-value">
            {analytics.open} / {analytics.solved}
          </div>
          <p>Status mix across the dataset.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Top category</p>
          <div className="stat-value">{analytics.topCat}</div>
          <p>Hidden from feed: {analytics.hidden}</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Feed health</p>
          <div className="stat-value">{analytics.total - analytics.hidden}</div>
          <p>Visible in public explore.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-kicker">Moderation</p>
            <h2>All requests</h2>
          </div>
        </div>
        <div className="stack">
          {all.map((r) => (
            <article key={r.id} className="request-card">
              <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div className="tag-row" style={{ marginBottom: 8 }}>
                    <span className="tag">{r.category}</span>
                    <span className={r.status === "solved" ? "tag success" : "tag"}>
                      {r.status === "solved" ? "Solved" : "Open"}
                    </span>
                    {r.moderationHidden ? (
                      <span className="tag urgent">Hidden</span>
                    ) : (
                      <span className="tag">Visible</span>
                    )}
                  </div>
                  <p style={{ fontWeight: 700, margin: 0 }}>{r.title}</p>
                  <p style={{ margin: "6px 0 0" }}>
                    {r.authorName} · {r.location}
                  </p>
                </div>
                <div className="row" style={{ flexDirection: "column", flexShrink: 0 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => handleToggleHide(r)}>
                    {r.moderationHidden ? "Show in feed" : "Hide from feed"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ color: "var(--danger)" }}
                    onClick={() => handleDelete(r.id, r.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

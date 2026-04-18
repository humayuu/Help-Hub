import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { loadSession, loadProfile } from "../lib/storage.js";
import { getVisibleRequests } from "../lib/requestsStorage.js";
import {
  topCategoryFromRequests,
  highUrgencyOpenCount,
  userContributionStats,
} from "../lib/communityStats.js";
import { getNotifications } from "../lib/notificationsStorage.js";

export default function DashboardPage() {
  const location = useLocation();
  const session = loadSession();
  const profile = loadProfile();
  const requests = useMemo(
    () => getVisibleRequests(),
    [location.key, location.pathname],
  );

  const mine = useMemo(
    () => (session?.userId ? userContributionStats(session.userId) : null),
    [session?.userId, location.key],
  );

  const stats = useMemo(() => {
    const open = requests.filter((r) => r.status !== "solved").length;
    return { open };
  }, [requests]);

  const aiInsights = useMemo(() => {
    const trend = topCategoryFromRequests();
    const highOpen = highUrgencyOpenCount();
    return { trend, highOpen };
  }, [requests, location.key]);

  const recent = useMemo(() => {
    return [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [requests]);

  const notes = useMemo(() => getNotifications().slice(0, 5), [location.key]);

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Dashboard</p>
          <h1 style={{ fontSize: "clamp(2.3rem, 4vw, 4.2rem)" }}>
            Welcome back{session?.displayName ? `, ${session.displayName}` : ""}.
          </h1>
          <p>
            Your command center for requests, AI insights, helper momentum, and live community
            activity.
          </p>
          {profile?.location ? (
            <p style={{ marginTop: 12 }}>
              <strong style={{ color: "rgba(255,255,255,0.95)" }}>Location:</strong>{" "}
              {profile.location} ·{" "}
              <strong style={{ color: "rgba(255,255,255,0.95)" }}>Role:</strong>{" "}
              {session?.roleLabel}
            </p>
          ) : (
            <p style={{ marginTop: 12 }}>
              <strong style={{ color: "rgba(255,255,255,0.95)" }}>Role:</strong>{" "}
              {session?.roleLabel}
            </p>
          )}
        </div>
      </section>

      <section className="mini-grid section">
        <div className="stat-card">
          <p className="eyebrow">Trust score</p>
          <div className="stat-value">{mine?.trust ?? "—"}</div>
          <p>Driven by solved requests and consistent support.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Helping</p>
          <div className="stat-value">{mine?.helped ?? 0}</div>
          <p>Requests where you are currently listed as a helper.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Open requests</p>
          <div className="stat-value">{stats.open}</div>
          <p>Community requests currently active across the feed.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">AI pulse</p>
          <div className="stat-value">{aiInsights.highOpen}</div>
          <p>High-urgency open threads ({aiInsights.trend} is the top category).</p>
        </div>
      </section>

      <section className="dashboard-grid section">
        <div className="stack">
          <div className="section-head">
            <div>
              <p className="section-kicker">Recent requests</p>
              <h2>What the community needs right now</h2>
            </div>
            <Link className="btn btn-secondary" to="/explore">
              Go to feed
            </Link>
          </div>
          <div className="stack">
            {recent.map((r) => (
              <article key={r.id} className="request-card">
                <div className="tag-row">
                  <span className="tag">{r.category}</span>
                  <span className={r.urgency === "High" ? "tag urgent" : "tag"}>{r.urgency}</span>
                  <span className={r.status === "solved" ? "tag success" : "tag"}>
                    {r.status === "solved" ? "Solved" : "Open"}
                  </span>
                </div>
                <h3 className="request-card__title">
                  <Link to={`/requests/${r.id}`}>{r.title}</Link>
                </h3>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  {r.authorName} · {r.location}
                </p>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
            <Link className="btn btn-primary" to="/explore">
              Open explore
            </Link>
            <Link className="btn btn-secondary" to="/create-request">
              New request
            </Link>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <p className="section-kicker">AI insights</p>
            <h3>Suggested actions for you</h3>
            <p>
              Trending category: <strong>{aiInsights.trend}</strong>. Open high-urgency count:{" "}
              <strong>{aiInsights.highOpen}</strong>.
            </p>
            {mine ? (
              <p>
                You have helped on <strong>{mine.helped}</strong> requests and authored{" "}
                <strong>{mine.authored}</strong>.
              </p>
            ) : null}
          </div>
          <div className="panel">
            <p className="section-kicker">Notifications</p>
            <h3>Latest updates</h3>
            <div className="notif-list">
              {notes.length === 0 ? (
                <p style={{ margin: 0 }}>No notifications yet.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="notif-item">
                    <div>
                      <strong style={{ color: "var(--text)" }}>{n.title}</strong>
                      <p style={{ margin: "6px 0 0", fontSize: "0.9rem" }}>{n.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link className="btn btn-secondary" to="/notifications" style={{ marginTop: 14 }}>
              View all
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

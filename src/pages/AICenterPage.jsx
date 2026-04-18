import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getVisibleRequests } from "../lib/requestsStorage.js";
import { getAllUsers } from "../lib/usersStorage.js";
import { topCategoryFromRequests, highUrgencyOpenCount } from "../lib/communityStats.js";

function urgencyOrder(u) {
  if (u === "High") return 0;
  if (u === "Medium") return 1;
  return 2;
}

export default function AICenterPage() {
  const location = useLocation();
  const reqs = useMemo(
    () => getVisibleRequests(),
    [location.key, location.pathname],
  );
  const users = useMemo(() => getAllUsers(), [location.key]);

  const mentorPool = useMemo(
    () => users.filter((u) => u.role === "can_help" || u.role === "both").length,
    [users],
  );

  const attention = useMemo(() => {
    return [...reqs]
      .filter((r) => r.status !== "solved")
      .sort((a, b) => urgencyOrder(a.urgency) - urgencyOrder(b.urgency))
      .slice(0, 4);
  }, [reqs]);

  const trend = topCategoryFromRequests();
  const highOpen = highUrgencyOpenCount();

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">AI Center</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            See what the platform intelligence is noticing.
          </h1>
          <p>Demand trends, helper readiness, urgency signals, and request recommendations.</p>
        </div>
      </section>

      <section className="mini-grid section">
        <div className="stat-card">
          <p className="eyebrow">Trend pulse</p>
          <div className="stat-value">{trend}</div>
          <p>Most common category across stored requests.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Urgency watch</p>
          <div className="stat-value">{highOpen}</div>
          <p>Open requests flagged High urgency.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Mentor pool</p>
          <div className="stat-value">{mentorPool}</div>
          <p>Profiles with “Can help” or “Both” roles.</p>
        </div>
        <div className="stat-card">
          <p className="eyebrow">Open threads</p>
          <div className="stat-value">{reqs.filter((r) => r.status !== "solved").length}</div>
          <p>Visible requests still accepting helpers.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-kicker">AI recommendations</p>
            <h2>Requests needing attention</h2>
          </div>
        </div>
        <div className="stack">
          {attention.map((r) => (
            <article key={r.id} className="request-card">
              <p style={{ fontWeight: 700, marginBottom: 6 }}>
                <Link to={`/requests/${r.id}`}>{r.title}</Link>
              </p>
              <p style={{ margin: 0 }}>
                {r.description.slice(0, 160)}
                {r.description.length > 160 ? "…" : ""}
              </p>
              <div className="tag-row" style={{ marginTop: 10 }}>
                <span className="tag">{r.category}</span>
                <span className={r.urgency === "High" ? "tag urgent" : "tag"}>{r.urgency}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

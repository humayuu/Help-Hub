import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getVisibleRequests } from "../lib/requestsStorage.js";

export default function ExplorePage() {
  const location = useLocation();
  const [category, setCategory] = useState("All");
  const [urgency, setUrgency] = useState("All");
  const [skillQ, setSkillQ] = useState("");
  const [locationQ, setLocationQ] = useState("");

  const all = useMemo(() => getVisibleRequests(), [location.key, location.pathname]);

  const categories = useMemo(() => {
    const set = new Set(all.map((r) => r.category).filter(Boolean));
    return ["All", ...[...set].sort()];
  }, [all]);

  const filtered = useMemo(() => {
    const sk = skillQ.trim().toLowerCase();
    const loc = locationQ.trim().toLowerCase();
    return all.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (urgency !== "All" && r.urgency !== urgency) return false;
      if (loc && !String(r.location || "").toLowerCase().includes(loc)) return false;
      if (sk) {
        const blob = [...(r.skills || []), ...(r.tags || [])].join(" ").toLowerCase();
        if (!blob.includes(sk)) return false;
      }
      return true;
    });
  }, [all, category, urgency, skillQ, locationQ]);

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Explore / Feed</p>
          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 4rem)" }}>
            Browse help requests with filterable community context.
          </h1>
          <p>Filter by category, urgency, skills, and location to surface the best matches.</p>
        </div>
      </section>

      <section className="feed-grid section">
        <form
          className="panel stack"
          aria-label="Filters"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <p className="section-kicker">Filters</p>
            <h2>Refine the feed</h2>
          </div>
          <div className="field">
            <label htmlFor="flt-cat">Category</label>
            <select
              id="flt-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="flt-urg">Urgency</label>
            <select id="flt-urg" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              {["All", "High", "Medium", "Low"].map((u) => (
                <option key={u} value={u}>
                  {u === "All" ? "All urgency levels" : u}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="flt-skill">Skills</label>
            <input
              id="flt-skill"
              value={skillQ}
              onChange={(e) => setSkillQ(e.target.value)}
              placeholder="React, Figma, Git/GitHub"
            />
          </div>
          <div className="field">
            <label htmlFor="flt-loc">Location</label>
            <input
              id="flt-loc"
              value={locationQ}
              onChange={(e) => setLocationQ(e.target.value)}
              placeholder="Karachi, Lahore, Remote"
            />
          </div>
        </form>

        <div className="stack">
          <p className="feed-line">
            Showing <strong>{filtered.length}</strong> of {all.length}
          </p>
          {filtered.map((r) => (
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
              <p style={{ margin: 0 }}>{r.description}</p>
              <div className="tag-row">
                {(r.skills || []).map((s) => (
                  <span key={s} className="pill">
                    {s}
                  </span>
                ))}
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "var(--text)" }}>{r.authorName}</p>
                  <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                    {r.location} •{" "}
                    {(Array.isArray(r.helpers) ? r.helpers.length : 0) || (r.helperCount ?? 0)} helpers
                  </p>
                </div>
                <Link className="btn btn-secondary" to={`/requests/${r.id}`}>
                  Open details
                </Link>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <p className="feed-line">No requests match these filters.</p> : null}
          <Link className="btn btn-primary" to="/create-request">
            New request
          </Link>
        </div>
      </section>
    </main>
  );
}

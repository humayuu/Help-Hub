import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../landing-parity.css";
import { initUsersIfEmpty, getAllUsers } from "../lib/usersStorage.js";
import { initRequestsIfEmpty, getVisibleRequests } from "../lib/requestsStorage.js";
import { userContributionStats } from "../lib/communityStats.js";

function helperLine(r) {
  const n = Array.isArray(r.helpers) ? r.helpers.length : r.helperCount ?? 0;
  if (n <= 0) return "Be the first helper";
  if (n === 1) return "1 helper interested";
  return `${n} helpers interested`;
}

function urgencyClass(u) {
  if (u === "High") return "hh-tag hh-tag--urgent";
  if (u === "Medium") return "hh-tag hh-tag--amber";
  return "hh-tag";
}

export default function LandingPage() {
  const location = useLocation();
  const [members, setMembers] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [topTrust, setTopTrust] = useState(0);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    initUsersIfEmpty();
    initRequestsIfEmpty();
    const users = getAllUsers();
    const reqs = getVisibleRequests();
    const solved = reqs.filter((r) => r.status === "solved").length;
    let maxT = 0;
    for (const u of users) {
      const t = userContributionStats(u.id).trust;
      if (t > maxT) maxT = t;
    }
    setMembers(users.length);
    setRequestCount(reqs.length);
    setSolvedCount(solved);
    setTopTrust(maxT);
    setFeatured([...reqs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));
  }, []);

  const homeNavClass = location.pathname === "/" ? "hh-nav-active" : "";

  return (
    <div className="hh-landing">
      <header className="hh-topbar">
        <div className="hh-container hh-nav">
          <Link to="/" className="hh-brand">
            <span className="hh-brand-badge" aria-hidden>
              H
            </span>
            <span>HelpHub AI</span>
          </Link>
          <nav className="hh-nav-links" aria-label="Primary">
            <Link to="/" className={homeNavClass}>
              Home
            </Link>
            <Link to="/explore">Explore</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/ai-center">AI Center</Link>
          </nav>
          <div className="hh-nav-actions">
            <Link to="/notifications" className="hh-pill">
              Live community signals
            </Link>
            <Link to="/auth" className="hh-btn hh-btn--primary hh-btn--sm">
              Join the platform
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hh-hero">
          <div className="hh-container hh-hero-grid">
            <div className="hh-hero-copy">
              <p className="hh-eyebrow">SMIT Grand Coding Night 2026</p>
              <h1>Find help faster. Become help that matters.</h1>
              <p>
                HelpHub AI is a community-powered support network for students, mentors, creators,
                and builders. Ask for help, offer help, track impact, and let AI surface smarter
                matches across the platform.
              </p>
              <div className="hh-hero-actions">
                <Link to="/dashboard" className="hh-btn hh-btn--primary">
                  Open product demo
                </Link>
                <Link to="/create-request" className="hh-btn hh-btn--secondary">
                  Post a request
                </Link>
              </div>
              <div className="hh-stats-grid">
                <div className="hh-stat-card">
                  <p className="hh-eyebrow">Members</p>
                  <p className="hh-stat-value">{members}</p>
                  <p>Students, mentors, and helpers in the loop.</p>
                </div>
                <div className="hh-stat-card">
                  <p className="hh-eyebrow">Requests</p>
                  <p className="hh-stat-value">{requestCount}</p>
                  <p>Support posts shared across learning journeys.</p>
                </div>
                <div className="hh-stat-card">
                  <p className="hh-eyebrow">Solved</p>
                  <p className="hh-stat-value">{solvedCount}</p>
                  <p>Problems resolved through fast community action.</p>
                </div>
              </div>
            </div>

            <div className="hh-hero-panel">
              <span className="hh-orb" aria-hidden />
              <p className="hh-eyebrow">Live product feel</p>
              <h2>More than a form. More like an ecosystem.</h2>
              <p>
                A polished multi-page experience inspired by product platforms, with AI summaries,
                trust scores, contribution signals, notifications, and leaderboard momentum built
                directly in HTML, CSS, JavaScript, and LocalStorage.
              </p>
              <div className="hh-stack">
                <div className="hh-feature-tile">
                  <h3>AI request intelligence</h3>
                  <p>
                    Auto-categorization, urgency detection, tags, rewrite suggestions, and trend
                    snapshots.
                  </p>
                </div>
                <div className="hh-feature-tile">
                  <h3>Community trust graph</h3>
                  <p>
                    Badges, helper rankings, trust score boosts, and visible contribution history.
                  </p>
                </div>
                <div className="hh-feature-tile hh-feature-tile--metric">
                  <h3>{topTrust}%</h3>
                  <p>Top trust score currently active across the sample mentor network.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="hh-section">
          <div className="hh-container">
            <div className="hh-section-head">
              <div>
                <p className="hh-section-kicker">Core flow</p>
                <h2>From struggling alone to solving together</h2>
              </div>
              <Link to="/onboarding" className="hh-btn hh-btn--secondary hh-btn--sm">
                Try onboarding AI
              </Link>
            </div>
            <div className="hh-card-grid">
              <article className="hh-feature-card">
                <h3>Ask for help clearly</h3>
                <p>
                  Create structured requests with category, urgency, AI suggestions, and tags that
                  attract the right people.
                </p>
              </article>
              <article className="hh-feature-card">
                <h3>Discover the right people</h3>
                <p>
                  Use the explore feed, helper lists, notifications, and messaging to move quickly
                  once a match happens.
                </p>
              </article>
              <article className="hh-feature-card">
                <h3>Track real contribution</h3>
                <p>
                  Trust scores, badges, solved requests, and rankings help the community recognize
                  meaningful support.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="hh-section">
          <div className="hh-container">
            <div className="hh-section-head">
              <div>
                <p className="hh-section-kicker">Featured requests</p>
                <h2>Community problems currently in motion</h2>
              </div>
              <Link to="/explore" className="hh-btn hh-btn--secondary hh-btn--sm">
                View full feed
              </Link>
            </div>
            <div className="hh-card-grid">
              {featured.length === 0 ? (
                <p className="hh-empty">
                  No featured requests yet. Join the platform and publish a request to see it here.
                </p>
              ) : (
                featured.map((r) => (
                  <article key={r.id} className="hh-request-card">
                    <div className="hh-tag-row">
                      <span className="hh-tag">{r.category}</span>
                      <span className={urgencyClass(r.urgency)}>{r.urgency}</span>
                      <span className="hh-tag hh-tag--open">{r.status === "solved" ? "Solved" : "Open"}</span>
                    </div>
                    <h3>{r.title}</h3>
                    <p className="hh-request-body">{r.description}</p>
                    <div className="hh-chip-row">
                      {(r.skills || []).slice(0, 5).map((s) => (
                        <span key={s} className="hh-chip">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="hh-request-footer">
                      <div>
                        <p className="hh-request-name">{r.authorName}</p>
                        <p className="hh-request-meta">
                          {r.location} • {helperLine(r)}
                        </p>
                      </div>
                      <Link to={`/requests/${r.id}`} className="hh-btn hh-btn--secondary hh-btn--sm">
                        Open details
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="hh-footer">
        <div className="hh-container">
          HelpHub AI is built as a premium-feel, multi-page community support product using HTML,
          CSS, JavaScript, and LocalStorage.
        </div>
      </footer>
    </div>
  );
}

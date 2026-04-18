import { useMemo } from "react";
import { getAllUsers } from "../lib/usersStorage.js";
import { userContributionStats, badgesForUser } from "../lib/communityStats.js";

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function LeaderboardPage() {
  const rows = useMemo(() => {
    return getAllUsers()
      .map((u) => {
        const s = userContributionStats(u.id);
        const badgeStr = badgesForUser(s.trust, s.contributions, s.helped).join(" • ");
        return { ...u, ...s, badgeStr };
      })
      .sort((a, b) => b.trust - a.trust || b.contributions - a.contributions);
  }, []);

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Leaderboard</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            Recognize the people who keep the community moving.
          </h1>
          <p>Trust scores and contributions are derived from help activity in LocalStorage.</p>
        </div>
      </section>

      <section className="leader-grid section">
        <div className="panel stack">
          <div>
            <p className="section-kicker">Top helpers</p>
            <h2>Rankings</h2>
          </div>
          {rows.map((u, i) => (
            <div key={u.id} className="rank-item">
              <span className="avatar teal">{initials(u.name)}</span>
              <div>
                <strong>
                  #{i + 1} {u.name}
                </strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                  {u.role === "can_help"
                    ? "JavaScript, React, Git/GitHub"
                    : "Community, peer review, coursework"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat-value" style={{ fontSize: "1.35rem" }}>
                  {u.trust}%
                </div>
                <small style={{ color: "var(--muted)" }}>{u.contributions} contributions</small>
              </div>
            </div>
          ))}
        </div>

        <div className="panel stack">
          <div>
            <p className="section-kicker">Badge system</p>
            <h2>Trust and achievement</h2>
          </div>
          {rows.slice(0, 4).map((u) => (
            <article key={u.id} className="feature-card">
              <h3>{u.name}</h3>
              <p style={{ marginBottom: 10 }}>{u.badgeStr}</p>
              <div className="progress">
                <span style={{ width: `${u.trust}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

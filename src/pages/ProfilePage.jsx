import { useState } from "react";
import { loadSession, loadProfile, saveProfile, saveSession } from "../lib/storage.js";
import { userContributionStats, badgesForUser } from "../lib/communityStats.js";
import { parseList } from "../lib/onboardingAi.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ProfilePage() {
  const session = loadSession();
  const { showToast } = useToast();
  const initial = loadProfile() ?? {};
  const stats = userContributionStats(session?.userId);

  const [name, setName] = useState(initial.name ?? session?.displayName ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [skillsText, setSkillsText] = useState((initial.skills || []).join(", "));
  const [interestsText, setInterestsText] = useState((initial.interests || []).join(", "));
  const skillsArr = parseList(skillsText);
  const badges = badgesForUser(stats.trust, stats.contributions, stats.helped);

  function handleSave(e) {
    e.preventDefault();
    if (!session) return;
    saveProfile({
      ...initial,
      userId: session.userId,
      name: name.trim(),
      location: location.trim(),
      skills: parseList(skillsText),
      interests: parseList(interestsText),
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });
    saveSession({
      ...session,
      displayName: name.trim() || session.displayName,
    });
    showToast("Profile saved.", "success");
  }

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Profile</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>{name || session?.displayName}</h1>
          <p>
            {session?.roleLabel} • {location || "Location not set"}
          </p>
        </div>
      </section>

      <section className="two-col section">
        <article className="panel stack">
          <div>
            <p className="section-kicker">Public profile</p>
            <h2>Skills and reputation</h2>
          </div>

          <div className="metric">
            <span>Trust score</span>
            <strong>{stats.trust}%</strong>
          </div>
          <div className="metric">
            <span>Contributions</span>
            <strong>{stats.contributions}</strong>
          </div>

          <div>
            <p className="section-kicker" style={{ marginBottom: 8 }}>
              Skills
            </p>
            <div className="tag-row">
              {skillsArr.length ? (
                skillsArr.map((s) => (
                  <span key={s} className="pill">
                    {s}
                  </span>
                ))
              ) : (
                <p>Add skills in the form →</p>
              )}
            </div>
          </div>

          <div>
            <p className="section-kicker" style={{ marginBottom: 8 }}>
              Badges
            </p>
            <div className="tag-row">
              {badges.map((b) => (
                <span key={b} className="pill">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article className="panel stack">
          <div>
            <p className="section-kicker">Edit profile</p>
            <h2>Update your identity</h2>
          </div>
          <form className="stack" onSubmit={handleSave}>
            <div className="auth-grid">
              <div className="field">
                <label htmlFor="pf-name">Name</label>
                <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="pf-loc">Location</label>
                <input id="pf-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="pf-skills">Skills</label>
              <input
                id="pf-skills"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Figma, UI/UX, HTML/CSS"
              />
            </div>
            <div className="field">
              <label htmlFor="pf-int">Interests</label>
              <input
                id="pf-int"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="Career guidance, open source"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Save profile
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}

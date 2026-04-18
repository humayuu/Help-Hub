import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NetlifyTopbar from "../components/NetlifyTopbar.jsx";
import {
  loadSession,
  saveProfile,
  isOnboardingComplete,
} from "../lib/storage.js";
import {
  suggestSkillsYouCanHelpWith,
  suggestAreasYouMayNeedHelp,
  parseList,
} from "../lib/onboardingAi.js";
import { useToast } from "../context/ToastContext.jsx";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const session = loadSession();
  const { showToast } = useToast();

  const [name, setName] = useState(() => loadSession()?.displayName ?? "");
  const [skillsText, setSkillsText] = useState("");
  const [interestsText, setInterestsText] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loadSession()) {
      navigate("/auth", { replace: true });
      return;
    }
    if (isOnboardingComplete()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const skillIdeas = useMemo(
    () => suggestSkillsYouCanHelpWith({ name, skillsText, interestsText }),
    [name, skillsText, interestsText],
  );

  const needIdeas = useMemo(
    () => suggestAreasYouMayNeedHelp({ name, skillsText, interestsText }),
    [name, skillsText, interestsText],
  );

  if (!session) {
    return null;
  }

  function appendUnique(current, addition) {
    const items = parseList(current);
    if (items.some((x) => x.toLowerCase() === addition.toLowerCase())) return current;
    const next = [...items, addition];
    return next.join(", ");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      showToast("Name is required.", "error");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your location.");
      showToast("Location is required.", "error");
      return;
    }
    saveProfile({
      userId: session.userId,
      name: name.trim(),
      skills: parseList(skillsText),
      interests: parseList(interestsText),
      location: location.trim(),
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });
    showToast("Profile complete — welcome to your dashboard.", "success");
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="nh-app">
      <NetlifyTopbar variant="onboarding" />

      <main className="auth-layout container">
        <div className="auth-wrap">
          <section className="auth-card fade-in">
            <p className="section-kicker">Onboarding</p>
            <h1 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>Tell the network who you are</h1>
            <p>
              Name, skills, interests, and location — finish once so the dashboard can personalize
              stats and requests.
            </p>

            <form className="stack" style={{ marginTop: 20 }} onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="ob-name">Full name</label>
                <input
                  id="ob-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hassan Ali"
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label htmlFor="ob-skills">Skills (comma separated)</label>
                <textarea
                  id="ob-skills"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="React, teaching, UI copy, …"
                  rows={3}
                />
              </div>

              <div className="field">
                <label htmlFor="ob-int">Interests (comma separated)</label>
                <textarea
                  id="ob-int"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  placeholder="Career switch, public speaking, open source, …"
                  rows={3}
                />
              </div>

              <div className="field">
                <label htmlFor="ob-loc">Location</label>
                <input
                  id="ob-loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / campus / remote"
                  autoComplete="address-level2"
                />
              </div>

              {error ? <p className="auth-error">{error}</p> : null}

              <button type="submit" className="btn btn-primary btn--block">
                Save profile and go to dashboard
              </button>

              <button
                type="button"
                className="btn btn-secondary btn--block"
                onClick={() => {
                  const s = loadSession();
                  if (!s) return;
                  saveProfile({
                    userId: s.userId,
                    name: name.trim() || s.displayName,
                    skills: parseList(skillsText),
                    interests: parseList(interestsText),
                    location: location.trim() || "Not set",
                    onboardingComplete: true,
                    updatedAt: new Date().toISOString(),
                  });
                  navigate("/dashboard", { replace: true });
                }}
              >
                Quick finish (demo)
              </button>
            </form>
          </section>

          <aside className="auth-side fade-in" aria-label="AI suggestions">
            <p className="eyebrow">AI suggestions</p>
            <h2 style={{ fontSize: "clamp(1.2rem, 2.2vw, 1.6rem)", color: "#fff" }}>
              Keyword hints (no API)
            </h2>
            <p>
              Tap a chip to append it to your lists — lightweight suggestions from what you type.
            </p>

            <div style={{ marginTop: 20 }}>
              <p style={{ fontWeight: 700, marginBottom: 8, color: "rgba(255,255,255,0.9)" }}>
                Skills you can help with
              </p>
              <div className="tag-row">
                {skillIdeas.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="pill"
                    style={{ cursor: "pointer", border: "none" }}
                    onClick={() => setSkillsText((t) => appendUnique(t, label))}
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <p style={{ fontWeight: 700, marginBottom: 8, color: "rgba(255,255,255,0.9)" }}>
                Areas you may want help in
              </p>
              <div className="tag-row">
                {needIdeas.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="pill"
                    style={{ cursor: "pointer", border: "none", opacity: 0.95 }}
                    onClick={() => setInterestsText((t) => appendUnique(t, label))}
                  >
                    + {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

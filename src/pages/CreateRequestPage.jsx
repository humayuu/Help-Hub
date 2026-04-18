import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadSession, loadProfile } from "../lib/storage.js";
import { addRequest } from "../lib/requestsStorage.js";
import {
  inferCategory,
  suggestTags,
  suggestUrgency,
  shortAiSummary,
  rewriteDescription,
} from "../lib/requestAi.js";
import { appendNotification } from "../lib/notificationsStorage.js";
import { useToast } from "../context/ToastContext.jsx";

const CATEGORIES = [
  "Web Development",
  "Data / ML",
  "Mobile",
  "Career",
  "Design",
  "General",
];

function parseList(str) {
  return String(str || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const session = loadSession();
  const profile = loadProfile();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [category, setCategory] = useState("General");
  const [urgency, setUrgency] = useState("Low");
  const [tagsText, setTagsText] = useState("");

  const blob = useMemo(() => `${title}\n${description}`, [title, description]);
  const aiCategory = useMemo(() => inferCategory(blob), [blob]);
  const aiUrgency = useMemo(() => suggestUrgency(blob), [blob]);
  const aiTags = useMemo(() => suggestTags(blob), [blob]);
  const summary = useMemo(() => shortAiSummary(title, description), [title, description]);

  const [error, setError] = useState("");

  function applyAi() {
    setCategory(aiCategory);
    setUrgency(aiUrgency);
    const existing = parseList(tagsText);
    const merged = [...new Set([...existing, ...aiTags])];
    setTagsText(merged.join(", "));
    const next = rewriteDescription(title, description);
    if (next) setDescription(next);
    showToast("AI suggestions applied to category, urgency, tags, and description.", "success");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Please add a title.");
      showToast("Add a title before publishing.", "error");
      return;
    }
    if (!description.trim()) {
      setError("Please add a description.");
      showToast("Add a description before publishing.", "error");
      return;
    }
    if (!session) return;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `req_${crypto.randomUUID()}`
        : `req_${Date.now()}`;

    const skills = parseList(tagsText).length ? parseList(tagsText) : [...aiTags];

    const row = {
      id,
      title: title.trim(),
      description: description.trim(),
      category,
      urgency,
      status: "open",
      skills,
      tags: skills.map((s) => s.toLowerCase()),
      location: location.trim() || "Remote",
      authorId: session.userId,
      authorName: session.displayName,
      helpers: [],
      helperCount: 0,
      createdAt: new Date().toISOString(),
    };

    addRequest(row);
    appendNotification({
      type: "request",
      title: "Request published",
      body: `“${row.title}” is now visible in Explore.`,
    });
    showToast("Request published — opening detail view.", "success");
    navigate(`/requests/${id}`, { replace: true });
  }

  const tagsHint =
    aiTags.length > 0 ? aiTags.join(", ") : "Add more detail for smarter tags";

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Create request</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)" }}>
            Turn a rough problem into a clear help request.
          </h1>
          <p>
            Use built-in AI suggestions for category, urgency, tags, and a stronger description
            rewrite.
          </p>
        </div>
      </section>

      <section className="two-col section">
        <form className="panel stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="cr-title">Title</label>
            <input
              id="cr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Need review on my JavaScript quiz app before submission"
            />
          </div>

          <div className="field">
            <label htmlFor="cr-desc">Description</label>
            <textarea
              id="cr-desc"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the challenge, your current progress, deadline, and what kind of help would be useful."
            />
          </div>

          <div className="auth-grid">
            <div className="field">
              <label htmlFor="cr-tags">Tags</label>
              <input
                id="cr-tags"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="JavaScript, Debugging, Review"
              />
            </div>
            <div className="field">
              <label htmlFor="cr-cat">Category</label>
              <select id="cr-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="cr-urg">Urgency</label>
            <select id="cr-urg" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              {["Low", "Medium", "High"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="cr-loc">Location</label>
            <input
              id="cr-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or remote"
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={applyAi}>
              Apply AI suggestions
            </button>
            <button type="submit" className="btn btn-primary">
              Publish request
            </button>
          </div>
        </form>

        <aside className="panel stack" aria-label="AI assistant">
          <p className="section-kicker">AI assistant</p>
          <h2 style={{ marginTop: 0 }}>Smart request guidance</h2>
          <p style={{ marginBottom: 8 }}>{summary}</p>

          <div className="nh-ai-kv">
            <span className="nh-ai-kv__label">Suggested category</span>
            <span className="nh-ai-kv__value">{aiCategory}</span>
          </div>
          <div className="nh-ai-kv">
            <span className="nh-ai-kv__label">Detected urgency</span>
            <span className="nh-ai-kv__value">{aiUrgency}</span>
          </div>
          <div className="nh-ai-kv">
            <span className="nh-ai-kv__label">Suggested tags</span>
            <span className="nh-ai-kv__value" style={{ fontWeight: 500 }}>
              {tagsHint}
            </span>
          </div>
          <div className="nh-ai-kv">
            <span className="nh-ai-kv__label">Rewrite suggestion</span>
            <span className="nh-ai-kv__value" style={{ fontWeight: 500 }}>
              {rewriteDescription(title, description) ||
                "Start describing the challenge to generate a stronger version."}
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

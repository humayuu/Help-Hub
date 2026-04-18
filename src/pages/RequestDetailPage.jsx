import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getRequestById,
  addHelperToRequest,
  markRequestSolved,
  getHelpersForDisplay,
} from "../lib/requestsStorage.js";
import { shortAiSummary } from "../lib/requestAi.js";
import { loadSession } from "../lib/storage.js";
import { appendNotification } from "../lib/notificationsStorage.js";

function urgencyClass(u) {
  if (u === "High") return "tag urgent";
  return "tag";
}

function helperCountDisplay(r) {
  const n = Array.isArray(r.helpers) ? r.helpers.length : 0;
  return n || (r.helperCount ?? 0);
}

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const session = loadSession();

  const [record, setRecord] = useState(() => (id ? getRequestById(id) : null));
  const [flash, setFlash] = useState(null);

  const refresh = useCallback(() => {
    setRecord(id ? getRequestById(id) : null);
  }, [id]);

  useEffect(() => {
    refresh();
    setFlash(null);
  }, [id, refresh]);

  const r = record;

  if (!r) {
    return (
      <main className="container section">
        <div className="panel">
          <p className="section-kicker">Request</p>
          <h1>Request not found</h1>
          <Link to="/explore" className="btn btn-primary" style={{ marginTop: 12 }}>
            Back to explore
          </Link>
        </div>
      </main>
    );
  }

  const summary = shortAiSummary(r.title, r.description);
  const helpers = getHelpersForDisplay(r);
  const isAuthor = session && r.authorId === session.userId;
  const isSolved = r.status === "solved";
  const alreadyHelper =
    session && Array.isArray(r.helpers) && r.helpers.some((h) => h.userId === session.userId);

  function handleCanHelp() {
    if (!session) return;
    setFlash(null);
    const res = addHelperToRequest(r.id, {
      userId: session.userId,
      displayName: session.displayName,
    });
    if (!res.ok) {
      const map = {
        not_found: "Request not found.",
        closed: "This request is already solved.",
        own_request: "You cannot volunteer on your own request.",
        already: "You are already on the helper list.",
      };
      setFlash({ type: "err", text: map[res.error] ?? "Could not update." });
      return;
    }
    appendNotification({
      type: "help",
      title: "Helper signed up",
      body: `${session.displayName} offered to help on “${r.title}”.`,
    });
    setFlash({ type: "ok", text: "You are on the helper list for this request." });
    refresh();
  }

  function handleSolved() {
    if (!session) return;
    setFlash(null);
    const res = markRequestSolved(r.id, session.userId);
    if (!res.ok) {
      const map = {
        not_found: "Request not found.",
        forbidden: "Only the author can mark this as solved.",
        already: "Already marked as solved.",
      };
      setFlash({ type: "err", text: map[res.error] ?? "Could not update." });
      return;
    }
    appendNotification({
      type: "status",
      title: "Request solved",
      body: `You marked “${r.title}” as solved.`,
    });
    setFlash({ type: "ok", text: "Marked as solved." });
    refresh();
  }

  const canOfferHelp = Boolean(session) && !isSolved && !isAuthor && !alreadyHelper;
  const canMarkSolved = Boolean(session) && isAuthor && !isSolved;

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <Link to="/explore" style={{ display: "inline-block", marginBottom: 14, color: "rgba(255,255,255,0.85)" }}>
            ← Back to explore
          </Link>
          <p className="eyebrow">Request detail</p>
          <div className="tag-row">
            <span className="tag">{r.category}</span>
            <span className={urgencyClass(r.urgency)}>{r.urgency}</span>
            <span className={isSolved ? "tag success" : "tag"}>{isSolved ? "Solved" : "Open"}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>{r.title}</h1>
          <p>{r.description}</p>
        </div>
      </section>

      <div className="section">
        {r.moderationHidden ? (
          <p className="auth-error" role="status">
            This request is hidden from Explore and the public feed. You can still open it with a
            direct link (e.g. author or helpers). Restore visibility from Admin.
          </p>
        ) : null}
        {flash ? (
          <p className={flash.type === "err" ? "auth-error" : "feed-line"} style={{ marginBottom: 16 }}>
            {flash.text}
          </p>
        ) : null}
      </div>

      <section className="two-col section">
        <div className="stack">
          <article className="panel">
            <p className="section-kicker">AI summary</p>
            <div className="row" style={{ alignItems: "flex-start", marginTop: 8 }}>
              <span className="avatar teal" style={{ flexShrink: 0 }}>
                H
              </span>
              <div>
                <p style={{ margin: "0 0 6px", fontWeight: 700, color: "var(--text)" }}>HelpHub AI</p>
                <p style={{ margin: 0 }}>{summary}</p>
                <div className="tag-row" style={{ marginTop: 12 }}>
                  {(r.skills || []).slice(0, 5).map((s) => (
                    <span key={s} className="pill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="panel">
            <p className="section-kicker">Actions</p>
            <div className="row" style={{ flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canOfferHelp}
                title={
                  isAuthor
                    ? "Your request"
                    : alreadyHelper
                      ? "Already listed"
                      : isSolved
                        ? "Closed"
                        : ""
                }
                onClick={handleCanHelp}
              >
                I can help
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={!canMarkSolved}
                title={!isAuthor ? "Author only" : isSolved ? "Solved" : ""}
                onClick={handleSolved}
              >
                Mark as solved
              </button>
            </div>
          </article>
        </div>

        <div className="stack">
          <article className="panel">
            <p className="section-kicker">Requester</p>
            <div className="helper-item" style={{ marginTop: 8 }}>
              <span className="avatar">{initials(r.authorName)}</span>
              <div>
                <strong>{r.authorName}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>{r.location}</p>
              </div>
            </div>
          </article>

          <article className="panel">
            <p className="section-kicker">Helpers</p>
            <h3 style={{ marginTop: 4 }}>People ready to support</h3>
            {helpers.length === 0 ? (
              <p>No helpers yet.</p>
            ) : (
              helpers.map((h) => (
                <div key={h.userId + (h.joinedAt || "")} className="helper-item" style={{ marginTop: 10 }}>
                  <span className="avatar">{initials(h.displayName)}</span>
                  <div>
                    <strong>{h.displayName}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "0.9rem" }}>
                      {(r.skills || []).slice(0, 3).join(", ") || "Community helper"}
                    </p>
                  </div>
                  <span className="pill">Trust {h.legacy ? "—" : `${60 + (h.displayName.length % 40)}%`}</span>
                </div>
              ))
            )}
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              <strong>Interested:</strong> {helperCountDisplay(r)}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

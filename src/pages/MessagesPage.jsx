import { useMemo, useState } from "react";
import { loadSession } from "../lib/storage.js";
import { getAllUsers } from "../lib/usersStorage.js";
import { getMessages, addMessage } from "../lib/messagesStorage.js";
import { useToast } from "../context/ToastContext.jsx";

export default function MessagesPage() {
  const session = loadSession();
  const { showToast } = useToast();
  const [toId, setToId] = useState("");
  const [body, setBody] = useState("");
  const [, bump] = useState(0);

  const messages = useMemo(() => {
    const uid = session?.userId;
    return [...getMessages()]
      .filter((m) => uid && (m.fromUserId === uid || m.toUserId === uid))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bump, session?.userId]);

  const recipients = useMemo(() => {
    return getAllUsers().filter((u) => u.id !== session?.userId);
  }, [session?.userId]);

  function refresh() {
    bump((x) => x + 1);
  }

  function handleSend(e) {
    e.preventDefault();
    if (!recipients.length) {
      showToast("No other demo users to message yet.", "error");
      return;
    }
    const targetId = toId || recipients[0]?.id;
    if (!session || !targetId || !body.trim()) {
      showToast("Pick a recipient and write a message.", "error");
      return;
    }
    const to = recipients.find((u) => u.id === targetId);
    if (!to) {
      showToast("Recipient not found.", "error");
      return;
    }
    addMessage({
      fromUserId: session.userId,
      fromName: session.displayName,
      toUserId: to.id,
      toName: to.name,
      body,
    });
    setBody("");
    refresh();
    showToast(`Message sent to ${to.name}.`, "success");
  }

  return (
    <main className="container">
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">Interaction / Messaging</p>
          <h1 style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
            Keep support moving through direct communication.
          </h1>
          <p>
            Basic messaging gives helpers and requesters a clear follow-up path once a match happens.
          </p>
        </div>
      </section>

      <section className="two-col section">
        <div className="panel stack nh-msg-column">
          <div>
            <p className="section-kicker">Conversation stream</p>
            <h2 style={{ marginTop: 4 }}>Recent messages</h2>
          </div>
          {messages.length === 0 ? (
            <p className="feed-line">No messages yet — send one from the form.</p>
          ) : (
            messages.map((m) => (
              <article key={m.id} className="nh-msg-bubble">
                <div className="nh-msg-bubble__head">
                  <strong className="nh-msg-bubble__names">
                    {m.fromName} → {m.toName}
                  </strong>
                  <span className="nh-msg-time-pill">
                    {new Date(m.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="nh-msg-bubble__body">{m.body}</p>
              </article>
            ))
          )}
        </div>

        <aside className="panel stack" aria-label="Compose">
          <div>
            <p className="section-kicker">Send message</p>
            <h2 style={{ marginTop: 4 }}>Start a conversation</h2>
          </div>
          <form className="stack" onSubmit={handleSend}>
            <div className="field">
              <label htmlFor="msg-to">To</label>
              <select
                id="msg-to"
                value={toId || recipients[0]?.id || ""}
                onChange={(e) => setToId(e.target.value)}
              >
                {recipients.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="msg-body">Message</label>
              <textarea
                id="msg-body"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share support details, ask for files, or suggest next steps."
              />
            </div>
            <button type="submit" className="btn btn-primary btn--block">
              Send
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

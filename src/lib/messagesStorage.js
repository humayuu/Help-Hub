export const MESSAGES_KEY = "helplytics_messages";

function read() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(list.slice(0, 120)));
}

const SEED = [
  {
    id: "msg_seed_1",
    fromUserId: "u_sara",
    fromName: "Sara Noor",
    toUserId: "u_ahmed",
    toName: "Ahmed Raza",
    body: "Thanks for the pandas tip — can we hop on a 15 min call tomorrow evening?",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "msg_seed_2",
    fromUserId: "u_noor",
    fromName: "Noor Fatima",
    toUserId: "u_sara",
    toName: "Sara Noor",
    body: "Sharing a Figma link for the nav flow we discussed.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export function initMessagesIfEmpty() {
  if (read().length) return;
  write(SEED);
}

export function getMessages() {
  initMessagesIfEmpty();
  return read();
}

export function addMessage({ fromUserId, fromName, toUserId, toName, body }) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `msg_${crypto.randomUUID()}`
      : `msg_${Date.now()}`;
  const row = {
    id,
    fromUserId,
    fromName,
    toUserId,
    toName,
    body: String(body || "").trim(),
    createdAt: new Date().toISOString(),
  };
  if (!row.body) return null;
  write([row, ...read()]);
  return row;
}

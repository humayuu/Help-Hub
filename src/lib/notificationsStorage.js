export const NOTIFICATIONS_KEY = "helplytics_notifications";

function readNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeNotifications(list) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list.slice(0, 80)));
}

export function getNotifications() {
  return readNotifications();
}

export function appendNotification({ type, title, body }) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `n_${Date.now()}`;
  const row = {
    id,
    type: type ?? "info",
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  };
  writeNotifications([row, ...readNotifications()]);
}

export function clearNotifications() {
  localStorage.removeItem(NOTIFICATIONS_KEY);
}

export function setNotificationRead(id, isRead) {
  const list = readNotifications();
  const next = list.map((n) => (n.id === id ? { ...n, read: Boolean(isRead) } : n));
  writeNotifications(next);
}

export function markAllNotificationsRead() {
  const list = readNotifications().map((n) => ({ ...n, read: true }));
  writeNotifications(list);
}

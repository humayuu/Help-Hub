/**
 * Demo-only user store in localStorage. Passwords are stored in plain text
 * for this assignment — do not reuse this pattern in production.
 */
export const USERS_KEY = "helplytics_users";

/** Pre-seeded accounts (password: demo1234) */
export const SEED_USERS = [
  {
    id: "u_hassan",
    name: "Hassan Ali",
    email: "community@helphub.ai",
    password: "demo1234",
    role: "need_help",
  },
  {
    id: "u_sara",
    name: "Sara Noor",
    email: "sara.noor@helphub.ai",
    password: "demo1234",
    role: "need_help",
  },
  {
    id: "u_ahmed",
    name: "Ahmed Raza",
    email: "ahmed.raza@helphub.ai",
    password: "demo1234",
    role: "can_help",
  },
  {
    id: "u_noor",
    name: "Noor Fatima",
    email: "noor.fatima@helphub.ai",
    password: "demo1234",
    role: "both",
  },
];

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Call once before auth logic so demo accounts exist in storage. */
export function initUsersIfEmpty() {
  if (readUsers()?.length) return;
  writeUsers(SEED_USERS.map((u) => ({ ...u, createdAt: new Date().toISOString() })));
}

export function getAllUsers() {
  initUsersIfEmpty();
  return readUsers() ?? [];
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function findUserByEmail(email) {
  const key = normalizeEmail(email);
  return getAllUsers().find((u) => normalizeEmail(u.email) === key) ?? null;
}

export function registerUser({ name, email, password, role }) {
  initUsersIfEmpty();
  const users = getAllUsers();
  if (findUserByEmail(email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `u_${crypto.randomUUID()}`
      : `u_${Date.now()}`;
  const row = {
    id,
    name: name.trim(),
    email: email.trim(),
    password,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(row);
  writeUsers(users);
  return { ok: true, user: row };
}

/** Returns user row if credentials match, else null. */
export function verifyLogin(email, password) {
  const u = findUserByEmail(email);
  if (!u) return null;
  if (u.password !== password) return null;
  return u;
}

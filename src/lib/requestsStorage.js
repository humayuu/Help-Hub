export const REQUESTS_KEY = "helplytics_requests";

const SEED = [
  {
    id: "req_seed_1",
    title: "Need help making my portfolio feel senior-level",
    description:
      "I have projects but the layout feels generic. Looking for someone to critique hierarchy, spacing, and storytelling flow before I ship to recruiters.",
    category: "Web Development",
    urgency: "High",
    status: "open",
    skills: ["HTML/CSS", "Responsive", "UI polish"],
    tags: ["portfolio", "layout"],
    location: "Karachi",
    authorId: "u_sara",
    authorName: "Sara Noor",
    helperCount: 1,
    helpers: [
      {
        userId: "u_hassan",
        displayName: "Hassan Ali",
        joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "req_seed_2",
    title: "Stuck normalizing messy survey exports for a class project",
    description:
      "CSVs have inconsistent headers and missing values. Want a clean notebook walkthrough and sanity checks so my charts are not lying by accident.",
    category: "Data / ML",
    urgency: "Medium",
    status: "open",
    skills: ["Pandas", "Cleaning", "Visualization"],
    tags: ["csv", "class"],
    location: "Lahore",
    authorId: "u_ahmed",
    authorName: "Ahmed Raza",
    helperCount: 3,
    helpers: [
      {
        userId: "u_sara",
        displayName: "Sara Noor",
        joinedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      },
      {
        userId: "u_noor",
        displayName: "Noor Fatima",
        joinedAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
      },
      {
        userId: "u_hassan",
        displayName: "Hassan Ali",
        joinedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "req_seed_3",
    title: "Second pair of eyes on navigation UX for a React Native app",
    description:
      "Flow works but feels clunky between stacks. Looking for quick wins on transitions, empty states, and back behavior on Android.",
    category: "Mobile",
    urgency: "Low",
    status: "open",
    skills: ["React Native", "UX", "Navigation"],
    tags: ["android", "navigation"],
    location: "Islamabad",
    authorId: "u_noor",
    authorName: "Noor Fatima",
    helperCount: 2,
    helpers: [
      {
        userId: "u_sara",
        displayName: "Sara Noor",
        joinedAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        userId: "u_ahmed",
        displayName: "Ahmed Raza",
        joinedAt: new Date(Date.now() - 36000000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

function read() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function write(list) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
}

export function initRequestsIfEmpty() {
  if (read()?.length) return;
  write(SEED);
}

export function getRequests() {
  initRequestsIfEmpty();
  return read() ?? [];
}

/** Feed / dashboard lists: exclude moderated-hidden rows. */
export function getVisibleRequests() {
  return getRequests().filter((r) => !r.moderationHidden);
}

export function getRequestById(id) {
  return getRequests().find((r) => r.id === id) ?? null;
}

export function saveRequests(list) {
  write(list);
}

export function addRequest(row) {
  const list = getRequests();
  const helpers = Array.isArray(row.helpers) ? row.helpers : [];
  const withHelpers = {
    moderationHidden: false,
    ...row,
    helpers,
    helperCount: helpers.length ? helpers.length : row.helperCount ?? 0,
  };
  list.unshift(withHelpers);
  write(list);
  return withHelpers;
}

export function deleteRequest(id) {
  const list = getRequests().filter((r) => r.id !== id);
  write(list);
  return list;
}

export function setRequestModerationHidden(id, hidden) {
  const list = getRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return { ok: false };
  list[idx] = { ...list[idx], moderationHidden: Boolean(hidden) };
  write(list);
  return { ok: true, request: list[idx] };
}

/**
 * @param {string} requestId
 * @param {{ userId: string, displayName: string }} helper
 */
export function addHelperToRequest(requestId, helper) {
  const list = getRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx === -1) return { ok: false, error: "not_found" };
  const r = list[idx];
  if (r.status === "solved") return { ok: false, error: "closed" };
  if (r.authorId === helper.userId) return { ok: false, error: "own_request" };
  const helpers = [...(Array.isArray(r.helpers) ? r.helpers : [])];
  if (helpers.some((h) => h.userId === helper.userId)) {
    return { ok: false, error: "already" };
  }
  helpers.push({
    userId: helper.userId,
    displayName: helper.displayName,
    joinedAt: new Date().toISOString(),
  });
  list[idx] = { ...r, helpers, helperCount: helpers.length };
  write(list);
  return { ok: true, request: list[idx] };
}

/**
 * Only the author can mark a request solved.
 */
export function markRequestSolved(requestId, userId) {
  const list = getRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx === -1) return { ok: false, error: "not_found" };
  const r = list[idx];
  if (r.authorId !== userId) return { ok: false, error: "forbidden" };
  if (r.status === "solved") return { ok: false, error: "already" };
  list[idx] = {
    ...r,
    status: "solved",
    solvedAt: new Date().toISOString(),
  };
  write(list);
  return { ok: true, request: list[idx] };
}

/** Helpers list for display (legacy rows without `helpers` use count only). */
export function getHelpersForDisplay(r) {
  if (Array.isArray(r.helpers) && r.helpers.length) return r.helpers;
  const n = r.helperCount ?? 0;
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => ({
    userId: `legacy_${i}`,
    displayName: `Helper ${i + 1}`,
    joinedAt: r.createdAt,
    legacy: true,
  }));
}

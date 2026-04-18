import { getRequests, getVisibleRequests } from "./requestsStorage.js";

export function userContributionStats(userId) {
  const reqs = getRequests();
  let helped = 0;
  let authored = 0;
  let solvedAuthored = 0;
  for (const r of reqs) {
    if (r.authorId === userId) {
      authored += 1;
      if (r.status === "solved") solvedAuthored += 1;
    }
    if (Array.isArray(r.helpers) && r.helpers.some((h) => h.userId === userId)) {
      helped += 1;
    }
  }
  const contributions = helped + solvedAuthored * 2;
  const trust = Math.min(100, 38 + helped * 6 + solvedAuthored * 10);
  return { helped, authored, solvedAuthored, contributions, trust };
}

export function badgesForUser(trust, contributions, helped) {
  const b = [];
  if (trust >= 90) b.push("Top Mentor");
  else if (trust >= 75) b.push("Trusted helper");
  if (helped >= 2) b.push("Fast Responder");
  if (contributions >= 4) b.push("Design Ally");
  if (contributions >= 1 && b.length < 3) b.push("Code Rescuer");
  if (b.length === 0) b.push("Community member");
  return b.slice(0, 4);
}

export function topCategoryFromRequests() {
  const reqs = getVisibleRequests();
  const map = {};
  for (const r of reqs) {
    const c = r.category || "General";
    map[c] = (map[c] || 0) + 1;
  }
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "—";
}

export function highUrgencyOpenCount() {
  return getVisibleRequests().filter((r) => r.status !== "solved" && r.urgency === "High").length;
}

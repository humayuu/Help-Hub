/** Keyword-only helpers for create-request UX (no external API). */

export function inferCategory(text) {
  const t = String(text || "").toLowerCase();
  if (/(react|html|css|web|portfolio|next|vite|tailwind|frontend|ui|layout)/.test(t)) {
    return "Web Development";
  }
  if (/(python|pandas|data|csv|ml|model|survey|notebook|sql|excel)/.test(t)) {
    return "Data / ML";
  }
  if (/(react native|android|ios|mobile|expo|navigation)/.test(t)) {
    return "Mobile";
  }
  if (/(career|interview|resume|cv|job|recruiter)/.test(t)) {
    return "Career";
  }
  if (/(figma|design|brand|typography)/.test(t)) {
    return "Design";
  }
  return "General";
}

export function suggestUrgency(text) {
  const t = String(text || "").toLowerCase();
  if (/(urgent|asap|emergency|blocked|today|tonight|exam tomorrow)/.test(t)) return "High";
  if (/(soon|this week|deadline|priority)/.test(t)) return "Medium";
  return "Low";
}

export function suggestTags(text) {
  const t = String(text || "").toLowerCase();
  const pool = [
    ["react", "React"],
    ["python", "Python"],
    ["css", "CSS"],
    ["figma", "Figma"],
    ["pandas", "Pandas"],
    ["android", "Android"],
    ["interview", "Interviews"],
    ["portfolio", "Portfolio"],
    ["debug", "Debugging"],
    ["api", "APIs"],
    ["sql", "SQL"],
    ["ux", "UX"],
  ];
  const out = [];
  const seen = new Set();
  for (const [needle, label] of pool) {
    if (t.includes(needle) && !seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out.slice(0, 6);
}

export function shortAiSummary(title, description) {
  const t = `${title} ${description}`.trim();
  if (!t) return "Add a title and description to generate a short summary.";
  const cat = inferCategory(t);
  const urg = suggestUrgency(t);
  return `Looks like a ${cat.toLowerCase()} request with ${urg.toLowerCase()} urgency. Keep the next step concrete so helpers can reply with a plan.`;
}

/**
 * Keyword-based rewrite (PDF “rewrite suggestions”) — edits tone/clarity without external API.
 */
export function rewriteDescription(title, description) {
  const raw = `${String(title || "").trim()}\n\n${String(description || "").trim()}`.trim();
  if (!raw) return "";
  const cat = inferCategory(raw);
  const urg = suggestUrgency(raw);
  const bullets = suggestTags(raw)
    .slice(0, 4)
    .map((t) => `• ${t}: add one concrete detail or link related to this area.`);
  const body = String(description || "").trim() || "I am looking for structured guidance.";
  return (
    `Context (${cat}, ${urg} urgency)\n\n` +
    `Goal: ${String(title || "Help request").trim()}\n\n` +
    `What I need:\n` +
    `${body}\n\n` +
    `Next steps I can take today:\n` +
    (bullets.length ? bullets.join("\n") + "\n\n" : "") +
    `Constraints: please mention timeline, tools, and what you already tried so helpers can respond quickly.`
  );
}

/**
 * Lightweight "AI-like" suggestions from free text (keywords only, no API).
 */
const HELP_SKILL_KEYWORDS = [
  ["react", "React"],
  ["javascript", "js", "JavaScript"],
  ["python", "Python"],
  ["figma", "ui", "ux", "design", "UI/UX"],
  ["css", "html", "tailwind", "CSS"],
  ["node", "express", "backend", "Node.js"],
  ["sql", "database", "mongo", "SQL"],
  ["data", "pandas", "excel", "Data analysis"],
  ["mobile", "android", "ios", "react native", "Mobile"],
  ["writing", "essay", "documentation", "Writing"],
];

const NEED_AREA_KEYWORDS = [
  ["interview", "job", "career", "recruiter", "Career / interviews"],
  ["portfolio", "resume", "cv", "Portfolio & presentation"],
  ["course", "class", "assignment", "homework", "Coursework"],
  ["debug", "error", "stuck", "bug", "Debugging support"],
  ["architecture", "system design", "scalability", "Architecture planning"],
  ["motivation", "time", "focus", "burnout", "Study habits & focus"],
  ["english", "grammar", "ielts", "English communication"],
  ["ml", "model", "ai", "Machine learning basics"],
];

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[\s,;.]+/)
    .filter(Boolean);
}

function matchCatalog(text, catalog) {
  const blob = String(text || "").toLowerCase();
  const out = [];
  const seen = new Set();
  for (const [needle, label] of catalog) {
    if (blob.includes(needle) && !seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

export function suggestSkillsYouCanHelpWith({ name, skillsText, interestsText }) {
  const blob = [name, skillsText, interestsText].join(" ");
  const fromKeywords = matchCatalog(blob, HELP_SKILL_KEYWORDS);
  const defaults = ["Community support", "Peer review"];
  return [...new Set([...fromKeywords, ...defaults])].slice(0, 8);
}

export function suggestAreasYouMayNeedHelp({ name, skillsText, interestsText }) {
  const blob = [name, skillsText, interestsText].join(" ");
  const fromKeywords = matchCatalog(blob, NEED_AREA_KEYWORDS);
  const defaults = ["Finding the right mentor", "Breaking a problem into steps"];
  return [...new Set([...fromKeywords, ...defaults])].slice(0, 8);
}

export function parseList(str) {
  return String(str || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

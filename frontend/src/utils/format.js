// The API returns dates as "YYYY-MM-DD HH:MM:SS" (local time)
export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-GB", options) : "";
}

export function formatTime(value) {
  const d = toDate(value);
  return d ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return `${formatDate(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ${formatTime(d)}`;
}

export function timeAgo(value) {
  const d = toDate(value);
  if (!d) return "";
  const seconds = Math.round((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(d);
}

// "2026-10-20 14:30:00" -> "2026-10-20T14:30" for <input type="datetime-local">
export function toInputDateTime(value) {
  if (!value) return "";
  return String(value).replace(" ", "T").slice(0, 16);
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Stable accent colour for a club / category
const PALETTE = ["#0b6571", "#1f7a5c", "#7a4b9c", "#b5651d", "#2f5f9e", "#a23b5a", "#4d6b16", "#5b5f97"];
export function colorFor(text = "") {
  let hash = 0;
  for (const ch of text) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export const CLUB_CATEGORIES = [
  "Technology",
  "Arts & Culture",
  "Sports",
  "Community Service",
  "Leadership",
  "Academic",
  "Religious",
  "General",
];

export const FACULTIES = [
  "Engineering",
  "Science",
  "Medicine",
  "Agriculture",
  "Management & Finance",
  "Humanities & Social Sciences",
  "Fisheries & Marine Sciences",
  "Technology",
  "Allied Health Sciences",
  "Other",
];

// Formatting and form helpers for the Link Studio admin console (pure, unit-tested).

/** Same rules as the Worker: 3–64 chars of A–Z a–z 0–9 - _, starting and ending with a letter or digit. */
export const ALIAS_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9_-]{1,62})[A-Za-z0-9]$/;

/** The Worker's reserved words (compared case-insensitively). Kept in sync with toolkit4me-shortlinks src/config.ts. */
export const RESERVED_ALIASES = new Set(["api", "health", "healthz", "admin", "assets", "static", "login", "logout", "dashboard", "link-studio", "www", "app", "cdn-cgi", "_next", "bulk"]);

/** Client-side alias check for instant feedback; the Worker re-validates and checks uniqueness. */
export function aliasProblem(alias: string): string | null {
  const a = alias.trim();
  if (a === "") return null;
  if (a.length < 3) return "Alias must be at least 3 characters.";
  if (a.length > 64) return "Alias must be at most 64 characters.";
  if (!ALIAS_PATTERN.test(a)) return 'Use only letters, numbers, "-" and "_", starting and ending with a letter or number.';
  if (RESERVED_ALIASES.has(a.toLowerCase())) return "That alias is reserved by the system — choose another.";
  return null;
}

/** Client-side destination check mirroring the Worker's main rules. */
export function destinationProblem(url: string): string | null {
  const v = url.trim();
  if (v === "") return "Enter the destination URL.";
  if (v.length > 2048) return "The destination URL must be at most 2,048 characters.";
  if (/\s/.test(v)) return "The destination URL contains spaces.";
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return "Enter a full URL starting with https://";
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return "Only http:// and https:// destinations are allowed.";
  if (u.username || u.password) return "Destination URLs can't contain a user name or password.";
  if (!u.hostname.includes(".")) return "The destination needs a full domain name, such as example.com.";
  if (u.hostname.toLowerCase() === "go.toolkit4me.com") return "A short link can't point to another go.toolkit4me.com link.";
  return null;
}

/** <input type="datetime-local"> value (visitor's local time) → ISO-8601 with offset, as the Worker requires. */
export function localInputToIso(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO date → value for <input type="datetime-local"> in the visitor's local time. */
export function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function expiryProblem(value: string, now = Date.now()): string | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return "Enter a valid expiry date and time.";
  if (t <= now) return "The expiry must be in the future.";
  const max = new Date(now);
  max.setFullYear(max.getFullYear() + 10);
  if (t > max.getTime()) return "The expiry must be within 10 years.";
  return null;
}

export function formatDateTime(iso: string | null, fallback = "—"): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? fallback : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatDay(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? isoDate : d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

let regionNames: Intl.DisplayNames | null | undefined;
/** "GB" → "United Kingdom"; special values such as "(unknown)" and "XX"/"T1" pass through. */
export function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return code === "T1" ? "Tor network" : code === "XX" ? "(unknown)" : code;
  if (regionNames === undefined) {
    try {
      regionNames = new Intl.DisplayNames(undefined, { type: "region" });
    } catch {
      regionNames = null;
    }
  }
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

export const REDIRECT_LABELS: Record<number, string> = {
  302: "302 — temporary (recommended: every click is counted)",
  307: "307 — temporary, keeps the request method",
  301: "301 — permanent (browsers cache it; repeat clicks may not be counted)",
  308: "308 — permanent, keeps the request method (cached)",
};

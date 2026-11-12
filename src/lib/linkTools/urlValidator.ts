// ---------------------------------------------------------------------
// URL Validator — checks a web address's structure the way browsers and
// link services read it. Pure function (no network): it can't tell
// whether the page exists, only whether the address is well-formed and
// whether anything about it is likely to cause problems.
// ---------------------------------------------------------------------

import { isTrackingParam } from "./urlCleaner";

export type CheckSeverity = "error" | "warning" | "info";

export interface UrlCheck {
  severity: CheckSeverity;
  message: string;
}

export interface UrlValidation {
  /** True when no check is an error. */
  valid: boolean;
  /** The address as a browser will read it (only when it parses). */
  normalized?: string;
  /** A corrected address to try, e.g. with https:// added. */
  suggestion?: string;
  checks: UrlCheck[];
  /** Parsed parts (only when it parses). */
  parts?: { scheme: string; host: string; port: string; path: string; query: string; fragment: string };
}

/** Longest address we recommend; many services and older browsers truncate or reject longer ones. */
export const RECOMMENDED_MAX_URL_LENGTH = 2048;

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
// eslint-disable-next-line no-control-regex
const CONTROL_OR_SPACE = /[\u0000-\u001F\u007F\s]/;
const LOOKS_LIKE_DOMAIN = /^[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)*\.[\p{L}]{2,}(?::\d+)?([/?#].*)?$/u;
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

function finish(checks: UrlCheck[], extra: Omit<UrlValidation, "valid" | "checks"> = {}): UrlValidation {
  return { valid: !checks.some((c) => c.severity === "error"), checks, ...extra };
}

export function validateUrl(raw: string): UrlValidation {
  const checks: UrlCheck[] = [];
  const value = raw.trim();

  if (value === "") return finish([{ severity: "error", message: "Enter a web address to check." }]);
  if (value !== raw) checks.push({ severity: "info", message: "Spaces at the start or end were ignored." });

  if (CONTROL_OR_SPACE.test(value)) {
    const fixed = value.replace(/\s/g, "%20");
    checks.push({
      severity: "error",
      message: "The address contains spaces or invisible control characters. Spaces must be written as %20 — they often sneak in when a link is copied from a document or email.",
    });
    return finish(checks, { suggestion: CONTROL_OR_SPACE.test(fixed) ? undefined : fixed });
  }

  const scheme = SCHEME.exec(value)?.[1]?.toLowerCase();
  // "example.com:8080/x" parses as scheme "example.com" — treat a dotted "scheme" as a missing one.
  if (!scheme || (scheme.includes(".") && LOOKS_LIKE_DOMAIN.test(value))) {
    if (value.startsWith("//")) {
      checks.push({ severity: "error", message: "The address starts with // but has no scheme. Add https: in front." });
      return finish(checks, { suggestion: `https:${value}` });
    }
    if (LOOKS_LIKE_DOMAIN.test(value) || value.toLowerCase().startsWith("www.")) {
      checks.push({
        severity: "error",
        message: "The address is missing https://. Browsers guess it when you type it, but QR codes, emails, apps and link services need the full address.",
      });
      return finish(checks, { suggestion: `https://${value}` });
    }
    checks.push({ severity: "error", message: "This isn't a web address. A complete one starts with https:// followed by a domain, such as https://example.com." });
    return finish(checks);
  }

  if (scheme !== "http" && scheme !== "https") {
    checks.push({
      severity: "error",
      message: `This is a "${scheme}:" address, not a web page link. Only http:// and https:// addresses open in a browser for everyone.`,
    });
    return finish(checks);
  }

  if (/^https?:\/[^/]/i.test(value) || /^https?:[^/]/i.test(value)) {
    checks.push({ severity: "error", message: "The address needs two slashes after the colon, as in https://example.com." });
    return finish(checks, { suggestion: value.replace(/^(https?):\/*/i, "$1://") });
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    checks.push({ severity: "error", message: "The address can't be read. Check the domain for typos, stray characters or a missing part." });
    return finish(checks);
  }

  const host = url.hostname.toLowerCase();
  const parts = {
    scheme: url.protocol.replace(":", ""),
    host,
    port: url.port,
    path: url.pathname,
    query: url.search,
    fragment: url.hash,
  };
  const extra = { normalized: url.href, parts };

  if (host === "") {
    checks.push({ severity: "error", message: "The address has no domain name." });
    return finish(checks, extra);
  }

  // ----- Host -----
  const isIpv6 = host.startsWith("[");
  const ipv4 = IPV4.exec(host);
  if (ipv4) {
    if (ipv4.slice(1).some((o) => Number(o) > 255)) checks.push({ severity: "error", message: "The IP address isn't valid — each number must be 0 to 255." });
    else checks.push({ severity: "warning", message: "The address uses an IP number instead of a domain name. That's normal for routers and test servers, but unusual for a public link, and visitors can't tell who runs it." });
  } else if (isIpv6) {
    checks.push({ severity: "warning", message: "The address uses an IPv6 number instead of a domain name, which is unusual for a public link." });
  } else if (host === "localhost" || host.endsWith(".localhost")) {
    checks.push({ severity: "warning", message: "localhost points to the visitor's own computer, so this link only works on the machine that runs the site." });
  } else if (!host.includes(".")) {
    checks.push({ severity: "error", message: `"${host}" isn't a complete domain name — it needs an ending such as .com or .org.` });
  } else {
    if (host.length > 253) checks.push({ severity: "error", message: "The domain name is longer than the 253-character maximum." });
    const labels = host.replace(/\.$/, "").split(".");
    if (labels.some((l) => l.length === 0)) checks.push({ severity: "error", message: "The domain has an empty part (two dots in a row)." });
    if (labels.some((l) => l.length > 63)) checks.push({ severity: "error", message: "One part of the domain is longer than the 63-character maximum." });
    if (labels.some((l) => l.startsWith("-") || l.endsWith("-"))) checks.push({ severity: "error", message: "A part of the domain starts or ends with a hyphen, which isn't allowed." });
    if (labels.some((l) => l.includes("_"))) checks.push({ severity: "warning", message: "The domain contains an underscore. Some browsers and services reject underscores in host names." });
    const tld = labels[labels.length - 1];
    if (/^\d+$/.test(tld)) checks.push({ severity: "error", message: "The domain ending can't be a number." });
    if (labels.some((l) => l.startsWith("xn--"))) {
      checks.push({
        severity: "info",
        message: `The domain contains international characters (shown to browsers as ${host}). Check it's the site you expect — look-alike letters are a common phishing trick.`,
      });
    }
  }

  // ----- Scheme, credentials, port -----
  if (parts.scheme === "http") checks.push({ severity: "warning", message: "The address uses http://, which isn't encrypted. Browsers mark such pages as \"Not secure\"; use https:// if the site supports it." });
  if (url.username || url.password) {
    checks.push({
      severity: "warning",
      message: "The address contains a user name or password before the @ sign. Browsers warn about this, and it's a common way to disguise the real destination.",
    });
  }
  if (url.port) checks.push({ severity: "info", message: `The address uses port ${url.port}. That's fine for development servers but unusual for public links.` });

  // ----- Length and rewriting -----
  if (url.href.length > RECOMMENDED_MAX_URL_LENGTH) {
    checks.push({ severity: "warning", message: `The address is ${url.href.length.toLocaleString()} characters. Many services cut off or reject links longer than ${RECOMMENDED_MAX_URL_LENGTH.toLocaleString()} characters.` });
  }
  const tracking = [...url.searchParams.keys()].filter(isTrackingParam);
  if (tracking.length > 0) {
    checks.push({ severity: "info", message: `It contains tracking parameters (${[...new Set(tracking)].join(", ")}). Remove them with the URL Parser & Cleaner if you're sharing the link yourself.` });
  }
  if (url.hash) checks.push({ severity: "info", message: `It ends with a fragment (${url.hash.length > 40 ? `${url.hash.slice(0, 40)}…` : url.hash}), which jumps to a spot on the page and is never sent to the server.` });

  if (!checks.some((c) => c.severity !== "info")) checks.unshift({ severity: "info", message: "The address is well-formed and uses a secure https:// connection." });

  return finish(checks, extra);
}

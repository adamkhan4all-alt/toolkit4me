// ---------------------------------------------------------------------
// URL parser and cleaner. Cleaning works on the raw query string so every
// parameter that's kept stays byte-for-byte as it was — re-encoding
// through URLSearchParams would silently turn %20 into + and similar.
// ---------------------------------------------------------------------

/** Exact parameter names added by ad platforms, email tools and social sites to track clicks. */
const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "gclsrc",
  "dclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "yclid",
  "twclid",
  "ttclid",
  "li_fat_id",
  "igshid",
  "igsh",
  "mc_cid",
  "mc_eid",
  "_hsenc",
  "_hsmi",
  "__hssc",
  "__hstc",
  "__hsfp",
  "hsctatracking",
  "mkt_tok",
  "oly_anon_id",
  "oly_enc_id",
  "vero_id",
  "vero_conv",
  "rb_clickid",
  "s_cid",
  "_ga",
  "_gl",
  "srsltid",
]);

/** utm_* (Google Analytics campaign tags) and the matomo/piwik equivalents. */
const TRACKING_PREFIXES = ["utm_", "mtm_", "pk_"];

export function isTrackingParam(name: string): boolean {
  const n = name.toLowerCase();
  return TRACKING_PARAMS.has(n) || TRACKING_PREFIXES.some((p) => n.startsWith(p));
}

export interface QueryParam {
  /** Decoded name. */
  name: string;
  /** Decoded value ("" when the parameter has no "="). */
  value: string;
  /** The parameter exactly as it appears in the address. */
  raw: string;
  tracking: boolean;
}

export interface ParsedUrl {
  href: string;
  scheme: string;
  username: string;
  password: string;
  host: string;
  /** Port as written, or "" for the scheme's default. */
  port: string;
  origin: string;
  path: string;
  pathSegments: string[];
  query: string;
  params: QueryParam[];
  fragment: string;
}

export type ParseResult = { ok: true; url: ParsedUrl } | { ok: false; error: string };

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

/** Splits a raw query string ("a=1&b=2", no leading "?") into parameters, keeping each one's original text. */
export function splitQuery(query: string): QueryParam[] {
  if (query === "") return [];
  return query
    .split("&")
    .filter((part) => part !== "")
    .map((raw) => {
      const eq = raw.indexOf("=");
      const name = safeDecode(eq === -1 ? raw : raw.slice(0, eq));
      const value = eq === -1 ? "" : safeDecode(raw.slice(eq + 1));
      return { name, value, raw, tracking: isTrackingParam(name) };
    });
}

/** Parses an http(s) address; adds https:// when the scheme is missing but the text looks like a domain. */
export function parseUrl(input: string): ParseResult {
  let value = input.trim();
  if (value === "") return { ok: false, error: "Paste a web address to parse." };
  if (/\s/.test(value)) return { ok: false, error: "The address contains spaces. Replace them with %20, or check it was copied in full." };
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    if (/^[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)+([:/?#].*)?$/u.test(value)) value = `https://${value}`;
    else return { ok: false, error: "This doesn't look like a web address. It should start with https:// or a domain such as example.com." };
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, error: "The address can't be read — check it for typos." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "Only http:// and https:// addresses can be parsed here." };

  return {
    ok: true,
    url: {
      href: url.href,
      scheme: url.protocol.slice(0, -1),
      username: url.username,
      password: url.password,
      host: url.hostname,
      port: url.port,
      origin: url.origin,
      path: url.pathname,
      pathSegments: url.pathname.split("/").filter(Boolean).map(safeDecode),
      query: url.search,
      params: splitQuery(url.search.slice(1)),
      fragment: url.hash,
    },
  };
}

export interface CleanOptions {
  /** Remove known tracking parameters (utm_*, fbclid, gclid, …). */
  removeTracking: boolean;
  /** Remove every query parameter. */
  removeAllParams: boolean;
  /** Remove parameters with an empty value ("?a=&b"). */
  removeEmptyParams: boolean;
  /** Drop the #fragment. */
  removeFragment: boolean;
  /** Sort the kept parameters by name, so equivalent links compare equal. */
  sortParams: boolean;
  /** Drop a trailing slash from the path (never from the bare domain). */
  removeTrailingSlash: boolean;
  /** Remove a leading "www." from the host. */
  removeWww: boolean;
}

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  removeTracking: true,
  removeAllParams: false,
  removeEmptyParams: false,
  removeFragment: false,
  sortParams: false,
  removeTrailingSlash: false,
  removeWww: false,
};

export type CleanResult = { ok: true; url: string; removed: string[]; changed: boolean } | { ok: false; error: string };

export function cleanUrl(input: string, options: CleanOptions = DEFAULT_CLEAN_OPTIONS): CleanResult {
  const parsed = parseUrl(input);
  if (!parsed.ok) return parsed;
  const p = parsed.url;
  const removed: string[] = [];

  let kept = p.params;
  if (options.removeAllParams) {
    removed.push(...kept.map((q) => q.name));
    kept = [];
  } else {
    kept = kept.filter((q) => {
      const drop = (options.removeTracking && q.tracking) || (options.removeEmptyParams && q.value === "");
      if (drop) removed.push(q.name);
      return !drop;
    });
  }
  if (options.sortParams) kept = [...kept].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  let host = p.host;
  if (options.removeWww && host.startsWith("www.") && host.split(".").length > 2) host = host.slice(4);

  let path = p.path;
  if (options.removeTrailingSlash && path.length > 1) path = path.replace(/\/+$/, "") || "/";

  const auth = p.username ? `${p.username}${p.password ? `:${p.password}` : ""}@` : "";
  const port = p.port ? `:${p.port}` : "";
  const query = kept.length > 0 ? `?${kept.map((q) => q.raw).join("&")}` : "";
  const fragment = options.removeFragment ? "" : p.fragment;
  if (options.removeFragment && p.fragment) removed.push("#fragment");

  const url = `${p.scheme}://${auth}${host}${port}${path}${query}${fragment}`;
  return { ok: true, url, removed, changed: url !== p.href };
}

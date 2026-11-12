// ---------------------------------------------------------------------
// Server-only configuration for Link Studio's Vercel Functions.
// Every value comes from Vercel environment variables; nothing here is
// ever sent to the browser. Missing configuration fails CLOSED: the
// admin API answers 503 rather than running without authentication.
// ---------------------------------------------------------------------

export type Env = Record<string, string | undefined>;

/** Public site origin: used for the OAuth callback URL and same-origin checks. Never derived from the Host header. */
export const DEFAULT_SITE_ORIGIN = "https://www.toolkit4me.com";
/** The existing Cloudflare Worker (toolkit4me-shortlinks) on its branded domain. */
export const DEFAULT_LINK_API_URL = "https://go.toolkit4me.com";
/** Admin sessions last 8 hours, then the admin signs in again. */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;
/** The OAuth round trip must finish within 10 minutes. */
export const OAUTH_STATE_TTL_SECONDS = 10 * 60;
export const MIN_SESSION_SECRET_LENGTH = 32;

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  sessionSecret: string;
  /** Numeric GitHub user ids allowed to administer Link Studio (ids never change; logins can be renamed). */
  adminIds: ReadonlySet<string>;
  siteOrigin: string;
  callbackUrl: string;
}

export interface UpstreamConfig {
  baseUrl: string;
  apiKey: string;
}

function trimmed(env: Env, name: string): string {
  return (env[name] ?? "").trim();
}

export function siteOrigin(env: Env): string {
  return (trimmed(env, "LINK_STUDIO_SITE_ORIGIN") || DEFAULT_SITE_ORIGIN).replace(/\/+$/, "");
}

/** Auth configuration, or the names of the missing/invalid variables (names only — never values). */
export function getAuthConfig(env: Env): { ok: true; config: AuthConfig } | { ok: false; missing: string[] } {
  const clientId = trimmed(env, "LINK_STUDIO_GITHUB_CLIENT_ID");
  const clientSecret = trimmed(env, "LINK_STUDIO_GITHUB_CLIENT_SECRET");
  const sessionSecret = trimmed(env, "LINK_STUDIO_SESSION_SECRET");
  const adminIds = new Set(
    trimmed(env, "LINK_STUDIO_ADMIN_GITHUB_IDS")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{1,20}$/.test(s))
  );
  const missing: string[] = [];
  if (!clientId) missing.push("LINK_STUDIO_GITHUB_CLIENT_ID");
  if (!clientSecret) missing.push("LINK_STUDIO_GITHUB_CLIENT_SECRET");
  if (sessionSecret.length < MIN_SESSION_SECRET_LENGTH) missing.push("LINK_STUDIO_SESSION_SECRET");
  if (adminIds.size === 0) missing.push("LINK_STUDIO_ADMIN_GITHUB_IDS");
  if (missing.length > 0) return { ok: false, missing };
  const origin = siteOrigin(env);
  return { ok: true, config: { clientId, clientSecret, sessionSecret, adminIds, siteOrigin: origin, callbackUrl: `${origin}/api/link-studio/auth/callback` } };
}

export function getUpstreamConfig(env: Env): UpstreamConfig | null {
  const apiKey = trimmed(env, "ADMIN_API_KEY");
  if (apiKey.length < 16) return null;
  const baseUrl = (trimmed(env, "LINK_STUDIO_API_URL") || DEFAULT_LINK_API_URL).replace(/\/+$/, "");
  if (!/^https?:\/\//.test(baseUrl)) return null;
  return { baseUrl, apiKey };
}

/** Short public base for links shown in the UI. */
export function shortUrlBase(env: Env): string {
  return (trimmed(env, "LINK_STUDIO_API_URL") || DEFAULT_LINK_API_URL).replace(/\/+$/, "");
}

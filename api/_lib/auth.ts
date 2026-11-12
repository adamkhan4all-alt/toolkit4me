// ---------------------------------------------------------------------
// Admin sign-in: GitHub OAuth (authorization code + PKCE + state),
// restricted to an allow-list of numeric GitHub user ids. The GitHub
// access token is used once to read the user's id and then discarded —
// only our own signed session cookie is kept.
// ---------------------------------------------------------------------

import { getAuthConfig, OAUTH_STATE_TTL_SECONDS, SESSION_TTL_SECONDS, siteOrigin, type AuthConfig, type Env } from "./config.js";
import { randomToken, safeEqual, sha256Base64Url } from "./crypto.js";
import { checkSameOrigin, fail, ok, redirect } from "./http.js";
import {
  clearCookie,
  OAUTH_COOKIE,
  OAUTH_COOKIE_PATH,
  parseCookies,
  serializeCookie,
  SESSION_COOKIE,
  SESSION_COOKIE_PATH,
  signToken,
  verifyToken,
  type OAuthStatePayload,
  type SessionPayload,
} from "./session.js";

export interface Deps {
  env: Env;
  fetch: typeof fetch;
  /** Seconds since the epoch (injectable for tests). */
  now?: () => number;
}

export const ADMIN_PAGE = "/link-studio/admin";
const GITHUB_AUTHORIZE = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_USER = "https://api.github.com/user";
const UPSTREAM_TIMEOUT_MS = 10_000;

const nowOf = (deps: Deps) => (deps.now ? deps.now() : Math.floor(Date.now() / 1000));
const isSecure = (origin: string) => origin.startsWith("https://");

function adminRedirect(error: string | null, cookies: string[]): Response {
  const headers = new Headers();
  for (const c of cookies) headers.append("Set-Cookie", c);
  return redirect(error ? `${ADMIN_PAGE}?error=${error}` : ADMIN_PAGE, headers);
}

export interface Admin {
  id: string;
  login: string;
}

/** The signed-in admin, or null. Re-checks the allow-list on every request, so removing an id revokes access at once. */
export async function currentAdmin(request: Request, config: AuthConfig, deps: Deps): Promise<Admin | null> {
  const token = parseCookies(request.headers.get("Cookie"))[SESSION_COOKIE];
  const session = await verifyToken<SessionPayload>(config.sessionSecret, token, nowOf(deps));
  if (!session || typeof session.sub !== "string" || !config.adminIds.has(session.sub)) return null;
  return { id: session.sub, login: typeof session.login === "string" ? session.login : "" };
}

/** Gate for every admin API call: 503 when sign-in isn't configured, 401 when signed out. */
export async function requireAdmin(request: Request, deps: Deps): Promise<{ ok: true; admin: Admin; config: AuthConfig } | { ok: false; response: Response }> {
  const auth = getAuthConfig(deps.env);
  if (!auth.ok) return { ok: false, response: fail(503, "admin_not_configured", "Link Studio sign-in hasn't been set up yet.") };
  const admin = await currentAdmin(request, auth.config, deps);
  if (!admin) return { ok: false, response: fail(401, "unauthenticated", "Sign in to manage short links.") };
  return { ok: true, admin, config: auth.config };
}

async function login(deps: Deps): Promise<Response> {
  const auth = getAuthConfig(deps.env);
  if (!auth.ok) return adminRedirect("not_configured", []);
  const { config } = auth;
  const state = randomToken(32);
  const verifier = randomToken(48);
  const payload: OAuthStatePayload = { v: 1, state, verifier, exp: nowOf(deps) + OAUTH_STATE_TTL_SECONDS };
  const cookie = serializeCookie(OAUTH_COOKIE, await signToken(config.sessionSecret, payload), {
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_STATE_TTL_SECONDS,
    // Lax, not Strict: the callback is a top-level navigation coming back from github.com.
    sameSite: "Lax",
    secure: isSecure(config.siteOrigin),
  });
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    state,
    code_challenge: await sha256Base64Url(verifier),
    code_challenge_method: "S256",
    allow_signup: "false",
  });
  const headers = new Headers({ "Set-Cookie": cookie });
  return redirect(`${GITHUB_AUTHORIZE}?${params}`, headers);
}

async function callback(request: Request, deps: Deps): Promise<Response> {
  const auth = getAuthConfig(deps.env);
  if (!auth.ok) return adminRedirect("not_configured", []);
  const { config } = auth;
  const secure = isSecure(config.siteOrigin);
  const clearOAuth = clearCookie(OAUTH_COOKIE, OAUTH_COOKIE_PATH, secure);
  const url = new URL(request.url);

  if (url.searchParams.get("error")) return adminRedirect("denied", [clearOAuth]);

  const oauth = await verifyToken<OAuthStatePayload>(config.sessionSecret, parseCookies(request.headers.get("Cookie"))[OAUTH_COOKIE], nowOf(deps));
  const state = url.searchParams.get("state") ?? "";
  if (!oauth || !state || !(await safeEqual(state, oauth.state))) return adminRedirect("state", [clearOAuth]);

  const code = url.searchParams.get("code") ?? "";
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(code)) return adminRedirect("oauth", [clearOAuth]);

  let user: { id?: unknown; login?: unknown };
  try {
    const tokenRes = await deps.fetch(GITHUB_TOKEN, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl,
        code_verifier: oauth.verifier,
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const token = (await tokenRes.json()) as { access_token?: unknown };
    if (!tokenRes.ok || typeof token.access_token !== "string") return adminRedirect("oauth", [clearOAuth]);

    const userRes = await deps.fetch(GITHUB_USER, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "toolkit4me-link-studio",
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!userRes.ok) return adminRedirect("oauth", [clearOAuth]);
    user = (await userRes.json()) as typeof user;
  } catch {
    return adminRedirect("oauth", [clearOAuth]);
  }

  const id = typeof user.id === "number" && Number.isSafeInteger(user.id) ? String(user.id) : "";
  if (!id || !config.adminIds.has(id)) return adminRedirect("not_allowed", [clearOAuth]);

  const now = nowOf(deps);
  const session: SessionPayload = { v: 1, sub: id, login: typeof user.login === "string" ? user.login.slice(0, 64) : "", iat: now, exp: now + SESSION_TTL_SECONDS };
  const sessionCookie = serializeCookie(SESSION_COOKIE, await signToken(config.sessionSecret, session), {
    path: SESSION_COOKIE_PATH,
    maxAge: SESSION_TTL_SECONDS,
    sameSite: "Strict",
    secure,
  });
  return adminRedirect(null, [clearOAuth, sessionCookie]);
}

async function session(request: Request, deps: Deps): Promise<Response> {
  const auth = getAuthConfig(deps.env);
  if (!auth.ok) return ok({ configured: false, authenticated: false });
  const admin = await currentAdmin(request, auth.config, deps);
  return ok(admin ? { configured: true, authenticated: true, login: admin.login } : { configured: true, authenticated: false });
}

function logout(request: Request, deps: Deps): Response {
  const origin = siteOrigin(deps.env);
  const blocked = checkSameOrigin(request, origin);
  if (blocked) return blocked;
  return ok({ authenticated: false }, 200, { "Set-Cookie": clearCookie(SESSION_COOKIE, SESSION_COOKIE_PATH, isSecure(origin)) });
}

/** /api/link-studio/auth/{login|callback|session|logout} */
export async function handleAuth(request: Request, deps: Deps): Promise<Response> {
  const action = new URL(request.url).pathname.split("/").filter(Boolean).pop();
  const method = request.method.toUpperCase();
  if (method === "GET" && action === "login") return login(deps);
  if (method === "GET" && action === "callback") return callback(request, deps);
  if (method === "GET" && action === "session") return session(request, deps);
  if (method === "POST" && action === "logout") return logout(request, deps);
  return fail(404, "not_found", "Not found.");
}

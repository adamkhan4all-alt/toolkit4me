// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { handleAuth, type Deps } from "../auth";
import { handleAnalytics, handleLink, handleLinks } from "../links";
import { SESSION_COOKIE, OAUTH_COOKIE, signToken, verifyToken, type OAuthStatePayload } from "../session";
import { sha256Base64Url } from "../crypto";

const ORIGIN = "https://www.toolkit4me.com";
const API_KEY = "test-admin-key-0123456789abcdef-never-leak";
const SECRET = "s".repeat(40);
const ADMIN_ID = "424242";

const fullEnv = {
  ADMIN_API_KEY: API_KEY,
  LINK_STUDIO_GITHUB_CLIENT_ID: "client-id",
  LINK_STUDIO_GITHUB_CLIENT_SECRET: "client-secret-value",
  LINK_STUDIO_SESSION_SECRET: SECRET,
  LINK_STUDIO_ADMIN_GITHUB_IDS: `${ADMIN_ID}, 7`,
};

const NOW = 1_800_000_000;

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>;

function deps(env: Record<string, string | undefined> = fullEnv, fetchImpl?: FetchMock): Deps & { fetch: FetchMock } {
  const f = fetchImpl ?? vi.fn<typeof fetch>(async () => workerJson(200, { ok: true, data: { items: [] } }));
  return { env, fetch: f, now: () => NOW };
}

function workerJson(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

async function sessionCookie(sub = ADMIN_ID, exp = NOW + 3600, secret = SECRET): Promise<string> {
  return `${SESSION_COOKIE}=${await signToken(secret, { v: 1, sub, login: "admin", iat: NOW, exp })}`;
}

async function req(path: string, init: RequestInit & { cookie?: string; origin?: string | null } = {}): Promise<Request> {
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("Cookie", init.cookie);
  if (init.origin !== null && init.origin !== undefined) headers.set("Origin", init.origin);
  return new Request(`${ORIGIN}${path}`, { ...init, headers });
}

async function expectNoSecrets(res: Response) {
  const text = await res.clone().text();
  const headers = JSON.stringify([...res.headers]);
  for (const secret of [API_KEY, SECRET, "client-secret-value"]) {
    expect(text).not.toContain(secret);
    expect(headers).not.toContain(secret);
  }
}

describe("admin gate", () => {
  it("fails closed with 503 when sign-in isn't configured, without calling the Worker", async () => {
    const d = deps({ ADMIN_API_KEY: API_KEY });
    const res = await handleLinks(await req("/api/link-studio/links", { cookie: await sessionCookie() }), d);
    expect(res.status).toBe(503);
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it("rejects missing, tampered, expired, wrongly-signed and no-longer-allowed sessions", async () => {
    const valid = await sessionCookie();
    const tampered = valid.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
    const cases = [undefined, tampered, await sessionCookie(ADMIN_ID, NOW - 1), await sessionCookie(ADMIN_ID, NOW + 3600, "x".repeat(40)), await sessionCookie("999")];
    for (const cookie of cases) {
      const d = deps();
      const res = await handleLinks(await req("/api/link-studio/links", { cookie }), d);
      expect(res.status).toBe(401);
      expect(d.fetch).not.toHaveBeenCalled();
    }
  });

  it("protects every admin endpoint", async () => {
    for (const [handler, path, method] of [
      [handleLinks, "/api/link-studio/links", "POST"],
      [handleLink, "/api/link-studio/links/abc", "GET"],
      [handleLink, "/api/link-studio/links/abc", "PUT"],
      [handleLink, "/api/link-studio/links/abc", "DELETE"],
      [handleAnalytics, "/api/link-studio/analytics", "GET"],
    ] as const) {
      const d = deps();
      const res = await handler(await req(path, { method, origin: ORIGIN }), d);
      expect(res.status).toBe(401);
      expect(d.fetch).not.toHaveBeenCalled();
    }
  });
});

describe("Worker calls", () => {
  it("lists links, forwarding only allow-listed query parameters with the key server-side", async () => {
    const d = deps();
    const res = await handleLinks(await req("/api/link-studio/links?page=2&limit=20&search=promo&status=active&sort=clicks&order=desc&evil=1", { cookie: await sessionCookie() }), d);
    expect(res.status).toBe(200);
    const [url, init] = d.fetch.mock.calls[0];
    expect(url).toBe("https://go.toolkit4me.com/api/links?page=2&limit=20&search=promo&status=active&sort=clicks&order=desc");
    expect(new Headers(init?.headers).get("Authorization")).toBe(`Bearer ${API_KEY}`);
    expect(new Headers(init?.headers).get("X-Client-Id")).toBe(`admin-gh-${ADMIN_ID}`);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    await expectNoSecrets(res);
  });

  it("rejects invalid list parameters", async () => {
    for (const q of ["limit=500", "page=0", "status=deleted", "sort=original_url", "order=sideways", `search=${"a".repeat(101)}`]) {
      const d = deps();
      const res = await handleLinks(await req(`/api/link-studio/links?${q}`, { cookie: await sessionCookie() }), d);
      expect(res.status).toBe(400);
      expect(d.fetch).not.toHaveBeenCalled();
    }
  });

  it("creates a link: same-origin JSON only, known fields only", async () => {
    const cookie = await sessionCookie();
    const body = JSON.stringify({ url: "https://example.com", alias: "summer26", redirectType: 302, isActive: true, expiresAt: null });
    const post = (init: { origin?: string | null; type?: string; body?: string }) =>
      req("/api/link-studio/links", { method: "POST", cookie, origin: init.origin === undefined ? ORIGIN : init.origin, headers: { "Content-Type": init.type ?? "application/json" }, body: init.body ?? body });

    for (const [init, status] of [
      [{ origin: null }, 403],
      [{ origin: "https://evil.example" }, 403],
      [{ type: "text/plain" }, 415],
      [{ body: "{nope" }, 400],
      [{ body: JSON.stringify({ url: "https://e.com", shortCode: "x" }) }, 400],
      [{ body: JSON.stringify({ url: "https://e.com", redirectType: 303 }) }, 400],
      [{ body: JSON.stringify({ url: "https://e.com", alias: "../health" }) }, 400],
      [{ body: JSON.stringify({ alias: "x" }) }, 400],
      [{ body: JSON.stringify({ url: "https://e.com", pad: "x".repeat(9000) }) }, 413],
    ] as const) {
      const d = deps();
      const res = await handleLinks(await post(init), d);
      expect(res.status, JSON.stringify(init).slice(0, 80)).toBe(status);
      expect(d.fetch).not.toHaveBeenCalled();
    }

    const d = deps(fullEnv, vi.fn<typeof fetch>(async () => workerJson(201, { ok: true, data: { code: "summer26" } })));
    const res = await handleLinks(await post({}), d);
    expect(res.status).toBe(201);
    const [url, init] = d.fetch.mock.calls[0];
    expect(url).toBe("https://go.toolkit4me.com/api/links");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ url: "https://example.com", alias: "summer26", redirectType: 302, isActive: true, expiresAt: null });
  });

  it("passes Worker validation errors through, but hides auth and server failures", async () => {
    const cookie = await sessionCookie();
    const run = async (worker: () => Promise<Response>) => {
      const d = deps(fullEnv, vi.fn<typeof fetch>(worker));
      const res = await handleLink(await req("/api/link-studio/links/abc", { cookie }), d);
      await expectNoSecrets(res);
      return { status: res.status, body: (await res.json()) as { error: { code: string; message: string } } };
    };
    const taken = await run(async () => workerJson(409, { ok: false, error: { code: "alias_taken", message: "Alias is already in use" } }));
    expect(taken).toEqual({ status: 409, body: { ok: false, error: { code: "alias_taken", message: "Alias is already in use" } } });

    const auth = await run(async () => workerJson(401, { ok: false, error: { code: "unauthorized", message: `bad key ${API_KEY}` } }));
    expect(auth.status).toBe(502);
    expect(auth.body.error.code).toBe("link_service_auth");

    const crash = await run(async () => workerJson(500, { ok: false, error: { code: "internal", message: "D1_ERROR: stack trace" } }));
    expect(crash.status).toBe(502);
    expect(crash.body.error.message).not.toContain("D1_ERROR");

    const down = await run(async () => {
      throw new Error("ECONNRESET");
    });
    expect(down.status).toBe(502);

    const html = await run(async () => new Response("<html>", { status: 200 }));
    expect(html.status).toBe(502);
  });

  it("only accepts short-code-shaped path segments", async () => {
    const cookie = await sessionCookie();
    for (const code of ["..%2F..%2Fhealth", "%2e%2e", "a%20b", "x".repeat(65), "%E0%A4%A"]) {
      const d = deps();
      const res = await handleLink(await req(`/api/link-studio/links/${code}`, { cookie }), d);
      expect(res.status).toBe(404);
      expect(d.fetch).not.toHaveBeenCalled();
    }
  });

  it("updates and deletes with same-origin checks", async () => {
    const cookie = await sessionCookie();
    const put = (body: unknown, origin: string | null = ORIGIN) =>
      req("/api/link-studio/links/summer26", { method: "PUT", cookie, origin, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    let d = deps();
    expect((await handleLink(await put({ isActive: false }, null), d)).status).toBe(403);
    expect((await handleLink(await put({}), d)).status).toBe(400);
    expect((await handleLink(await put({ alias: "new" }), d)).status).toBe(400);
    expect(d.fetch).not.toHaveBeenCalled();

    d = deps();
    expect((await handleLink(await put({ isActive: false, expiresAt: "2030-01-01T00:00:00Z" }), d)).status).toBe(200);
    expect(d.fetch.mock.calls[0][0]).toBe("https://go.toolkit4me.com/api/links/summer26");
    expect(JSON.parse(String(d.fetch.mock.calls[0][1]?.body))).toEqual({ isActive: false, expiresAt: "2030-01-01T00:00:00Z" });

    d = deps();
    expect((await handleLink(await req("/api/link-studio/links/summer26", { method: "DELETE", cookie }), d)).status).toBe(403);
    expect((await handleLink(await req("/api/link-studio/links/summer26", { method: "DELETE", cookie, origin: ORIGIN }), d)).status).toBe(200);
    expect(d.fetch.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("routes analytics to the summary or a single link, validating days", async () => {
    const cookie = await sessionCookie();
    let d = deps();
    await handleAnalytics(await req("/api/link-studio/analytics?days=7", { cookie }), d);
    expect(d.fetch.mock.calls[0][0]).toBe("https://go.toolkit4me.com/api/analytics/summary?days=7");
    d = deps();
    await handleAnalytics(await req("/api/link-studio/analytics?code=summary&days=90", { cookie }), d);
    expect(d.fetch.mock.calls[0][0]).toBe("https://go.toolkit4me.com/api/analytics/summary?days=90".replace("summary?", "summary?"));
    for (const q of ["days=0", "days=366", "days=abc", "code=../x"]) {
      d = deps();
      const res = await handleAnalytics(await req(`/api/link-studio/analytics?${q}`, { cookie }), d);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(d.fetch).not.toHaveBeenCalled();
    }
  });

  it("returns 503 when the Worker key is missing", async () => {
    const { ADMIN_API_KEY: _omit, ...env } = fullEnv;
    void _omit;
    const d = deps(env);
    const res = await handleLinks(await req("/api/link-studio/links", { cookie: await sessionCookie() }), d);
    expect(res.status).toBe(503);
  });
});

describe("GitHub sign-in", () => {
  it("reports configuration state without revealing variable values", async () => {
    const off = await handleAuth(await req("/api/link-studio/auth/session"), deps({}));
    expect(await off.json()).toEqual({ ok: true, data: { configured: false, authenticated: false } });
    const on = await handleAuth(await req("/api/link-studio/auth/session", { cookie: await sessionCookie() }), deps());
    expect(await on.json()).toEqual({ ok: true, data: { configured: true, authenticated: true, login: "admin" } });
    const anon = await handleAuth(await req("/api/link-studio/auth/session"), deps());
    expect(await anon.json()).toEqual({ ok: true, data: { configured: true, authenticated: false } });
  });

  it("starts OAuth with state + PKCE and a short-lived Lax cookie", async () => {
    const res = await handleAuth(await req("/api/link-studio/auth/login"), deps());
    expect(res.status).toBe(303);
    const location = new URL(res.headers.get("Location") ?? "");
    expect(location.origin + location.pathname).toBe("https://github.com/login/oauth/authorize");
    expect(location.searchParams.get("redirect_uri")).toBe(`${ORIGIN}/api/link-studio/auth/callback`);
    expect(location.searchParams.get("code_challenge_method")).toBe("S256");
    const cookie = res.headers.get("Set-Cookie") ?? "";
    expect(cookie).toMatch(/^ls_oauth=.+; Path=\/api\/link-studio\/auth; Max-Age=600; HttpOnly; SameSite=Lax; Secure$/);
    const payload = await verifyToken<OAuthStatePayload>(SECRET, cookie.split(";")[0].split("=")[1], NOW);
    expect(payload?.state).toBe(location.searchParams.get("state"));
    expect(location.searchParams.get("code_challenge")).toBe(await sha256Base64Url(payload?.verifier ?? ""));
    await expectNoSecrets(res);
  });

  it("redirects to the admin page with an error when sign-in isn't configured", async () => {
    const res = await handleAuth(await req("/api/link-studio/auth/login"), deps({}));
    expect(res.headers.get("Location")).toBe("/link-studio/admin?error=not_configured");
  });

  async function startedLogin() {
    const res = await handleAuth(await req("/api/link-studio/auth/login"), deps());
    const state = new URL(res.headers.get("Location") ?? "").searchParams.get("state") ?? "";
    const cookie = (res.headers.get("Set-Cookie") ?? "").split(";")[0];
    return { state, cookie };
  }

  function github(userId: number): FetchMock {
    return vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.startsWith("https://github.com/login/oauth/access_token")) return workerJson(200, { access_token: "gho_token", token_type: "bearer" });
      if (url === "https://api.github.com/user") return workerJson(200, { id: userId, login: "someone" });
      return new Response("unexpected", { status: 500 });
    });
  }

  it("signs in an allowed GitHub user with a Strict, HttpOnly session scoped to the API", async () => {
    const { state, cookie } = await startedLogin();
    const d = deps(fullEnv, github(Number(ADMIN_ID)));
    const res = await handleAuth(await req(`/api/link-studio/auth/callback?code=abc123&state=${state}`, { cookie }), d);
    expect(res.status).toBe(303);
    expect(res.headers.get("Location")).toBe("/link-studio/admin");
    const cookies = res.headers.getSetCookie();
    const session = cookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`)) ?? "";
    expect(session).toMatch(/; Path=\/api\/link-studio; Max-Age=28800; HttpOnly; SameSite=Strict; Secure$/);
    expect(cookies.some((c) => c.startsWith(`${OAUTH_COOKIE}=;`))).toBe(true);
    // The PKCE verifier from the cookie is sent with the code exchange; the GitHub token isn't kept.
    const tokenBody = new URLSearchParams(String(d.fetch.mock.calls[0][1]?.body));
    expect(tokenBody.get("code_verifier")).toBeTruthy();
    expect(JSON.stringify(cookies)).not.toContain("gho_token");
    await expectNoSecrets(res);
  });

  it("refuses GitHub users who aren't on the allow-list", async () => {
    const { state, cookie } = await startedLogin();
    const res = await handleAuth(await req(`/api/link-studio/auth/callback?code=abc123&state=${state}`, { cookie }), deps(fullEnv, github(1)));
    expect(res.headers.get("Location")).toBe("/link-studio/admin?error=not_allowed");
    expect(res.headers.getSetCookie().some((c) => c.startsWith(`${SESSION_COOKIE}=`))).toBe(false);
  });

  it("rejects a callback with a missing or mismatched state (login CSRF)", async () => {
    const { state, cookie } = await startedLogin();
    for (const [query, c] of [
      [`code=abc&state=${state}`, undefined],
      [`code=abc&state=wrong`, cookie],
      [`code=abc`, cookie],
    ] as const) {
      const d = deps(fullEnv, github(Number(ADMIN_ID)));
      const res = await handleAuth(await req(`/api/link-studio/auth/callback?${query}`, { cookie: c }), d);
      expect(res.headers.get("Location")).toBe("/link-studio/admin?error=state");
      expect(d.fetch).not.toHaveBeenCalled();
    }
  });

  it("handles a denied consent screen and GitHub failures", async () => {
    const { state, cookie } = await startedLogin();
    const denied = await handleAuth(await req(`/api/link-studio/auth/callback?error=access_denied&state=${state}`, { cookie }), deps());
    expect(denied.headers.get("Location")).toBe("/link-studio/admin?error=denied");
    const broken = deps(fullEnv, vi.fn<typeof fetch>(async () => workerJson(200, { error: "bad_verification_code" })));
    const res = await handleAuth(await req(`/api/link-studio/auth/callback?code=abc&state=${state}`, { cookie }), broken);
    expect(res.headers.get("Location")).toBe("/link-studio/admin?error=oauth");
  });

  it("signs out only from the site's own pages", async () => {
    expect((await handleAuth(await req("/api/link-studio/auth/logout", { method: "POST" }), deps())).status).toBe(403);
    const res = await handleAuth(await req("/api/link-studio/auth/logout", { method: "POST", origin: ORIGIN }), deps());
    expect(res.status).toBe(200);
    expect(res.headers.get("Set-Cookie")).toMatch(/^ls_session=; Path=\/api\/link-studio; Max-Age=0/);
  });

  it("returns 404 for unknown auth actions and methods", async () => {
    expect((await handleAuth(await req("/api/link-studio/auth/admin"), deps())).status).toBe(404);
    expect((await handleAuth(await req("/api/link-studio/auth/login", { method: "POST", origin: ORIGIN }), deps())).status).toBe(404);
  });
});

// ---------------------------------------------------------------------
// Signed, stateless cookies: base64url(JSON payload) + "." + HMAC-SHA256.
// The admin session cookie is HttpOnly (no JavaScript access), Secure,
// SameSite=Strict and scoped to /api/link-studio, so it's only ever sent
// to these functions — never to the rest of the site.
// ---------------------------------------------------------------------

import { base64UrlDecode, base64UrlEncode, hmacSign, hmacVerify, utf8 } from "./crypto.js";

export const SESSION_COOKIE = "ls_session";
export const OAUTH_COOKIE = "ls_oauth";
export const SESSION_COOKIE_PATH = "/api/link-studio";
export const OAUTH_COOKIE_PATH = "/api/link-studio/auth";

export interface SessionPayload {
  v: 1;
  /** GitHub numeric user id. */
  sub: string;
  login: string;
  iat: number;
  exp: number;
}

export interface OAuthStatePayload {
  v: 1;
  state: string;
  verifier: string;
  exp: number;
}

export async function signToken(secret: string, payload: object): Promise<string> {
  const body = base64UrlEncode(utf8(JSON.stringify(payload)));
  return `${body}.${await hmacSign(secret, body)}`;
}

/** Verifies the signature and expiry; returns the payload or null. Never throws. */
export async function verifyToken<T extends { v: number; exp: number }>(secret: string, token: string | undefined, nowSeconds = Math.floor(Date.now() / 1000)): Promise<T | null> {
  if (!token || token.length > 4096) return null;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot !== token.lastIndexOf(".")) return null;
  const body = token.slice(0, dot);
  if (!(await hmacVerify(secret, body, token.slice(dot + 1)))) return null;
  const bytes = base64UrlDecode(body);
  if (!bytes) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as T;
    if (payload.v !== 1 || typeof payload.exp !== "number" || payload.exp <= nowSeconds) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name && !(name in out)) out[name] = part.slice(eq + 1).trim();
  }
  return out;
}

export interface CookieOptions {
  path: string;
  maxAge: number;
  sameSite: "Strict" | "Lax";
  /** False only for local http:// testing. */
  secure: boolean;
}

export function serializeCookie(name: string, value: string, o: CookieOptions): string {
  return `${name}=${value}; Path=${o.path}; Max-Age=${o.maxAge}; HttpOnly; SameSite=${o.sameSite}${o.secure ? "; Secure" : ""}`;
}

export function clearCookie(name: string, path: string, secure: boolean): string {
  return serializeCookie(name, "", { path, maxAge: 0, sameSite: "Lax", secure });
}

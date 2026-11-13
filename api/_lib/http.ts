// Response helpers shared by the Link Studio functions.

/** Headers on every Link Studio API response: never cached, never indexed, never framed or sniffed. */
export const SECURITY_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

export interface ApiErrorBody {
  ok: false;
  error: { code: string; message: string; details?: { path: string; message: string }[] };
}

export function json(status: number, body: unknown, headers: HeadersInit = {}): Response {
  const h = new Headers(headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  h.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers: h });
}

export function ok(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return json(status, { ok: true, data }, headers);
}

export function fail(status: number, code: string, message: string, details?: { path: string; message: string }[], headers: HeadersInit = {}): Response {
  const body: ApiErrorBody = { ok: false, error: { code, message, ...(details?.length ? { details } : {}) } };
  return json(status, body, headers);
}

export function redirect(location: string, headers: HeadersInit = {}): Response {
  const h = new Headers(headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) h.set(k, v);
  h.set("Location", location);
  return new Response(null, { status: 303, headers: h });
}

/**
 * State-changing requests must come from our own pages. Browsers always send Origin on
 * cross-origin and on POST/PUT/DELETE fetches, so a missing or foreign Origin is rejected.
 * (The session cookie is also SameSite=Strict — this is defence in depth against CSRF.)
 */
export function checkSameOrigin(request: Request, siteOrigin: string): Response | null {
  const origin = request.headers.get("Origin");
  if (origin !== siteOrigin) return fail(403, "origin_not_allowed", "This request must come from the Toolkit4Me website.");
  return null;
}

export const MAX_BODY_BYTES = 8 * 1024;
/** Bulk creation carries up to 50 URLs; matches the Worker's bulk body limit. */
export const MAX_BULK_BODY_BYTES = 64 * 1024;

/** Reads a small JSON object body, enforcing Content-Type and size. */
export async function readJsonObject(
  request: Request,
  maxBytes: number = MAX_BODY_BYTES
): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false; response: Response }> {
  const MAX_BODY_BYTES = maxBytes;
  const type = request.headers.get("Content-Type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: fail(415, "unsupported_media_type", "Send the request as JSON.") };
  }
  const declared = Number(request.headers.get("Content-Length") ?? "0");
  if (declared > MAX_BODY_BYTES) return { ok: false, response: fail(413, "payload_too_large", "The request is too large.") };
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return { ok: false, response: fail(413, "payload_too_large", "The request is too large.") };
  try {
    const value: unknown = JSON.parse(text);
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("not an object");
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false, response: fail(400, "invalid_json", "The request body isn't valid JSON.") };
  }
}

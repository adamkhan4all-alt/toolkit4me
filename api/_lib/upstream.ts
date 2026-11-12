// ---------------------------------------------------------------------
// The one place that talks to the Cloudflare Worker. Callers pass a
// fixed path they built themselves and already-validated fields — there
// is no generic pass-through, so this can't be used as an open proxy.
// The API key is added here and never appears in any response or log.
// ---------------------------------------------------------------------

import { getUpstreamConfig } from "./config.js";
import { fail, json } from "./http.js";
import type { Deps } from "./auth.js";

const TIMEOUT_MS = 10_000;

export interface UpstreamCall {
  method: "GET" | "POST" | "PUT" | "DELETE";
  /** Fixed API path such as /api/links or /api/links/abc (code already validated and encoded). */
  path: string;
  query?: URLSearchParams;
  body?: Record<string, unknown>;
  /** Per-admin id for the Worker's per-client rate limits. */
  clientId: string;
}

interface WorkerEnvelope {
  ok?: unknown;
  data?: unknown;
  error?: { code?: unknown; message?: unknown; details?: unknown };
}

function sanitizeDetails(details: unknown): { path: string; message: string }[] | undefined {
  if (!Array.isArray(details)) return undefined;
  return details
    .slice(0, 20)
    .filter((d): d is { path: unknown; message: unknown } => d !== null && typeof d === "object")
    .map((d) => ({ path: String(d.path ?? "").slice(0, 100), message: String(d.message ?? "").slice(0, 300) }));
}

export async function callWorker(deps: Deps, call: UpstreamCall): Promise<Response> {
  const upstream = getUpstreamConfig(deps.env);
  if (!upstream) return fail(503, "link_service_not_configured", "The link service isn't configured on this deployment.");

  const qs = call.query && [...call.query.keys()].length > 0 ? `?${call.query}` : "";
  let res: Response;
  try {
    res = await deps.fetch(`${upstream.baseUrl}${call.path}${qs}`, {
      method: call.method,
      headers: {
        Authorization: `Bearer ${upstream.apiKey}`,
        Accept: "application/json",
        "X-Client-Id": call.clientId,
        ...(call.body ? { "Content-Type": "application/json" } : {}),
      },
      body: call.body ? JSON.stringify(call.body) : undefined,
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return fail(502, "link_service_unavailable", "The link service didn't respond. Try again in a moment.");
  }

  let body: WorkerEnvelope;
  try {
    body = (await res.json()) as WorkerEnvelope;
  } catch {
    return fail(502, "link_service_error", "The link service returned an unexpected response.");
  }

  if (res.status === 401 || res.status === 403) {
    // Our key was rejected: a deployment problem, not the admin's. Don't echo the Worker's reason.
    console.error(`[link-studio] link service rejected the server credentials (status ${res.status})`);
    return fail(502, "link_service_auth", "The link service rejected this website's credentials. Check the ADMIN_API_KEY configuration.");
  }
  if (res.status >= 500) {
    console.error(`[link-studio] link service error ${res.status} ${typeof body.error?.code === "string" ? body.error.code : ""}`);
    return fail(502, "link_service_error", "The link service had a problem. Try again in a moment.");
  }
  if (body.ok === true) return json(res.status, { ok: true, data: body.data });

  const code = typeof body.error?.code === "string" ? body.error.code.slice(0, 64) : "request_failed";
  const message = typeof body.error?.message === "string" ? body.error.message.slice(0, 300) : "The request failed.";
  const retryAfter = res.headers.get("Retry-After");
  return fail(res.status, code, message, sanitizeDetails(body.error?.details), retryAfter ? { "Retry-After": retryAfter } : {});
}

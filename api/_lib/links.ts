// ---------------------------------------------------------------------
// Admin link management and analytics. Each handler: (1) requires a
// signed-in admin, (2) requires same-origin for changes, (3) validates
// and allow-lists every field, then (4) calls one fixed Worker endpoint.
// The Worker re-validates everything (zod, strict) — this layer exists so
// nothing unexpected is ever forwarded with the admin key attached.
// ---------------------------------------------------------------------

import { requireAdmin, type Admin, type Deps } from "./auth.js";
import { checkSameOrigin, fail, readJsonObject } from "./http.js";
import { callWorker } from "./upstream.js";

type Detail = { path: string; message: string };

/** Short codes as the Worker stores them (generated 7-char base62, or a 3–64 char alias). */
export const CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const REDIRECT_TYPES = [301, 302, 307, 308];
const STATUSES = ["all", "active", "inactive", "expired"];
const SORTS = ["created_at", "clicks", "last_clicked_at", "expires_at"];

const clientIdFor = (admin: Admin) => `admin-gh-${admin.id}`;

function validationError(details: Detail[]): Response {
  return fail(400, "validation_error", details[0]?.message ?? "Some fields aren't valid.", details);
}

/** Validates create/update bodies; rejects unknown fields like the Worker does. */
function pickLinkFields(body: Record<string, unknown>, mode: "create" | "update"): { ok: true; value: Record<string, unknown> } | { ok: false; details: Detail[] } {
  const allowed = mode === "create" ? ["url", "alias", "expiresAt", "redirectType", "isActive"] : ["url", "expiresAt", "redirectType", "isActive"];
  const details: Detail[] = [];
  const value: Record<string, unknown> = {};
  for (const key of Object.keys(body)) if (!allowed.includes(key)) details.push({ path: key, message: `Unknown field "${key.slice(0, 40)}".` });

  if (body.url !== undefined) {
    if (typeof body.url !== "string" || body.url.trim() === "" || body.url.length > 4096) details.push({ path: "url", message: "Enter a destination URL." });
    else value.url = body.url.trim();
  } else if (mode === "create") details.push({ path: "url", message: "Enter a destination URL." });

  if (body.alias !== undefined && body.alias !== "") {
    if (typeof body.alias !== "string" || !CODE_PATTERN.test(body.alias.trim())) details.push({ path: "alias", message: 'Alias may contain only letters, numbers, "-" and "_" (up to 64 characters).' });
    else value.alias = body.alias.trim();
  }
  if (body.expiresAt !== undefined) {
    if (body.expiresAt === null) value.expiresAt = null;
    else if (typeof body.expiresAt !== "string" || body.expiresAt.length > 40 || Number.isNaN(Date.parse(body.expiresAt))) details.push({ path: "expiresAt", message: "Expiry must be a valid date and time." });
    else value.expiresAt = body.expiresAt;
  }
  if (body.redirectType !== undefined) {
    if (typeof body.redirectType !== "number" || !REDIRECT_TYPES.includes(body.redirectType)) details.push({ path: "redirectType", message: "Redirect type must be 301, 302, 307 or 308." });
    else value.redirectType = body.redirectType;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") details.push({ path: "isActive", message: "Active must be true or false." });
    else value.isActive = body.isActive;
  }
  if (mode === "update" && details.length === 0 && Object.keys(value).length === 0) details.push({ path: "", message: "Change at least one field." });
  return details.length > 0 ? { ok: false, details } : { ok: true, value };
}

function listQuery(params: URLSearchParams): { ok: true; query: URLSearchParams } | { ok: false; details: Detail[] } {
  // Each allowed parameter with its validity rule; anything not listed here is dropped.
  const rules: [name: string, valid: (v: string) => boolean, message: string][] = [
    ["page", (v) => /^\d{1,6}$/.test(v) && Number(v) >= 1, "Page must be a positive number."],
    ["limit", (v) => /^\d{1,3}$/.test(v) && Number(v) >= 1 && Number(v) <= 100, "Limit must be 1 to 100."],
    ["search", (v) => v.length <= 100, "Search is limited to 100 characters."],
    ["status", (v) => STATUSES.includes(v), "Unknown status filter."],
    ["sort", (v) => SORTS.includes(v), "Unknown sort."],
    ["order", (v) => v === "asc" || v === "desc", "Order must be asc or desc."],
  ];
  const details: Detail[] = [];
  const query = new URLSearchParams();
  for (const [name, valid, message] of rules) {
    const value = params.get(name)?.trim();
    if (value === undefined || value === "") continue;
    if (valid(value)) query.set(name, value);
    else details.push({ path: name, message });
  }
  return details.length > 0 ? { ok: false, details } : { ok: true, query };
}

/** /api/link-studio/links — GET list, POST create. */
export async function handleLinks(request: Request, deps: Deps): Promise<Response> {
  const gate = await requireAdmin(request, deps);
  if (!gate.ok) return gate.response;
  const method = request.method.toUpperCase();

  if (method === "GET") {
    const q = listQuery(new URL(request.url).searchParams);
    if (!q.ok) return validationError(q.details);
    return callWorker(deps, { method: "GET", path: "/api/links", query: q.query, clientId: clientIdFor(gate.admin) });
  }
  if (method === "POST") {
    const blocked = checkSameOrigin(request, gate.config.siteOrigin);
    if (blocked) return blocked;
    const body = await readJsonObject(request);
    if (!body.ok) return body.response;
    const fields = pickLinkFields(body.value, "create");
    if (!fields.ok) return validationError(fields.details);
    return callWorker(deps, { method: "POST", path: "/api/links", body: fields.value, clientId: clientIdFor(gate.admin) });
  }
  return fail(405, "method_not_allowed", "Method not allowed.", undefined, { Allow: "GET, POST" });
}

/** /api/link-studio/links/:code — GET, PUT, DELETE. */
export async function handleLink(request: Request, deps: Deps): Promise<Response> {
  const gate = await requireAdmin(request, deps);
  if (!gate.ok) return gate.response;
  // Exactly one segment after /links/ — anything else (including dot-segments the URL parser resolved) is a 404.
  const raw = /^\/api\/link-studio\/links\/([^/]+)$/.exec(new URL(request.url).pathname)?.[1] ?? "";
  let code: string;
  try {
    code = decodeURIComponent(raw);
  } catch {
    code = "";
  }
  if (!CODE_PATTERN.test(code)) return fail(404, "link_not_found", "No link has that short code.");
  const path = `/api/links/${encodeURIComponent(code)}`;
  const clientId = clientIdFor(gate.admin);
  const method = request.method.toUpperCase();

  if (method === "GET") return callWorker(deps, { method: "GET", path, clientId });
  if (method === "PUT" || method === "DELETE") {
    const blocked = checkSameOrigin(request, gate.config.siteOrigin);
    if (blocked) return blocked;
    if (method === "DELETE") return callWorker(deps, { method: "DELETE", path, clientId });
    const body = await readJsonObject(request);
    if (!body.ok) return body.response;
    const fields = pickLinkFields(body.value, "update");
    if (!fields.ok) return validationError(fields.details);
    return callWorker(deps, { method: "PUT", path, body: fields.value, clientId });
  }
  return fail(405, "method_not_allowed", "Method not allowed.", undefined, { Allow: "GET, PUT, DELETE" });
}

/** /api/link-studio/analytics?days=30[&code=abc] — summary, or one link's analytics. */
export async function handleAnalytics(request: Request, deps: Deps): Promise<Response> {
  const gate = await requireAdmin(request, deps);
  if (!gate.ok) return gate.response;
  if (request.method.toUpperCase() !== "GET") return fail(405, "method_not_allowed", "Method not allowed.", undefined, { Allow: "GET" });
  const params = new URL(request.url).searchParams;
  const days = params.get("days") ?? "30";
  if (!/^\d{1,3}$/.test(days) || Number(days) < 1 || Number(days) > 365) return validationError([{ path: "days", message: "Days must be 1 to 365." }]);
  const code = params.get("code");
  if (code !== null && !CODE_PATTERN.test(code)) return fail(404, "link_not_found", "No link has that short code.");
  const path = code === null ? "/api/analytics/summary" : `/api/analytics/${encodeURIComponent(code)}`;
  return callWorker(deps, { method: "GET", path, query: new URLSearchParams({ days }), clientId: clientIdFor(gate.admin) });
}

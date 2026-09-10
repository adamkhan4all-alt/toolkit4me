// ---------------------------------------------------------------------
// Single source of truth for the backend API's base URL. The only place
// that constant is read from — every server-mode tool's network call
// (src/hooks/useServerProcessing.ts) goes through `apiUrl()` here rather
// than hard-coding a host anywhere else.
//
// Empty string (the default) means "same origin as the frontend" — the
// right default for a production deployment where the API is reverse-
// proxied under the same domain (e.g. /api/* routed to the backend
// service). For local development, where the Vite dev server (5173) and
// the backend (4000) run on different origins, set
// VITE_API_BASE_URL=http://localhost:4000 in .env.local.
// ---------------------------------------------------------------------

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

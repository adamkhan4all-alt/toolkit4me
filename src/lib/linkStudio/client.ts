// ---------------------------------------------------------------------
// Browser client for Link Studio's admin API (/api/link-studio/*, the
// Vercel Functions in api/). The browser never talks to the Cloudflare
// Worker's management API and never sees its key: the session cookie is
// HttpOnly, and the functions add the key server-side.
// Response shapes mirror the existing Worker (toolkit4me-shortlinks).
// ---------------------------------------------------------------------

export type LinkStatus = "active" | "inactive" | "expired";
export type RedirectType = 301 | 302 | 307 | 308;

export interface ShortLink {
  code: string;
  shortUrl: string;
  url: string;
  clicks: number;
  status: LinkStatus;
  isActive: boolean;
  redirectType: RedirectType;
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  lastClickedAt: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NamedCount {
  name: string;
  clicks: number;
}

export interface DailyCount {
  date: string;
  clicks: number;
}

export interface Period {
  days: number;
  from: string;
  to: string;
}

export interface AnalyticsSummary {
  period: Period;
  totals: {
    links: number;
    activeLinks: number;
    inactiveLinks: number;
    expiredLinks: number;
    clicksAllTime: number;
    clicksInPeriod: number;
    linksCreatedInPeriod: number;
  };
  daily: DailyCount[];
  topLinks: { code: string; shortUrl: string; clicks: number }[];
  referrers: NamedCount[];
  countries: NamedCount[];
  devices: NamedCount[];
}

export interface LinkAnalytics {
  link: ShortLink;
  period: Period;
  totals: { clicksAllTime: number; clicksInPeriod: number };
  daily: DailyCount[];
  referrers: NamedCount[];
  countries: NamedCount[];
  devices: NamedCount[];
}

export interface SessionInfo {
  configured: boolean;
  authenticated: boolean;
  login?: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | LinkStatus;
  sort?: "created_at" | "clicks" | "last_clicked_at" | "expires_at";
  order?: "asc" | "desc";
}

export interface CreateLinkInput {
  url: string;
  alias?: string;
  expiresAt?: string | null;
  redirectType?: RedirectType;
  isActive?: boolean;
}

export type UpdateLinkInput = Partial<Omit<CreateLinkInput, "alias">>;

export class LinkStudioError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: { path: string; message: string }[];
  constructor(status: number, code: string, message: string, details: { path: string; message: string }[] = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const BASE = "/api/link-studio";

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch {
    throw new LinkStudioError(0, "network_error", "Couldn't reach the server. Check your connection and try again.");
  }
  let body: { ok?: boolean; data?: T; error?: { code?: string; message?: string; details?: { path: string; message: string }[] } } | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (res.ok && body?.ok) return body.data as T;
  throw new LinkStudioError(res.status, body?.error?.code ?? "request_failed", body?.error?.message ?? `The request failed (HTTP ${res.status}).`, body?.error?.details ?? []);
}

function query(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const linkStudioApi = {
  session: () => call<SessionInfo>("/auth/session"),
  logout: () => call<{ authenticated: false }>("/auth/logout", { method: "POST" }),
  list: (p: ListParams) => call<{ items: ShortLink[]; pagination: Pagination }>(`/links${query({ ...p })}`),
  create: (input: CreateLinkInput) => call<ShortLink>("/links", { method: "POST", body: JSON.stringify(input) }),
  get: (code: string) => call<ShortLink>(`/links/${encodeURIComponent(code)}`),
  update: (code: string, input: UpdateLinkInput) => call<ShortLink>(`/links/${encodeURIComponent(code)}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (code: string) => call<{ code: string; deleted: true }>(`/links/${encodeURIComponent(code)}`, { method: "DELETE" }),
  summary: (days: number) => call<AnalyticsSummary>(`/analytics${query({ days })}`),
  linkAnalytics: (code: string, days: number) => call<LinkAnalytics>(`/analytics${query({ code, days })}`),
};

/** Where sign-in starts (a full-page navigation, not fetch). */
export const SIGN_IN_URL = `${BASE}/auth/login`;

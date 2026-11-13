// Browser client for the public shortener on go.toolkit4me.com (the Worker's /api/public/*). Calls are credentialed
// so the Worker's signed, HttpOnly visitor cookie travels with them; the page never sees or sets that cookie.
import { SHORTLINKS_API } from "../../config/site";
import type { PowChallenge } from "./pow";

export interface PublicQuota {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: string;
}

export interface PublicLink {
  code: string;
  shortUrl: string;
  url: string;
  createdAt: string;
}

export class PublicShortenerError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  constructor(status: number, code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${SHORTLINKS_API}${path}`, { ...init, credentials: "include", headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}) } });
  } catch {
    throw new PublicShortenerError(0, "network_error", "Couldn't reach the short-link service. Check your connection and try again.");
  }
  const body = (await res.json().catch(() => null)) as { ok?: boolean; data?: T; error?: { code?: string; message?: string; details?: unknown } } | null;
  if (res.ok && body?.ok) return body.data as T;
  const d = body?.error?.details;
  throw new PublicShortenerError(
    res.status,
    body?.error?.code ?? "request_failed",
    body?.error?.message ?? `The request failed (HTTP ${res.status}).`,
    d && typeof d === "object" && !Array.isArray(d) ? (d as Record<string, unknown>) : { list: d }
  );
}

export const publicShortener = {
  status: () => call<{ quota: PublicQuota; challenge: PowChallenge | null }>("/api/public/status"),
  create: (input: { url: string; challenge?: PowChallenge; nonce?: string }) =>
    call<{ link: PublicLink; quota: PublicQuota }>("/api/public/links", { method: "POST", body: JSON.stringify(input) }),
};

/** Solves a challenge in a Web Worker (keeps the page responsive). */
export function solveInWorker(challenge: PowChallenge): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./powWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<{ ok: boolean; nonce?: string; error?: string }>) => {
      worker.terminate();
      if (e.data.ok && e.data.nonce) resolve(e.data.nonce);
      else reject(new Error(e.data.error ?? "Check failed"));
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message));
    };
    worker.postMessage(challenge);
  });
}

/** "in 5 h 12 min" until a reset time. */
export function timeUntil(iso: string, now = Date.now()): string {
  const mins = Math.max(1, Math.round((new Date(iso).getTime() - now) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `in ${h} h ${m} min` : `in ${m} min`;
}

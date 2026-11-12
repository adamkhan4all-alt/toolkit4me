// Small Web Crypto helpers (available in Node 18+ and every Vercel runtime) — no dependencies.

const encoder = new TextEncoder();

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) return null;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export function utf8(value: string): Uint8Array {
  return encoder.encode(value);
}

export function randomToken(bytes = 32): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", utf8(secret) as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function hmacSign(secret: string, data: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), utf8(data) as BufferSource);
  return base64UrlEncode(new Uint8Array(sig));
}

/** Constant-time HMAC verification (crypto.subtle.verify compares in constant time). */
export async function hmacVerify(secret: string, data: string, signature: string): Promise<boolean> {
  const sig = base64UrlDecode(signature);
  if (!sig) return false;
  return crypto.subtle.verify("HMAC", await hmacKey(secret), sig as BufferSource, utf8(data) as BufferSource);
}

export async function sha256Base64Url(value: string): Promise<string> {
  return base64UrlEncode(new Uint8Array(await crypto.subtle.digest("SHA-256", utf8(value) as BufferSource)));
}

/** Constant-time string comparison via HMAC of both values under a one-off random key. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const key = randomToken(16);
  const [x, y] = await Promise.all([hmacSign(key, a), hmacSign(key, b)]);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

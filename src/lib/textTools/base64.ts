// ---------------------------------------------------------------------
// Base64 Encoder / Decoder — UTF-8-correct encoding using TextEncoder/
// TextDecoder + btoa/atob (plain btoa throws on any non-Latin-1
// character, which is the most common Base64 bug). No library.
// ---------------------------------------------------------------------

/** Text input limit (characters) and file limit (bytes). Base64 output is ~33% larger than its input. */
export const MAX_BASE64_TEXT_CHARS = 10_000_000;
export const MAX_BASE64_FILE_BYTES = 10 * 1024 * 1024;

export function bytesToBase64(bytes: Uint8Array, urlSafe = false): string {
  let binary = "";
  const chunk = 0x8000; // build the binary string in chunks to avoid call-stack limits on large inputs
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  const b64 = btoa(binary);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

export function encodeText(text: string, urlSafe = false): string {
  return bytesToBase64(new TextEncoder().encode(text), urlSafe);
}

export class Base64Error extends Error {}

/** A data URL's MIME type, if the input is one (e.g. "data:image/png;base64,…"). */
export function dataUrlMime(input: string): string | undefined {
  return /^data:([^;,]+)[^,]*;base64,/i.exec(input.trim())?.[1];
}

/**
 * Decodes standard or URL-safe Base64, with or without padding, ignoring
 * whitespace and line breaks, and accepting a data: URL prefix.
 */
export function base64ToBytes(input: string): Uint8Array {
  let b64 = input.trim().replace(/^data:[^,]*;base64,/i, "").replace(/\s+/g, "");
  if (!b64) throw new Base64Error("Paste some Base64 to decode.");
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  const bad = /[^A-Za-z0-9+/=]/.exec(b64);
  if (bad) throw new Base64Error(`“${bad[0]}” at position ${bad.index + 1} isn't a Base64 character. Base64 uses only A–Z, a–z, 0–9, + and / (or - and _ in the URL-safe form).`);
  const body = b64.replace(/=+$/, "");
  if (body.includes("=")) throw new Base64Error("Padding characters (=) can only appear at the end.");
  if (body.length % 4 === 1) throw new Base64Error("This Base64 is the wrong length — it looks truncated or has an extra character.");
  const padded = body + "=".repeat((4 - (body.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Control characters other than tab, newline, vertical tab, form feed and carriage return mean the data is almost certainly binary. */
function hasBinaryControlChars(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 0x08 || (code >= 0x0e && code <= 0x1f)) return true;
  }
  return false;
}

export type DecodeResult = { kind: "text"; text: string; bytes: Uint8Array } | { kind: "binary"; bytes: Uint8Array };

/** Decodes and, if the bytes are valid UTF-8 text, returns the text; otherwise flags them as binary (e.g. an image). */
export function decodeBase64(input: string): DecodeResult {
  const bytes = base64ToBytes(input);
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (hasBinaryControlChars(text)) return { kind: "binary", bytes };
    return { kind: "text", text, bytes };
  } catch {
    return { kind: "binary", bytes };
  }
}

/** Guesses a file extension for decoded binary data from its leading "magic" bytes. */
export function guessExtension(bytes: Uint8Array, mime?: string): string {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0x89, 0x50, 0x4e, 0x47)) return "png";
  if (starts(0xff, 0xd8, 0xff)) return "jpg";
  if (starts(0x47, 0x49, 0x46, 0x38)) return "gif";
  if (starts(0x25, 0x50, 0x44, 0x46)) return "pdf";
  if (starts(0x50, 0x4b, 0x03, 0x04)) return "zip";
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45) return "webp";
  const fromMime = mime?.split("/")[1]?.replace("jpeg", "jpg").replace("svg+xml", "svg");
  return fromMime && /^[a-z0-9]+$/.test(fromMime) ? fromMime : "bin";
}

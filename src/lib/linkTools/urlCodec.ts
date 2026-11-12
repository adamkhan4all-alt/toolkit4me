// ---------------------------------------------------------------------
// URL encoding and decoding (percent-encoding, RFC 3986), using the
// browser's built-in encodeURIComponent / encodeURI / decodeURIComponent.
// ---------------------------------------------------------------------

export type EncodeMode = "component" | "fullUrl" | "form";

export class UrlCodecError extends Error {}

/**
 * - component: encodes everything except A–Z a–z 0–9 - _ . ! ~ * ' ( ) — for one query value or path segment.
 * - fullUrl:   keeps the characters that give a URL its structure (: / ? # & = …) — for a whole address.
 * - form:      like component, but spaces become "+" (HTML form submissions, application/x-www-form-urlencoded).
 */
export function encodeUrlText(text: string, mode: EncodeMode): string {
  try {
    if (mode === "fullUrl") return encodeURI(text);
    const encoded = encodeURIComponent(text);
    return mode === "form" ? encoded.replace(/%20/g, "+") : encoded;
  } catch {
    throw new UrlCodecError("The text contains a broken character (an unpaired surrogate) that can't be encoded. It usually comes from a damaged emoji — retype it and try again.");
  }
}

export interface DecodeResult {
  text: string;
  /** True when the output still contains %XX sequences — the input was probably encoded twice. */
  looksDoubleEncoded: boolean;
}

/** Finds the first "%" that doesn't start a valid UTF-8 percent-encoded character. */
function findBadEscape(text: string): number {
  const re = /%(?![0-9a-fA-F]{2})/g;
  const m = re.exec(text);
  if (m) return m.index;
  // Every % is followed by two hex digits, so the problem is an invalid UTF-8 byte sequence — find it.
  const seq = /(?:%[0-9a-fA-F]{2})+/g;
  let s: RegExpExecArray | null;
  while ((s = seq.exec(text))) {
    try {
      decodeURIComponent(s[0]);
    } catch {
      return s.index;
    }
  }
  return -1;
}

export function decodeUrlText(text: string, plusAsSpace: boolean): DecodeResult {
  const input = plusAsSpace ? text.replace(/\+/g, " ") : text;
  let out: string;
  try {
    out = decodeURIComponent(input);
  } catch {
    const at = findBadEscape(input);
    const where = at >= 0 ? ` at character ${at + 1} ("${input.slice(at, at + 9)}")` : "";
    throw new UrlCodecError(
      `The text has a "%" that isn't a valid percent-encoded character${where}. A % must be followed by two hexadecimal digits, and the bytes must form valid UTF-8. A literal % sign is written %25.`
    );
  }
  return { text: out, looksDoubleEncoded: /%[0-9a-fA-F]{2}/.test(out) };
}

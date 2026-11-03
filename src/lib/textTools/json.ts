// ---------------------------------------------------------------------
// JSON Formatter & Validator — pure functions over the browser's own
// JSON.parse / JSON.stringify (no library). Kept free of React so it can
// be unit-tested directly.
// ---------------------------------------------------------------------

/** 5 million characters (~5MB): comfortably above typical API responses/config files, small enough to stay responsive on phones. */
export const MAX_JSON_CHARS = 5_000_000;

export type JsonIndent = "2" | "4" | "tab";

export interface JsonErrorLocation {
  line: number;
  column: number;
}

export type JsonResult =
  | { ok: true; output: string; stats: { keys: number; depth: number }; warnings: string[] }
  | { ok: false; message: string; location?: JsonErrorLocation; lineText?: string };

/** Converts a 0-based character offset into a 1-based line/column. */
export function offsetToLocation(text: string, offset: number): JsonErrorLocation {
  const before = text.slice(0, Math.max(0, Math.min(offset, text.length)));
  const lines = before.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/**
 * Extracts the error position from a JSON.parse error. Engines word these
 * differently: V8 (Chrome/Edge/Node) reports "position N" and, in newer
 * versions, "(line L column C)"; Firefox reports "at line L column C";
 * Safari reports no position at all.
 */
export function locateParseError(text: string, message: string): JsonErrorLocation | undefined {
  const lineCol = /line (\d+) column (\d+)/i.exec(message);
  if (lineCol) return { line: Number(lineCol[1]), column: Number(lineCol[2]) };
  const position = /position (\d+)/i.exec(message);
  if (position) return offsetToLocation(text, Number(position[1]));
  return undefined;
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeysDeep((value as Record<string, unknown>)[k])])
    );
  }
  return value;
}

function measure(value: unknown, depth = 0): { keys: number; depth: number } {
  if (Array.isArray(value)) {
    return value.reduce<{ keys: number; depth: number }>(
      (acc, item) => {
        const m = measure(item, depth + 1);
        return { keys: acc.keys + m.keys, depth: Math.max(acc.depth, m.depth) };
      },
      { keys: 0, depth: depth + 1 }
    );
  }
  if (value && typeof value === "object") {
    const entries = Object.values(value as Record<string, unknown>);
    return entries.reduce<{ keys: number; depth: number }>(
      (acc, item) => {
        const m = measure(item, depth + 1);
        return { keys: acc.keys + m.keys, depth: Math.max(acc.depth, m.depth) };
      },
      { keys: entries.length, depth: depth + 1 }
    );
  }
  return { keys: 0, depth };
}

/**
 * Integers beyond ±2^53 can't be represented exactly by JavaScript numbers,
 * so JSON.parse silently rounds them (e.g. 64-bit IDs). Detect long digit
 * runs outside strings and warn rather than reformat them wrongly unnoticed.
 */
export function findUnsafeIntegers(text: string): string[] {
  const found: string[] = [];
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (/[-\d]/.test(ch) && !/[\w.]/.test(text[i - 1] ?? "")) {
      const m = /^-?\d+(?![\d.eE])/.exec(text.slice(i, i + 40));
      if (m) {
        if (!Number.isSafeInteger(Number(m[0]))) found.push(m[0]);
        i += m[0].length - 1;
      }
    }
  }
  return found;
}

export function processJson(input: string, mode: "format" | "minify", indent: JsonIndent = "2", sortKeys = false): JsonResult {
  if (!input.trim()) return { ok: false, message: "Paste or type some JSON first." };
  if (input.length > MAX_JSON_CHARS) {
    return { ok: false, message: `That's ${input.length.toLocaleString()} characters — the limit is ${MAX_JSON_CHARS.toLocaleString()}.` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const location = locateParseError(input, raw);
    const lineText = location ? input.split("\n")[location.line - 1] : undefined;
    // Strip the engine's own position suffix; we show a cleaner one.
    const message = raw.replace(/^JSON\.parse: /, "").replace(/ at line \d+ column \d+ of the JSON data$/, "").replace(/\s*\(line \d+ column \d+\)$/, "");
    return { ok: false, message, location, lineText };
  }

  const value = sortKeys ? sortKeysDeep(parsed) : parsed;
  const space = mode === "minify" ? undefined : indent === "tab" ? "\t" : Number(indent);
  const unsafe = findUnsafeIntegers(input);
  const warnings = unsafe.length
    ? [
        `${unsafe.length === 1 ? "A number" : `${unsafe.length} numbers`} (${unsafe.slice(0, 3).join(", ")}${unsafe.length > 3 ? ", …" : ""}) ${unsafe.length === 1 ? "is" : "are"} too large to keep exactly and will be rounded in the output. If these are IDs, store them as strings.`,
      ]
    : [];
  return { ok: true, output: JSON.stringify(value, null, space), stats: measure(value), warnings };
}

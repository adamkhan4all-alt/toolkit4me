// ---------------------------------------------------------------------
// Tiny inline-markup parser for blog text: [text](href) links and
// **bold**. Deliberately minimal — no HTML is ever accepted from content,
// so article text can't inject markup. Used by the React renderer
// (components/blog/InlineText.tsx), the static prerender and the content
// tests (which check every link target is real).
// ---------------------------------------------------------------------

export type InlineSegment =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "link"; text: string; href: string };

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

export function parseInline(source: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let last = 0;
  for (const m of source.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    if (index > last) out.push({ type: "text", text: source.slice(last, index) });
    if (m[1] !== undefined) out.push({ type: "link", text: m[1], href: m[2] });
    else out.push({ type: "bold", text: m[3] });
    last = index + m[0].length;
  }
  if (last < source.length) out.push({ type: "text", text: source.slice(last) });
  return out;
}

/** Text with markup removed — for word counts, search and meta text. */
export function plainText(source: string): string {
  return parseInline(source)
    .map((s) => s.text)
    .join("");
}

/** Every link target in a piece of text. */
export function linkTargets(source: string): string[] {
  return parseInline(source).flatMap((s) => (s.type === "link" ? [s.href] : []));
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

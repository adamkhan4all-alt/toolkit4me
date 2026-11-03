// ---------------------------------------------------------------------
// Meta Tag Generator — builds the <head> tags a page needs for search
// results and social sharing (standard, Open Graph, Twitter Card). Pure
// string building; every value is HTML-escaped so user input can't break
// out of an attribute.
// ---------------------------------------------------------------------

export interface MetaInput {
  title: string;
  description: string;
  url: string;
  siteName: string;
  imageUrl: string;
  imageAlt: string;
  twitterHandle: string;
  type: "website" | "article";
  index: boolean;
  follow: boolean;
  includeBasics: boolean;
}

export const EMPTY_META: MetaInput = {
  title: "",
  description: "",
  url: "",
  siteName: "",
  imageUrl: "",
  imageAlt: "",
  twitterHandle: "",
  type: "website",
  index: true,
  follow: true,
  includeBasics: true,
};

/** Rough limits before Google typically truncates in results (it actually truncates by pixel width). */
export const TITLE_GUIDE = 60;
export const DESCRIPTION_GUIDE = 160;

export function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export interface MetaIssue {
  field: keyof MetaInput;
  level: "error" | "warning";
  message: string;
}

export function checkMeta(input: MetaInput): MetaIssue[] {
  const issues: MetaIssue[] = [];
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title) issues.push({ field: "title", level: "error", message: "Add a page title — it's the most important tag for search results." });
  else if (title.length > TITLE_GUIDE) issues.push({ field: "title", level: "warning", message: `The title is ${title.length} characters; Google usually shows about ${TITLE_GUIDE}, so the end may be cut off.` });
  else if (title.length < 15) issues.push({ field: "title", level: "warning", message: "The title is very short. A descriptive title of 30–60 characters usually performs better." });

  if (!description) issues.push({ field: "description", level: "warning", message: "Add a description — without one, search engines and social sites pick text from the page themselves." });
  else if (description.length > DESCRIPTION_GUIDE)
    issues.push({ field: "description", level: "warning", message: `The description is ${description.length} characters; Google usually shows about ${DESCRIPTION_GUIDE}.` });
  else if (description.length < 50) issues.push({ field: "description", level: "warning", message: "The description is short. Aim for roughly 120–160 characters that summarise the page." });

  if (input.url.trim() && !isAbsoluteHttpUrl(input.url.trim()))
    issues.push({ field: "url", level: "error", message: "The page URL must be a full address starting with https:// (or http://)." });
  if (input.imageUrl.trim() && !isAbsoluteHttpUrl(input.imageUrl.trim()))
    issues.push({ field: "imageUrl", level: "error", message: "The image URL must be a full address starting with https:// — social sites can't load relative paths." });
  if (input.imageUrl.trim() && !input.imageAlt.trim())
    issues.push({ field: "imageAlt", level: "warning", message: "Add image alt text so people using screen readers know what the shared image shows." });
  if (input.twitterHandle.trim() && !/^@?[A-Za-z0-9_]{1,15}$/.test(input.twitterHandle.trim()))
    issues.push({ field: "twitterHandle", level: "error", message: "X/Twitter usernames are 1–15 letters, numbers or underscores, like @toolkit4me." });
  return issues;
}

/** Builds the tag block. Tags whose value is empty (or invalid) are left out rather than emitted blank. */
export function buildMetaTags(input: MetaInput): string {
  const errors = new Set(checkMeta(input).filter((i) => i.level === "error").map((i) => i.field));
  const v = (field: keyof MetaInput) => (errors.has(field) ? "" : String(input[field]).trim());
  const lines: string[] = [];
  const meta = (attr: "name" | "property", key: string, value: string) => value && lines.push(`<meta ${attr}="${key}" content="${escapeAttr(value)}" />`);

  if (input.includeBasics) {
    lines.push('<meta charset="utf-8" />');
    lines.push('<meta name="viewport" content="width=device-width, initial-scale=1" />');
  }
  if (v("title")) lines.push(`<title>${escapeAttr(v("title"))}</title>`);
  meta("name", "description", v("description"));
  if (!input.index || !input.follow) meta("name", "robots", `${input.index ? "index" : "noindex"}, ${input.follow ? "follow" : "nofollow"}`);
  if (v("url")) lines.push(`<link rel="canonical" href="${escapeAttr(v("url"))}" />`);

  lines.push("", "<!-- Open Graph (Facebook, LinkedIn, WhatsApp and others) -->");
  meta("property", "og:type", input.type);
  meta("property", "og:title", v("title"));
  meta("property", "og:description", v("description"));
  meta("property", "og:url", v("url"));
  meta("property", "og:site_name", v("siteName"));
  meta("property", "og:image", v("imageUrl"));
  if (v("imageUrl")) meta("property", "og:image:alt", v("imageAlt"));

  lines.push("", "<!-- X (Twitter) -->");
  meta("name", "twitter:card", v("imageUrl") ? "summary_large_image" : "summary");
  const handle = v("twitterHandle");
  meta("name", "twitter:site", handle && (handle.startsWith("@") ? handle : `@${handle}`));
  meta("name", "twitter:title", v("title"));
  meta("name", "twitter:description", v("description"));
  meta("name", "twitter:image", v("imageUrl"));
  if (v("imageUrl")) meta("name", "twitter:image:alt", v("imageAlt"));

  return lines.join("\n");
}

/** Displayable URL for the search preview: "example.com › blog › post". */
export function breadcrumbUrl(url: string): string {
  try {
    const u = new URL(url);
    return [u.hostname.replace(/^www\./, ""), ...u.pathname.split("/").filter(Boolean)].join(" › ");
  } catch {
    return "example.com";
  }
}

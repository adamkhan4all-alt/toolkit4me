import type { HubId } from "../data/hubs";
// ---------------------------------------------------------------------
// Core type contract for the reusable tool framework (Phase 4).
//
// Every tool on the platform — present and future — is described purely
// as data conforming to ToolDefinition. No tool page contains bespoke UI
// code: the entire rendering pipeline (ToolPage + its child components)
// is generic and driven by this shape. Adding tool #11 means writing one
// ToolDefinition object and registering it — nothing else.
// ---------------------------------------------------------------------

export type ToolCategory = "convert" | "compress" | "merge" | "ocr" | "edit" | "security" | "text" | "web" | "photo" | "social" | "video";

/**
 * Where the actual conversion/compression work happens.
 * - CLIENT: performed entirely in the browser (e.g. with a WASM/JS library),
 *   no file ever leaves the user's device.
 * - SERVER: the file is uploaded to `endpoint` and processed remotely.
 * Phase 4 wires this flag through the framework only — no real client-side
 * or server-side processing is implemented yet (still mocked, per Phase 3).
 */
export type ProcessingMode = "CLIENT" | "SERVER";

export interface ToolOption {
  id: string;
  label: string;
  type: "select" | "radio" | "password" | "text";
  /** Required for "select"/"radio"; unused for "password"/"text". */
  choices?: { value: string; label: string }[];
  defaultValue: string;
  /** "password"/"text" only — shown when the field is empty. */
  placeholder?: string;
  /** "password"/"text" only — short guidance shown under the field. */
  helpText?: string;
}

export interface ToolFaqEntry {
  question: string;
  answer: string;
}

export interface ToolSeoMetadata {
  title: string;
  metaDescription: string;
  h1: string;
  keywords: string[];
  /** Falls back to `metaDescription` when omitted — set only when the OG/Twitter card copy should differ. */
  ogDescription?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  /** Top-level section of the site this tool belongs to (navigation, hub page, sitemap). */
  hub: HubId;
  /** Editorially featured on the homepage and hub pages. */
  featured?: boolean;
  /** ISO date the tool was first published — drives "Recently added". */
  addedOn: string;
  /** Upper bound on files per run when `multiple` is true, matching the backend's limit. Omit for no limit (client-side tools). */
  maxFiles?: number;
  /** ISO date (YYYY-MM-DD) this tool's page content last changed meaningfully. Feeds the sitemap <lastmod>; bump it when editing the tool's copy. */
  lastModified: string;
  category: ToolCategory;
  categoryLabel: string;
  description: string;
  acceptedFormats: string[];
  acceptedMime: string[];
  maxFileSize: number; // MB
  /** "text" for tools whose input is typed/pasted rather than an uploaded file — adjusts the formats/privacy wording. Defaults to "file". */
  inputKind?: "file" | "text";
  /** Human-readable input limit shown instead of "{maxFileSize}MB per file", e.g. "Up to 1,000,000 characters". */
  inputLimitLabel?: string;
  multiple: boolean;
  processingMode: ProcessingMode;
  /** API endpoint used when processingMode is SERVER. Null for CLIENT-mode tools. */
  endpoint: string | null;
  actionLabel: string;
  icon: string;
  outputExtension: string;
  howItWorks: string[];
  features: string[];
  /** Concrete, everyday situations this tool is the right choice for — rendered as "Common uses". */
  useCases: string[];
  /** Honest, verified limits of what the tool does (formats, fidelity, size/count caps) — rendered as "Limitations". */
  limitations: string[];
  faq: ToolFaqEntry[];
  options?: ToolOption[];
  relatedTools: string[]; // tool ids
  seo: ToolSeoMetadata;
  /**
   * Unique introductory copy (1-2 paragraphs) rendered above the fold on
   * the tool page, beyond the one-line `description`. Exists specifically
   * so every tool page carries genuine, non-duplicate body content for
   * search engines and readers, not just an interactive widget.
   */
  intro: string[];
  /** Plain-language statement of accepted input formats, size limit, and output format — rendered as its own page section. */
  formatsNote: string;
  /**
   * Optional extra H2 sections rendered after "About this tool", for tools
   * whose searchers need more explanation than the standard blocks give
   * (e.g. static vs dynamic QR codes). Same shape as a guide section.
   */
  extraSections?: ToolContentSection[];
  /** Optional replacements for the generic section headings, so a heading can describe the task in searchers' own words. */
  sectionHeadings?: Partial<Record<"intro" | "useCases" | "howItWorks" | "features", string>>;
}

export interface ToolContentSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  table?: { caption: string; headers: string[]; rows: string[][] };
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  convert: "Convert",
  compress: "Compress",
  merge: "Merge",
  ocr: "OCR",
  edit: "Edit",
  security: "Security",
  text: "Text",
  web: "Web & Developer",
  photo: "Photo Editing Lab",
  social: "Social Creator Studio",
  video: "Video Playground",
};

export const CATEGORIES: ToolCategory[] = ["convert", "compress", "merge", "ocr", "edit", "security", "text", "web", "photo", "social", "video"];

/**
 * What discovery UI needs — cards, hub menus, search, the directory and sitemaps. Every ToolDefinition is
 * a ToolListing as-is (its page lives at /tools/<slug>); Calculator Hub entries are lightweight listings
 * with their own `path`, so their page copy and formulas stay out of the shared bundle.
 */
export interface ToolListing {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  hub: HubId;
  categoryLabel: string;
  addedOn: string;
  lastModified: string;
  featured?: boolean;
  /** Page path; defaults to /tools/<slug>. */
  path?: string;
  /** Extra search terms (ToolDefinitions use seo.keywords). */
  keywords?: string[];
}

export function listingPath(t: ToolListing): string {
  return t.path ?? `/tools/${t.slug}`;
}

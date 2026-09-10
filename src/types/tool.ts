// ---------------------------------------------------------------------
// Core type contract for the reusable tool framework (Phase 4).
//
// Every tool on the platform — present and future — is described purely
// as data conforming to ToolDefinition. No tool page contains bespoke UI
// code: the entire rendering pipeline (ToolPage + its child components)
// is generic and driven by this shape. Adding tool #11 means writing one
// ToolDefinition object and registering it — nothing else.
// ---------------------------------------------------------------------

export type ToolCategory = "convert" | "compress" | "merge" | "ocr";

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
  type: "select" | "radio";
  choices: { value: string; label: string }[];
  defaultValue: string;
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
  category: ToolCategory;
  categoryLabel: string;
  description: string;
  acceptedFormats: string[];
  acceptedMime: string[];
  maxFileSize: number; // MB
  multiple: boolean;
  processingMode: ProcessingMode;
  /** API endpoint used when processingMode is SERVER. Null for CLIENT-mode tools. */
  endpoint: string | null;
  actionLabel: string;
  icon: string;
  outputExtension: string;
  howItWorks: string[];
  features: string[];
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
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  convert: "Convert",
  compress: "Compress",
  merge: "Merge",
  ocr: "OCR",
};

export const CATEGORIES: ToolCategory[] = ["convert", "compress", "merge", "ocr"];

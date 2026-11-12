// ---------------------------------------------------------------------
// Hubs — the top-level sections of the site (navigation, homepage
// sections, hub landing pages, sitemaps). A hub is shown only when at
// least one released tool belongs to it (see releasedHubs), so planned
// sections never appear as empty pages.
// ---------------------------------------------------------------------

export type HubId = "pdf" | "image" | "pixel" | "video" | "calculators" | "developer" | "link";

export interface HubDefinition {
  id: HubId;
  /** Navigation label. */
  name: string;
  /** Landing page path. */
  path: string;
  /** One-line promise under the H1 and in menus. */
  tagline: string;
  /** H1 on the landing page. */
  h1: string;
  seoTitle: string;
  metaDescription: string;
  /** Two short, specific paragraphs for the landing page. */
  intro: string[];
  /** Short glyph shown on cards and menus. */
  icon: string;
  /** Tailwind classes for the hub's accent chip (background + text), chosen to pass WCAG AA contrast. */
  accent: string;
  /** Guide categories whose guides are listed on the hub page. */
  guideCategories: string[];
}

export const HUBS: HubDefinition[] = [
  {
    id: "pdf",
    name: "PDF Tools",
    path: "/pdf-tools",
    tagline: "Convert, compress, merge, split, edit and protect PDFs.",
    h1: "Free PDF Tools",
    seoTitle: "Free PDF Tools Online — Convert, Compress, Merge & Edit | Toolkit4Me",
    metaDescription:
      "Free online PDF tools: convert PDF to Word or JPG, turn Office files and images into PDFs, compress, merge, split, number, edit and password-protect PDFs.",
    intro: [
      "Everything you need for everyday PDF jobs: turn Word, Excel, PowerPoint and photos into PDFs, get editable text back out, shrink a file for email, combine or split documents, add page numbers, and add or remove passwords.",
      "Tools that can run in your browser — splitting, editing, page numbers and JPG to PDF — never upload your file. Conversions that need desktop-grade software, such as Word to PDF, run on our server and the files are deleted within an hour.",
    ],
    icon: "PDF",
    accent: "bg-rose-50 text-rose-700",
    guideCategories: ["pdf"],
  },
  {
    id: "image",
    name: "Image Tools",
    path: "/image-tools",
    tagline: "Compress, resize, convert and read text from images.",
    h1: "Free Image Tools",
    seoTitle: "Free Image Tools Online — Compress, Resize, Convert & OCR | Toolkit4Me",
    metaDescription:
      "Free online image tools: compress JPG, PNG and WebP, resize to exact pixels, convert between JPG, PNG and WebP, and extract text from photos with OCR.",
    intro: [
      "Make images the right size and format for the job: compress photos for email and websites, resize to exact pixel dimensions, convert between JPG, PNG and WebP, and pull editable text out of screenshots and photos.",
      "Compression, resizing and format conversion happen entirely in your browser, so your photos aren't uploaded. Text recognition runs on our server, which deletes your image as soon as it's read.",
    ],
    icon: "IMG",
    accent: "bg-teal-50 text-teal-800",
    guideCategories: ["images", "ocr"],
  },
  {
    id: "pixel",
    name: "Pixel Playground",
    path: "/pixel-playground",
    tagline: "Create. Edit. Transform. Have fun.",
    h1: "Pixel Playground",
    seoTitle: "Pixel Playground — Free Creative Photo & Social Tools | Toolkit4Me",
    metaDescription:
      "Free creative photo and social tools: filters, frames, transparent backgrounds, privacy blur, memes, stories, thumbnails, stickers and collages.",
    intro: [
      "A creative corner for photos and social posts: give a picture a new look with filters, frame it, add a shadow, make its background transparent or turn it into a pencil sketch. Blur faces before you share, pull a colour palette from a photo, and make memes, stories, YouTube thumbnails, stickers, collages, profile-picture rings and fancy bio text.",
      "Every tool here runs in your browser, so your photos never leave your device. They're classic image techniques — colour maths, edge detection, blending — rather than AI, which keeps them instant and predictable; each page explains exactly what it can and can't do.",
    ],
    icon: "✦",
    accent: "bg-fuchsia-50 text-fuchsia-800",
    guideCategories: [],
  },
  {
    id: "video",
    name: "Video & Audio",
    path: "/video-audio",
    tagline: "Quick video and audio jobs in your browser.",
    h1: "Video & Audio Tools",
    seoTitle: "Free Video & Audio Tools | Toolkit4Me",
    metaDescription: "Free video and audio tools that run in your browser.",
    intro: [],
    icon: "▶",
    accent: "bg-orange-50 text-orange-800",
    guideCategories: [],
  },
  {
    id: "calculators",
    name: "Calculator Hub",
    path: "/calculators",
    tagline: "Calculators for literally everything.",
    h1: "Calculator Hub",
    seoTitle: "Calculator Hub — Free Online Calculators | Toolkit4Me",
    metaDescription: "Free online calculators for everyday maths, money, study, technology and property.",
    intro: [],
    icon: "=",
    accent: "bg-amber-50 text-amber-800",
    guideCategories: [],
  },
  {
    id: "developer",
    name: "Developer & Text",
    path: "/developer-tools",
    tagline: "JSON, Base64, meta tags, QR codes, word counts and text diffs.",
    h1: "Free Developer & Text Tools",
    seoTitle: "Free Developer & Text Tools — JSON, Base64, QR, Diff | Toolkit4Me",
    metaDescription:
      "Free developer and writing tools: format and validate JSON, encode Base64, generate meta tags and QR codes, count words and compare texts — all in your browser.",
    intro: [
      "Small, dependable utilities for web work and writing: format and validate JSON, encode and decode Base64, generate meta tags for search and social sharing, make QR codes, count words and characters, and compare two versions of a text.",
      "All of them run entirely in your browser. What you paste is never sent to a server, which makes them safe for API responses, configuration files and unpublished drafts.",
    ],
    icon: "</>",
    accent: "bg-indigo-50 text-indigo-800",
    guideCategories: ["web", "writing"],
  },
  {
    id: "link",
    name: "Link Studio",
    path: "/link-studio",
    tagline: "Shorten. Share. Track.",
    h1: "Link Studio",
    seoTitle: "Link Studio — Free Link Tools | Toolkit4Me",
    metaDescription: "Free link tools.",
    intro: [],
    icon: "↗",
    accent: "bg-emerald-50 text-emerald-800",
    guideCategories: [],
  },
];

export function getHub(id: HubId): HubDefinition {
  const hub = HUBS.find((h) => h.id === id);
  if (!hub) throw new Error(`Unknown hub: ${id}`);
  return hub;
}

/** Hubs that contain at least one released item, in display order. `counts` maps hub id → number of released items. */
export function releasedHubs(counts: Partial<Record<HubId, number>>): HubDefinition[] {
  return HUBS.filter((h) => (counts[h.id] ?? 0) > 0);
}

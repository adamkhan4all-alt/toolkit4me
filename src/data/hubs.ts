// ---------------------------------------------------------------------
// Hubs — the top-level sections of the site (navigation, homepage
// sections, hub landing pages, sitemaps). A hub is shown only when at
// least one released tool belongs to it (see releasedHubs), so planned
// sections never appear as empty pages.
// ---------------------------------------------------------------------

import type { ToolContentSection, ToolFaqEntry } from "../types/tool";

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
  /** Optional second line under the tagline. */
  strapline?: string;
  /** Optional extra H2 sections after the tool groups (same shape as a tool page's extra sections). */
  sections?: ToolContentSection[];
  /** Optional FAQ for the hub page (also emitted as FAQPage structured data). */
  faq?: ToolFaqEntry[];
  /** Ids of tools from other hubs worth listing here, shown as "More link tools"-style group. */
  relatedTools?: { label: string; ids: string[] };
  /** Optional small call-to-action box under the intro. */
  callout?: { title: string; body: string; linkLabel: string; href: string };
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
      "A creative corner for photos and social posts: give a picture a new look with filters, frame it, add a shadow, make its background transparent or turn it into a pencil sketch. Blur faces before you share, pull a colour palette from a photo, make passport photos, and create memes, stories, YouTube thumbnails, stickers, collages, GIFs from videos, profile-picture rings and fancy bio text.",
      "Every tool here runs in your browser, so your photos never leave your device. They're classic image and video techniques — colour maths, edge detection, blending, GIF encoding — rather than AI, which keeps them fast and predictable; each page explains exactly what it can and can't do.",
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
    tagline: "Calculators for Literally Everything.",
    h1: "Calculator Hub",
    seoTitle: "Calculator Hub — 30 Free Online Calculators | Toolkit4Me",
    metaDescription:
      "Free online calculators for percentages, dates, loans, interest, GPA, marks, download times, electricity, fuel, square feet and marla — formulas shown.",
    intro: [
      "Quick, accurate answers to the sums everyday life throws at you: percentages and discounts, ages and dates, loan instalments and interest, GPAs and exam marks, download times and data sizes, electricity and fuel costs, and room and plot areas — including marla and kanal, with the standard you choose.",
      "Every calculator shows the formula it uses and the working with your numbers, has a worked example you can load with one click, and runs entirely in your browser. Each formula is checked by automated tests against independently calculated values.",
    ],
    icon: "=",
    accent: "bg-amber-50 text-amber-800",
    guideCategories: [],
    sections: [
      {
        heading: "How the calculators work",
        list: [
          "Type your numbers and select Calculate — after that, results update as you change any value.",
          "Each result shows the working, so you can check it or copy the method.",
          "Try the example loads a worked example that matches the explanation on the page.",
          "Copy result puts the answer and its working on your clipboard.",
          "Nothing you enter is sent to a server or stored.",
        ],
      },
      {
        heading: "Accuracy and limits",
        paragraphs: [
          "Results are calculated to full precision and rounded only for display. Money results are shown to two decimal places without a currency symbol, so they work in any currency; no exchange rates or prices are built in.",
          "Finance results are estimates that exclude fees and taxes and aren't financial advice. Grade calculators use common conventions, and marla conversions use whichever marla size you choose — always check your institution's or authority's own rules when it matters.",
        ],
      },
    ],
    faq: [
      {
        question: "Are the calculators free?",
        answer: "Yes — every calculator is free, with no sign-up and no limits.",
      },
      {
        question: "Is my data stored?",
        answer: "No. Calculations run in your browser and nothing you type is sent to Toolkit4Me's servers.",
      },
      {
        question: "Can I suggest a calculator?",
        answer: "Yes — email toolkit4me@gmail.com. More categories, such as health and fitness, travel and business, are planned.",
      },
    ],
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
    strapline: "Your links. Your brand. Your rules.",
    h1: "Link Studio",
    seoTitle: "Link Studio — Free UTM Builder, URL Cleaner & Link Tools | Toolkit4Me",
    metaDescription:
      "Free link tools that run in your browser: build UTM campaign links, remove tracking parameters, validate and encode URLs, and make QR codes.",
    intro: [
      "Link Studio is Toolkit4Me's home for working with links. Tag a link so your analytics show which campaign sent each visitor, strip the tracking codes out of a link before you share it, check that an address is complete before it goes on a poster, encode text so it's safe inside a URL, and turn any link into a QR code.",
      "The URL tools are free for everyone and run entirely in your browser — the links you paste are never sent to our servers. Branded short links on go.toolkit4me.com, with click counts and simple analytics, are created and managed by the Toolkit4Me team; short-link creation isn't open to the public yet.",
    ],
    icon: "↗",
    accent: "bg-emerald-50 text-emerald-800",
    guideCategories: [],
    relatedTools: { label: "More link tools", ids: ["qr-code-generator", "base64-encoder-decoder"] },
    callout: {
      title: "Toolkit4Me team",
      body: "Create and manage go.toolkit4me.com short links, and see their click analytics.",
      linkLabel: "Team sign-in →",
      href: "/link-studio/admin",
    },
    sections: [
      {
        heading: "Which link tool do you need?",
        table: {
          caption: "Link Studio tools by task",
          headers: ["You want to…", "Use"],
          rows: [
            ["See which newsletter, post or ad sent each visitor", "UTM Builder"],
            ["Remove fbclid, utm_ and other tracking codes before sharing a link", "URL Parser & Cleaner"],
            ["Check an address is complete and well-formed before printing it", "URL Validator"],
            ["Put a search phrase or another link inside a URL, or read a %-encoded one", "URL Encoder & Decoder"],
            ["Let people open a link by scanning it with a phone", "QR Code Generator"],
          ],
        },
      },
      {
        heading: "Branded short links on go.toolkit4me.com",
        paragraphs: [
          "A short link such as go.toolkit4me.com/summer26 redirects to a longer destination address. It's easier to type, fits on print and in social posts, and can be updated or switched off later without reprinting it.",
          "Each Toolkit4Me short link points only to an http:// or https:// address, can be given an expiry date, and can be disabled at once — a disabled or expired link shows a notice instead of redirecting. A link can also be made one-time: it opens a short confirmation page, works once when someone presses Continue, and then shows that it has been used (chat-app previews and email scanners don't use it up). If you find a go.toolkit4me.com link that leads somewhere harmful, email toolkit4me@gmail.com and we'll disable it.",
        ],
      },
      {
        heading: "How short-link click analytics work",
        paragraphs: [
          "When someone opens a go.toolkit4me.com link, the click is counted after the redirect has been sent, so counting never slows the visitor down. Click numbers are filtered estimates rather than exact counts of people: known bots, link-preview fetches and browser prefetches aren't counted, and repeat clicks from the same visitor within about a minute are usually — but not always — counted once.",
        ],
        list: [
          "Stored for each counted click: the time, the short code, the referring website's domain name (not the full page address), a two-letter country code and the device type (mobile, tablet or desktop).",
          "Not stored in the analytics: IP addresses, browser user-agent strings or any identifier that follows you across sites.",
          "Individual click records are deleted after 365 days; only each link's running total is kept.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I create my own short links?",
        answer:
          "Not yet. go.toolkit4me.com short links are currently created by the Toolkit4Me team only, so the domain can't be used to disguise spam or harmful sites. All the URL tools on this page are free for everyone.",
      },
      {
        question: "What happens when I click a go.toolkit4me.com link?",
        answer:
          "Your browser is redirected straight to the link's destination. A filtered click is recorded with the time, the referring site's domain, your country and your device type — never your IP address or browser details. See our Privacy Policy for details.",
      },
      {
        question: "Do the URL tools send my links anywhere?",
        answer:
          "No. The UTM Builder, URL Parser & Cleaner, URL Validator, URL Encoder & Decoder and QR Code Generator all run in your browser, so the addresses you paste never leave your device.",
      },
      {
        question: "What's the difference between a short link and a UTM link?",
        answer:
          "A UTM link is the full address with campaign labels added, which your own analytics read. A short link is a short address that redirects somewhere else. They work well together: build a UTM link, then point a short link at it so the long address never has to be typed.",
      },
    ],
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

// ---------------------------------------------------------------------
// Post-build static prerender.
//
// This is a client-rendered SPA (Vite + React Router, `createRoot`, no
// SSR framework). That's fine for Googlebot, which executes JavaScript —
// but it's a real gap for crawlers/bots that DON'T run JS: most social
// link-preview scrapers (Slack, iMessage, some Twitter/X and Facebook
// crawlers) and simpler SEO tools fetch raw HTML only. Without this step,
// every route would serve the same generic <head> from index.html and no
// visible body content until JS runs.
//
// This script runs after `vite build` and, for each route (home, the
// tools directory, and all 10 tool pages), writes a real physical
// `dist/<route>/index.html` containing:
//   - the correct <title>/meta description/canonical/OG/Twitter tags
//   - BreadcrumbList + FAQPage JSON-LD
//   - real, visible fallback content (H1, intro, how-it-works, supported
//     formats, privacy note, FAQ text, related-tool links) inside #root
//
// The React app still owns #root once its JS loads — since main.tsx uses
// `createRoot(...).render(...)` (not `hydrateRoot`), React simply clears
// and replaces the prerendered content on mount, so there's no hydration
// mismatch to worry about. Static hosts that serve a folder's index.html
// for its matching path (Netlify, Vercel, S3+CloudFront, GitHub Pages)
// need no extra rewrite config for this to work — /tools/pdf-to-word
// resolves directly to dist/tools/pdf-to-word/index.html.
// ---------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { TOOL_DEFINITIONS } from "../src/data/tools";
import { toolRegistry } from "../src/lib/toolRegistry";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, TWITTER_HANDLE, HOME_DESCRIPTION, TOOLS_PAGE_DESCRIPTION, TOOLS_PAGE_TITLE, toolsPageIntro } from "../src/config/site";
import { CATEGORIES, CATEGORY_LABELS } from "../src/types/tool";
import { TOOL_AREAS } from "../src/data/toolAreas";
import type { ToolDefinition } from "../src/types/tool";
import { GUIDE_AUTHOR, GUIDE_CATEGORIES, GUIDES, GUIDES_INDEX_META, guideCategoryLabel, guidesForTool, readingMinutes, relatedGuidesFor, sectionId, type GuideDefinition } from "../src/data/guides";
import { formatLongDate } from "../src/lib/format";
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  webApplicationSchema,
  websiteSchema,
  type JsonLd,
} from "../src/lib/seo/structuredData";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const templatePath = path.join(distDir, "index.html");

if (!existsSync(templatePath)) {
  console.error(`prerender: ${templatePath} not found — run \`vite build\` first.`);
  process.exit(1);
}

const template = readFileSync(templatePath, "utf8");

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface PageMeta {
  route: string;
  title: string;
  description: string;
  breadcrumbs: { name: string; path: string }[];
  faq?: { question: string; answer: string }[];
  /** Extra page-specific JSON-LD, built with the same helpers <SeoHead> uses. */
  jsonLd?: JsonLd[];
  noindex?: boolean;
  /** Absolute URL of a page-specific share image; defaults to the site-wide one. */
  ogImage?: string;
}

/** JSON for an inline <script>: escape "<" so a "</script>" inside text content can't end the tag early. */
function inlineJson(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// Every tag is marked data-prerender="true": these serve non-JS crawlers,
// and src/main.tsx removes them on boot (src/lib/seo/prerenderedHead.ts)
// because <SeoHead> re-emits the same tags — so there's never a second
// canonical / description / JSON-LD block once the app is running.
function renderHead(meta: PageMeta): string {
  const url = meta.route === "/" ? `${SITE_URL}/` : `${SITE_URL}${meta.route}`;
  const image = meta.ogImage ?? DEFAULT_OG_IMAGE;
  const structuredData: JsonLd[] = [
    ...(meta.breadcrumbs.length ? [breadcrumbSchema(meta.breadcrumbs)] : []),
    ...(meta.faq?.length ? [faqSchema(meta.faq)] : []),
    ...(meta.jsonLd ?? []),
  ];
  const scripts = structuredData.map((d) => `<script data-prerender="true" type="application/ld+json">${inlineJson(d)}</script>`);

  return `<title data-prerender="true">${escapeHtml(meta.title)}</title>
    <meta data-prerender="true" name="description" content="${escapeHtml(meta.description)}" />
    ${meta.noindex ? `<meta data-prerender="true" name="robots" content="noindex, nofollow" />` : `<link data-prerender="true" rel="canonical" href="${url}" />`}
    <meta data-prerender="true" property="og:type" content="website" />
    <meta data-prerender="true" property="og:site_name" content="${SITE_NAME}" />
    <meta data-prerender="true" property="og:title" content="${escapeHtml(meta.title)}" />
    <meta data-prerender="true" property="og:description" content="${escapeHtml(meta.description)}" />
    <meta data-prerender="true" property="og:url" content="${url}" />
    <meta data-prerender="true" property="og:image" content="${image}" />
    ${meta.ogImage ? "" : `<meta data-prerender="true" property="og:image:width" content="1200" />\n    <meta data-prerender="true" property="og:image:height" content="630" />\n    `}<meta data-prerender="true" property="og:image:alt" content="${escapeHtml(meta.ogImage ? meta.title : DEFAULT_OG_IMAGE_ALT)}" />
    <meta data-prerender="true" name="twitter:card" content="summary_large_image" />
    <meta data-prerender="true" name="twitter:site" content="${TWITTER_HANDLE}" />
    <meta data-prerender="true" name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta data-prerender="true" name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta data-prerender="true" name="twitter:image" content="${image}" />
    ${scripts.join("\n    ")}`;
}

function renderBreadcrumbNav(breadcrumbs: { name: string; path: string }[]): string {
  const items = breadcrumbs
    .map((crumb, i) => {
      const isLast = i === breadcrumbs.length - 1;
      const label = isLast
        ? `<span aria-current="page">${escapeHtml(crumb.name)}</span>`
        : `<a href="${crumb.path}">${escapeHtml(crumb.name)}</a>`;
      return i === 0 ? label : ` / ${label}`;
    })
    .join("");
  return `<nav aria-label="Breadcrumb" style="font-size:14px;color:#4b5563;margin-bottom:16px">${items}</nav>`;
}

function listItems(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n");
}

function renderToolBody(tool: ToolDefinition): string {
  const related = toolRegistry.getRelated(tool);

  const intro = tool.intro.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
  const steps = tool.howItWorks.map((step, i) => `<li>${i + 1}. ${escapeHtml(step)}</li>`).join("\n");
  const features = tool.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("\n");
  const faq = tool.faq
    .map((item) => `<div><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`)
    .join("\n");
  const relatedLinks = related
    .map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a></li>`)
    .join("\n");
  const guideLinks = guidesForTool(tool.slug)
    .map((g) => `<li><a href="${g.path}">${escapeHtml(g.title)}</a></li>`)
    .join("\n");

  const privacyText =
    tool.processingMode === "CLIENT" && tool.inputKind === "text"
      ? `${tool.shortName} runs entirely in your browser — the text you enter is never sent to our servers or stored.`
      : tool.processingMode === "CLIENT"
        ? `${tool.shortName} runs entirely in your browser — your file is never uploaded to a server.`
        : `Your file is transferred securely and automatically deleted from our servers after 1 hour.`;

  return `<div style="max-width:720px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: tool.categoryLabel, path: `/tools?category=${tool.category}` },
      { name: tool.name, path: `/tools/${tool.slug}` },
    ])}
    <h1>${escapeHtml(tool.seo.h1)}</h1>
    <p>${escapeHtml(tool.description)}</p>

    <h2>About this tool</h2>
    ${intro}

    <h2>Common uses</h2>
    <ul>${listItems(tool.useCases)}</ul>

    <h2>How it works</h2>
    <ol>${steps}</ol>

    <h2>Supported formats</h2>
    <p>${tool.inputKind === "text" ? "Input" : "Accepts"}: ${escapeHtml(tool.acceptedFormats.join(", "))} — ${escapeHtml(tool.inputLimitLabel ?? `Max file size: ${tool.maxFileSize}MB`)} — Output: .${tool.outputExtension}</p>
    <p>${escapeHtml(tool.formatsNote)}</p>

    <h2>Limitations</h2>
    <ul>${listItems(tool.limitations)}</ul>

    <h2>Features</h2>
    <ul>${features}</ul>

    <h2>Privacy &amp; security</h2>
    <p>${escapeHtml(privacyText)}</p>

    <h2>Frequently asked questions</h2>
    ${faq}

    <h2>Related tools</h2>
    <ul>${relatedLinks}</ul>
    ${guideLinks ? `<h2>Helpful guides</h2>\n    <ul>${guideLinks}</ul>` : ""}
  </div>`;
}

function renderHomeBody(): string {
  // Tools grouped under their category, each with its one-line description, so the static page
  // describes the whole catalogue the way a reader (or a search summary) should understand it.
  const groups = CATEGORIES.map((category) => {
    const tools = toolRegistry.getByCategory(category);
    if (tools.length === 0) return "";
    const items = tools.map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)}</li>`).join("\n");
    return `<h3>${escapeHtml(CATEGORY_LABELS[category])}</h3>\n    <ul>${items}</ul>`;
  }).join("\n    ");
  const guideLinks = GUIDES.map((g) => `<li><a href="${g.path}">${escapeHtml(g.title)}</a> — ${escapeHtml(g.summary)}</li>`).join("\n");
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>Toolkit4Me — Free Tools for Everyday Digital Tasks</h1>
    <p>${escapeHtml(HOME_DESCRIPTION)}</p>
    <p>${TOOL_DEFINITIONS.length} free tools, no account or software required. Many run entirely in your browser; files that need server processing are deleted automatically within an hour.</p>
    <h2>Tools by category</h2>
    ${groups}
    <h2>Guides &amp; tips</h2>
    <ul>${guideLinks}</ul>
  </div>`;
}

function renderGuidesIndexBody(): string {
  const groups = GUIDE_CATEGORIES.map((c) => {
    const guides = GUIDES.filter((g) => g.category === c.id);
    if (!guides.length) return "";
    const items = guides
      .map((g) => `<li><a href="${g.path}">${escapeHtml(g.title)}</a> — ${escapeHtml(g.summary)} <small>(${readingMinutes(g)} min read)</small></li>`)
      .join("\n");
    return `<h2 id="${c.id}">${escapeHtml(c.label)}</h2>\n    <p>${escapeHtml(c.description)}</p>\n    <ul>${items}</ul>`;
  }).join("\n    ");
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
    ])}
    <h1>Guides</h1>
    <p>Practical explanations of the file formats and everyday tasks behind our tools — why files get large, which format to pick, how to get clean results, and the mistakes to avoid. ${GUIDES.length} guides, written and checked by the Toolkit4Me editorial team.</p>
    ${groups}
  </div>`;
}

function renderGuideSection(s: GuideDefinition["sections"][number]): string {
  const heading = s.heading ? `<h2 id="${sectionId(s.heading)}">${escapeHtml(s.heading)}</h2>` : "";
  const paragraphs = (s.paragraphs ?? []).map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
  const list = s.list ? `<ul>${s.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}</ul>` : "";
  const table = s.table
    ? `<table><caption>${escapeHtml(s.table.caption)}</caption><thead><tr>${s.table.headers.map((h) => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${s.table.rows
        .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${escapeHtml(c)}</th>` : `<td>${escapeHtml(c)}</td>`)).join("")}</tr>`)
        .join("")}</tbody></table>`
    : "";
  const image = s.image
    ? `<figure><img src="${s.image.src}" alt="${escapeHtml(s.image.alt)}" width="${s.image.width}" height="${s.image.height}" loading="lazy" decoding="async" style="max-width:100%;height:auto" />${s.image.caption ? `<figcaption>${escapeHtml(s.image.caption)}</figcaption>` : ""}</figure>`
    : "";
  return `${heading}\n${paragraphs}\n${list}\n${table}\n${image}`;
}

function guideBreadcrumbs(guide: GuideDefinition) {
  return [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: guide.path },
  ];
}

function renderGuideBody(guide: GuideDefinition): string {
  const sections = guide.sections.map(renderGuideSection).join("\n");
  const mainTool = guide.relatedTools?.[0] ? toolRegistry.getBySlug(guide.relatedTools[0]) : undefined;
  const cta = mainTool ? `<p><strong>Try <a href="/tools/${mainTool.slug}">${escapeHtml(mainTool.name)}</a></strong> — ${escapeHtml(mainTool.description)}</p>` : "";
  const faq = guide.faq?.length
    ? `<h2 id="guide-faq">Frequently asked questions</h2>\n${guide.faq.map((f) => `<h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p>`).join("\n")}`
    : "";
  const updated = guide.updated !== guide.published ? ` · Updated ${escapeHtml(formatLongDate(guide.updated))}` : "";
  const related = (guide.relatedTools ?? [])
    .map((slug) => toolRegistry.getBySlug(slug))
    .filter((t) => t !== undefined)
    .map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a></li>`)
    .join("\n");

  return `<div style="max-width:760px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav(guideBreadcrumbs(guide))}
    <p><a href="/guides#${guide.category}">${escapeHtml(guideCategoryLabel(guide.category))}</a></p>
    <h1>${escapeHtml(guide.title)}</h1>
    <p><small>By ${escapeHtml(GUIDE_AUTHOR)} · Published ${escapeHtml(formatLongDate(guide.published))}${updated} · ${readingMinutes(guide)} min read</small></p>
    <p>${escapeHtml(guide.summary)}</p>
    ${sections}
    ${cta}
    ${faq}
    ${related ? `<h2>Related tools</h2>\n<ul>${related}</ul>` : ""}
    <h2>Related guides</h2>
    <ul>${relatedGuidesFor(guide)
      .map((g) => `<li><a href="${g.path}">${escapeHtml(g.title)}</a></li>`)
      .join("\n")}</ul>
  </div>`;
}

function renderLegalBody(title: string, paragraphs: string[]): string {
  const body = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
  return `<div style="max-width:720px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>${escapeHtml(title)}</h1>
    ${body}
  </div>`;
}

function renderDirectoryBody(): string {
  const links = TOOL_DEFINITIONS.map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a> (${escapeHtml(t.categoryLabel)}) — ${escapeHtml(t.description)}</li>`).join(
    "\n"
  );
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: "All Tools", path: "/tools" },
    ])}
    <h1>All Tools</h1>
    <p>${escapeHtml(toolsPageIntro(TOOL_DEFINITIONS.length))}</p>
    <ul>${links}</ul>
  </div>`;
}

function writePage(route: string, headHtml: string, bodyHtml: string) {
  const outputPath =
    route === "/"
      ? path.join(distDir, "index.html")
      : route.endsWith(".html")
        ? path.join(distDir, route.slice(1))
        : path.join(distDir, route.slice(1), "index.html");

  let html = template;
  html = html.replace(/<title>.*?<\/title>\s*/s, "");
  html = html.replace(/<meta\s+name="description"[^>]*\/>\s*/g, "");
  html = html.replace(/<link\s+rel="canonical"[^>]*\/>\s*/g, "");
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*\/>\s*/g, "");
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*\/>\s*/g, "");
  html = html.replace("</head>", `${headHtml}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
}

// --- Home ---
writePage(
  "/",
  renderHead({
    route: "/",
    title: "Toolkit4Me — Free Tools for Everyday Digital Tasks",
    description: HOME_DESCRIPTION,
    breadcrumbs: [],
    jsonLd: [websiteSchema(HOME_DESCRIPTION), organizationSchema()],
  }),
  renderHomeBody()
);

// --- Tools directory ---
writePage(
  "/tools",
  renderHead({
    route: "/tools",
    title: TOOLS_PAGE_TITLE,
    description: TOOLS_PAGE_DESCRIPTION,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "All Tools", path: "/tools" },
    ],
  }),
  renderDirectoryBody()
);

// --- Legal pages ---
// Full text lives in the React components (src/pages/PrivacyPolicyPage.tsx
// / TermsOfServicePage.tsx) for the JS-hydrated experience; this is just a
// short, real (non-JS) fallback so crawlers/link-preview bots see actual
// content and correct <head> tags rather than an empty shell.
writePage(
  "/privacy",
  renderHead({
    route: "/privacy",
    title: "Privacy Policy — Toolkit4Me",
    description: "How Toolkit4Me handles the files you process and the data collected while you use our free online tools.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Privacy Policy", path: "/privacy" },
    ],
  }),
  renderLegalBody("Privacy Policy", [
    "Toolkit4Me provides free online tools for converting, compressing, merging, and otherwise processing documents and images, without requiring an account.",
    "Tools that run entirely in your browser never send your file to our servers. Tools that require server-side processing upload your file over an encrypted connection and use it only to produce the output you requested. The upload is deleted as soon as processing finishes, and the result is deleted automatically within one hour. Processing runs on our own server; files are not sent to third-party conversion services.",
    "We show ads through Google AdSense, which may use cookies to personalize ads and measure performance. See the full policy for details on your choices, third-party providers, and your rights.",
  ])
);

writePage(
  "/terms",
  renderHead({
    route: "/terms",
    title: "Terms of Service — Toolkit4Me",
    description: "The terms that apply when you use Toolkit4Me's free online tools.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Terms of Service", path: "/terms" },
    ],
  }),
  renderLegalBody("Terms of Service", [
    "These Terms govern your use of Toolkit4Me's free, browser-based tools for converting, compressing, merging, and otherwise processing documents and images. No account or payment is required.",
    "You retain ownership of any file you process through the Service and are responsible for having the rights to it. The Service is provided \"as is,\" without warranties, and our liability is limited accordingly.",
    "See the full Terms for acceptable use, advertising and third-party links, intellectual property, and how changes to the Service or these Terms are communicated.",
  ])
);

// --- About / Contact ---
// renderLegalBody is a generic "title + paragraphs" renderer despite the
// name (it was only ever legal-pages-specific by usage, not by code) —
// reused as-is rather than adding a near-identical second function.
writePage(
  "/about",
  renderHead({
    route: "/about",
    title: "About Toolkit4Me",
    description: "What Toolkit4Me is, how it handles your files, and the principles behind it — free PDF, image, text and developer tools with no account required.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ],
  }),
  `<div style="max-width:720px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>About Toolkit4Me</h1>
    <p>Toolkit4Me is a collection of ${TOOL_DEFINITIONS.length} free online tools for everyday digital tasks: converting a PDF to Word, merging PDFs, resizing or compressing a photo, pulling text out of a scan, and, for writing and web work, counting words, comparing drafts, formatting JSON and making QR codes. No account, subscription, or email address required.</p>
    <h2>What's here</h2>
    <ul>${TOOL_AREAS.map(({ category, summary }) => `<li><a href="/tools?category=${category}">${escapeHtml(CATEGORY_LABELS[category])}</a> — ${escapeHtml(summary)}</li>`).join("\n")}</ul>
    <h2>How it works</h2>
    <p>Most tools — image compression, resizing and conversion, building and editing PDFs, page numbering, and every text and developer tool — run entirely in your browser, so nothing is uploaded. Tools that need server-side processing (Word/PDF conversion, OCR, PowerPoint and Excel conversion, PDF passwords) upload your file over an encrypted connection; the upload is deleted as soon as it's processed, and the result within one hour.</p>
    <p>The site is supported by advertising rather than paywalls, so every tool stays free and fully usable.</p>
  </div>`
);

writePage(
  "/contact",
  renderHead({
    route: "/contact",
    title: "Contact Toolkit4Me",
    description: "Get in touch with Toolkit4Me — bug reports, tool requests, or privacy questions.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ],
  }),
  renderLegalBody("Contact", [
    "Reach us at toolkit4me@gmail.com for a bug report, a tool request, a privacy question, or anything else about the site.",
  ])
);

// --- Disclaimer / Editorial policy ---
writePage(
  "/disclaimer",
  renderHead({
    route: "/disclaimer",
    title: "Disclaimer — Toolkit4Me",
    description: "What you can and can't rely on when using Toolkit4Me's free online tools and guides.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Disclaimer", path: "/disclaimer" },
    ],
  }),
  renderLegalBody("Disclaimer", [
    "Toolkit4Me's tools are free and provided \"as is\". Conversion results depend on the file you start with, so always keep your original and check the result before you send, print or submit it.",
    "Known limitations: PDF to Word converts a PDF's text into editable paragraphs but does not reproduce its layout, fonts, tables or images; OCR is never 100% accurate; Word, PowerPoint and Excel conversions substitute fonts our server doesn't have; compression results depend on the content. Each tool page lists its own limitations.",
    "Our guides are general information, not legal, financial, security or other professional advice. Ads are served by Google AdSense and are not endorsements. Microsoft Word, Excel and PowerPoint are trademarks of Microsoft Corporation; Toolkit4Me is not affiliated with Microsoft, Adobe or Google.",
  ])
);

writePage(
  "/editorial-policy",
  renderHead({
    route: "/editorial-policy",
    title: "Editorial Policy — Toolkit4Me",
    description: "How Toolkit4Me writes, checks and updates its tool pages and guides, and how advertising is kept separate from content.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Editorial Policy", path: "/editorial-policy" },
    ],
  }),
  renderLegalBody("Editorial Policy", [
    "Toolkit4Me publishes a page for each tool — what it does, how to use it and what its limits are — and guides that explain the file formats and tasks behind those tools. We only write about tasks our tools actually support.",
    "Tool descriptions are written from how each tool actually works and checked by running real files through it. We don't promise results we can't guarantee; where we quote a figure, it comes from a test we ran.",
    "Use of Artificial Intelligence: Toolkit4Me may use artificial intelligence tools to assist with research, content structuring, drafting and improving the clarity of its articles and guides. AI-assisted content is reviewed and edited before publication to ensure accuracy, usefulness, originality and relevance to readers. We do not intend to publish automatically generated or unreviewed content simply to increase the volume of website articles, and we remain responsible for the content published on Toolkit4Me.",
    "Guides show the date they were last updated, and pages are revised when a tool changes. Advertisers have no influence over content, we don't publish sponsored content, and every ad is labelled.",
    "Editorial responsibility: Toolkit4Me Editorial Team. Website: https://www.toolkit4me.com. Contact: toolkit4me@gmail.com.",
  ])
);

// --- Every tool page ---
for (const tool of TOOL_DEFINITIONS) {
  const route = `/tools/${tool.slug}`;
  writePage(
    route,
    renderHead({
      route,
      title: tool.seo.title,
      description: tool.seo.metaDescription,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: tool.categoryLabel, path: `/tools?category=${tool.category}` },
        { name: tool.name, path: route },
      ],
      faq: tool.faq,
      jsonLd: [webApplicationSchema(tool)],
    }),
    renderToolBody(tool)
  );
}

// --- Guides index + every guide ---
writePage(
  "/guides",
  renderHead({
    route: "/guides",
    title: GUIDES_INDEX_META.title,
    description: GUIDES_INDEX_META.description,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
    ],
  }),
  renderGuidesIndexBody()
);

for (const guide of GUIDES) {
  writePage(
    guide.path,
    renderHead({
      route: guide.path,
      title: guide.seoTitle,
      description: guide.metaDescription,
      breadcrumbs: guideBreadcrumbs(guide),
      jsonLd: [articleSchema(guide)],
    }),
    renderGuideBody(guide)
  );
}

// --- 404 ---
// Vercel serves dist/404.html, with a real 404 status, for any URL with no
// matching file — so unknown paths are hard 404s (never soft 404s), while
// still giving visitors a way back into the site. noindex, no canonical.
writePage(
  "/404.html",
  renderHead({
    route: "/404",
    title: "Page not found — Toolkit4Me",
    description: "The page you're looking for doesn't exist or may have moved.",
    breadcrumbs: [],
    noindex: true,
  }),
  `<div style="max-width:720px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or may have moved.</p>
    <p><a href="/tools">Browse all tools</a> · <a href="/guides">Read our guides</a> · <a href="/">Go to the homepage</a></p>
  </div>`
);

console.log(`prerender: wrote ${10 + TOOL_DEFINITIONS.length + GUIDES.length} static pages (incl. 404.html) into ${distDir}`);

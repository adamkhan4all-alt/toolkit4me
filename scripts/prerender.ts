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
import { getHub, type HubDefinition } from "../src/data/hubs";
import { hubGroups, hubGuides } from "../src/lib/hubContent";
import { HOME_FAQ, HOME_HEADLINE, HOME_SUBHEAD } from "../src/data/home";
import { listingPath, type ToolDefinition } from "../src/types/tool";
import { ALL_CALCULATORS } from "../src/data/calculators/all";
import { CALCULATOR_CATALOG } from "../src/data/calculators/catalog";
import { DISCLAIMERS, type CalculatorDefinition } from "../src/lib/calculators/engine";
import { GUIDE_AUTHOR, GUIDE_CATEGORIES, GUIDES, GUIDES_INDEX_META, guideCategoryLabel, guidesForTool, readingMinutes, relatedGuidesFor, sectionId, type GuideDefinition } from "../src/data/guides";
import { formatLongDate } from "../src/lib/format";
import { ABOUT_META, DISCLAIMER_META, EDITORIAL_META, PRIVACY_META, SUPPORT_EMAIL, TERMS_META } from "../src/data/policies";
import { ALL_ARTICLES } from "../src/data/blog/articles";
import { articleBreadcrumbs, articlePath, ARTICLES_PER_PAGE, BLOG_INDEX_META, BLOG_PATH } from "../src/data/blog/meta";
import { tagLabel, tagPageMeta } from "../src/data/blog/tags";
import { buildBlogIndex, publishedArticles } from "../src/lib/seo/blogIndex";
import { blogCategoryPages, blogTagPages } from "../src/lib/seo/blogPages";
import { renderArticle, renderBlogCategory, renderBlogHome, renderBlogTag, renderPolicy } from "./render-pages";
import {
  articleSchema,
  articleShareImage,
  blogPostingSchema,
  breadcrumbSchema,
  calculatorSchema,
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
  /** With noindex: "noindex, follow" instead of "noindex, nofollow" (thin blog listing pages). */
  followLinks?: boolean;
  /** Absolute URL of a page-specific share image; defaults to the site-wide one. */
  ogImage?: string;
  ogType?: "website" | "article";
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
    ${meta.noindex ? `<meta data-prerender="true" name="robots" content="${meta.followLinks ? "noindex, follow" : "noindex, nofollow"}" />` : `<link data-prerender="true" rel="canonical" href="${url}" />`}
    <meta data-prerender="true" property="og:type" content="${meta.ogType ?? "website"}" />
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
  const headings = tool.sectionHeadings ?? {};

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
      { name: getHub(tool.hub).name, path: getHub(tool.hub).path },
      { name: tool.name, path: `/tools/${tool.slug}` },
    ])}
    <h1>${escapeHtml(tool.seo.h1)}</h1>
    <p>${escapeHtml(tool.description)}</p>

    <h2>${escapeHtml(headings.intro ?? "About this tool")}</h2>
    ${intro}
    ${(tool.extraSections ?? []).map(renderGuideSection).join("\n")}

    <h2>${escapeHtml(headings.useCases ?? "Common uses")}</h2>
    <ul>${listItems(tool.useCases)}</ul>

    <h2>${escapeHtml(headings.howItWorks ?? "How it works")}</h2>
    <ol>${steps}</ol>

    <h2>Supported formats</h2>
    <p>${tool.inputKind === "text" ? "Input" : "Accepts"}: ${escapeHtml(tool.acceptedFormats.join(", "))} — ${escapeHtml(tool.inputLimitLabel ?? `Max file size: ${tool.maxFileSize}MB`)} — Output: .${tool.outputExtension}</p>
    <p>${escapeHtml(tool.formatsNote)}</p>

    <h2>Limitations</h2>
    <ul>${listItems(tool.limitations)}</ul>

    <h2>${escapeHtml(headings.features ?? "Features")}</h2>
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
  // Tools grouped under their hub, each with its one-line description, so the static page
  // describes the whole catalogue the way a reader (or a search summary) should understand it.
  const groups = toolRegistry
    .getHubs()
    .map((hub) => {
      const items = toolRegistry
        .getListingsByHub(hub.id)
        .map((t) => `<li><a href="${listingPath(t)}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)}</li>`)
        .join("\n");
      return `<h2><a href="${hub.path}">${escapeHtml(hub.name)}</a></h2>
    <p>${escapeHtml(hub.tagline)}</p>
    <ul>${items}</ul>`;
    })
    .join("\n    ");
  const featured = toolRegistry.getFeatured().map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a></li>`).join("\n");
  const recent = toolRegistry.getRecentlyAdded().map((t) => `<li><a href="${listingPath(t)}">${escapeHtml(t.name)}</a></li>`).join("\n");
  const guideLinks = GUIDES.filter((g) => g.featured).slice(0, 3).map((g) => `<li><a href="${g.path}">${escapeHtml(g.title)}</a> — ${escapeHtml(g.summary)}</li>`).join("\n");
  const faq = HOME_FAQ.map((item) => `<div><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join("\n");
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>${escapeHtml(HOME_HEADLINE)}</h1>
    <p>${escapeHtml(HOME_SUBHEAD)}</p>
    <p>${escapeHtml(HOME_DESCRIPTION)}</p>
    <h2>Featured tools</h2>
    <ul>${featured}</ul>
    ${groups}
    <h2>Recently added</h2>
    <ul>${recent}</ul>
    <h2>Guides &amp; tips</h2>
    <ul>${guideLinks}</ul>
    <h2>Frequently asked questions</h2>
    ${faq}
  </div>`;
}

function renderHubBody(hub: HubDefinition): string {
  const groups = hubGroups(toolRegistry.getListingsByHub(hub.id))
    .map((g) => `<h2>${escapeHtml(g.label)}</h2>
    <ul>${g.tools.map((t) => `<li><a href="${listingPath(t)}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)}</li>`).join("\n")}</ul>`)
    .join("\n    ");
  const guides = hubGuides(hub).map((g) => `<li><a href="${g.path}">${escapeHtml(g.title)}</a></li>`).join("\n");
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: hub.name, path: hub.path },
    ])}
    <h1>${escapeHtml(hub.h1)}</h1>
    <p>${escapeHtml(hub.tagline)}</p>
    ${hub.intro.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n    ")}
    ${groups}
    ${renderHubExtras(hub)}
    ${guides ? `<h2>Guides for ${escapeHtml(hub.name.toLowerCase())}</h2>
    <ul>${guides}</ul>` : ""}
  </div>`;
}

/** Optional hub content: related tools from other hubs, extra sections and the FAQ. */
function renderHubExtras(hub: HubDefinition): string {
  const related = (hub.relatedTools?.ids ?? [])
    .map((id) => toolRegistry.getById(id))
    .filter((t) => t !== undefined)
    .map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)}</li>`)
    .join("\n");
  const faq = (hub.faq ?? []).map((item) => `<div><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join("\n");
  return [
    hub.strapline ? `<p>${escapeHtml(hub.strapline)}</p>` : "",
    related ? `<h2>${escapeHtml(hub.relatedTools?.label ?? "Related tools")}</h2>\n    <ul>${related}</ul>` : "",
    ...(hub.sections ?? []).map(renderGuideSection),
    faq ? `<h2>Frequently asked questions</h2>\n    ${faq}` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
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
  const links = toolRegistry.getListings().map((t) => `<li><a href="${listingPath(t)}">${escapeHtml(t.name)}</a> (${escapeHtml(t.categoryLabel)}) — ${escapeHtml(t.description)}</li>`).join(
    "\n"
  );
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: "All Tools", path: "/tools" },
    ])}
    <h1>All Tools</h1>
    <p>${escapeHtml(toolsPageIntro(toolRegistry.countListings()))}</p>
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
  // Function replacements, so a "$" in page text is never read as a replacement pattern ($&, $', …).
  html = html.replace("</head>", () => `${headHtml}\n  </head>`);
  html = html.replace('<div id="root"></div>', () => `<div id="root">${bodyHtml}</div>`);

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html);
  pagesWritten++;
}

let pagesWritten = 0;

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

// --- About and policy pages ---
// Rendered from the real React components (scripts/render-pages.ts), so the
// static HTML carries the full text — not a summary that can drift.
for (const meta of [ABOUT_META, PRIVACY_META, TERMS_META, DISCLAIMER_META, EDITORIAL_META]) {
  writePage(
    meta.path,
    renderHead({
      route: meta.path,
      title: meta.seoTitle,
      description: meta.description,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: meta.title, path: meta.path },
      ],
    }),
    renderPolicy(meta.path)
  );
}

// --- Contact ---
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
    `Reach us at ${SUPPORT_EMAIL} for a bug report, a tool request, a privacy question, a correction to an article, or anything else about the site.`,
  ])
);


// --- Hub landing pages (only hubs with released tools) ---
for (const hub of toolRegistry.getHubs()) {
  writePage(
    hub.path,
    renderHead({
      route: hub.path,
      title: hub.seoTitle,
      description: hub.metaDescription,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: hub.name, path: hub.path },
      ],
      faq: hub.faq,
    }),
    renderHubBody(hub)
  );
}

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
        { name: getHub(tool.hub).name, path: getHub(tool.hub).path },
        { name: tool.name, path: route },
      ],
      faq: tool.faq,
      jsonLd: [webApplicationSchema(tool)],
    }),
    renderToolBody(tool)
  );
}

// --- Calculator Hub: every calculator page ---
function renderCalculatorBody(def: CalculatorDefinition): string {
  const listing = CALCULATOR_CATALOG.find((c) => c.id === def.id)!;
  const c = def.content;
  const p = (items: string[]) => items.map((x) => `<p>${escapeHtml(x)}</p>`).join("\n    ");
  const related = c.related
    .map((id) => CALCULATOR_CATALOG.find((x) => x.id === id))
    .filter((x) => x !== undefined)
    .map((x) => `<li><a href="${x.path}">${escapeHtml(x.name)}</a></li>`)
    .join("\n");
  return `<div style="max-width:720px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: getHub("calculators").name, path: getHub("calculators").path },
      { name: listing.name, path: listing.path },
    ])}
    <h1>${escapeHtml(c.seo.h1)}</h1>
    <p>${escapeHtml(listing.description)}</p>
    ${c.disclaimer ? `<p><strong>Please note:</strong> ${escapeHtml(DISCLAIMERS[c.disclaimer])}</p>` : ""}
    <h2>About this calculator</h2>
    ${p(c.intro)}
    <h2>How to use it</h2>
    <ol>${c.howTo.map((s) => `<li>${escapeHtml(s)}</li>`).join("\n")}</ol>
    <h2>The formula</h2>
    ${c.formula.lines.map((l) => `<p><code>${escapeHtml(l)}</code></p>`).join("\n    ")}
    ${p(c.formula.explanation)}
    <h2>Worked example</h2>
    ${p(c.workedExample)}
    <h2>Frequently asked questions</h2>
    ${c.faq.map((f) => `<div><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></div>`).join("\n")}
    <h2>Related calculators</h2>
    <ul>${related}</ul>
  </div>`;
}

for (const def of ALL_CALCULATORS) {
  const listing = CALCULATOR_CATALOG.find((c) => c.id === def.id)!;
  writePage(
    listing.path,
    renderHead({
      route: listing.path,
      title: def.content.seo.title,
      description: def.content.seo.metaDescription,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: getHub("calculators").name, path: getHub("calculators").path },
        { name: listing.name, path: listing.path },
      ],
      faq: def.content.faq,
      jsonLd: [calculatorSchema({ name: listing.name, path: listing.path, description: def.content.seo.metaDescription })],
    }),
    renderCalculatorBody(def)
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

// --- Blog & Resource Center ---
// Home, every published article, every category page and every tag page,
// all rendered from the real React components. Category pages with no
// articles yet and tag pages with too few articles are noindex (and left
// out of sitemap-blog.xml) — see src/lib/seo/blogPages.ts.
const blogIndex = buildBlogIndex(ALL_ARTICLES);
let blogPageCount = 0;

// The "Load more" grid renders ARTICLES_PER_PAGE cards; past that, list every article as a plain link so crawlers reach all of them.
const allArticleLinks =
  blogIndex.length > ARTICLES_PER_PAGE
    ? `<nav aria-label="All articles" style="max-width:1200px;margin:0 auto;padding:0 16px 32px"><h2>All articles</h2><ul>${blogIndex.map((a) => `<li><a href="${a.path}">${escapeHtml(a.title)}</a></li>`).join("")}</ul></nav>`
    : "";

writePage(
  BLOG_PATH,
  renderHead({
    route: BLOG_PATH,
    title: BLOG_INDEX_META.title,
    description: BLOG_INDEX_META.description,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blog", path: BLOG_PATH },
    ],
  }),
  renderBlogHome(BLOG_PATH) + allArticleLinks
);
blogPageCount++;

for (const article of publishedArticles(ALL_ARTICLES)) {
  const route = articlePath(article.slug);
  writePage(
    route,
    renderHead({
      route,
      title: article.seoTitle,
      description: article.metaDescription,
      breadcrumbs: articleBreadcrumbs(article),
      jsonLd: [blogPostingSchema(article)],
      ogImage: articleShareImage(article.slug),
      ogType: "article",
    }),
    renderArticle(route, article)
  );
  blogPageCount++;
}

for (const page of blogCategoryPages(blogIndex)) {
  writePage(
    page.path,
    renderHead({
      route: page.path,
      title: page.category.seoTitle,
      description: page.category.metaDescription,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blog", path: BLOG_PATH },
        { name: page.category.label, path: page.path },
      ],
      noindex: !page.indexable,
      followLinks: true,
    }),
    renderBlogCategory(page.path)
  );
  blogPageCount++;
}

for (const page of blogTagPages(blogIndex)) {
  const meta = tagPageMeta(page.tag, page.articles.length);
  writePage(
    page.path,
    renderHead({
      route: page.path,
      title: meta.title,
      description: meta.description,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Blog", path: BLOG_PATH },
        { name: tagLabel(page.tag), path: page.path },
      ],
      noindex: !page.indexable,
      followLinks: true,
    }),
    renderBlogTag(page.path)
  );
  blogPageCount++;
}


// --- Link Studio team console: an app shell only, never indexed and not in any sitemap. ---
writePage(
  "/link-studio/admin",
  renderHead({
    route: "/link-studio/admin",
    title: "Link Studio — Team console | Toolkit4Me",
    description: "Toolkit4Me team console for go.toolkit4me.com short links.",
    breadcrumbs: [],
    noindex: true,
  }),
  `<div style="max-width:720px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>Link Studio — Team console</h1>
    <p>This page is for the Toolkit4Me team. The free <a href="/link-studio">Link Studio tools</a> are open to everyone.</p>
  </div>`
);

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
    <p><a href="/tools">Browse all tools</a> · <a href="/guides">Read our guides</a> · <a href="/blog">Visit the blog</a> · <a href="/">Go to the homepage</a></p>
  </div>`
);

console.log(`prerender: wrote ${pagesWritten} static pages (incl. 404.html and ${blogPageCount} blog pages) into ${distDir}`);

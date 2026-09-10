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
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE, TWITTER_HANDLE } from "../src/config/site";
import type { ToolDefinition } from "../src/types/tool";

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
  bodyHtml: string;
}

function jsonLdBreadcrumb(breadcrumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

function jsonLdFaq(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function renderHead(meta: PageMeta): string {
  const url = `${SITE_URL}${meta.route}`;
  const scripts: string[] = [];
  scripts.push(`<script type="application/ld+json">${JSON.stringify(jsonLdBreadcrumb(meta.breadcrumbs))}</script>`);
  if (meta.faq?.length) {
    scripts.push(`<script type="application/ld+json">${JSON.stringify(jsonLdFaq(meta.faq))}</script>`);
  }

  return `<title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${TWITTER_HANDLE}" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
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

  const privacyText =
    tool.processingMode === "CLIENT"
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

    <h2>How it works</h2>
    <ol>${steps}</ol>

    <h2>Supported formats</h2>
    <p>Accepts: ${escapeHtml(tool.acceptedFormats.join(", "))} — Max file size: ${tool.maxFileSize}MB — Output: .${tool.outputExtension}</p>
    <p>${escapeHtml(tool.formatsNote)}</p>

    <h2>Features</h2>
    <ul>${features}</ul>

    <h2>Privacy &amp; security</h2>
    <p>${escapeHtml(privacyText)}</p>

    <h2>Frequently asked questions</h2>
    ${faq}

    <h2>Related tools</h2>
    <ul>${relatedLinks}</ul>
  </div>`;
}

function renderHomeBody(): string {
  const links = TOOL_DEFINITIONS.map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a></li>`).join("\n");
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    <h1>Free Online PDF &amp; Image Tools</h1>
    <p>Convert, compress and process your documents and images quickly and securely.</p>
    <h2>Popular tools</h2>
    <ul>${links}</ul>
  </div>`;
}

function renderDirectoryBody(): string {
  const links = TOOL_DEFINITIONS.map((t) => `<li><a href="/tools/${t.slug}">${escapeHtml(t.name)}</a> — ${escapeHtml(t.description)}</li>`).join(
    "\n"
  );
  return `<div style="max-width:960px;margin:0 auto;padding:32px 16px;font-family:sans-serif;line-height:1.6">
    ${renderBreadcrumbNav([
      { name: "Home", path: "/" },
      { name: "All Tools", path: "/tools" },
    ])}
    <h1>All Tools</h1>
    <p>Browse every conversion, compression, merge, and OCR tool on the platform.</p>
    <ul>${links}</ul>
  </div>`;
}

function writePage(route: string, headHtml: string, bodyHtml: string) {
  const outputPath = route === "/" ? path.join(distDir, "index.html") : path.join(distDir, route.slice(1), "index.html");

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
    title: "Tier1Tools — Free Online PDF & Image Tools",
    description: "Convert, compress, merge, and extract text from PDFs and images for free — fast, secure, and no account required.",
    breadcrumbs: [{ name: "Home", path: "/" }],
  }),
  renderHomeBody()
);

// --- Tools directory ---
writePage(
  "/tools",
  renderHead({
    route: "/tools",
    title: "All Tools — Free PDF & Image Tools | Tier1Tools",
    description: "Browse every PDF and image tool on Tier1Tools: convert, compress, merge, and extract text, all free and no account required.",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "All Tools", path: "/tools" },
    ],
  }),
  renderDirectoryBody()
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
    }),
    renderToolBody(tool)
  );
}

console.log(`prerender: wrote ${2 + TOOL_DEFINITIONS.length} static pages into ${distDir}`);

// ---------------------------------------------------------------------
// Static HTML for prerendered pages, rendered from the real React page
// components (react-dom/server), so crawlers and link-preview bots get
// exactly the content visitors see — full article and policy text, not a
// hand-written summary that can drift. Used by scripts/prerender.ts.
//
// Only the page body is rendered (no header/footer), matching the other
// prerendered routes; React replaces it on boot (createRoot, no hydrate).
// Plain createElement rather than JSX: tsx compiles scripts/ outside the
// app's tsconfig, so JSX here wouldn't get the automatic runtime.
// ---------------------------------------------------------------------

import { createElement as h, type ComponentType, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Route, Routes, StaticRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { ArticleView } from "../src/pages/blog/ArticlePage";
import { BlogHomePage } from "../src/pages/blog/BlogHomePage";
import { BlogCategoryPage } from "../src/pages/blog/BlogCategoryPage";
import { BlogTagPage } from "../src/pages/blog/BlogTagPage";
import { AboutPage } from "../src/pages/AboutPage";
import { PrivacyPolicyPage } from "../src/pages/PrivacyPolicyPage";
import { TermsOfUsePage } from "../src/pages/TermsOfUsePage";
import { DisclaimerPage } from "../src/pages/DisclaimerPage";
import { EditorialPolicyPage } from "../src/pages/EditorialPolicyPage";
import type { BlogArticle } from "../src/data/blog/types";

function render(path: string, element: ReactElement): string {
  const html = renderToStaticMarkup(h(HelmetProvider, { context: {} }, h(StaticRouter, { location: path }, element)));
  // React 19 renders <SeoHead>'s tags inline. prerender.ts writes the <head> itself (with the same builders SeoHead
  // uses), so drop them from the body to avoid a second title, description, canonical or JSON-LD block.
  return html
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<meta [^>]*\/?>/g, "")
    .replace(/<link rel="canonical"[^>]*\/?>/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
}

/** Renders a page that reads its URL parameter, under its real route pattern. */
function routed(pattern: string, page: ComponentType): ReactElement {
  return h(Routes, null, h(Route, { path: pattern, element: h(page) }));
}

export const renderArticle = (path: string, article: BlogArticle) => render(path, h(ArticleView, { article }));
export const renderBlogHome = (path: string) => render(path, h(BlogHomePage));
export const renderBlogCategory = (path: string) => render(path, routed("/blog/category/:category", BlogCategoryPage));
export const renderBlogTag = (path: string) => render(path, routed("/blog/tag/:tag", BlogTagPage));

const POLICY_PAGES: Record<string, ComponentType> = {
  "/about": AboutPage,
  "/privacy": PrivacyPolicyPage,
  "/terms-of-use": TermsOfUsePage,
  "/disclaimer": DisclaimerPage,
  "/editorial-policy": EditorialPolicyPage,
};

export function renderPolicy(path: string): string {
  const page = POLICY_PAGES[path];
  if (!page) throw new Error(`renderPolicy: no page for ${path}`);
  return render(path, h(page));
}

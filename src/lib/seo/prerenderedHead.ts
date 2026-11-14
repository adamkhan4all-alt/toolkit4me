// ---------------------------------------------------------------------
// scripts/prerender.ts writes each page's <title>, description,
// canonical, OG/Twitter tags and JSON-LD into the static HTML, marked
// data-prerender="true", for crawlers and link-preview bots that don't
// run JavaScript.
//
// Once the app boots, <SeoHead> (react-helmet-async, which on React 19
// just renders the tags and lets React hoist them into <head>) emits the
// same tags again. React never removes tags it didn't create, so without
// this cleanup every page would end up with two canonicals, two
// descriptions, two <title>s and duplicate JSON-LD — and after client-side
// navigation, a stale canonical from the landing page.
//
// The prerendered <title> is the exception: it stays until the app's own
// <title> is in <head>, then goes. Pages that load their content lazily
// (calculators, guides) render <SeoHead> a moment after boot, and until
// then document.title would otherwise be empty — which is what Google
// Analytics' automatic first page_view would record.
// ---------------------------------------------------------------------

export const PRERENDER_ATTRIBUTE = "data-prerender";

/**
 * Removes the build-time head tags so <SeoHead> is the single source of head metadata. Call once, before the first
 * render. The prerendered <title> is kept until a title rendered by the app appears, so the page always has exactly
 * one meaningful title.
 */
export function removePrerenderedHead(doc: Document = document): void {
  let title: Element | null = null;
  for (const node of Array.from(doc.head.querySelectorAll(`[${PRERENDER_ATTRIBUTE}]`))) {
    if (node.tagName === "TITLE" && title === null) title = node;
    else node.remove();
  }
  if (title === null) return;
  const prerendered = title;
  const appTitlePresent = () => Array.from(doc.head.querySelectorAll("title")).some((t) => t !== prerendered);
  if (appTitlePresent()) {
    prerendered.remove();
    return;
  }
  const observer = new MutationObserver(() => {
    if (!appTitlePresent()) return;
    prerendered.remove();
    observer.disconnect();
  });
  observer.observe(doc.head, { childList: true });
}

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
// ---------------------------------------------------------------------

export const PRERENDER_ATTRIBUTE = "data-prerender";

/** Removes the build-time head tags so <SeoHead> is the single source of head metadata. Call once, before the first render. */
export function removePrerenderedHead(doc: Document = document): void {
  doc.head.querySelectorAll(`[${PRERENDER_ATTRIBUTE}]`).forEach((node) => node.remove());
}

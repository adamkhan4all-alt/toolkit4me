import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { SeoHead } from "../SeoHead";
import { removePrerenderedHead } from "../../../lib/seo/prerenderedHead";

// What scripts/prerender.ts writes into each page's static <head>.
const PRERENDERED_HEAD = `
  <title data-prerender="true">PDF to Word</title>
  <meta data-prerender="true" name="description" content="Old description" />
  <link data-prerender="true" rel="canonical" href="https://www.toolkit4me.com/tools/pdf-to-word" />
  <script data-prerender="true" type="application/ld+json">{"@type":"BreadcrumbList"}</script>`;

function renderSeoHead() {
  return render(
    <HelmetProvider>
      <SeoHead
        title="PDF to Word"
        description="New description"
        path="/tools/pdf-to-word"
        breadcrumbs={[{ name: "Home", path: "/" }]}
        jsonLd={[{ "@context": "https://schema.org", "@type": "WebApplication" }]}
      />
    </HelmetProvider>
  );
}

describe("SeoHead over a prerendered <head>", () => {
  afterEach(() => {
    cleanup(); // unmount first, so React can remove the tags it hoisted before the head is wiped
    document.head.innerHTML = "";
  });

  it("leaves exactly one set of head tags once the prerendered copies are removed at boot", async () => {
    document.head.innerHTML = PRERENDERED_HEAD;
    removePrerenderedHead();
    renderSeoHead();

    await waitFor(() => expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "New description"));
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelectorAll("title")).toHaveLength(1);
    const types = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => JSON.parse(s.textContent ?? "{}")["@type"]);
    expect(types.sort()).toEqual(["BreadcrumbList", "WebApplication"]);
  });

  it("documents why the cleanup is needed: without it, SeoHead duplicates the canonical", async () => {
    document.head.innerHTML = PRERENDERED_HEAD;
    renderSeoHead();

    await waitFor(() => expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(2));
  });
});

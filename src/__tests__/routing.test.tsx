import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "../App";
import { toolRegistry } from "../lib/toolRegistry";
import { ToastProvider } from "../components/ui/ToastProvider";
import { STATIC_PAGES } from "../lib/seo/pages";
import { GUIDES } from "../data/guides";
import { BLOG_INDEX } from "../data/blog/blogIndex.generated";
import { BLOG_CATEGORIES } from "../data/blog/categories";
import { BLOG_INDEX_META } from "../data/blog/meta";

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

// Routes are code-split with React.lazy (see App.tsx) for Core Web Vitals,
// so their content is no longer available synchronously after render —
// every assertion below awaits it via findBy* instead of getBy*.

describe("routing", () => {
  it("renders the homepage at /", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { level: 1, name: /Everything You Need/i })).toBeInTheDocument();
  });

  it("renders the tools directory at /tools", async () => {
    renderAt("/tools");
    expect(await screen.findByRole("heading", { level: 1, name: /All Tools/i })).toBeInTheDocument();
  });

  it.each(toolRegistry.getAll().map((t) => [t.slug, t.seo.h1] as const))(
    "renders the correct H1 for /tools/%s",
    async (slug, expectedH1) => {
      renderAt(`/tools/${slug}`);
      // The first case pays the cold lazy-import cost of the whole tool-page chunk, which can exceed findBy's default 1s.
      expect(await screen.findByRole("heading", { level: 1, name: expectedH1 }, { timeout: 5000 })).toBeInTheDocument();
    }
  );

  it("redirects an unknown tool slug back to the tools directory", async () => {
    renderAt("/tools/this-tool-does-not-exist");
    expect(await screen.findByRole("heading", { level: 1, name: /All Tools/i })).toBeInTheDocument();
  });

  it("renders the not-found page for an unrelated unknown path", async () => {
    renderAt("/some/random/path");
    expect(await screen.findByRole("heading", { level: 1, name: /Page not found/i })).toBeInTheDocument();
  });

  it("every registered tool resolves to a route that renders its process action", async () => {
    for (const tool of toolRegistry.getAll()) {
      // pdf-editor is the one deliberately different, interactive
      // workspace (see PdfEditorWorkspace) — dropping a file opens the
      // page-editing UI directly rather than a separate labeled process
      // button, so it has no single element matching tool.actionLabel.
      if (tool.id === "pdf-editor") continue;
      const { unmount } = renderAt(`/tools/${tool.slug}`);
      if (tool.id === "utm-builder" || tool.id === "url-parser-cleaner") {
        // Live tools: the result updates as you type, so there's no process button — check the main field instead.
        expect(await screen.findByLabelText(/^(Landing page URL|Link to parse and clean)$/)).toBeInTheDocument();
      } else if (tool.hub === "pixel" && tool.inputKind !== "text") {
        // Pixel Playground image tools show their controls and download button only after an image is chosen.
        expect(await screen.findByRole("button", { name: /^Upload / })).toBeInTheDocument();
      } else {
        expect((await screen.findAllByRole("button", { name: tool.actionLabel }))[0]).toBeInTheDocument();
      }
      unmount();
    }
    // Renders every tool page in turn (42 and growing), so it needs more than the 5 s default on slower machines.
  }, 60_000);

  // Every URL the sitemaps advertise must be a real, rendering route —
  // never the not-found page.
  it.each(STATIC_PAGES.map((p) => [p.path] as const))("sitemap page %s renders a real page", async (path) => {
    renderAt(path);
    const h1 = await screen.findByRole("heading", { level: 1 });
    expect(h1).not.toHaveTextContent(/Page not found/i);
  });

  it.each(GUIDES.map((g) => [g.path, g.title] as const))("renders the guide at %s", async (path, title) => {
    renderAt(path);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });
});

describe("blog and policy routing", () => {
  it("renders the blog home with its featured article and search", async () => {
    renderAt("/blog");
    expect(await screen.findByRole("heading", { level: 1, name: BLOG_INDEX_META.h1 }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search articles" })).toBeInTheDocument();
    expect(screen.getByText("Featured article")).toBeInTheDocument();
  });

  it("filters articles as you search", async () => {
    renderAt("/blog");
    const box = await screen.findByRole("searchbox", { name: "Search articles" }, { timeout: 5000 });
    fireEvent.change(box, { target: { value: "students" } });
    expect(await screen.findByRole("heading", { level: 2, name: "Search results" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /How Students Can Use PDF Tools/ })).toBeInTheDocument();
  });

  it.each(BLOG_INDEX.map((a) => [a.path, a.title] as const))("renders the article at %s", async (path, title) => {
    renderAt(path);
    expect(await screen.findByRole("heading", { level: 1, name: title }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Key takeaways" })).toBeInTheDocument();
  });

  it.each(BLOG_CATEGORIES.map((c) => [c.id, c.label] as const))("renders the category page for %s", async (id, label) => {
    renderAt(`/blog/category/${id}`);
    expect(await screen.findByRole("heading", { level: 1, name: label }, { timeout: 5000 })).toBeInTheDocument();
  });

  it("renders a tag page", async () => {
    renderAt("/blog/tag/pdf");
    expect(await screen.findByRole("heading", { level: 1, name: "Articles tagged “PDF”" }, { timeout: 5000 })).toBeInTheDocument();
  });

  it("sends unknown articles, categories and tags back to the blog home", async () => {
    for (const path of ["/blog/no-such-article", "/blog/category/no-such-category", "/blog/tag/no-such-tag"]) {
      const { unmount } = renderAt(path);
      expect(await screen.findByRole("heading", { level: 1, name: BLOG_INDEX_META.h1 }, { timeout: 5000 })).toBeInTheDocument();
      unmount();
    }
  });

  it("redirects the old /terms address to Terms of Use", async () => {
    renderAt("/terms");
    expect(await screen.findByRole("heading", { level: 1, name: "Terms of Use" }, { timeout: 5000 })).toBeInTheDocument();
  });

  it("links Blog and the regrouped policy pages from the footer", async () => {
    renderAt("/about");
    await screen.findByRole("heading", { level: 1, name: "About Toolkit4Me" }, { timeout: 5000 });
    const footer = screen.getByRole("contentinfo");
    for (const [name, href] of [["Blog", "/blog"], ["Terms of Use", "/terms-of-use"], ["Privacy Policy", "/privacy"], ["Disclaimer", "/disclaimer"], ["Editorial Policy", "/editorial-policy"], ["Contact Us", "/contact"]]) {
      expect(within(footer).getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(within(footer).queryByText(/Terms of Service/)).toBeNull();
  });
});

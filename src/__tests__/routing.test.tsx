import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "../App";
import { toolRegistry } from "../lib/toolRegistry";
import { ToastProvider } from "../components/ui/ToastProvider";
import { STATIC_PAGES } from "../lib/seo/pages";
import { GUIDES } from "../data/guides";

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
    expect(await screen.findByRole("heading", { level: 1, name: /Toolkit4Me/i })).toBeInTheDocument();
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
      expect(await screen.findByRole("button", { name: tool.actionLabel })).toBeInTheDocument();
      unmount();
    }
  });

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

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "../App";
import { toolRegistry } from "../lib/toolRegistry";
import { ToastProvider } from "../components/ui/ToastProvider";

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
      expect(await screen.findByRole("heading", { level: 1, name: expectedH1 })).toBeInTheDocument();
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
});

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { LoadingState } from "./components/ui/LoadingState";

// Route-level code splitting (Core Web Vitals): the homepage's initial JS
// payload no longer has to include the tool-page framework, the FAQ/
// related-tools/instructions components, or client-side processing code —
// none of that is needed until a visitor actually navigates to a tool.
// This keeps first-load JS smaller, which helps LCP/INP on the pages most
// visitors land on first (home, the directory).
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ToolsDirectoryPage = lazy(() => import("./pages/ToolsDirectoryPage").then((m) => ({ default: m.ToolsDirectoryPage })));
const ToolPageRoute = lazy(() => import("./pages/ToolPage").then((m) => ({ default: m.ToolPageRoute })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

/**
 * Routing is intentionally minimal: a single dynamic `/tools/:slug` route
 * serves every tool page. Each of the 10 required routes
 * (/tools/pdf-to-word, /tools/word-to-pdf, ...) resolves through this one
 * route + the tool registry in src/data/tools.ts. Adding an 11th tool means
 * adding one entry to that registry — no new <Route> is ever needed.
 */
function App() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsDirectoryPage />} />
          <Route path="/tools/:slug" element={<ToolPageRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

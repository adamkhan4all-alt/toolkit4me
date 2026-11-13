import { lazy, Suspense } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { LoadingState } from "./components/ui/LoadingState";
import { toolRegistry } from "./lib/toolRegistry";
import { SHORT_PATH_REDIRECTS } from "./data/shortPaths";

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
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage").then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsOfUsePage = lazy(() => import("./pages/TermsOfUsePage").then((m) => ({ default: m.TermsOfUsePage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const GuidesIndexPage = lazy(() => import("./pages/GuidesIndexPage").then((m) => ({ default: m.GuidesIndexPage })));
const GuidePage = lazy(() => import("./pages/GuidePage").then((m) => ({ default: m.GuidePage })));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage").then((m) => ({ default: m.DisclaimerPage })));
const HubPage = lazy(() => import("./pages/HubPage").then((m) => ({ default: m.HubPage })));
const CalculatorPageRoute = lazy(() => import("./pages/CalculatorPage").then((m) => ({ default: m.CalculatorPageRoute })));
const LinkStudioAdminPage = lazy(() => import("./pages/LinkStudioAdminPage").then((m) => ({ default: m.LinkStudioAdminPage })));
const EditorialPolicyPage = lazy(() => import("./pages/EditorialPolicyPage").then((m) => ({ default: m.EditorialPolicyPage })));
const BlogHomePage = lazy(() => import("./pages/blog/BlogHomePage").then((m) => ({ default: m.BlogHomePage })));
const ArticlePage = lazy(() => import("./pages/blog/ArticlePage").then((m) => ({ default: m.ArticlePage })));
const BlogCategoryPage = lazy(() => import("./pages/blog/BlogCategoryPage").then((m) => ({ default: m.BlogCategoryPage })));
const BlogTagPage = lazy(() => import("./pages/blog/BlogTagPage").then((m) => ({ default: m.BlogTagPage })));

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
          {toolRegistry.getHubs().map((hub) => (
            <Route key={hub.id} path={hub.path} element={<HubPage hub={hub} />} />
          ))}
          <Route path="/calculators/:slug" element={<CalculatorPageRoute />} />
          <Route path="/link-studio/admin" element={<LinkStudioAdminPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          {/* Old address: Vercel answers it with a permanent redirect (vercel.json); this covers in-app navigation. */}
          <Route path="/terms" element={<Navigate to="/terms-of-use" replace />} />
          {SHORT_PATH_REDIRECTS.map((r) => (
            <Route key={r.from} path={r.from} element={<Navigate to={r.to} replace />} />
          ))}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
          <Route path="/guides" element={<GuidesIndexPage />} />
          <Route path="/guides/:slug" element={<GuidePage />} />
          <Route path="/blog" element={<BlogHomePage />} />
          <Route path="/blog/category/:category" element={<BlogCategoryPage />} />
          <Route path="/blog/tag/:tag" element={<BlogTagPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;

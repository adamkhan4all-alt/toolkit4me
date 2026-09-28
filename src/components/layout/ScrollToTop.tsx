import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top on route change — but only for routes
 * that don't manage their own scroll target. Tool pages (`/tools/:slug`)
 * scroll to their workspace instead (see ToolPage.tsx); firing both would
 * fight each other and cause visible jank, so this explicitly skips them.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith("/tools/")) return;
    // Deferred to the next frame rather than called synchronously inside
    // the effect, so it doesn't force a layout pass in the same tick as
    // the route's own DOM writes (Lighthouse: "Forced reflow").
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}

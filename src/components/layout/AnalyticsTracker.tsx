import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ANALYTICS_CONFIGURED, trackPageView } from "../../lib/analytics";

/** Longest wait for the new page's <title> before the page view is sent anyway (a route can keep its title). */
const TITLE_WAIT_MS = 1500;

/**
 * Sends one GA4 page view per route (path + search). Lazy routes set their <title> a moment after the URL changes, so
 * this waits for the title to change, or TITLE_WAIT_MS, and reports the new page's real title. Consent and
 * de-duplication are handled in src/lib/analytics.ts. Renders nothing; does nothing without a Measurement ID.
 */
export function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!ANALYTICS_CONFIGURED) return;
    const startTitle = document.title;
    let done = false;
    const report = () => {
      if (done) return;
      done = true;
      observer.disconnect();
      window.clearTimeout(timer);
      trackPageView(window.location.href, document.title);
    };
    const observer = new MutationObserver(() => {
      if (document.title !== startTitle) report();
    });
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    const timer = window.setTimeout(report, TITLE_WAIT_MS);
    return () => {
      done = true;
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}

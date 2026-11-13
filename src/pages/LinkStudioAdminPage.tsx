import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SeoHead } from "../components/seo/SeoHead";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { CreateLinkForm } from "../components/linkStudio/CreateLinkForm";
import { BulkShortener } from "../components/linkStudio/BulkShortener";
import { LinksManager } from "../components/linkStudio/LinksManager";
import { AnalyticsView } from "../components/linkStudio/AnalyticsView";
import { linkStudioApi, SIGN_IN_URL, type SessionInfo } from "../lib/linkStudio/client";

const SIGN_IN_ERRORS: Record<string, string> = {
  not_configured: "Team sign-in hasn't been set up on this website yet.",
  not_allowed: "That GitHub account isn't allowed to manage Link Studio.",
  denied: "Sign-in was cancelled on GitHub.",
  state: "The sign-in link expired or was opened in a different browser. Please try again.",
  oauth: "GitHub sign-in didn't complete. Please try again.",
};

type Tab = "create" | "bulk" | "links" | "analytics";

/**
 * Link Studio admin console (/link-studio/admin). Not indexed, not in the sitemap.
 * Hiding it isn't what protects it: every action goes through /api/link-studio,
 * which checks the signed, HttpOnly admin session on each request.
 */
export function LinkStudioAdminPage() {
  const [params, setParams] = useSearchParams();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionError, setSessionError] = useState(false);
  const [tab, setTab] = useState<Tab>("create");
  const [analyticsCode, setAnalyticsCode] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const signInError = params.get("error");

  useEffect(() => {
    linkStudioApi
      .session()
      .then(setSession)
      .catch(() => setSessionError(true));
  }, []);

  const signOut = async () => {
    try {
      await linkStudioApi.logout();
    } finally {
      setSession((s) => (s ? { ...s, authenticated: false, login: undefined } : s));
    }
  };

  const showAnalytics = (code: string | null) => {
    setAnalyticsCode(code);
    setTab("analytics");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6">
      <SeoHead title="Link Studio — Team console | Toolkit4Me" description="Toolkit4Me team console for go.toolkit4me.com short links." path="/link-studio/admin" noindex />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Link Studio", href: "/link-studio" }, { label: "Team console" }]} />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-[36px]">Link Studio</h1>
          <p className="text-base font-medium text-neutral-700">Shorten. Share. Track.</p>
        </div>
        {session?.authenticated && (
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <span>
              Signed in{session.login ? <> as <span className="font-semibold text-neutral-900">{session.login}</span></> : null}
            </span>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        )}
      </header>

      {!session && !sessionError && <LoadingState label="Checking your session…" />}
      {sessionError && <Alert variant="error">The sign-in service couldn't be reached. Refresh the page to try again.</Alert>}

      {session && !session.authenticated && (
        <section className="flex max-w-[640px] flex-col gap-4 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold text-neutral-900">Team sign-in</h2>
          <p className="text-sm leading-6 text-neutral-600">
            Creating and managing go.toolkit4me.com short links is limited to the Toolkit4Me team. Looking for something to use right now? The{" "}
            <Link to="/link-studio" className="text-brand-700 underline">
              Link Studio tools
            </Link>{" "}
            — UTM builder, URL cleaner, validator, encoder and QR codes — are free for everyone.
          </p>
          {signInError && <Alert variant="error">{SIGN_IN_ERRORS[signInError] ?? "Sign-in failed. Please try again."}</Alert>}
          {session.configured ? (
            <div>
              <a
                href={SIGN_IN_URL}
                onClick={() => setParams({}, { replace: true })}
                className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-neutral-900 px-4 text-[15px] font-medium text-white hover:bg-neutral-700"
              >
                <svg aria-hidden="true" viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Sign in with GitHub
              </a>
            </div>
          ) : (
            <Alert variant="info" title="Not set up yet">
              Team sign-in needs its GitHub OAuth settings in the Vercel project before anyone can sign in. See docs/LINK_STUDIO.md.
            </Alert>
          )}
        </section>
      )}

      {session?.authenticated && (
        <>
          <div role="tablist" aria-label="Link Studio" className="flex gap-1 border-b border-neutral-200">
            {(
              [
                ["create", "Create"],
                ["bulk", "Bulk"],
                ["links", "Links"],
                ["analytics", "Analytics"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                id={`tab-${key}`}
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                onClick={() => (key === "analytics" ? showAnalytics(null) : setTab(key))}
                className={`focus-ring -mb-px border-b-2 px-4 py-2 text-sm font-semibold ${tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-neutral-600 hover:text-neutral-900"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === "create" && (
              <div className="flex max-w-[760px] flex-col gap-3">
                <p className="text-sm text-neutral-600">Turn a long address into a branded go.toolkit4me.com link. You can change its destination, expiry or status later.</p>
                <CreateLinkForm onCreated={() => setRefreshKey((k) => k + 1)} />
              </div>
            )}
            {tab === "bulk" && (
              <div className="flex max-w-[960px] flex-col gap-3">
                <p className="text-sm text-neutral-600">Shorten a list of addresses at once. Each line is checked separately, so one bad entry doesn't stop the rest.</p>
                <BulkShortener onCreated={() => setRefreshKey((k) => k + 1)} />
              </div>
            )}
            {tab === "links" && <LinksManager refreshKey={refreshKey} onShowAnalytics={showAnalytics} />}
            {tab === "analytics" && <AnalyticsView key={analyticsCode ?? "summary"} code={analyticsCode} onSelectLink={showAnalytics} onClearLink={() => setAnalyticsCode(null)} />}
          </div>
        </>
      )}
    </div>
  );
}

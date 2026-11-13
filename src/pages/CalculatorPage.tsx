import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SeoHead } from "../components/seo/SeoHead";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ToolCard } from "../components/tools/ToolCard";
import { FAQ } from "../components/tools/FAQ";
import { AdInContent } from "../components/ads";
import { Alert } from "../components/ui/Alert";
import { LoadingState } from "../components/ui/LoadingState";
import { CalculatorWidget } from "../components/calculators/CalculatorWidget";
import { NotFoundPage } from "./NotFoundPage";
import { CALCULATOR_CATALOG, getCalculatorListing, type CalculatorListing } from "../data/calculators/catalog";
import { loadCalculator } from "../data/calculators/load";
import { DISCLAIMERS, type CalculatorDefinition } from "../lib/calculators/engine";
import { calculatorSchema } from "../lib/seo/structuredData";
import { getHub } from "../data/hubs";

/** /calculators/:slug — one generic page for every Calculator Hub calculator. */
export function CalculatorPageRoute() {
  const { slug } = useParams<{ slug: string }>();
  const listing = slug ? getCalculatorListing(slug) : undefined;
  if (!listing) return <NotFoundPage />;
  return <CalculatorPage key={listing.id} listing={listing} />;
}

function CalculatorPage({ listing }: { listing: CalculatorListing }) {
  const [definition, setDefinition] = useState<CalculatorDefinition | null>(null);
  const [failed, setFailed] = useState(false);
  const hub = getHub("calculators");

  useEffect(() => {
    let cancelled = false;
    loadCalculator(listing.group, listing.id)
      .then((d) => {
        if (cancelled) return;
        if (d) setDefinition(d);
        else setFailed(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [listing]);

  const content = definition?.content;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: hub.name, path: hub.path },
    { name: listing.name, path: listing.path },
  ];
  const related = (content?.related ?? []).map((id) => CALCULATOR_CATALOG.find((c) => c.id === id)).filter((c): c is CalculatorListing => Boolean(c));

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-8 sm:px-6">
      {content && (
        <SeoHead
          title={content.seo.title}
          description={content.seo.metaDescription}
          path={listing.path}
          breadcrumbs={breadcrumbs}
          faq={content.faq}
          jsonLd={[calculatorSchema({ name: listing.name, path: listing.path, description: content.seo.metaDescription })]}
        />
      )}

      <div className="flex w-full flex-col gap-8 lg:max-w-[760px]">
        <header className="flex flex-col gap-3">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: hub.name, href: hub.path }, { label: listing.name }]} />
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${hub.accent}`}>
              {listing.icon}
            </span>
            <span className="text-xs font-semibold text-neutral-600">{listing.categoryLabel}</span>
          </div>
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-[36px]">{content?.seo.h1 ?? listing.name}</h1>
          <p className="text-base text-neutral-600">{listing.description}</p>
        </header>

        {failed && <Alert variant="error">This calculator couldn't be loaded. Check your connection and refresh the page.</Alert>}
        {/* Hold a full screen of space while the calculator chunk loads, so the footer starts below the fold and
            nothing visible moves when the content arrives (this was CLS 0.52 desktop / 0.43 mobile). */}
        {!definition && !failed && (
          <div className="min-h-svh">
            <LoadingState label="Loading calculator…" />
          </div>
        )}
        {definition && content && (
          <>
            <CalculatorWidget definition={definition} title={listing.name} />

            {content.disclaimer && (
              <Alert variant="info" title="Please note">
                {DISCLAIMERS[content.disclaimer]}
              </Alert>
            )}

            <section aria-labelledby="calc-about" className="flex flex-col gap-3">
              <h2 id="calc-about" className="text-2xl font-semibold text-neutral-900">
                About this calculator
              </h2>
              {content.intro.map((p) => (
                <p key={p} className="text-sm leading-7 text-neutral-600">
                  {p}
                </p>
              ))}
            </section>

            <section aria-labelledby="calc-how" className="flex flex-col gap-3">
              <h2 id="calc-how" className="text-2xl font-semibold text-neutral-900">
                How to use it
              </h2>
              <ol className="ml-5 flex list-decimal flex-col gap-1.5 text-sm leading-6 text-neutral-600">
                {content.howTo.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </section>

            <AdInContent />

            <section aria-labelledby="calc-formula" className="flex flex-col gap-3">
              <h2 id="calc-formula" className="text-2xl font-semibold text-neutral-900">
                The formula
              </h2>
              <div className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                {content.formula.lines.map((l) => (
                  <p key={l} className="font-mono text-sm leading-6 break-words text-neutral-900">
                    {l}
                  </p>
                ))}
              </div>
              {content.formula.explanation.map((p) => (
                <p key={p} className="text-sm leading-7 text-neutral-600">
                  {p}
                </p>
              ))}
            </section>

            <section aria-labelledby="calc-example" className="flex flex-col gap-3">
              <h2 id="calc-example" className="text-2xl font-semibold text-neutral-900">
                Worked example
              </h2>
              {content.workedExample.map((p) => (
                <p key={p} className="text-sm leading-7 text-neutral-600">
                  {p}
                </p>
              ))}
            </section>

            <section aria-labelledby="calc-faq" className="flex flex-col gap-4">
              <h2 id="calc-faq" className="text-2xl font-semibold text-neutral-900">
                Frequently asked questions
              </h2>
              <FAQ items={content.faq} />
            </section>

            {related.length > 0 && (
              <section aria-labelledby="calc-related" className="flex flex-col gap-4">
                <h2 id="calc-related" className="text-2xl font-semibold text-neutral-900">
                  Related calculators
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {related.map((c) => (
                    <ToolCard key={c.id} tool={c} />
                  ))}
                </div>
                <Link to={hub.path} className="focus-ring w-fit rounded text-sm font-semibold text-brand-700 hover:underline">
                  All {CALCULATOR_CATALOG.length} calculators →
                </Link>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

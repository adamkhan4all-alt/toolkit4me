import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../layout/Breadcrumb";
import { SeoHead } from "../seo/SeoHead";
import type { PolicyMeta } from "../../data/policies";
import { formatLongDate } from "../../lib/format";

const policyLink = "focus-ring rounded font-medium text-brand-700 underline hover:text-brand-600";

/** Internal link styled for policy text. */
export function PLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={policyLink}>
      {children}
    </Link>
  );
}

/** External link: new tab, rel="noopener noreferrer", announced to screen readers. */
export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={policyLink}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/** The support address as a mailto link (same tab). */
export function MailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className={policyLink}>
      {email}
    </a>
  );
}

export function PolicySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-24 flex-col gap-3">
      <h2 id={`${id}-h`} className="text-lg font-semibold text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Shared frame for About and the policy pages: breadcrumb, H1, last-updated date, optional contents list, body. */
export function PolicyLayout({ meta, intro, toc, children }: { meta: PolicyMeta; intro?: ReactNode; toc?: { id: string; title: string }[]; children: ReactNode }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: meta.title, path: meta.path },
  ];
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-8 px-4 py-10 sm:px-6">
      <SeoHead title={meta.seoTitle} description={meta.description} path={meta.path} breadcrumbs={crumbs} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: meta.title }]} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-neutral-900">{meta.title}</h1>
        <p className="text-sm text-neutral-600">
          Last updated: <time dateTime={meta.updated}>{formatLongDate(meta.updated)}</time>
        </p>
      </header>
      {intro && <div className="flex flex-col gap-3 text-[15px] leading-7 text-neutral-700">{intro}</div>}
      {toc && toc.length > 0 && (
        <nav aria-labelledby="policy-toc-heading" className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4">
          <h2 id="policy-toc-heading" className="mb-2 text-sm font-semibold text-neutral-900">
            On this page
          </h2>
          <ol className="ml-5 grid list-decimal gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="focus-ring rounded text-brand-700 hover:underline">
                  {t.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-8 text-[15px] leading-7 text-neutral-700 [&_li]:leading-7 [&_ul]:ml-5 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5">
        {children}
      </div>
    </div>
  );
}

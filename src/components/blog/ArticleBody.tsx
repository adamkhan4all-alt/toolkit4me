import { headingId } from "../../data/blog/meta";
import type { ArticleCallout, ArticleSection, ArticleSubsection, ArticleTable } from "../../data/blog/types";
import { plainText } from "../../lib/blog/inline";
import { ArticleImage } from "./ArticleImage";
import { InlineText } from "./InlineText";

const P = "text-[15px] leading-7 text-neutral-700";

function Paragraphs({ items }: { items?: string[] }) {
  return (
    <>
      {items?.map((p) => (
        <p key={p} className={P}>
          <InlineText text={p} />
        </p>
      ))}
    </>
  );
}

function BulletList({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className={`ml-5 flex list-disc flex-col gap-2 ${P} marker:text-neutral-400`}>
      {items.map((item) => (
        <li key={item}>
          <InlineText text={item} />
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <ol className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
            {i + 1}
          </span>
          <span className={P}>
            <span className="sr-only">Step {i + 1}: </span>
            <InlineText text={item} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function Table({ table }: { table: ArticleTable }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <caption className="px-4 py-2.5 text-left text-xs text-neutral-600">{table.caption}</caption>
        <thead className="bg-neutral-100 text-neutral-900">
          <tr>
            {table.headers.map((h) => (
              <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join("|")} className="border-t border-neutral-200 align-top">
              {row.map((cell, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-4 py-2.5 font-medium text-neutral-900">
                    <InlineText text={cell} />
                  </th>
                ) : (
                  <td key={i} className="px-4 py-2.5 leading-6 text-neutral-700">
                    <InlineText text={cell} />
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CALLOUT_STYLE: Record<ArticleCallout["tone"], { box: string; label: string }> = {
  example: { box: "border-sky-200 bg-sky-50", label: "Example" },
  tip: { box: "border-emerald-200 bg-emerald-50", label: "Tip" },
  warning: { box: "border-amber-200 bg-amber-50", label: "Watch out" },
};

function Callout({ callout }: { callout: ArticleCallout }) {
  const style = CALLOUT_STYLE[callout.tone];
  return (
    <aside aria-label={`${style.label}: ${callout.title}`} className={`flex flex-col gap-2 rounded-xl border p-4 sm:p-5 ${style.box}`}>
      <p className="text-sm font-semibold text-neutral-900">
        <span className="mr-2 text-xs font-bold tracking-wide text-neutral-700 uppercase">{style.label}</span>
        {callout.title}
      </p>
      {callout.body.map((p) => (
        <p key={p} className="text-sm leading-6 text-neutral-800">
          <InlineText text={p} />
        </p>
      ))}
    </aside>
  );
}

function Subsection({ sub }: { sub: ArticleSubsection }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 id={headingId(sub.heading)} className="scroll-mt-24 text-lg font-semibold text-neutral-900">
        {plainText(sub.heading)}
      </h3>
      <Paragraphs items={sub.paragraphs} />
      <BulletList items={sub.list} />
      <Steps items={sub.steps} />
    </div>
  );
}

/** One H2 section: paragraphs, list, steps, table, figure, callout, then H3 subsections. */
export function ArticleSectionView({ section }: { section: ArticleSection }) {
  return (
    <section id={headingId(section.heading)} aria-labelledby={`${headingId(section.heading)}-h`} className="flex scroll-mt-24 flex-col gap-4">
      <h2 id={`${headingId(section.heading)}-h`} className="text-[22px] leading-snug font-semibold text-neutral-900">
        {plainText(section.heading)}
      </h2>
      <Paragraphs items={section.paragraphs} />
      <BulletList items={section.list} />
      <Steps items={section.steps} />
      {section.table && <Table table={section.table} />}
      {section.figure && <ArticleImage figure={section.figure} />}
      {section.callout && <Callout callout={section.callout} />}
      {section.subsections?.map((sub) => <Subsection key={sub.heading} sub={sub} />)}
    </section>
  );
}

export { Paragraphs as ArticleParagraphs };

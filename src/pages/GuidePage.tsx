import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ToolCard } from "../components/tools/ToolCard";
import { FAQ } from "../components/tools/FAQ";
import { AdInContent } from "../components/ads";
import { SeoHead } from "../components/seo/SeoHead";
import { getGuide, GUIDE_AUTHOR, guideCategoryLabel, readingMinutes, relatedGuidesFor, sectionId, type GuideSection } from "../data/guides";
import { toolRegistry } from "../lib/toolRegistry";
import { formatLongDate } from "../lib/format";
import { articleSchema } from "../lib/seo/structuredData";

/** Guides with at least this many headed sections get a table of contents. */
const TOC_MIN_SECTIONS = 4;

function SectionBody({ section }: { section: GuideSection }) {
  return (
    <>
      {section.paragraphs?.map((p) => (
        <p key={p} className="text-sm leading-7 text-neutral-600">
          {p}
        </p>
      ))}
      {section.list && (
        <ul className="ml-5 flex list-disc flex-col gap-1.5 text-sm leading-6 text-neutral-600">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.table && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <caption className="px-3 py-2 text-left text-xs text-neutral-600">{section.table.caption}</caption>
            <thead className="bg-neutral-100 text-neutral-900">
              <tr>
                {section.table.headers.map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row) => (
                <tr key={row.join("|")} className="border-t border-neutral-200">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="px-3 py-2 font-medium text-neutral-900">
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className="px-3 py-2 text-neutral-600">
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.image && (
        <figure className="flex flex-col gap-2">
          <img
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-lg border border-neutral-200"
          />
          {section.image.caption && <figcaption className="text-xs text-neutral-600">{section.image.caption}</figcaption>}
        </figure>
      )}
    </>
  );
}

/** Renders one guide from src/data/guides.ts; unknown slugs fall back to the guides index. */
export function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuide(`/guides/${slug}`) : undefined;
  if (!guide) return <Navigate to="/guides" replace />;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.title, path: guide.path },
  ];
  const relatedTools = (guide.relatedTools ?? []).map((s) => toolRegistry.getBySlug(s)).filter((t) => t !== undefined);
  const mainTool = relatedTools[0];
  const moreGuides = relatedGuidesFor(guide);
  const headed = guide.sections.filter((s) => s.heading);
  const showToc = headed.length >= TOC_MIN_SECTIONS;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 py-8 sm:px-6">
      <SeoHead
        title={guide.seoTitle}
        description={guide.metaDescription}
        path={guide.path}
        breadcrumbs={crumbs}
        jsonLd={[articleSchema(guide)]}
      />
      <Breadcrumb items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.name } : { label: c.name, href: c.path }))} />

      <header className="flex flex-col gap-3">
        <Link to={`/guides#${guide.category}`} className="focus-ring w-fit rounded text-xs font-semibold tracking-wide text-brand-700 uppercase hover:underline">
          {guideCategoryLabel(guide.category)}
        </Link>
        <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[36px]">{guide.title}</h1>
        <p className="text-xs text-neutral-600">
          By {GUIDE_AUTHOR} · Published {formatLongDate(guide.published)}
          {guide.updated !== guide.published && <> · Updated {formatLongDate(guide.updated)}</>} · {readingMinutes(guide)} min read
        </p>
        <p className="text-base leading-7 text-neutral-700">{guide.summary}</p>
      </header>

      {showToc && (
        <nav aria-labelledby="toc-heading" className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 id="toc-heading" className="mb-2 text-sm font-semibold text-neutral-900">
            In this guide
          </h2>
          <ol className="ml-5 flex list-decimal flex-col gap-1 text-sm">
            {headed.map((s) => (
              <li key={s.heading}>
                <a href={`#${sectionId(s.heading!)}`} className="focus-ring rounded text-brand-600 hover:underline">
                  {s.heading}
                </a>
              </li>
            ))}
            {guide.faq?.length ? (
              <li>
                <a href="#guide-faq" className="focus-ring rounded text-brand-600 hover:underline">
                  Frequently asked questions
                </a>
              </li>
            ) : null}
          </ol>
        </nav>
      )}

      <article className="flex flex-col gap-8">
        {guide.sections.map((section, i) => (
          <section key={section.heading ?? i} id={section.heading ? sectionId(section.heading) : undefined} className="flex scroll-mt-24 flex-col gap-3">
            {section.heading && <h2 className="text-xl font-semibold text-neutral-900">{section.heading}</h2>}
            <SectionBody section={section} />
          </section>
        ))}
      </article>

      {mainTool && (
        <aside className="flex flex-col gap-3 rounded-xl border border-brand-600 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-neutral-900">Try {mainTool.name}</p>
            <p className="text-sm text-neutral-700">{mainTool.description}</p>
          </div>
          <Link
            to={`/tools/${mainTool.slug}`}
            className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-600 px-4 text-[15px] font-medium text-white hover:bg-brand-700"
          >
            Open {mainTool.shortName}
          </Link>
        </aside>
      )}

      {guide.faq?.length ? (
        <section id="guide-faq" aria-labelledby="guide-faq-heading" className="flex scroll-mt-24 flex-col gap-4">
          <h2 id="guide-faq-heading" className="text-xl font-semibold text-neutral-900">
            Frequently asked questions
          </h2>
          <FAQ items={guide.faq} />
        </section>
      ) : null}

      <AdInContent />

      {relatedTools.length > 1 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">Tools mentioned in this guide</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-neutral-900">Related guides</h2>
        <ul className="flex flex-col gap-2">
          {moreGuides.map((g) => (
            <li key={g.path}>
              <Link to={g.path} className="focus-ring rounded text-sm font-medium text-brand-600 hover:underline">
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

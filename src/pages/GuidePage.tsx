import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ToolCard } from "../components/tools/ToolCard";
import { AdInContent } from "../components/ads";
import { SeoHead } from "../components/seo/SeoHead";
import { getGuide, GUIDES } from "../data/guides";
import { toolRegistry } from "../lib/toolRegistry";

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
  const moreGuides = GUIDES.filter((g) => g.path !== guide.path).slice(0, 3);

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 py-8 sm:px-6">
      <SeoHead title={guide.seoTitle} description={guide.metaDescription} path={guide.path} breadcrumbs={crumbs} />
      <Breadcrumb items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.name } : { label: c.name, href: c.path }))} />

      <header className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[36px]">{guide.title}</h1>
        <p className="text-xs text-neutral-600">Last updated: {guide.updated}</p>
        <p className="text-base leading-7 text-neutral-700">{guide.summary}</p>
      </header>

      <article className="flex flex-col gap-8">
        {guide.sections.map((section, i) => (
          <section key={section.heading ?? i} className="flex flex-col gap-3">
            {section.heading && <h2 className="text-xl font-semibold text-neutral-900">{section.heading}</h2>}
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
          </section>
        ))}
      </article>

      <AdInContent />

      {relatedTools.length > 0 && (
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
        <h2 className="text-xl font-semibold text-neutral-900">More guides</h2>
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

import { Link } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { SeoHead } from "../components/seo/SeoHead";
import { GUIDE_CATEGORIES, GUIDES, GUIDES_INDEX_META, guideCategoryLabel, readingMinutes, type GuideDefinition } from "../data/guides";
import { formatLongDate } from "../lib/format";

/** How many recent guides the "Latest" row shows (featured guides are excluded from it). */
const LATEST_COUNT = 3;

function GuideCard({ guide }: { guide: GuideDefinition }) {
  return (
    <Link
      to={guide.path}
      className="focus-ring group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-brand-600"
    >
      <span className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{guideCategoryLabel(guide.category)}</span>
      <h3 className="text-base font-semibold text-neutral-900 group-hover:text-brand-600">{guide.title}</h3>
      <p className="text-sm leading-6 text-neutral-600">{guide.summary}</p>
      <p className="mt-auto pt-2 text-xs text-neutral-600">
        {formatLongDate(guide.updated)} · {readingMinutes(guide)} min read
      </p>
    </Link>
  );
}

const byNewest = (a: GuideDefinition, b: GuideDefinition) => b.published.localeCompare(a.published) || b.updated.localeCompare(a.updated);

export function GuidesIndexPage() {
  const featured = GUIDES.filter((g) => g.featured);
  const latest = GUIDES.filter((g) => !g.featured)
    .sort(byNewest)
    .slice(0, LATEST_COUNT);
  const categories = GUIDE_CATEGORIES.map((c) => ({ ...c, guides: GUIDES.filter((g) => g.category === c.id) })).filter((c) => c.guides.length > 0);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-8 sm:px-6">
      <SeoHead
        title={GUIDES_INDEX_META.title}
        description={GUIDES_INDEX_META.description}
        path="/guides"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[32px]">Guides</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          Practical explanations of the file formats and everyday tasks behind our tools — why files get large, which format to
          pick, how to get clean results, and the mistakes to avoid. {GUIDES.length} guides, written and checked by the
          Toolkit4Me editorial team.
        </p>
        <nav aria-label="Guide categories" className="flex flex-wrap gap-2 pt-1">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="focus-ring rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 hover:border-brand-600"
            >
              {c.label} <span className="text-neutral-400">({c.guides.length})</span>
            </a>
          ))}
        </nav>
      </div>

      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="flex flex-col gap-4">
          <h2 id="featured-heading" className="text-xl font-semibold text-neutral-900">
            Featured
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GuideCard key={g.path} guide={g} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section aria-labelledby="latest-heading" className="flex flex-col gap-4">
          <h2 id="latest-heading" className="text-xl font-semibold text-neutral-900">
            Latest
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((g) => (
              <GuideCard key={g.path} guide={g} />
            ))}
          </div>
        </section>
      )}

      {categories.map((c) => (
        <section key={c.id} id={c.id} aria-labelledby={`${c.id}-heading`} className="flex scroll-mt-24 flex-col gap-4">
          <div>
            <h2 id={`${c.id}-heading`} className="text-xl font-semibold text-neutral-900">
              {c.label}
            </h2>
            <p className="text-sm text-neutral-600">{c.description}</p>
          </div>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {c.guides.map((g) => (
              <li key={g.path} className="text-sm">
                <Link to={g.path} className="focus-ring rounded font-medium text-brand-600 hover:underline">
                  {g.title}
                </Link>
                <span className="text-neutral-600"> · {readingMinutes(g)} min read</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

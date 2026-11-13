import { useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { SeoHead } from "../../components/seo/SeoHead";
import { ArticleGrid } from "../../components/blog/ArticleGrid";
import { ArticleCard } from "../../components/blog/ArticleCard";
import { BlogCategoryNav } from "../../components/blog/BlogCategoryNav";
import { BlogSearchInput, BlogSearchResults } from "../../components/blog/BlogSearch";
import { FeaturedArticle } from "../../components/blog/FeaturedArticle";
import { RecommendedToolCard } from "../../components/blog/RecommendedToolCard";
import { BLOG_INDEX } from "../../data/blog/blogIndex.generated";
import { BLOG_INDEX_META, BLOG_PATH, byNewest, featuredArticle } from "../../data/blog/meta";
import { BLOG_HOME_TOOLS } from "../../lib/blog/tools";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Blog", path: BLOG_PATH },
];

export function BlogHomePage() {
  const [query, setQuery] = useState("");
  const featured = featuredArticle(BLOG_INDEX);
  const latest = [...BLOG_INDEX].sort(byNewest).filter((a) => a.slug !== featured?.slug);
  const picks = BLOG_INDEX.filter((a) => a.editorsPick).sort(byNewest);
  const searching = query.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-8 sm:px-6">
      <SeoHead title={BLOG_INDEX_META.title} description={BLOG_INDEX_META.description} path={BLOG_PATH} breadcrumbs={CRUMBS} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <header className="flex flex-col gap-4">
        <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[36px]">{BLOG_INDEX_META.h1}</h1>
        <p className="max-w-3xl text-[15px] leading-7 text-neutral-700">{BLOG_INDEX_META.intro}</p>
        <p className="max-w-3xl text-sm leading-6 text-neutral-600">
          Looking for a step-by-step how-to for a single tool? Our{" "}
          <Link to="/guides" className="focus-ring rounded font-medium text-brand-700 underline">
            Guides
          </Link>{" "}
          cover those. The blog looks at the bigger picture: how documents, images and links fit into study, work and business.
        </p>
        <BlogSearchInput value={query} onChange={setQuery} />
      </header>

      {searching ? (
        <BlogSearchResults index={BLOG_INDEX} query={query} />
      ) : (
        <>
          {featured && <FeaturedArticle article={featured} />}

          <section aria-labelledby="categories-heading" className="flex flex-col gap-3">
            <h2 id="categories-heading" className="text-xl font-semibold text-neutral-900">
              Browse by category
            </h2>
            <BlogCategoryNav index={BLOG_INDEX} />
          </section>

          {latest.length > 0 && (
            <section aria-labelledby="latest-heading" className="flex flex-col gap-4">
              <h2 id="latest-heading" className="text-xl font-semibold text-neutral-900">
                Latest articles
              </h2>
              <ArticleGrid articles={latest} label="articles" />
            </section>
          )}

          {picks.length > 0 && (
            <section aria-labelledby="picks-heading" className="flex flex-col gap-4">
              <div>
                <h2 id="picks-heading" className="text-xl font-semibold text-neutral-900">
                  Editor’s picks
                </h2>
                <p className="text-sm text-neutral-600">Chosen by our editors as good places to start — not ranked by views.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {picks.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <section aria-labelledby="tools-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="tools-heading" className="text-xl font-semibold text-neutral-900">
            Tools our articles use
          </h2>
          <p className="text-sm text-neutral-600">Free Toolkit4Me tools that come up again and again in these articles. Each opens on its own page here.</p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BLOG_HOME_TOOLS.map((id) => (
            <li key={id}>
              <RecommendedToolCard id={id} />
            </li>
          ))}
        </ul>
        <Link to="/tools" className="focus-ring w-fit rounded text-sm font-semibold text-brand-700 hover:underline">
          Browse all tools →
        </Link>
      </section>
    </div>
  );
}

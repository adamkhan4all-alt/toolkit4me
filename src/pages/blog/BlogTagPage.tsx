import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { SeoHead } from "../../components/seo/SeoHead";
import { ArticleGrid } from "../../components/blog/ArticleGrid";
import { BLOG_INDEX } from "../../data/blog/blogIndex.generated";
import { articlesWithTag, BLOG_PATH, tagCounts } from "../../data/blog/meta";
import { MIN_ARTICLES_FOR_INDEXED_TAG, tagLabel, tagPageMeta, tagPath } from "../../data/blog/tags";

export function BlogTagPage() {
  const { tag = "" } = useParams<{ tag: string }>();
  const articles = articlesWithTag(BLOG_INDEX, tag);
  if (!articles.length) return <Navigate to={BLOG_PATH} replace />;

  const meta = tagPageMeta(tag, articles.length);
  const otherTags = tagCounts(BLOG_INDEX).filter((t) => t.tag !== tag);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: BLOG_PATH },
    { name: tagLabel(tag), path: tagPath(tag) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <SeoHead
        title={meta.title}
        description={meta.description}
        path={tagPath(tag)}
        breadcrumbs={crumbs}
        noindex={articles.length < MIN_ARTICLES_FOR_INDEXED_TAG}
        followLinks
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: BLOG_PATH }, { label: tagLabel(tag) }]} />

      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Tag</p>
        <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[34px]">{meta.h1}</h1>
        <p className="text-[15px] text-neutral-700">
          {articles.length} article{articles.length === 1 ? "" : "s"}
        </p>
      </header>

      <ArticleGrid articles={articles} label="articles" />

      {otherTags.length > 0 && (
        <nav aria-labelledby="other-tags-heading" className="flex flex-col gap-3">
          <h2 id="other-tags-heading" className="text-lg font-semibold text-neutral-900">
            Other tags
          </h2>
          <ul className="flex flex-wrap gap-2">
            {otherTags.map((t) => (
              <li key={t.tag}>
                <Link to={tagPath(t.tag)} className="focus-ring inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:border-brand-600 hover:text-brand-700">
                  {tagLabel(t.tag)} <span className="ml-1 text-neutral-500">({t.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

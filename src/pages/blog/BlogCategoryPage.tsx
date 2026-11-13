import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { SeoHead } from "../../components/seo/SeoHead";
import { ArticleGrid } from "../../components/blog/ArticleGrid";
import { BlogCategoryNav } from "../../components/blog/BlogCategoryNav";
import { BLOG_INDEX } from "../../data/blog/blogIndex.generated";
import { blogCategoryPath, getBlogCategory } from "../../data/blog/categories";
import { articlesInCategory, BLOG_PATH } from "../../data/blog/meta";
import { GUIDE_INDEX } from "../../data/guideIndex.generated";

export function BlogCategoryPage() {
  const { category: id = "" } = useParams<{ category: string }>();
  const category = getBlogCategory(id);
  if (!category) return <Navigate to={BLOG_PATH} replace />;

  const articles = articlesInCategory(BLOG_INDEX, category.id);
  const guides = category.relatedGuides.map((p) => GUIDE_INDEX.find((g) => g.path === p)).filter((g) => g !== undefined);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: BLOG_PATH },
    { name: category.label, path: blogCategoryPath(category.id) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      {/* A category with no published articles yet is useful to readers (it links to related guides) but too thin to index. */}
      <SeoHead title={category.seoTitle} description={category.metaDescription} path={crumbs[2].path} breadcrumbs={crumbs} noindex={articles.length === 0} followLinks />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: BLOG_PATH }, { label: category.label }]} />

      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold tracking-wide text-neutral-600 uppercase">Blog category</p>
        <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[34px]">{category.label}</h1>
        <p className="max-w-3xl text-[15px] leading-7 text-neutral-700">{category.description}</p>
      </header>

      <BlogCategoryNav index={BLOG_INDEX} active={category.id} />

      {articles.length > 0 ? (
        <section aria-labelledby="category-articles-heading" className="flex flex-col gap-4">
          <h2 id="category-articles-heading" className="text-xl font-semibold text-neutral-900">
            {articles.length} article{articles.length === 1 ? "" : "s"} in {category.label}
          </h2>
          <ArticleGrid articles={articles} label="articles" />
        </section>
      ) : (
        <section aria-labelledby="category-empty-heading" className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6">
          <h2 id="category-empty-heading" className="text-lg font-semibold text-neutral-900">
            No articles here yet
          </h2>
          <p className="text-[15px] leading-7 text-neutral-700">
            We’re still writing the first articles for this category. In the meantime, the guides below cover related tasks, and the{" "}
            <Link to={BLOG_PATH} className="focus-ring rounded font-medium text-brand-700 underline">
              blog home
            </Link>{" "}
            has everything published so far.
          </p>
        </section>
      )}

      {guides.length > 0 && (
        <section aria-labelledby="category-guides-heading" className="flex flex-col gap-3">
          <h2 id="category-guides-heading" className="text-xl font-semibold text-neutral-900">
            Related guides
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {guides.map((g) => (
              <li key={g.path}>
                <Link to={g.path} className="focus-ring card-lift flex h-full flex-col gap-1.5 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-4 hover:border-brand-100">
                  <span className="text-[15px] font-semibold text-neutral-900">{g.title}</span>
                  <span className="text-sm leading-6 text-neutral-600">{g.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

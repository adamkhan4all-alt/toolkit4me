import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../../components/layout/Breadcrumb";
import { SeoHead } from "../../components/seo/SeoHead";
import { AdInContent } from "../../components/ads";
import { LoadingState } from "../../components/ui/LoadingState";
import { ArticleAuthor, ArticleByline } from "../../components/blog/ArticleAuthor";
import { ArticleParagraphs, ArticleSectionView } from "../../components/blog/ArticleBody";
import { ArticleCategoryBadge } from "../../components/blog/ArticleCategoryBadge";
import { ArticleCTA } from "../../components/blog/ArticleCTA";
import { ArticleImage } from "../../components/blog/ArticleImage";
import { ArticleReferences } from "../../components/blog/ArticleReferences";
import { ArticleTableOfContents } from "../../components/blog/ArticleTableOfContents";
import { InlineText } from "../../components/blog/InlineText";
import { RecommendedTools } from "../../components/blog/RecommendedToolCard";
import { RelatedArticles } from "../../components/blog/RelatedArticles";
import { ARTICLE_LOADERS, BLOG_INDEX } from "../../data/blog/blogIndex.generated";
import { articleBreadcrumbs, articlePath, articleReadingMinutes, BLOG_PATH, relatedArticlesFor, tocEntries } from "../../data/blog/meta";
import { tagLabel, tagPath } from "../../data/blog/tags";
import type { BlogArticle } from "../../data/blog/types";
import { GUIDE_INDEX } from "../../data/guideIndex.generated";
import { articleShareImage, blogPostingSchema } from "../../lib/seo/structuredData";

/** Loads the article's own chunk (see ARTICLE_LOADERS); unknown slugs go back to /blog. */
export function ArticlePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const loader = ARTICLE_LOADERS[slug];
  const [loaded, setLoaded] = useState<{ slug: string; article: BlogArticle } | null>(null);

  useEffect(() => {
    if (!loader) return;
    let cancelled = false;
    loader().then((article) => {
      if (!cancelled) setLoaded({ slug, article });
    });
    return () => {
      cancelled = true;
    };
  }, [loader, slug]);

  if (!loader) return <Navigate to={BLOG_PATH} replace />;
  if (!loaded || loaded.slug !== slug) return <LoadingState label="Loading article…" />;
  return <ArticleView article={loaded.article} />;
}

export function ArticleView({ article }: { article: BlogArticle }) {
  const crumbs = articleBreadcrumbs(article);
  const toc = tocEntries(article.sections, { faq: Boolean(article.faq?.length), references: Boolean(article.references?.length) });
  const related = relatedArticlesFor(article, BLOG_INDEX);
  const guides = (article.relatedGuides ?? []).map((p) => GUIDE_INDEX.find((g) => g.path === p)).filter((g) => g !== undefined);
  const [mainTool] = article.relatedTools;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <SeoHead
        title={article.seoTitle}
        description={article.metaDescription}
        path={articlePath(article.slug)}
        breadcrumbs={crumbs}
        ogType="article"
        ogImage={articleShareImage(article.slug)}
        jsonLd={[blogPostingSchema(article)]}
      />
      <Breadcrumb items={crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.name } : { label: c.name, href: c.path }))} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,760px)_240px] lg:justify-between">
        <article className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-4">
            <ArticleCategoryBadge category={article.category} />
            <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[38px]">{article.title}</h1>
            <p className="text-[17px] leading-8 text-neutral-700">{article.excerpt}</p>
            <ArticleByline authorId={article.author} published={article.published} updated={article.updated} minutes={articleReadingMinutes(article)} />
          </header>

          <ArticleImage figure={article.hero} priority />

          <section aria-labelledby="takeaways-heading" className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-5">
            <h2 id="takeaways-heading" className="mb-3 text-base font-semibold text-neutral-900">
              Key takeaways
            </h2>
            <ul className="ml-5 flex list-disc flex-col gap-2 text-[15px] leading-7 text-neutral-700 marker:text-brand-600">
              {article.takeaways.map((t) => (
                <li key={t}>
                  <InlineText text={t} />
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-4">
            <ArticleParagraphs items={article.intro} />
          </div>

          <div className="lg:hidden">
            <ArticleTableOfContents entries={toc} />
          </div>

          {article.sections.map((section) => (
            <ArticleSectionView key={section.heading} section={section} />
          ))}

          {mainTool && <ArticleCTA toolId={mainTool} />}

          {article.faq?.length ? (
            <section id="article-faq" aria-labelledby="article-faq-heading" className="flex scroll-mt-24 flex-col gap-5">
              <h2 id="article-faq-heading" className="text-[22px] font-semibold text-neutral-900">
                Frequently asked questions
              </h2>
              {article.faq.map((f) => (
                <div key={f.question} className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold text-neutral-900">{f.question}</h3>
                  <p className="text-[15px] leading-7 text-neutral-700">
                    <InlineText text={f.answer} />
                  </p>
                </div>
              ))}
            </section>
          ) : null}

          <AdInContent />

          <RecommendedTools ids={article.relatedTools} title="Tools mentioned in this article" headingId="article-tools-heading" />

          {guides.length > 0 && (
            <section aria-labelledby="article-guides-heading" className="flex flex-col gap-3">
              <h2 id="article-guides-heading" className="text-xl font-semibold text-neutral-900">
                Step-by-step guides
              </h2>
              <ul className="flex flex-col gap-2">
                {guides.map((g) => (
                  <li key={g.path}>
                    <Link to={g.path} className="focus-ring rounded text-[15px] font-medium text-brand-700 hover:underline">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {article.references?.length ? <ArticleReferences references={article.references} /> : null}

          <section aria-label="Tags" className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">Tags:</span>
            {article.tags.map((t) => (
              <Link key={t} to={tagPath(t)} className="focus-ring rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-brand-600 hover:text-brand-700">
                {tagLabel(t)}
              </Link>
            ))}
          </section>

          <ArticleAuthor authorId={article.author} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ArticleTableOfContents entries={toc} variant="sidebar" />
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <RelatedArticles articles={related} />
      </div>
    </div>
  );
}

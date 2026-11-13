import { Helmet } from "react-helmet-async";
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_ALT, SITE_NAME, TWITTER_HANDLE, absoluteUrl } from "../../config/site";
import { breadcrumbSchema, faqSchema, type JsonLd } from "../../lib/seo/structuredData";

export interface BreadcrumbLink {
  name: string;
  path: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  /** Set true only for pages that should stay out of search results (e.g. 404). Noindex pages get no canonical, as in the prerendered HTML. */
  noindex?: boolean;
  /** With noindex: let crawlers follow the page's links (thin blog tag pages). Default "noindex, nofollow". */
  followLinks?: boolean;
  breadcrumbs?: BreadcrumbLink[];
  faq?: FaqEntry[];
  ogImage?: string;
  /** Open Graph type; "article" for blog articles. */
  ogType?: "website" | "article";
  /** Extra page-specific JSON-LD (WebSite/Organization, WebApplication, Article) from src/lib/seo/structuredData.ts. */
  jsonLd?: JsonLd[];
}

/**
 * Centralized per-page <head> management — title, meta description,
 * canonical URL, Open Graph, Twitter Card, and JSON-LD structured data
 * (BreadcrumbList + FAQPage where applicable). Every routed page renders
 * exactly one of these so head content is always unique per URL and never
 * duplicated between pages.
 */
export function SeoHead({ title, description, path, noindex, followLinks, breadcrumbs, faq, ogImage, ogType = "website", jsonLd = [] }: SeoHeadProps) {
  const url = absoluteUrl(path);
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  // Same builders scripts/prerender.ts uses, so the prerendered and
  // client-rendered <head> carry identical structured data.
  const structuredData: JsonLd[] = [
    ...(breadcrumbs?.length ? [breadcrumbSchema(breadcrumbs)] : []),
    ...(faq?.length ? [faqSchema(faq)] : []),
    ...jsonLd,
  ];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content={followLinks ? "noindex, follow" : "noindex, nofollow"} /> : <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      {!ogImage && <meta property="og:image:width" content="1200" />}
      {!ogImage && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt" content={ogImage ? title : DEFAULT_OG_IMAGE_ALT} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {structuredData.map((data) => (
        <script key={String(data["@type"])} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}

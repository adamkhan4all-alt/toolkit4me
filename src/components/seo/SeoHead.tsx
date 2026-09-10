import { Helmet } from "react-helmet-async";
import { DEFAULT_OG_IMAGE, SITE_NAME, TWITTER_HANDLE, absoluteUrl } from "../../config/site";

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
  /** Set true only for pages that should stay out of search results (e.g. 404). */
  noindex?: boolean;
  breadcrumbs?: BreadcrumbLink[];
  faq?: FaqEntry[];
  ogImage?: string;
}

/**
 * Centralized per-page <head> management — title, meta description,
 * canonical URL, Open Graph, Twitter Card, and JSON-LD structured data
 * (BreadcrumbList + FAQPage where applicable). Every routed page renders
 * exactly one of these so head content is always unique per URL and never
 * duplicated between pages.
 */
export function SeoHead({ title, description, path, noindex, breadcrumbs, faq, ogImage }: SeoHeadProps) {
  const url = absoluteUrl(path);
  const image = ogImage ?? DEFAULT_OG_IMAGE;

  const breadcrumbJsonLd = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.path),
        })),
      }
    : null;

  const faqJsonLd = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {breadcrumbJsonLd && <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>}
      {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
    </Helmet>
  );
}

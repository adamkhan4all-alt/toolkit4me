// ---------------------------------------------------------------------
// JSON-LD builders shared by the runtime <SeoHead> and the build-time
// prerender script, so both emit byte-identical structured data and
// there's exactly one definition of each schema.
//
// Only facts the site can stand behind: no ratings, reviews, prices
// other than "free", or features a tool doesn't have.
// ---------------------------------------------------------------------

import { CONTACT_EMAIL, SITE_NAME, SITE_URL, absoluteUrl } from "../../config/site";
import type { ToolDefinition } from "../../types/tool";
import { guideCategoryLabel, guideWordCount, type GuideDefinition } from "../../data/guideMeta";

export type JsonLd = Record<string, unknown>;

const organizationRef = { "@type": "Organization", name: SITE_NAME, url: `${SITE_URL}/` };

export function breadcrumbSchema(crumbs: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function faqSchema(faq: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Homepage only. */
export function websiteSchema(description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description,
    publisher: organizationRef,
  };
}

/** Homepage only. */
export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    ...organizationRef,
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL },
  };
}

export function webApplicationSchema(tool: ToolDefinition): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: absoluteUrl(`/tools/${tool.slug}`),
    description: tool.seo.metaDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organizationRef,
  };
}

export function articleSchema(guide: GuideDefinition): JsonLd {
  const url = absoluteUrl(guide.path);
  const images = guide.sections.flatMap((s) => (s.image ? [absoluteUrl(s.image.src)] : []));
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: guide.title,
    description: guide.metaDescription,
    url,
    mainEntityOfPage: url,
    datePublished: guide.published,
    dateModified: guide.updated,
    articleSection: guideCategoryLabel(guide.category),
    wordCount: guideWordCount(guide),
    ...(images.length ? { image: images } : {}),
    author: organizationRef,
    publisher: organizationRef,
  };
}

/** WebApplication schema for a Calculator Hub page (same shape as tools, with the calculator's own URL). */
export function calculatorSchema(calc: { name: string; path: string; description: string }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: calc.name,
    url: absoluteUrl(calc.path),
    description: calc.description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern web browser with JavaScript enabled.",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: organizationRef,
  };
}

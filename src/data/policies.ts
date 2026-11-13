// ---------------------------------------------------------------------
// Titles, descriptions and dates of the About page and the four policy
// pages — shared by the React pages and scripts/prerender.ts so the
// static and client-rendered <head> always match.
//
// Owner decisions (docs/BLOG_AUDIT_AND_PLAN.md, D4–D6): the operator is
// referred to generically as "the operator of Toolkit4Me"; no legal
// name, governing-law clause, fixed minimum age or log-retention period
// is stated, because none has been provided. Every factual statement
// about data handling is taken from the implementation (see the audit).
// This is not legal advice; have it reviewed before relying on it for
// regulatory compliance.
// ---------------------------------------------------------------------

/** Date the About page and the policy pages were last revised (Blog & Resource Center release). */
export const POLICIES_UPDATED = "2026-11-13";

export interface PolicyMeta {
  path: string;
  /** Visible H1 and breadcrumb label. */
  title: string;
  seoTitle: string;
  description: string;
  /** ISO date of the last revision. */
  updated: string;
}

export const ABOUT_META: PolicyMeta = {
  path: "/about",
  title: "About Toolkit4Me",
  seoTitle: "About Toolkit4Me — Free Online Tools for Everyday Digital Tasks",
  description:
    "What Toolkit4Me is: free PDF, image, developer and creative tools, calculators, link utilities and a blog, how each tool processes your files, and who it's for.",
  updated: POLICIES_UPDATED,
};

export const PRIVACY_META: PolicyMeta = {
  path: "/privacy",
  title: "Privacy Policy",
  seoTitle: "Privacy Policy — Toolkit4Me",
  description:
    "How Toolkit4Me handles your files and data: browser-based vs server processing, file deletion, server logs, short-link analytics, advertising cookies, third-party providers and your rights.",
  updated: POLICIES_UPDATED,
};

export const TERMS_META: PolicyMeta = {
  path: "/terms-of-use",
  title: "Terms of Use",
  seoTitle: "Terms of Use — Toolkit4Me",
  description:
    "The Terms of Use for Toolkit4Me's free online tools, calculators, Link Studio and blog: acceptable use, your files, fair usage, availability, warranties and liability.",
  updated: POLICIES_UPDATED,
};

export const DISCLAIMER_META: PolicyMeta = {
  path: "/disclaimer",
  title: "Disclaimer",
  seoTitle: "Disclaimer — Toolkit4Me",
  description:
    "What you can and can't rely on when using Toolkit4Me: limits of PDF conversion, compression, OCR and calculators, general-information content, external links and availability.",
  updated: POLICIES_UPDATED,
};

export const EDITORIAL_META: PolicyMeta = {
  path: "/editorial-policy",
  title: "Editorial Policy",
  seoTitle: "Editorial Policy — How Toolkit4Me Writes and Checks Content",
  description:
    "How Toolkit4Me researches, writes, checks and updates its blog articles, guides and tool pages: sources, testing, images, AI assistance, independence and corrections.",
  updated: POLICIES_UPDATED,
};

/** The verified public support address — the only contact detail the site publishes. */
export const SUPPORT_EMAIL = "toolkit4me@gmail.com";

import { SITE_NAME } from "../../config/site";
import type { BlogCategory, BlogCategoryId } from "./types";

/** Blog categories, in display order. Adding a category here adds its page, nav entry and sitemap URL. */
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "business-productivity",
    label: "Business & Productivity",
    description: "Everyday office work done faster: document workflows, file handling and the small habits that save time across a team.",
    seoTitle: `Business & Productivity Articles | ${SITE_NAME} Blog`,
    metaDescription: "Practical articles on office productivity: document workflows, file handling and free tools that help teams spend less time on routine digital tasks.",
    badge: "bg-sky-50 text-sky-800",
    relatedGuides: ["/guides/how-to-merge-and-organize-pdfs", "/guides/convert-office-documents-to-pdf", "/guides/how-to-reduce-pdf-file-size"],
  },
  {
    id: "education-learning",
    label: "Education & Learning",
    description: "For students and teachers: organising study material, preparing assignments and handouts, and meeting upload limits.",
    seoTitle: `Education & Learning Articles for Students & Teachers | ${SITE_NAME} Blog`,
    metaDescription: "Articles for students and teachers: organising notes and readings, preparing assignments and handouts, and working with PDFs, scans and upload limits.",
    badge: "bg-emerald-50 text-emerald-800",
    relatedGuides: ["/guides/how-to-extract-text-from-images-ocr", "/guides/scanned-pdf-vs-text-pdf", "/guides/how-to-merge-and-organize-pdfs"],
  },
  {
    id: "career-development",
    label: "Career & Professional Development",
    description: "Digital skills for working life: presenting documents professionally, sharing files with clients and colleagues, and working remotely.",
    seoTitle: `Career & Professional Development Articles | ${SITE_NAME} Blog`,
    metaDescription: "Articles on the digital skills modern work relies on: preparing professional documents, sharing files with clients and colleagues, and remote work.",
    badge: "bg-violet-50 text-violet-800",
    relatedGuides: ["/guides/convert-office-documents-to-pdf", "/guides/how-to-fit-excel-sheet-on-one-page-pdf", "/guides/how-to-convert-pdf-to-word"],
  },
  {
    id: "freelancers-small-business",
    label: "Freelancers & Small Businesses",
    description: "Running a small operation without a big software budget: documents, images, pricing maths and marketing links.",
    seoTitle: `Articles for Freelancers & Small Businesses | ${SITE_NAME} Blog`,
    metaDescription: "Practical help for freelancers and small businesses: professional documents, images, pricing calculations and marketing links using free online tools.",
    badge: "bg-amber-50 text-amber-800",
    relatedGuides: ["/guides/how-to-compress-images", "/guides/how-to-reduce-pdf-file-size", "/guides/convert-office-documents-to-pdf"],
  },
  {
    id: "technology-ai",
    label: "Technology & AI",
    description: "How the technology behind everyday tools works — OCR, file formats, browser-based processing — explained without hype.",
    seoTitle: `Technology & AI Articles — OCR, File Formats & Web Tools | ${SITE_NAME} Blog`,
    metaDescription: "Plain-English articles on the technology behind everyday digital tools: OCR, image and document formats, browser-based processing and practical AI.",
    badge: "bg-indigo-50 text-indigo-800",
    relatedGuides: ["/guides/how-to-extract-text-from-images-ocr", "/guides/jpg-vs-png", "/guides/scanned-pdf-vs-text-pdf"],
  },
  {
    id: "digital-tools-tutorials",
    label: "Digital Tools & Tutorials",
    description: "Walk-throughs of real workflows that combine several tools, with the reasons behind each step.",
    seoTitle: `Digital Tools & Tutorials | ${SITE_NAME} Blog`,
    metaDescription: "Step-by-step tutorials for real workflows that combine free online tools — PDFs, images, text and links — with the reasoning behind each step.",
    badge: "bg-teal-50 text-teal-800",
    relatedGuides: ["/guides/how-to-compress-images", "/guides/how-to-merge-and-organize-pdfs", "/guides/how-to-convert-webp-to-jpg"],
  },
  {
    id: "security-privacy",
    label: "Online Security & Privacy",
    description: "Sharing files and links safely: hidden data in documents and photos, passwords, redaction and tracking parameters.",
    seoTitle: `Online Security & Privacy Articles | ${SITE_NAME} Blog`,
    metaDescription: "Articles on sharing files and links safely: hidden data in documents and photos, PDF passwords, redaction, and removing tracking parameters from links.",
    badge: "bg-rose-50 text-rose-800",
    relatedGuides: ["/guides/how-to-password-protect-a-pdf", "/guides/what-is-exif-data-and-how-to-remove-it", "/guides/scanned-pdf-vs-text-pdf"],
  },
];

export function getBlogCategory(id: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.id === id);
}

export function blogCategoryLabel(id: BlogCategoryId): string {
  return getBlogCategory(id)?.label ?? id;
}

export function blogCategoryPath(id: BlogCategoryId): string {
  return `/blog/category/${id}`;
}

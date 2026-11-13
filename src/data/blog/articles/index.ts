// Every article, drafts included. Adding an article: create ./<slug>.ts exporting `article`, add it here, and run
// `npm run seo:generate` (part of dev and build) to refresh the listing index, loaders and sitemap.
//
// Only build-time code (prerender, sitemap, generator) and tests import this file. The app imports
// ../blogIndex.generated.ts instead, so article text is never in a shared bundle.
import type { BlogArticle } from "../types";
import { article as freeOnlineToolsForSmallBusinesses } from "./free-online-tools-for-small-businesses";
import { article as howStudentsCanUsePdfTools } from "./how-students-can-use-pdf-tools-to-study-efficiently";
import { article as protectSensitiveInformation } from "./how-to-protect-sensitive-information-before-sharing-documents";
import { article as professionalDocumentsForFreelancers } from "./professional-documents-for-freelancers-without-expensive-software";
import { article as browserBasedWorkflow } from "./improve-your-digital-workflow-with-browser-based-tools";

export const ALL_ARTICLES: BlogArticle[] = [
  freeOnlineToolsForSmallBusinesses,
  howStudentsCanUsePdfTools,
  protectSensitiveInformation,
  professionalDocumentsForFreelancers,
  browserBasedWorkflow,
];

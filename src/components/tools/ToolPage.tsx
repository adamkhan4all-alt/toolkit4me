import type { ToolDefinition } from "../../types/tool";
import { getClientProcessor } from "../../lib/processing/clientProcessors";
import { ToolHeader } from "./ToolHeader";
import { UploadWorkspace } from "./UploadWorkspace";
import { ClientToolWorkspace } from "./ClientToolWorkspace";
import { ToolInstructions } from "./ToolInstructions";
import { SupportedFormats } from "./SupportedFormats";
import { PrivacySection } from "./PrivacySection";
import { FAQ } from "./FAQ";
import { RelatedTools } from "./RelatedTools";
import { AdInContent, AdMobile, AdSidebar } from "../ads";
import { SeoHead } from "../seo/SeoHead";

/**
 * The generic tool page framework (Phase 2 spec, Section 4). This is the
 * ONLY layout used for every tool — it is pure composition of reusable
 * components driven entirely by a ToolDefinition. No tool-specific markup
 * exists anywhere in this file or its children.
 *
 * The one branch here is intentional and stays generic: a tool with a
 * registered ClientProcessor (real, in-browser processing) renders
 * ClientToolWorkspace; every other tool falls back to the mocked
 * UploadWorkspace until its real backend exists. Nothing tool-specific
 * leaks into this file either way.
 *
 * SEO (Phase 8): every field this page renders — title, description, H1,
 * intro copy, how-it-works steps, formats, FAQ — comes from the tool's own
 * ToolDefinition, so every one of the 10 routes gets genuinely unique
 * head metadata and body content, never shared boilerplate.
 *
 * Advertising (Phase 9): every ad placement below is deliberately kept
 * out of the workspace block (upload/options/process button/result) —
 * there is always at least one full informational section between the
 * workspace and the first ad, on every screen size, so nothing ad-related
 * ever sits "immediately beside" the primary action a visitor came to use.
 * The desktop sidebar ad lives in its own layout column, never overlapping
 * the workspace column; the mobile ad is a small in-flow block, never
 * fixed/sticky, so it can't dock itself over the upload area or a
 * download button on a small screen.
 */
export function ToolPage({ tool }: { tool: ToolDefinition }) {
  const hasClientProcessor = Boolean(getClientProcessor(tool.id));

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-8 sm:px-6">
      <SeoHead
        title={tool.seo.title}
        description={tool.seo.metaDescription}
        path={`/tools/${tool.slug}`}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: tool.categoryLabel, path: `/tools?category=${tool.category}` },
          { name: tool.name, path: `/tools/${tool.slug}` },
        ]}
        faq={tool.faq}
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-8 lg:max-w-[720px]">
          <ToolHeader tool={tool} />

          {hasClientProcessor ? <ClientToolWorkspace tool={tool} /> : <UploadWorkspace tool={tool} />}

          <section aria-labelledby="intro-heading" className="flex flex-col gap-4">
            <h2 id="intro-heading" className="text-2xl font-semibold text-neutral-900">
              About this tool
            </h2>
            {tool.intro.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-6 text-neutral-600">
                {paragraph}
              </p>
            ))}
          </section>

          <ToolInstructions steps={tool.howItWorks} />

          <SupportedFormats tool={tool} />

          {/* First ad placement: below a full block of informational content
              (intro, how-it-works, supported formats), well separated from
              the workspace/process button above. */}
          <AdInContent />

          <section aria-labelledby="features-heading" className="flex flex-col gap-4">
            <h2 id="features-heading" className="text-2xl font-semibold text-neutral-900">
              Features
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tool.features.map((feature) => (
                <div key={feature} className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-900">
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <PrivacySection tool={tool} />

          {/* Mobile-only secondary placement — small, in-flow, never fixed,
              so it can't interfere with scrolling back up to re-run the
              tool or download a result on a small screen. */}
          <AdMobile />

          <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
            <h2 id="faq-heading" className="text-2xl font-semibold text-neutral-900">
              Frequently asked questions
            </h2>
            <FAQ items={tool.faq} />
          </section>

          <RelatedTools tool={tool} />
        </div>

        {/* Desktop sidebar: its own layout column, beside — never
            overlapping — the workspace/content column above. */}
        <aside className="hidden lg:block">
          <AdSidebar />
        </aside>
      </div>
    </div>
  );
}

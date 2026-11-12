import { Link } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { ToolCard } from "../components/tools/ToolCard";
import { AdInContent } from "../components/ads";
import { FAQ } from "../components/tools/FAQ";
import { SectionBody } from "../components/content/SectionBody";
import { sectionId } from "../data/guideMeta";
import { SeoHead } from "../components/seo/SeoHead";
import type { HubDefinition } from "../data/hubs";
import { toolRegistry } from "../lib/toolRegistry";
import { hubGroups, hubGuides } from "../lib/hubContent";

export function HubPage({ hub }: { hub: HubDefinition }) {
  const tools = toolRegistry.getByHub(hub.id);
  const groups = hubGroups(tools);
  const guides = hubGuides(hub);
  const otherHubs = toolRegistry.getHubs().filter((h) => h.id !== hub.id);
  const related = (hub.relatedTools?.ids ?? []).map((id) => toolRegistry.getById(id)).filter((t) => t !== undefined);

  return (
    <div className="flex flex-col gap-12 pb-16">
      <SeoHead
        title={hub.seoTitle}
        description={hub.metaDescription}
        path={hub.path}
        faq={hub.faq}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: hub.name, path: hub.path },
        ]}
      />
      <section className="hero-backdrop pt-8 pb-10 sm:pt-12">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 sm:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: hub.name }]} />
          <span aria-hidden="true" className={`inline-flex w-fit rounded-lg px-2.5 py-1 text-xs font-bold ${hub.accent}`}>
            {hub.icon}
          </span>
          <h1 className="text-[32px] leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-[44px]">{hub.h1}</h1>
          <p className="text-lg font-medium text-neutral-700">{hub.tagline}</p>
          {hub.strapline && <p className="-mt-2 text-base text-neutral-600">{hub.strapline}</p>}
          <div className="flex max-w-[760px] flex-col gap-3">
            {hub.intro.map((p) => (
              <p key={p} className="text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
                {p}
              </p>
            ))}
          </div>
          {hub.callout && (
            <div className="flex max-w-[760px] flex-col gap-1 rounded-[var(--radius-card)] border border-neutral-200 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-neutral-900">{hub.callout.title}:</span> {hub.callout.body}
              </p>
              <Link to={hub.callout.href} rel="nofollow" className="focus-ring shrink-0 rounded text-sm font-semibold text-brand-700 hover:underline">
                {hub.callout.linkLabel}
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 sm:px-6">
        {groups.map((group) => (
          <section key={group.label} aria-labelledby={`group-${group.label}`} className="flex flex-col gap-4">
            <h2 id={`group-${group.label}`} className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        ))}

        {hub.relatedTools && related.length > 0 && (
          <section aria-labelledby="hub-related" className="flex flex-col gap-4">
            <h2 id="hub-related" className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {hub.relatedTools.label}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {related.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        )}

        <AdInContent />

        {hub.sections?.map((section) => (
          <section key={section.heading} aria-labelledby={sectionId(section.heading)} className="flex max-w-[860px] flex-col gap-4">
            <h2 id={sectionId(section.heading)} className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {section.heading}
            </h2>
            <SectionBody section={section} />
          </section>
        ))}

        {hub.faq && hub.faq.length > 0 && (
          <section aria-labelledby="hub-faq" className="flex max-w-[860px] flex-col gap-4">
            <h2 id="hub-faq" className="text-xl font-bold text-neutral-900 sm:text-2xl">
              Frequently asked questions
            </h2>
            <FAQ items={hub.faq} />
          </section>
        )}

        {guides.length > 0 && (
          <section aria-labelledby="hub-guides" className="flex flex-col gap-4">
            <h2 id="hub-guides" className="text-xl font-bold text-neutral-900 sm:text-2xl">
              Guides for {hub.name.toLowerCase()}
            </h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {guides.map((g) => (
                <li key={g.path}>
                  <Link to={g.path} className="focus-ring block rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 hover:border-brand-100 hover:text-brand-700">
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/guides" className="focus-ring w-fit rounded text-sm font-semibold text-brand-700 hover:underline">
              All guides →
            </Link>
          </section>
        )}

        {otherHubs.length > 0 && (
          <nav aria-label="Other tool sections" className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">More tools</h2>
            <div className="flex flex-wrap gap-2">
              {otherHubs.map((h) => (
                <Link key={h.id} to={h.path} className="focus-ring rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-brand-100 hover:text-brand-700">
                  {h.name}
                </Link>
              ))}
              <Link to="/tools" className="focus-ring rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:border-brand-100 hover:text-brand-700">
                All tools
              </Link>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

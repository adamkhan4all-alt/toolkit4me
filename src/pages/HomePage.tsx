import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/layout/SearchBar";
import { ToolCard } from "../components/tools/ToolCard";
import { FAQ } from "../components/tools/FAQ";
import { AdBanner, AdInContent, AdMobile } from "../components/ads";
import { SeoHead } from "../components/seo/SeoHead";
import { toolRegistry } from "../lib/toolRegistry";
import { GUIDE_INDEX } from "../data/guideIndex.generated";
import { HOME_FAQ, HOME_HEADLINE, HOME_SUBHEAD } from "../data/home";
import { organizationSchema, websiteSchema } from "../lib/seo/structuredData";
import { HOME_DESCRIPTION } from "../config/site";

/** Tools shown per hub section before "View all". */
const HUB_PREVIEW_COUNT = 6;

const trustPoints = [
  {
    title: "Free, no sign-up",
    body: "Every tool is free to use, with no account, no subscription and no watermark on your files.",
  },
  {
    title: "Private by design",
    body: "Most tools run entirely in your browser, so your file never leaves your device. Server-based tools delete files automatically within an hour.",
  },
  {
    title: "Honest about limits",
    body: "Each tool page explains what it does, what it can't do and the file limits — tested with real files before it's published.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const hubs = toolRegistry.getHubs();
  const toolCount = toolRegistry.getAll().length;
  const featured = toolRegistry.getFeatured();
  const recent = toolRegistry.getRecentlyAdded(4);
  const guides = GUIDE_INDEX.filter((g) => g.featured).slice(0, 3);

  return (
    <div className="flex flex-col gap-14 pb-16 sm:gap-16">
      <SeoHead
        title="Toolkit4Me — Free Tools for Everyday Digital Tasks"
        description={HOME_DESCRIPTION}
        path="/"
        jsonLd={[websiteSchema(HOME_DESCRIPTION), organizationSchema()]}
      />

      <section className="hero-backdrop px-4 pt-12 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 text-center">
          <span className="animate-fade-up rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700">
            {toolCount} free tools · no sign-up · nothing to install
          </span>
          <h1 className="animate-fade-up text-[34px] leading-[1.1] font-extrabold tracking-tight text-neutral-900 sm:text-[56px]">
            {HOME_HEADLINE.replace("One Toolkit.", "")}
            <span className="brand-gradient-text">One Toolkit.</span>
          </h1>
          <p className="max-w-[600px] text-base text-neutral-600 sm:text-lg">{HOME_SUBHEAD}</p>
          <div className="w-full max-w-[640px]">
            <SearchBar large onSelect={(slug) => navigate(`/tools/${slug}`)} />
          </div>
          <nav aria-label="Tool sections" className="flex flex-wrap justify-center gap-2">
            {hubs.map((hub) => (
              <Link
                key={hub.id}
                to={hub.path}
                className="focus-ring rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:border-brand-100 hover:text-brand-700"
              >
                {hub.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Ad break between the hero and the tools — between sections, never inside either. */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <AdBanner />
        <AdMobile />
      </div>

      <section aria-labelledby="featured-heading" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <h2 id="featured-heading" className="mb-5 text-2xl font-bold tracking-tight text-neutral-900">
          Featured tools
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {featured.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {hubs.map((hub, index) => {
        const tools = toolRegistry.getByHub(hub.id);
        return (
          <div key={hub.id} className="contents">
            <section aria-labelledby={`hub-${hub.id}`} className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className={`mt-1 inline-flex rounded-lg px-2 py-1 text-xs font-bold ${hub.accent}`}>
                    {hub.icon}
                  </span>
                  <div>
                    <h2 id={`hub-${hub.id}`} className="text-2xl font-bold tracking-tight text-neutral-900">
                      {hub.name}
                    </h2>
                    <p className="text-sm text-neutral-600">{hub.tagline}</p>
                  </div>
                </div>
                <Link to={hub.path} className="focus-ring rounded text-sm font-semibold text-brand-700 hover:underline">
                  View all {tools.length} →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {tools.slice(0, HUB_PREVIEW_COUNT).map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
            {/* One in-content ad after the first hub section, well away from the hero search. */}
            {index === 0 && (
              <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
                <AdInContent />
              </div>
            )}
          </div>
        );
      })}

      <section aria-labelledby="recent-heading" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <h2 id="recent-heading" className="mb-5 text-2xl font-bold tracking-tight text-neutral-900">
          Recently added
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {recent.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section aria-labelledby="sections-heading" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <h2 id="sections-heading" className="mb-5 text-2xl font-bold tracking-tight text-neutral-900">
          Browse all categories
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {hubs.map((hub) => (
            <Link
              key={hub.id}
              to={hub.path}
              className="focus-ring card-lift group flex flex-col gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-5"
            >
              <span aria-hidden="true" className={`inline-flex w-fit rounded-lg px-2 py-1 text-xs font-bold ${hub.accent}`}>
                {hub.icon}
              </span>
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-700">{hub.name}</h3>
              <p className="text-sm text-neutral-600">{hub.tagline}</p>
              <span className="text-xs font-medium text-neutral-600">{toolRegistry.getByHub(hub.id).length} tools</span>
            </Link>
          ))}
          <Link
            to="/tools"
            className="focus-ring card-lift group flex flex-col justify-center gap-1 rounded-[var(--radius-card)] border border-dashed border-brand-100 bg-brand-50 p-5"
          >
            <h3 className="text-lg font-semibold text-brand-700">All {toolCount} tools →</h3>
            <p className="text-sm text-neutral-600">Search and filter the full directory.</p>
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {trustPoints.map((point) => (
            <div key={point.title} className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-neutral-900">{point.title}</h3>
              <p className="text-sm leading-6 text-neutral-600">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">About our tools</h2>
        <p className="text-sm leading-6 text-neutral-600">
          Toolkit4Me brings together the everyday document and image tools people need most, from{" "}
          <Link to="/tools/pdf-to-word" className="text-brand-700 underline">PDF to Word</Link> and{" "}
          <Link to="/tools/word-to-pdf" className="text-brand-700 underline">Word to PDF</Link> conversion to{" "}
          <Link to="/tools/compress-pdf" className="text-brand-700 underline">PDF compression</Link>,{" "}
          <Link to="/tools/merge-pdf" className="text-brand-700 underline">merging</Link>,{" "}
          <Link to="/tools/pdf-page-numbers" className="text-brand-700 underline">page numbering</Link> and password protection. There's no
          software to install and no account required.
        </p>
        <p className="text-sm leading-6 text-neutral-600">
          Working with images? Convert between <Link to="/tools/jpg-to-png" className="text-brand-700 underline">JPG and PNG</Link>, turn
          scans into editable text with <Link to="/tools/image-to-text" className="text-brand-700 underline">Image to Text</Link>, shrink
          large photos with <Link to="/tools/compress-image" className="text-brand-700 underline">Compress Image</Link>, or resize and convert
          to <Link to="/tools/webp-converter" className="text-brand-700 underline">WebP</Link> right in your browser.
        </p>
        <p className="text-sm leading-6 text-neutral-600">
          For writing and web work, use the <Link to="/tools/word-counter" className="text-brand-700 underline">Word Counter</Link>,{" "}
          <Link to="/tools/text-compare" className="text-brand-700 underline">Text Compare</Link>,{" "}
          <Link to="/tools/json-formatter" className="text-brand-700 underline">JSON Formatter</Link>,{" "}
          <Link to="/tools/base64-encoder-decoder" className="text-brand-700 underline">Base64 encoder</Link>,{" "}
          <Link to="/tools/meta-tag-generator" className="text-brand-700 underline">Meta Tag Generator</Link> and{" "}
          <Link to="/tools/qr-code-generator" className="text-brand-700 underline">QR Code Generator</Link>.
        </p>
      </section>

      <section aria-labelledby="guides-heading" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="guides-heading" className="text-2xl font-bold tracking-tight text-neutral-900">
            Guides &amp; tips
          </h2>
          <Link to="/guides" className="focus-ring rounded text-sm font-semibold text-brand-700 hover:underline">
            All guides →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.path}
              to={guide.path}
              className="focus-ring card-lift group flex flex-col gap-2 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-5"
            >
              <h3 className="text-base font-semibold text-neutral-900 group-hover:text-brand-700">{guide.title}</h3>
              <p className="text-sm leading-6 text-neutral-600">{guide.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-faq-heading" className="mx-auto flex w-full max-w-[860px] flex-col gap-4 px-4 sm:px-6">
        <h2 id="home-faq-heading" className="text-2xl font-bold tracking-tight text-neutral-900">
          Frequently asked questions
        </h2>
        <FAQ items={HOME_FAQ} />
      </section>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { SearchBar } from "../components/layout/SearchBar";
import { ToolCard } from "../components/tools/ToolCard";
import { AdBanner, AdInContent, AdMobile } from "../components/ads";
import { SeoHead } from "../components/seo/SeoHead";
import { toolRegistry } from "../lib/toolRegistry";

const trustPoints = [
  { title: "Secure", body: "Files are transferred over encrypted connections and deleted automatically after 1 hour." },
  { title: "Fast", body: "Most conversions and compressions finish in a few seconds, right in your browser." },
  { title: "Free", body: "Every tool is free to use, with no account required and no watermarks added." },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-16 pb-16">
      <SeoHead
        title="Toolkit4Me — Free Tools for Everyday Digital Tasks"
        description="Toolkit4Me provides free online tools for everyday digital tasks, including PDF conversion, image conversion, compression and OCR."
        path="/"
      />
      <section className="bg-neutral-100 px-4 pt-12 pb-10 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center">
          <h1 className="text-[28px] leading-tight font-bold text-neutral-900 sm:text-[40px] sm:leading-[48px]">
            Toolkit4Me
          </h1>
          <p className="text-lg font-medium text-neutral-700 sm:text-xl">Free tools for everyday digital tasks.</p>
          <p className="max-w-[560px] text-base text-neutral-600">
            Toolkit4Me provides free online tools for converting, compressing and working with documents and images.
          </p>
          <div className="w-full max-w-[640px]">
            <SearchBar large onSelect={(slug) => navigate(`/tools/${slug}`)} />
          </div>
        </div>
      </section>

      {/* Ad break between the hero and the tools grid — between major sections, never inside either. */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <AdBanner />
        <AdMobile />
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-semibold text-neutral-900">Popular Tools</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {toolRegistry.getAll().map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Ad break between the tools grid and the trust-points section. */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <AdInContent />
      </div>

      <section className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {trustPoints.map((point) => (
            <div key={point.title} className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-neutral-900">{point.title}</h3>
              <p className="text-sm text-neutral-600">{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-neutral-900">About our tools</h2>
        <p className="text-sm leading-6 text-neutral-600">
          Our platform brings together the everyday document and image tools people need most, from{" "}
          <a href="/tools/pdf-to-word" className="text-brand-600 hover:underline">PDF to Word</a> and{" "}
          <a href="/tools/word-to-pdf" className="text-brand-600 hover:underline">Word to PDF</a> conversion to{" "}
          <a href="/tools/compress-pdf" className="text-brand-600 hover:underline">PDF compression</a> and{" "}
          <a href="/tools/merge-pdf" className="text-brand-600 hover:underline">merging</a>. Everything runs directly
          in your browser — no software to install and no account required.
        </p>
        <p className="text-sm leading-6 text-neutral-600">
          Working with images? Convert between{" "}
          <a href="/tools/jpg-to-png" className="text-brand-600 hover:underline">JPG and PNG</a>, turn scans into
          searchable text with our <a href="/tools/image-to-text" className="text-brand-600 hover:underline">OCR tool</a>,
          or shrink large photos with <a href="/tools/compress-image" className="text-brand-600 hover:underline">Compress
          Image</a>. Every file you upload is processed securely and removed from our servers automatically.
        </p>
      </section>
    </div>
  );
}

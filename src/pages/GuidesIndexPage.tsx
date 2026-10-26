import { Link } from "react-router-dom";
import { Breadcrumb } from "../components/layout/Breadcrumb";
import { SeoHead } from "../components/seo/SeoHead";
import { GUIDES } from "../data/guides";

export function GuidesIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6">
      <SeoHead
        title="Guides — PDF & Image How-Tos | Toolkit4Me"
        description="Practical, plain-English guides to working with PDFs and images: shrinking files, choosing formats, OCR, merging and password protection."
        path="/guides"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Guides" }]} />

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[32px]">Guides</h1>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          Practical explanations of the file formats and tasks behind our tools — why files get large, which format to pick,
          and how to get the cleanest result.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.path}
            to={guide.path}
            className="focus-ring group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-brand-600"
          >
            <h2 className="text-base font-semibold text-neutral-900 group-hover:text-brand-600">{guide.title}</h2>
            <p className="text-sm leading-6 text-neutral-600">{guide.summary}</p>
            <span className="mt-auto pt-2 text-sm font-medium text-brand-700">Read guide →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { SeoHead } from "../components/seo/SeoHead";

const LAST_UPDATED = "November 3, 2026";

const linkClass = "text-brand-600 underline hover:text-brand-700";

export function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <SeoHead
        title="Editorial Policy — Toolkit4Me"
        description="How Toolkit4Me writes, checks and updates its tool pages and guides, and how advertising is kept separate from content."
        path="/editorial-policy"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Editorial Policy", path: "/editorial-policy" },
        ]}
      />

      <h1 className="mb-2 text-3xl font-bold text-neutral-900">Editorial Policy</h1>
      <p className="mb-10 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <div className="flex flex-col gap-8 text-sm leading-6 text-neutral-700">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">What we publish</h2>
          <p>
            Toolkit4Me publishes two kinds of content: a page for each tool, explaining what it does, how to use it
            and what its limits are; and <Link to="/guides" className={linkClass}>guides</Link> that explain the file
            formats and everyday tasks behind those tools — why PDFs get large, when to use JPG or PNG, how OCR works,
            and so on. We only write about tasks our tools actually support.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Accuracy comes first</h2>
          <ul className="list-disc pl-5">
            <li>
              Tool descriptions are written from how each tool actually works, and checked by running real files
              through it. Formats, file-size limits and file-handling details are taken from the tool's
              implementation, not from marketing copy.
            </li>
            <li>
              Every tool page lists its limitations — for example, that{" "}
              <Link to="/tools/pdf-to-word" className={linkClass}>PDF to Word</Link> converts text but not layout —
              so you know before you upload whether it will do what you need.
            </li>
            <li>
              We don't promise results we can't guarantee, such as a fixed compression percentage or perfect OCR
              accuracy. Where we quote a figure, it comes from a test we ran, and we say so.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">How content is produced</h2>
          <p>
            Pages may be drafted with the help of AI writing tools. Nothing is published on that basis alone: each
            page is checked against the tool's real behaviour and the facts it states, and edited so that it's
            useful, specific and accurate. We don't publish pages written only to target search keywords.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Updates and corrections</h2>
          <p>
            Guides show the date they were last updated. When a tool changes — a new option, a different limit — we
            update its page and any guide that mentions it. If you spot something wrong or out of date, email{" "}
            <a href="mailto:toolkit4me@gmail.com" className={linkClass}>toolkit4me@gmail.com</a> and we'll check it
            and correct it.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Advertising is kept separate</h2>
          <p>
            The site is funded by advertising from Google AdSense. Advertisers have no influence over what we write,
            we don't publish sponsored content or paid reviews, and every ad is labelled "Advertisement" and kept
            away from upload areas and download buttons so it can't be mistaken for part of a tool. See the{" "}
            <Link to="/disclaimer" className={linkClass}>Disclaimer</Link> and{" "}
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link> for more.
          </p>
        </section>
      </div>
    </div>
  );
}

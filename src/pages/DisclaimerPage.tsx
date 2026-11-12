import { Link } from "react-router-dom";
import { SeoHead } from "../components/seo/SeoHead";

// Written to match the tools' actual, verified behaviour (see each tool's
// "Limitations" in src/data/tools.ts) — not legal advice.
const LAST_UPDATED = "November 12, 2026";

const linkClass = "text-brand-600 underline hover:text-brand-700";

export function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <SeoHead
        title="Disclaimer — Toolkit4Me"
        description="What you can and can't rely on when using Toolkit4Me's free online tools and guides."
        path="/disclaimer"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Disclaimer", path: "/disclaimer" },
        ]}
      />

      <h1 className="mb-2 text-3xl font-bold text-neutral-900">Disclaimer</h1>
      <p className="mb-10 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <div className="flex flex-col gap-8 text-sm leading-6 text-neutral-700">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Tools are provided as is</h2>
          <p>
            Toolkit4Me's tools are free and provided "as is". We test them carefully, but file conversion depends
            heavily on the file you start with, and no converter handles every document perfectly. Always keep your
            original file, and check the result before you send, print or submit it — especially for anything
            important, such as legal, financial or official documents.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Known limitations</h2>
          <p className="mb-3">
            Every tool page has a "Limitations" section describing what that tool can't do. The most important ones:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <Link to="/tools/pdf-to-word" className={linkClass}>PDF to Word</Link> converts the text of a PDF into
              editable paragraphs; it does not reproduce the original layout, fonts, tables or images.
            </li>
            <li>
              Text recognition (OCR) in{" "}
              <Link to="/tools/image-to-text" className={linkClass}>Image to Text</Link> and for scanned PDFs is never
              100% accurate. Check names, numbers and dates against the original.
            </li>
            <li>
              Word, PowerPoint and Excel conversions replace fonts our server doesn't have with similar ones, which
              can move line or page breaks.
            </li>
            <li>
              Compression results depend on the content: image-heavy files shrink most, while text-only files may
              barely change.
            </li>
            <li>
              The <Link to="/pixel-playground" className={linkClass}>Pixel Playground</Link> tools use classic image
              techniques, not AI. Background removal works by colour, so it suits plain backgrounds only; a light blur
              can sometimes be partly reversed, so use pixelation or a solid box for sensitive details.
            </li>
            <li>
              The <Link to="/tools/passport-photo-maker" className={linkClass}>Passport Photo Maker</Link> produces the
              right size and head proportions, but acceptance also depends on lighting, expression and each
              authority's current rules. We can't guarantee a photo will be accepted — check the official guidance.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Guides are general information</h2>
          <p>
            Our <Link to="/guides" className={linkClass}>guides</Link> explain file formats and how to get good results
            with common tasks. They are general information, not legal, financial, security or other professional
            advice. If a document has legal or regulatory requirements (for example, a court filing or a government
            application), follow the instructions of the organisation you're submitting it to.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Your files and permissions</h2>
          <p>
            Only process files you have the right to use. The PDF password tools work only with the correct password
            and never attempt to crack or bypass protection; use them only on documents you own or are authorised to
            open and change. When you edit photos of other people, or make memes, stickers and thumbnails from
            pictures you didn't take, make sure you have permission and respect their privacy and copyright.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Advertising and external links</h2>
          <p>
            The site is supported by advertising served by Google AdSense. Ads are chosen by Google, not by us, and
            appearing on this site is not an endorsement of any advertiser. Links to external websites are provided
            for convenience; we aren't responsible for their content.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Trademarks</h2>
          <p>
            Microsoft Word, Excel and PowerPoint are trademarks of Microsoft Corporation. PDF is an open standard
            (ISO 32000) originally developed by Adobe. Other product names are trademarks of their respective
            owners. Toolkit4Me is not affiliated with, or endorsed by, any of these companies; their names are used
            only to describe the file formats our tools work with.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Questions</h2>
          <p>
            See our <Link to="/terms" className={linkClass}>Terms of Service</Link> and{" "}
            <Link to="/privacy" className={linkClass}>Privacy Policy</Link>, or contact us at{" "}
            <a href="mailto:toolkit4me@gmail.com" className={linkClass}>toolkit4me@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

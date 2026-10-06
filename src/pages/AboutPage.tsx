import { Link } from "react-router-dom";
import { SeoHead } from "../components/seo/SeoHead";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <SeoHead
        title="About Toolkit4Me"
        description="What Toolkit4Me is, how it processes your files, and the principles behind it — free PDF and image tools with no account required."
        path="/about"
      />

      <h1 className="mb-8 text-3xl font-bold text-neutral-900">About Toolkit4Me</h1>

      <div className="flex flex-col gap-8 text-sm leading-6 text-neutral-700">
        <section>
          <p>
            Toolkit4Me is a collection of free, browser-based tools for the document and image tasks people run into
            constantly: converting a PDF to Word, merging a few PDFs into one, shrinking a photo before uploading it
            somewhere, pulling text out of a scanned page. Nothing here requires an account, a subscription, or your
            email address — you open the tool you need, use it, and you're done.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Why it exists</h2>
          <p>
            Most "free" online tools for this kind of task bury the actual tool under walls of ads, force a sign-up
            for basic functionality, or add a watermark to anything you weren't willing to pay for. Toolkit4Me is
            built the other way around: the tool is the whole point. It stays free, requires nothing from you up
            front, and doesn't water down the output.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">How it works</h2>
          <p className="mb-3">
            Tools on this site work one of two ways, and each tool's page says which:
          </p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Entirely in your browser.</strong> Several tools — compressing an image, converting between
              JPG and PNG, splitting or editing a PDF — process the file on your own device using JavaScript. The
              file is never uploaded anywhere.
            </li>
            <li>
              <strong>Processed on our server.</strong> Tools that need heavier processing (Word/PDF conversion,
              OCR, PowerPoint and Excel conversion) upload your file over an encrypted connection, process it, and
              return the result. The file is then <strong>deleted automatically one hour later</strong>, whether or
              not you downloaded it. Full details are in the{" "}
              <Link to="/privacy" className="text-brand-600 underline hover:text-brand-700">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">What's here</h2>
          <p>
            The tools are organized into six areas —{" "}
            <Link to="/tools?category=convert" className="text-brand-600 underline hover:text-brand-700">
              Convert
            </Link>
            ,{" "}
            <Link to="/tools?category=compress" className="text-brand-600 underline hover:text-brand-700">
              Compress
            </Link>
            ,{" "}
            <Link to="/tools?category=merge" className="text-brand-600 underline hover:text-brand-700">
              Merge
            </Link>
            ,{" "}
            <Link to="/tools?category=ocr" className="text-brand-600 underline hover:text-brand-700">
              OCR
            </Link>
            ,{" "}
            <Link to="/tools?category=edit" className="text-brand-600 underline hover:text-brand-700">
              Edit
            </Link>
            , and{" "}
            <Link to="/tools?category=security" className="text-brand-600 underline hover:text-brand-700">
              Security
            </Link>{" "}
            — covering PDF and image conversion, compression, merging and splitting PDFs, extracting text from
            scans and photos, a direct PDF editor, and password-protecting or unlocking PDFs. The full, current list
            is always on the{" "}
            <Link to="/tools" className="text-brand-600 underline hover:text-brand-700">
              All Tools
            </Link>{" "}
            page — new tools get added there as they're built.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">How it's funded</h2>
          <p>
            Toolkit4Me is supported by advertising rather than subscriptions or paywalls, so every tool stays free
            and fully usable. There's more on what that means for cookies and data in the{" "}
            <Link to="/privacy" className="text-brand-600 underline hover:text-brand-700">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Questions or feedback</h2>
          <p>
            If something doesn't work the way it should, or you want to suggest a tool, see the{" "}
            <Link to="/contact" className="text-brand-600 underline hover:text-brand-700">
              Contact
            </Link>{" "}
            page.
          </p>
        </section>
      </div>
    </div>
  );
}

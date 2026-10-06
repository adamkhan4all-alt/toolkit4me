import { Link } from "react-router-dom";
import { SeoHead } from "../components/seo/SeoHead";

export function ContactPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <SeoHead
        title="Contact Toolkit4Me"
        description="Get in touch with Toolkit4Me — bug reports, tool requests, or privacy questions."
        path="/contact"
      />

      <h1 className="mb-8 text-3xl font-bold text-neutral-900">Contact</h1>

      <div className="flex flex-col gap-6 text-sm leading-6 text-neutral-700">
        <p>
          Reach us at{" "}
          <a href="mailto:adamkhan4all@gmail.com" className="text-brand-600 underline hover:text-brand-700">
            adamkhan4all@gmail.com
          </a>{" "}
          for any of the following:
        </p>

        <ul className="list-disc pl-5">
          <li>A tool isn't working, or produced an incorrect result</li>
          <li>A tool you'd like to see added</li>
          <li>Questions about how a file was processed, or a privacy request</li>
          <li>Anything else about the site</li>
        </ul>

        <p>
          For details on what happens to a file you upload and how long it's kept, see the{" "}
          <Link to="/privacy" className="text-brand-600 underline hover:text-brand-700">
            Privacy Policy
          </Link>
          . For the rules around using the site, see the{" "}
          <Link to="/terms" className="text-brand-600 underline hover:text-brand-700">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

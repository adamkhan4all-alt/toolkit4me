import { SeoHead } from "../components/seo/SeoHead";

// See the note at the top of PrivacyPolicyPage.tsx — same caveat applies
// here: written to match this app's actual behavior, not legal advice.

const LAST_UPDATED = "September 23, 2026";

export function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <SeoHead
        title="Terms of Service — Toolkit4Me"
        description="The terms that apply when you use Toolkit4Me's free online PDF and image tools."
        path="/terms"
      />

      <h1 className="mb-2 text-3xl font-bold text-neutral-900">Terms of Service</h1>
      <p className="mb-10 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <div className="flex flex-col gap-8 text-sm leading-6 text-neutral-700">
        <section>
          <p>
            These Terms of Service ("Terms") govern your use of toolkit4me.com and the tools it provides
            (together, the "Service"), operated by Toolkit4Me ("we", "us", "our"). By using the Service, you agree
            to these Terms. If you don't agree, please don't use the Service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">The Service</h2>
          <p>
            Toolkit4Me provides free, browser-based tools for converting, compressing, merging, editing, and
            otherwise processing documents and images. No account or payment is required. Some tools process files
            entirely on your own device; others upload your file to our servers for processing and then delete it
            automatically (see our <a href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</a>{" "}
            for details).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Your files and content</h2>
          <p className="mb-3">
            You retain all ownership rights to any file you upload or process through the Service. We claim no
            ownership over your content and use it only to generate the output you requested.
          </p>
          <p>
            You're responsible for making sure you have the necessary rights to any file you process, and for
            complying with applicable law. You agree not to use the Service to process content that is illegal,
            infringes someone else's rights, contains malware, or that you don't have permission to handle.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="mt-3 list-disc pl-5">
            <li>Attempt to disrupt, overload, or gain unauthorized access to the Service or its infrastructure;</li>
            <li>Use automated tools to scrape or bulk-process files in a way that circumvents our rate limits or file-size limits;</li>
            <li>Use the Service to process or distribute unlawful, harmful, or infringing content;</li>
            <li>Reverse-engineer, resell, or rebrand the Service as your own.</li>
          </ul>
          <p className="mt-3">
            We may throttle, block, or refuse requests that we reasonably believe violate these Terms or put the
            Service at risk for other users.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">No warranty</h2>
          <p>
            The Service is provided "as is" and "as available," without warranties of any kind, express or
            implied. We don't guarantee that conversions or other processing will be error-free, that output
            quality will meet your expectations, or that the Service will always be available or uninterrupted.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Limitation of liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Toolkit4Me and its operators will not be liable for
            any indirect, incidental, special, or consequential damages, or for any loss of data, profits, or
            business, arising out of or related to your use of (or inability to use) the Service. The Service is
            free to use, and our total liability for any claim relating to it is limited accordingly.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Advertising and third-party links</h2>
          <p>
            The Service is supported by advertising, including ads served through Google AdSense. Ads and any
            third-party links on the Service are provided by independent third parties; we don't control and
            aren't responsible for their content, products, or practices.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Intellectual property</h2>
          <p>
            The Toolkit4Me name, branding, and the design and code of the Service (excluding your own files and
            any open-source components, which remain under their respective licenses) belong to us or our
            licensors. These Terms don't grant you any right to use our branding without permission.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Changes to the Service or these Terms</h2>
          <p>
            We may add, change, or discontinue tools or features at any time, and may update these Terms as the
            Service evolves. Continued use of the Service after an update means you accept the revised Terms.
            Material changes will be reflected by updating the "Last updated" date above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Termination</h2>
          <p>
            We may suspend or restrict access to the Service, for anyone, at our discretion — for example, in
            response to abuse or activity that risks the Service for other users.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Contact us</h2>
          <p>
            Questions about these Terms? Contact us at{" "}
            <span className="font-medium text-neutral-500">[add a contact email]</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

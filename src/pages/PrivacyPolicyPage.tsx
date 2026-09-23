import { SeoHead } from "../components/seo/SeoHead";

// ---------------------------------------------------------------------
// Content here is written to match this app's actual behavior (client-
// vs server-side processing, the 1-hour file TTL, no accounts, AdSense)
// rather than generic boilerplate — see src/config/api.ts, the backend's
// FILE_TTL_MS, and src/config/ads.ts for the underlying facts. It is a
// solid starting point, not legal advice; have it reviewed before
// relying on it for regulatory compliance (GDPR/CCPA etc.).
// ---------------------------------------------------------------------

const LAST_UPDATED = "September 23, 2026";

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
      <SeoHead
        title="Privacy Policy — Toolkit4Me"
        description="How Toolkit4Me handles the files you process and the data collected while you use our free PDF and image tools."
        path="/privacy"
      />

      <h1 className="mb-2 text-3xl font-bold text-neutral-900">Privacy Policy</h1>
      <p className="mb-10 text-sm text-neutral-500">Last updated: {LAST_UPDATED}</p>

      <div className="flex flex-col gap-8 text-sm leading-6 text-neutral-700">
        <section>
          <p>
            Toolkit4Me ("we", "us", "our") provides free online tools for converting, compressing, merging, and
            otherwise processing documents and images. This policy explains what happens to your files and what
            other information we collect when you use toolkit4me.com (the "Service").
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">No accounts, no sign-up</h2>
          <p>
            Every tool on Toolkit4Me can be used without creating an account, providing your name, or giving us an
            email address. We don't have a login system, and we don't build user profiles.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">The files you process</h2>
          <p className="mb-3">
            Some tools run <strong>entirely in your browser</strong> — for those, your file is never sent to our
            servers at all; it's processed locally on your device and never leaves it. Each tool's page states
            whether it works this way.
          </p>
          <p>
            Other tools require your file to be uploaded to our processing server so we can convert, compress, or
            otherwise transform it. In that case:
          </p>
          <ul className="mt-3 list-disc pl-5">
            <li>The file is transmitted over an encrypted (HTTPS) connection.</li>
            <li>It's used only to produce the output you requested — we don't inspect, scan, or read file content for any other purpose.</li>
            <li><strong>It is automatically and permanently deleted from our servers one hour after upload</strong>, whether or not you download the result.</li>
            <li>We don't keep backups of uploaded or processed files beyond that window.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Information collected automatically</h2>
          <p>
            Like most websites, our servers and hosting/CDN providers automatically log standard technical
            information for security and reliability — things like IP address, browser type, request timestamps,
            and pages visited. This is used to keep the Service running, prevent abuse (for example, rate-limiting
            excessive requests), and diagnose problems. We may also use privacy-conscious analytics tools in the
            future to understand aggregate usage (e.g. which tools are popular); if so, this policy will be updated.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Advertising and cookies</h2>
          <p className="mb-3">
            We show ads through Google AdSense to keep every tool free to use. Google and its partners may use
            cookies and similar technologies to serve ads based on your visits to this and other websites, and to
            measure ad performance.
          </p>
          <p>
            You can learn more about how Google uses this data, and opt out of personalized advertising, at{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              policies.google.com/technologies/partner-sites
            </a>{" "}
            and manage your ad settings at{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              adssettings.google.com
            </a>
            . Most browsers also let you block or delete cookies in their settings.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Third-party service providers</h2>
          <p>
            We rely on third-party infrastructure providers to host and deliver the Service (for example, cloud
            hosting for file processing and a content delivery network for the website itself). These providers
            process data solely on our behalf, under their own security and privacy commitments, and don't use it
            for their own purposes beyond keeping the Service running.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">We don't sell your information</h2>
          <p>
            We don't sell, rent, or trade personal information. We don't have a marketing mailing list, since we
            never collect your email address in the first place.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Your rights</h2>
          <p>
            Because uploaded files are deleted automatically within an hour and we don't maintain user accounts or
            profiles, there is generally very little personal data of yours for us to hold at any given time.
            Depending on where you live, you may still have rights over data collected in server/analytics logs
            (such as access or deletion) under laws like the GDPR or CCPA. To make a request, use the contact
            details below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Children's privacy</h2>
          <p>
            The Service is not directed at children under 13, and we do not knowingly collect personal information
            from them.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Changes to this policy</h2>
          <p>
            We may update this policy from time to time as the Service changes. Material changes will be reflected
            by updating the "Last updated" date above.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Contact us</h2>
          <p>
            Questions about this policy or a privacy request? Contact us at{" "}
            <span className="font-medium text-neutral-500">[add a contact email]</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

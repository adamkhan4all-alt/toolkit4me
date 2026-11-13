import { MailLink, PLink, PolicyLayout, PolicySection } from "../components/content/PolicyLayout";
import { ABOUT_META, SUPPORT_EMAIL } from "../data/policies";
import { toolRegistry } from "../lib/toolRegistry";

const AUDIENCES: { who: string; how: string }[] = [
  { who: "Students and educators", how: "turning photos of notes into PDFs, making scanned handouts searchable, meeting upload limits and tracking grades with the education calculators." },
  { who: "Businesses and organisations", how: "sending documents that look right everywhere, keeping attachments small, optimising product images and building trackable marketing links." },
  { who: "Freelancers", how: "assembling proposals and deliverables, protecting documents with personal details and pricing work with the margin and markup calculators." },
  { who: "Developers", how: "formatting and validating JSON, encoding Base64 and URLs, generating meta tags and comparing text." },
  { who: "Office professionals", how: "converting Word, Excel and PowerPoint files, merging and splitting PDFs and adding page numbers." },
  { who: "Everyday internet users", how: "resizing a photo for a form, making a QR code, removing tracking from a link or blurring a detail before sharing a picture." },
];

export function AboutPage() {
  const hubs = toolRegistry.getHubs();
  return (
    <PolicyLayout
      meta={ABOUT_META}
      intro={
        <>
          <p>
            Toolkit4Me is a free collection of {toolRegistry.countListings()} online tools and calculators for everyday digital tasks: converting and
            compressing documents, editing and optimising images, working with text and code, doing quick calculations and preparing links. Alongside the
            tools, our <PLink to="/blog">Blog</PLink> and <PLink to="/guides">Guides</PLink> explain how to get these jobs done well.
          </p>
          <p>
            Our aim is simple: make useful digital tools easy to find and easy to use, without accounts, subscriptions or watermarks, and be clear about what
            each tool can and can't do.
          </p>
        </>
      }
    >
      <PolicySection id="whats-here" title="What you'll find here">
        <ul>
          {hubs.map((hub) => (
            <li key={hub.id}>
              <PLink to={hub.path}>{hub.name}</PLink> — {hub.tagline}
            </li>
          ))}
          <li>
            <PLink to="/blog">Blog &amp; Resource Center</PLink> — practical articles on documents, images, privacy and productivity for study, work and
            business.
          </li>
          <li>
            <PLink to="/guides">Guides</PLink> — step-by-step how-tos for specific tasks and file formats.
          </li>
        </ul>
        <p>
          The full, current list is always on the <PLink to="/tools">All Tools</PLink> page.
        </p>
      </PolicySection>

      <PolicySection id="who" title="Who Toolkit4Me helps">
        <ul>
          {AUDIENCES.map((a) => (
            <li key={a.who}>
              <strong>{a.who}</strong>: {a.how}
            </li>
          ))}
        </ul>
      </PolicySection>

      <PolicySection id="how" title="How the tools process your files">
        <p>Tools work in one of two ways, and each tool's page says which:</p>
        <ul>
          <li>
            <strong>In your browser.</strong> Many tools, including image compression, resizing and conversion, JPG to PDF, splitting, editing and numbering
            PDFs, every Pixel Playground and developer tool, the Link Studio tools and every calculator, process your file or text on your own device. Nothing is
            uploaded.
          </li>
          <li>
            <strong>On our server.</strong> Tools that need desktop-grade software, such as Word, Excel and PowerPoint conversion, PDF to Word, compressing and
            merging PDFs, OCR and PDF passwords, upload your file over an encrypted connection to our own processing server. The upload is deleted as soon as it's
            processed, and the result within one hour.
          </li>
        </ul>
        <p>
          The <PLink to="/privacy">Privacy Policy</PLink> has the full details, including what our servers log and how advertising works.
        </p>
      </PolicySection>

      <PolicySection id="honest" title="What we promise, and what we don't">
        <p>
          We describe each tool from how it actually works and list its limitations on its page. OCR is never perfect, PDF to Word doesn't keep the original
          layout, and calculator results are arithmetic, not professional advice. The <PLink to="/disclaimer">Disclaimer</PLink> covers these limits, and the{" "}
          <PLink to="/editorial-policy">Editorial Policy</PLink> explains how our articles are researched and checked.
        </p>
      </PolicySection>

      <PolicySection id="funding" title="How Toolkit4Me is funded">
        <p>
          The site is supported by advertising rather than paywalls, so the tools are free to use. Ads are labelled and kept away from upload areas and download
          buttons, and advertisers have no say over what we publish.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Questions and feedback">
        <p>
          Found a bug, want to suggest a tool or spotted a mistake in an article? Email <MailLink email={SUPPORT_EMAIL} /> or visit the{" "}
          <PLink to="/contact">Contact</PLink> page.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

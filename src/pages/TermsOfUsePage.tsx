import { MailLink, PLink, PolicyLayout, PolicySection } from "../components/content/PolicyLayout";
import { SUPPORT_EMAIL, TERMS_META } from "../data/policies";

// Written to match how the Service actually works (browser vs server
// processing, the 1-hour file TTL, per-IP rate limits, Link Studio).
// Generic by owner decision D4: no operator legal name or governing-law
// clause. Not legal advice — have it reviewed before relying on it.

const TOC = [
  { id: "acceptance", title: "Acceptance of these Terms" },
  { id: "eligibility", title: "Eligibility" },
  { id: "service", title: "What the Service includes" },
  { id: "permitted-use", title: "Permitted use" },
  { id: "prohibited", title: "Prohibited activities" },
  { id: "malicious", title: "Malicious files and unlawful use" },
  { id: "automated", title: "Automated access and fair usage" },
  { id: "responsibilities", title: "Your responsibilities" },
  { id: "content", title: "Your files and content" },
  { id: "ip", title: "Intellectual property" },
  { id: "third-party", title: "Third-party services and links" },
  { id: "link-studio", title: "Short links (Link Studio)" },
  { id: "availability", title: "Availability and limitations" },
  { id: "abuse", title: "Abuse prevention, suspension and termination" },
  { id: "warranties", title: "Disclaimer of warranties" },
  { id: "liability", title: "Limitation of liability" },
  { id: "indemnity", title: "Indemnification" },
  { id: "changes", title: "Changes to these Terms" },
  { id: "disputes", title: "Disputes" },
  { id: "contact", title: "Contact" },
];

export function TermsOfUsePage() {
  return (
    <PolicyLayout
      meta={TERMS_META}
      toc={TOC}
      intro={
        <p>
          These Terms of Use (“Terms”) apply to your use of toolkit4me.com, its tools, calculators, Link Studio, guides and blog (together, the “Service”),
          provided by the operator of Toolkit4Me (“we”, “us”, “our”). Please read them together with our <PLink to="/privacy">Privacy Policy</PLink> and{" "}
          <PLink to="/disclaimer">Disclaimer</PLink>.
        </p>
      }
    >
      <PolicySection id="acceptance" title="1. Acceptance of these Terms">
        <p>By using the Service you agree to these Terms. If you don't agree, please don't use the Service. No account or payment is required to use it.</p>
      </PolicySection>

      <PolicySection id="eligibility" title="2. Eligibility">
        <p>
          You may use the Service if you are old enough to accept these Terms under the law where you live. If you are not, you may use it only with the
          involvement and permission of a parent or guardian, who accepts these Terms on your behalf. If you use the Service on behalf of an organisation, you
          confirm you're authorised to accept these Terms for it.
        </p>
      </PolicySection>

      <PolicySection id="service" title="3. What the Service includes">
        <p>Toolkit4Me provides free online tools for everyday digital tasks, including:</p>
        <ul>
          <li>
            <PLink to="/pdf-tools">PDF tools</PLink> and document conversion (for example Word, Excel and PowerPoint to PDF, PDF to Word, merging, splitting,
            compressing, numbering and password protection);
          </li>
          <li>
            <PLink to="/image-tools">image tools</PLink> for compression, resizing, format conversion and text recognition (OCR);
          </li>
          <li>
            <PLink to="/pixel-playground">Pixel Playground</PLink> creative photo tools;
          </li>
          <li>
            <PLink to="/developer-tools">developer and text tools</PLink> such as a JSON formatter, Base64 encoder, word counter and QR code generator;
          </li>
          <li>
            the <PLink to="/calculators">Calculator Hub</PLink>;
          </li>
          <li>
            <PLink to="/link-studio">Link Studio</PLink> URL utilities; and
          </li>
          <li>
            the <PLink to="/blog">Blog</PLink> and <PLink to="/guides">Guides</PLink>.
          </li>
        </ul>
        <p>
          Some tools work entirely in your browser; others upload your file to our processing server, which deletes it after processing and deletes the result
          within one hour. Each tool page says which applies, and the <PLink to="/privacy">Privacy Policy</PLink> explains both in detail.
        </p>
      </PolicySection>

      <PolicySection id="permitted-use" title="4. Permitted use">
        <p>
          You may use the Service free of charge for personal, educational and business purposes, including processing files for your work or your clients,
          provided you follow these Terms. You may link to any page of the Service and quote short extracts of our articles and guides with a link back to the
          source.
        </p>
      </PolicySection>

      <PolicySection id="prohibited" title="5. Prohibited activities">
        <p>You agree not to:</p>
        <ul>
          <li>use the Service for anything unlawful, or to process content you don't have the right to use;</li>
          <li>infringe anyone's copyright, trademark, privacy or other rights;</li>
          <li>use the image tools to harass, impersonate or mislead people about a real person, or to use someone's photo or likeness without the right to do so;</li>
          <li>attempt to gain unauthorised access to the Service, its servers or other people's data, or probe or test its security without permission;</li>
          <li>interfere with or disrupt the Service, or place an unreasonable load on its infrastructure;</li>
          <li>use the PDF password tools to open or change documents you aren't authorised to access;</li>
          <li>copy, resell, rebrand or republish the Service, or substantial parts of our articles and guides, as your own; or</li>
          <li>help or encourage anyone else to do any of these things.</li>
        </ul>
      </PolicySection>

      <PolicySection id="malicious" title="6. Malicious files and unlawful use">
        <p>
          Don't upload or process files containing malware, viruses or other harmful code, files designed to exploit the software that processes them, or
          material that is illegal to possess or share. We may refuse, stop processing or delete such files, and may report unlawful activity to the relevant
          authorities where the law requires or permits.
        </p>
      </PolicySection>

      <PolicySection id="automated" title="7. Automated access, excessive requests and fair usage">
        <p>
          The Service is designed for people using it directly. Don't use scripts, bots or other automated means to send large volumes of requests, to scrape
          content, or to get around the file-size, file-count or rate limits that keep the Service available for everyone. Each tool page states its own
          limits. We apply rate limits to requests; ordinary use by a person stays well within them.
        </p>
      </PolicySection>

      <PolicySection id="responsibilities" title="8. Your responsibilities">
        <ul>
          <li>Keep your own copy of any file you process; we don't keep backups of your files.</li>
          <li>Check every result before relying on it, especially converted documents, extracted text and calculator results used for important decisions.</li>
          <li>Keep any password you set with Protect PDF safe; it can't be recovered.</li>
          <li>Comply with the laws that apply to you and to the content you process.</li>
        </ul>
      </PolicySection>

      <PolicySection id="content" title="9. Your files and content">
        <p>
          You keep all rights to the files and text you process. We don't claim ownership of them and use them only to produce the result you asked for, as
          described in the <PLink to="/privacy">Privacy Policy</PLink>. By processing a file you confirm you have the right to do so, and you give us the
          limited permission needed to process it for you.
        </p>
      </PolicySection>

      <PolicySection id="ip" title="10. Intellectual property">
        <p>
          The Toolkit4Me name and branding, the design and code of the Service, and the articles, guides, illustrations and other content we publish belong to
          the operator of Toolkit4Me or its licensors. Open-source components remain under their own licences. These Terms don't give you any right to use our
          branding, or to republish our content beyond short quotations with a link, without permission.
        </p>
      </PolicySection>

      <PolicySection id="third-party" title="11. Third-party services and external links">
        <p>
          The Service relies on third-party providers for hosting and delivery, and shows ads served by Google AdSense; these providers are listed in the{" "}
          <PLink to="/privacy">Privacy Policy</PLink>. Our articles link to external websites as references. Ads and external sites are provided by
          independent third parties under their own terms and policies; we don't control them and aren't responsible for their content, products or
          practices. External links in our articles open in a new tab, and tool links always open the tool's own page on toolkit4me.com.
        </p>
      </PolicySection>

      <PolicySection id="link-studio" title="12. Short links (Link Studio)">
        <p>
          Short links on go.toolkit4me.com are created by the Toolkit4Me team and redirect to the destination the team chose, which may be another website. We
          may disable or change a short link at any time, for example if its destination becomes unsafe or unavailable. The public Link Studio tools on
          toolkit4me.com (UTM Builder, URL Parser &amp; Cleaner, URL Validator and URL Encoder &amp; Decoder) run in your browser and are covered by these Terms
          like any other tool.
        </p>
      </PolicySection>

      <PolicySection id="availability" title="13. Availability and limitations">
        <p>
          We work to keep the Service available and accurate, but we may add, change, limit or withdraw tools and features, or take the Service offline for
          maintenance, at any time and without notice. Tools have documented limits: for example, OCR is never perfectly accurate, PDF to Word does not
          reproduce the original layout, and Office conversions may substitute fonts. Each tool page lists its limitations, and the{" "}
          <PLink to="/disclaimer">Disclaimer</PLink> summarises the most important ones. The Service is free today, but we don't guarantee that any particular
          tool will remain available or free.
        </p>
      </PolicySection>

      <PolicySection id="abuse" title="14. Abuse prevention, suspension and termination">
        <p>
          To protect the Service and its users, we may throttle, block or refuse requests, or suspend or end anyone's access, if we reasonably believe they are
          breaking these Terms, putting the Service or other users at risk, or acting unlawfully. Where it's practical and lawful, we'll explain why.
        </p>
      </PolicySection>

      <PolicySection id="warranties" title="15. Disclaimer of warranties">
        <p>
          To the extent permitted by law, the Service is provided “as is” and “as available”, without warranties of any kind, express or implied, including
          warranties of fitness for a particular purpose, accuracy or uninterrupted availability. We don't guarantee that results will be error-free or meet
          your requirements. This doesn't affect any rights you have that can't be excluded by law.
        </p>
      </PolicySection>

      <PolicySection id="liability" title="16. Limitation of liability">
        <p>
          To the fullest extent permitted by law, the operator of Toolkit4Me won't be liable for any indirect, incidental, special or consequential loss, or for
          loss of data, profits, revenue or business, arising from your use of, or inability to use, the Service. Because the Service is free, our total
          liability for any claim relating to it is limited to the extent the law allows. Nothing in these Terms excludes or limits liability that cannot be
          excluded or limited under applicable law.
        </p>
      </PolicySection>

      <PolicySection id="indemnity" title="17. Indemnification">
        <p>
          To the extent permitted by law, you agree to be responsible for, and to compensate us for, claims and losses arising from content you process through
          the Service or from your breach of these Terms. This doesn't apply where the law doesn't allow it, for example where you use the Service as a
          consumer and such an obligation would not be enforceable.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="18. Changes to these Terms">
        <p>
          We may update these Terms as the Service changes. The “Last updated” date at the top shows when they last changed. Continuing to use the Service after
          an update means you accept the revised Terms. These Terms were previously titled “Terms of Service”; the old address now redirects here.
        </p>
      </PolicySection>

      <PolicySection id="disputes" title="19. Disputes">
        <p>
          If you have a concern about the Service, please contact us first so we can try to resolve it informally. Nothing in these Terms takes away any
          mandatory protection you have under the consumer law of the country where you live.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="20. Contact">
        <p>
          Questions about these Terms? Email <MailLink email={SUPPORT_EMAIL} /> or see the <PLink to="/contact">Contact</PLink> page.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

import { MailLink, PLink, PolicyLayout, PolicySection } from "../components/content/PolicyLayout";
import { DISCLAIMER_META, SUPPORT_EMAIL } from "../data/policies";

// Written to match the tools' actual, documented limitations (each tool's
// "Limitations" in src/data/*.ts). Not legal advice. Deliberately doesn't
// try to exclude liability the law doesn't allow to be excluded.

const TOC = [
  { id: "general", title: "General information" },
  { id: "tools", title: "Tool limitations" },
  { id: "calculators", title: "Calculators, finance and professional use" },
  { id: "no-ai", title: "AI and automated features" },
  { id: "permissions", title: "Your files and permissions" },
  { id: "external", title: "External links and third parties" },
  { id: "availability", title: "Accuracy and availability" },
  { id: "trademarks", title: "Trademarks" },
  { id: "questions", title: "Questions" },
];

export function DisclaimerPage() {
  return (
    <PolicyLayout meta={DISCLAIMER_META} toc={TOC}>
      <PolicySection id="general" title="1. General information">
        <p>
          The articles, guides and tool pages on Toolkit4Me are published for general information and education. They explain file formats, everyday digital
          tasks and how our tools work, but they aren't legal, financial, tax, security or other professional advice. If a document or decision has legal or
          regulatory consequences, such as a court filing, a government application or a tax return, follow the instructions of the organisation involved and
          get qualified advice where needed.
        </p>
      </PolicySection>

      <PolicySection id="tools" title="2. Tool limitations">
        <p>Every tool page has a “Limitations” section. The most important ones:</p>
        <ul>
          <li>
            <strong>PDF conversion.</strong> <PLink to="/tools/pdf-to-word">PDF to Word</PLink> converts a PDF's text into editable paragraphs; it doesn't
            reproduce the original layout, fonts, tables or images. Word, Excel and PowerPoint conversions replace fonts our server doesn't have with similar ones,
            which can move line or page breaks.
          </li>
          <li>
            <strong>Document processing.</strong> Merging and splitting may not keep bookmarks or fillable form fields. Password-protected files must be unlocked
            with the correct password first; our tools never crack or bypass passwords.
          </li>
          <li>
            <strong>Image compression.</strong> Results depend on the image. Photos usually shrink a lot, while already-optimised images may barely change.
            Lossy compression (JPG, lossy WebP) discards detail permanently, so keep your original.
          </li>
          <li>
            <strong>Image conversion.</strong> Converting to JPG removes transparency, and converting a JPG to PNG doesn't restore detail already lost.
          </li>
          <li>
            <strong>OCR and text extraction.</strong> <PLink to="/tools/image-to-text">Image to Text</PLink> is never 100% accurate and works best on clear,
            printed text; handwriting and decorative fonts are often misread. Check names, numbers and dates against the original.
          </li>
          <li>
            <strong>Photo tools.</strong> The <PLink to="/pixel-playground">Pixel Playground</PLink> tools use classic image techniques. Background removal works
            by colour and suits plain backgrounds only; a light blur can sometimes be partly reversed, so use a solid box for sensitive details. The{" "}
            <PLink to="/tools/passport-photo-maker">Passport Photo Maker</PLink> produces the right size and proportions, but acceptance also depends on each
            authority's current rules, so check the official guidance.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="calculators" title="3. Calculators, finance and professional use">
        <p>
          The <PLink to="/calculators">Calculator Hub</PLink> does arithmetic on the numbers you enter, using the formula shown on each calculator's page. Results
          are estimates for planning and learning. They aren't financial, investment, tax, lending, legal or academic advice, and they may not reflect fees,
          taxes, rounding rules, local regulations or your institution's grading rules. Verify important calculations independently, and confirm decisions with
          a qualified professional or the organisation concerned.
        </p>
      </PolicySection>

      <PolicySection id="no-ai" title="4. AI and automated features">
        <p>
          Toolkit4Me's tools don't use generative AI, and your files aren't sent to AI services. Conversions, compression and photo effects are performed by
          conventional software; text recognition uses the open-source Tesseract OCR engine, whose trained recognition model can still misread text, as section
          2 explains. Where our editorial content is drafted with AI assistance, it's reviewed and checked by people before publication; see the{" "}
          <PLink to="/editorial-policy">Editorial Policy</PLink>.
        </p>
      </PolicySection>

      <PolicySection id="permissions" title="5. Your files and permissions">
        <p>
          Only process files you have the right to use. Use the PDF password tools only on documents you own or are authorised to open and change. When you edit
          photos of other people, or make memes, stickers and thumbnails from pictures you didn't take, make sure you have permission and respect their privacy
          and copyright.
        </p>
      </PolicySection>

      <PolicySection id="external" title="6. External links and third parties">
        <p>
          Our articles link to external websites, such as official documentation and regulators' guidance, as references. Those sites have their own content,
          terms and privacy practices, which we don't control, and a link isn't an endorsement of everything on them. Ads are selected and served by Google
          AdSense, not by us, and appearing on this site doesn't mean we endorse an advertiser. Short links on go.toolkit4me.com lead to the destinations chosen by
          the Toolkit4Me team.
        </p>
      </PolicySection>

      <PolicySection id="availability" title="7. Accuracy and availability">
        <p>We aim to keep the tools reliable and the content accurate and up to date, but we can't guarantee:</p>
        <ul>
          <li>error-free results for every file;</li>
          <li>compatibility with every file, format or device;</li>
          <li>perfect OCR or conversion accuracy;</li>
          <li>uninterrupted availability of the Service; or</li>
          <li>that every tool or feature will remain available permanently.</li>
        </ul>
        <p>
          Always keep your original file and check results before you send, print, publish or submit them. Nothing in this Disclaimer excludes or limits any
          liability that can't be excluded or limited under applicable law; the <PLink to="/terms-of-use">Terms of Use</PLink> set out the full terms.
        </p>
      </PolicySection>

      <PolicySection id="trademarks" title="8. Trademarks">
        <p>
          Microsoft Word, Excel and PowerPoint are trademarks of Microsoft Corporation. PDF is an open standard (ISO 32000) originally developed by Adobe. Other
          product names are trademarks of their respective owners. Toolkit4Me isn't affiliated with or endorsed by these companies; their names are used only to
          describe the file formats and services our content discusses.
        </p>
      </PolicySection>

      <PolicySection id="questions" title="9. Questions">
        <p>
          Spotted an error or a limitation we haven't mentioned? Email <MailLink email={SUPPORT_EMAIL} />. See also the <PLink to="/privacy">Privacy Policy</PLink>.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

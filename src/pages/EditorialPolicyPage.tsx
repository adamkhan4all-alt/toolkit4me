import { MailLink, PLink, PolicyLayout, PolicySection } from "../components/content/PolicyLayout";
import { EDITORIAL_META, SUPPORT_EMAIL } from "../data/policies";

// Describes the publishing practice actually used for the blog, guides
// and tool pages (see docs/BLOG.md). Keep it in step with how content is
// really produced — never claim a check that doesn't happen.

const TOC = [
  { id: "purpose", title: "Purpose of our content" },
  { id: "research", title: "Research and sources" },
  { id: "verification", title: "Fact-checking and technical verification" },
  { id: "recommendations", title: "How we recommend tools" },
  { id: "images", title: "Images and illustrations" },
  { id: "ai", title: "Use of artificial intelligence" },
  { id: "independence", title: "Independence, advertising and affiliates" },
  { id: "standards", title: "What we won't publish" },
  { id: "dates", title: "Publication and review dates" },
  { id: "corrections", title: "Corrections and reader feedback" },
  { id: "responsibility", title: "Editorial responsibility" },
];

export function EditorialPolicyPage() {
  return (
    <PolicyLayout
      meta={EDITORIAL_META}
      toc={TOC}
      intro={
        <p>
          This policy explains how we write, check and update the content on Toolkit4Me: the <PLink to="/blog">Blog</PLink>, the{" "}
          <PLink to="/guides">Guides</PLink> and each tool's own page.
        </p>
      }
    >
      <PolicySection id="purpose" title="1. Purpose of our content">
        <p>
          We publish three kinds of content. <strong>Tool pages</strong> say what each tool does, how to use it and what its limits are.{" "}
          <strong>Guides</strong> are step-by-step how-tos for specific tasks and file formats. <strong>Blog articles</strong> take a wider view: how documents,
          images, links and calculations fit into study, work, business and online privacy, for students, teachers, freelancers, small businesses and other
          professionals. Every piece should help a reader solve a real problem, and the blog links to guides rather than repeating them.
        </p>
      </PolicySection>

      <PolicySection id="research" title="2. Research and source selection">
        <ul>
          <li>Statements about our own tools come from how the tools are built and behave, not from marketing copy.</li>
          <li>
            Other factual claims are supported by primary or authoritative sources, such as official product documentation, standards bodies, regulators and the
            documentation of the open-source software involved. Those sources are listed in a “References and sources” section at the end of each article.
          </li>
          <li>Before we cite a source, we open it and check that it says what we attribute to it.</li>
          <li>We prefer explaining a concept accurately to quoting a statistic. We don't use figures we can't trace to a source or to our own test.</li>
        </ul>
      </PolicySection>

      <PolicySection id="verification" title="3. Fact-checking and technical verification">
        <ul>
          <li>
            File-size limits, supported formats, processing location (browser or server) and file-handling details are checked against the tool's
            implementation before publication.
          </li>
          <li>Step-by-step instructions are checked against the current version of the tool they describe.</li>
          <li>
            Where we show a result, such as a file size before and after compression, it comes from actually running the tool, and we say what file was used.
            We never say a tool has been tested unless it has.
          </li>
          <li>Every tool or page an article links to must exist; our build checks every internal link and every tool recommendation automatically.</li>
        </ul>
      </PolicySection>

      <PolicySection id="recommendations" title="4. How we recommend tools">
        <p>
          We recommend a Toolkit4Me tool only when it genuinely does the job being described, and we state its relevant limits alongside it. Recommendations say
          whether the tool runs in your browser or on our server. When our tools aren't the right fit, for example for true PDF redaction, editing existing PDF
          text or legally binding e-signatures, articles say so and suggest the kind of software that is. Tool links always open the tool's own page on
          toolkit4me.com; we never disguise an external site as one of our tools.
        </p>
      </PolicySection>

      <PolicySection id="images" title="5. Images, illustrations and licensing">
        <ul>
          <li>
            Every figure is labelled with what it is. <strong>Illustrations</strong> and <strong>diagrams</strong> are original artwork made for Toolkit4Me to explain
            an idea; they don't show real software output.
          </li>
          <li>
            <strong>Screenshots</strong> and <strong>real results</strong> are captured from the actual tools. Sample documents in them are made up for the article
            and contain no real personal data.
          </li>
          <li>We don't use stock photos of people, and we don't copy images from other websites. Any third-party image would be used only under a licence that permits it, with credit.</li>
          <li>Every image has descriptive alternative text for screen-reader users.</li>
        </ul>
      </PolicySection>

      <PolicySection id="ai" title="6. Use of artificial intelligence">
        <p>
          We may use AI tools to help with research, structuring, drafting and improving the clarity of articles and guides. AI-assisted content is reviewed and
          edited before publication, and its technical claims are checked in the same way as any other content: against the tools themselves and against cited
          sources. We don't publish automatically generated or unreviewed content to increase the number of pages on the site, and we remain responsible for
          everything we publish. Our illustrations are drawn for the site; if we ever publish an AI-generated image, its caption will say so.
        </p>
      </PolicySection>

      <PolicySection id="independence" title="7. Editorial independence, advertising and affiliates">
        <p>
          Toolkit4Me is funded by advertising from Google AdSense. Advertisers have no influence over what we write or which tools we mention. We don't publish
          sponsored articles or paid reviews, and we don't use affiliate links. If that ever changes, sponsored or affiliate content will be clearly labelled as
          such. Ads are labelled “Advertisement” and kept away from tools' upload areas and download buttons, and articles contain at most one in-content ad.
        </p>
      </PolicySection>

      <PolicySection id="standards" title="8. What we won't publish">
        <ul>
          <li>Mass-produced, repetitive articles, or articles written mainly to rank for a keyword.</li>
          <li>Invented statistics, research findings, testimonials or reviews.</li>
          <li>Claims about features a tool doesn't have.</li>
          <li>FAQs that no reader would actually ask, or structured data that doesn't match the visible page.</li>
          <li>Promises about results we can't guarantee, such as a fixed compression percentage or perfect OCR accuracy.</li>
        </ul>
      </PolicySection>

      <PolicySection id="dates" title="9. Publication and review dates">
        <p>
          Articles and guides show the date they were first published and the date they were last updated. We review content when a tool it mentions changes,
          such as a new option, a different limit or a change in where processing happens, and update the “Last updated” date whenever the change is meaningful
          to readers.
        </p>
      </PolicySection>

      <PolicySection id="corrections" title="10. Corrections and reader feedback">
        <p>
          If you spot a mistake, an out-of-date instruction or a broken link, email <MailLink email={SUPPORT_EMAIL} /> with the page address. We check every report
          and correct confirmed errors promptly. When a correction changes the meaning of an article, we update its “Last updated” date.
        </p>
      </PolicySection>

      <PolicySection id="responsibility" title="11. Editorial responsibility">
        <ul>
          <li>
            <strong>Author byline:</strong> Toolkit4Me Editorial Team, the team that builds and maintains the tools.
          </li>
          <li>
            <strong>Website:</strong> <PLink to="/">www.toolkit4me.com</PLink>
          </li>
          <li>
            <strong>Contact:</strong> <MailLink email={SUPPORT_EMAIL} />
          </li>
        </ul>
      </PolicySection>
    </PolicyLayout>
  );
}

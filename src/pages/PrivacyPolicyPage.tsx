import { ExtLink, MailLink, PLink, PolicyLayout, PolicySection } from "../components/content/PolicyLayout";
import { PRIVACY_META, SUPPORT_EMAIL } from "../data/policies";

// ---------------------------------------------------------------------
// Every statement here is taken from the implementation — see the data-
// flow audit in docs/BLOG_AUDIT_AND_PLAN.md §5: processing modes in
// src/data/tools.ts, the backend's FILE_TTL_MS (1 hour) and per-IP rate
// limits, the Link Studio Worker's click schema and 365-day retention,
// the team console's 8-hour session cookie, and the AdSense tag in
// index.html. Generic by owner decision D4 (no operator name, no log-
// retention period, no fixed minimum age); D5 confirms the Google consent
// message is enabled for the EEA. Not legal advice.
// ---------------------------------------------------------------------

const TOC = [
  { id: "summary", title: "Summary" },
  { id: "you-provide", title: "Information you provide" },
  { id: "files", title: "How your files are processed" },
  { id: "automatic", title: "Information collected automatically" },
  { id: "cookies", title: "Cookies and similar technologies" },
  { id: "analytics", title: "Analytics" },
  { id: "advertising", title: "Advertising" },
  { id: "short-links", title: "Short links and click analytics" },
  { id: "team-console", title: "Team console sign-in" },
  { id: "providers", title: "Third-party service providers" },
  { id: "security", title: "Security and abuse prevention" },
  { id: "retention", title: "Data retention" },
  { id: "rights", title: "Your privacy rights" },
  { id: "children", title: "Children's privacy" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact" },
];

const td = "border-t border-neutral-200 px-3 py-2 align-top";
const th = "border-t border-neutral-200 px-3 py-2 text-left align-top font-medium text-neutral-900";

export function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      meta={PRIVACY_META}
      toc={TOC}
      intro={
        <p>
          This policy explains what happens to your files and what other information is collected when you use toolkit4me.com and go.toolkit4me.com (the
          “Service”), which is provided by the operator of Toolkit4Me (“we”, “us”, “our”). It describes how the Service actually works today, tool by tool.
        </p>
      }
    >
      <PolicySection id="summary" title="1. Summary">
        <ul>
          <li>There are no user accounts. You never need to give us your name or email address to use a tool.</li>
          <li>
            Many tools run <strong>entirely in your browser</strong>, so your file never leaves your device. Others upload it to <strong>our own processing server</strong>,
            which deletes the upload once processing finishes and the result within one hour. Each tool page says which applies.
          </li>
          <li>Our servers and providers log technical request information, such as IP addresses, to run and protect the Service.</li>
          <li>We don't use an analytics service on toolkit4me.com.</li>
          <li>Ads are served by Google AdSense, which may use cookies. In the European Economic Area, Google's consent message lets you choose.</li>
          <li>Short-link clicks are counted without storing IP addresses or browser user-agent strings.</li>
          <li>We don't sell personal information.</li>
        </ul>
      </PolicySection>

      <PolicySection id="you-provide" title="2. Information you provide">
        <ul>
          <li>
            <strong>Files and text you process.</strong> The documents, images, videos and text you put into a tool. How they're handled depends on the tool;
            see section 3.
          </li>
          <li>
            <strong>Passwords for PDF tools.</strong> Passwords you enter in Protect PDF, Unlock PDF or UnProtect PDF are sent with the file, used for that one
            operation only, and never logged or stored.
          </li>
          <li>
            <strong>Messages you send us.</strong> If you email us, we receive your email address and whatever you include, and use them to reply and deal with
            your request.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="files" title="3. How your files are processed">
        <p>
          <strong>Browser-based tools.</strong> These tools process your file or text with code running on your own device, and nothing is sent to us. They
          include image compression, resizing and format conversion, JPG to PDF, Split PDF, the PDF Editor, Add Page Numbers, every{" "}
          <PLink to="/pixel-playground">Pixel Playground</PLink> tool, every text and developer tool, the <PLink to="/link-studio">Link Studio</PLink> URL tools
          and every <PLink to="/calculators">calculator</PLink>.
        </p>
        <p>
          <strong>Server-processed tools.</strong> These tools need software that can't run in a browser: Word, Excel and PowerPoint to PDF, PDF to Word, PDF to
          JPG, Compress PDF, Merge PDF, Image to Text (OCR), Protect PDF, Unlock PDF and UnProtect PDF. For these:
        </p>
        <ul>
          <li>your file is sent over an encrypted (HTTPS) connection to our processing server at api.toolkit4me.com, which is hosted by Amazon Web Services;</li>
          <li>it's used only to produce the result you asked for. We don't read, analyse or reuse its content for any other purpose;</li>
          <li>processing uses open-source software on our own server (such as LibreOffice, Ghostscript, qpdf and the Tesseract OCR engine), and files are not sent to third-party conversion or AI services;</li>
          <li>
            <strong>your uploaded file is deleted as soon as processing finishes</strong>, and the result is kept for up to one hour so you can download it, then
            deleted automatically whether or not you downloaded it. A cleanup job removes expired results every few minutes;
          </li>
          <li>we don't keep backups of uploaded or processed files.</li>
        </ul>
        <p>
          <strong>Creative photo tools.</strong> Picture to Anime, Picture Avatar, the WhatsApp Sticker Maker and the other Pixel Playground tools are classic image
          effects written in JavaScript. They don't download AI models, don't send your image to us or to any other service, and don't store it: the photo and
          the result exist only in your browser's memory until you download the result or leave the page.
        </p>
        <p>Each tool page states which way the tool works and its file-size limits.</p>
      </PolicySection>

      <PolicySection id="automatic" title="4. Information collected automatically">
        <p>Like most websites, the Service automatically records some technical information:</p>
        <ul>
          <li>
            <strong>Processing server logs.</strong> When you use a server-processed tool, our server records request details such as your IP address, the
            address requested, the time, and the outcome. It also uses your IP address to apply rate limits, which cap how many requests can be made in a period.
          </li>
          <li>
            <strong>Hosting and network providers.</strong> The website is delivered by Vercel and the short-link service by Cloudflare. Like any host, they
            process request information, including IP addresses and browser details, to deliver pages and protect against abuse, and may keep operational logs
            under their own policies.
          </li>
        </ul>
        <p>We use this information only to operate, secure and troubleshoot the Service, not to build profiles of visitors.</p>
      </PolicySection>

      <PolicySection id="cookies" title="5. Cookies and similar technologies">
        <ul>
          <li>
            <strong>Advertising cookies.</strong> Google AdSense may set or read cookies and similar identifiers to show and measure ads (see section 7).
          </li>
          <li>
            <strong>Team console cookies.</strong> The Link Studio team console, which visitors never need, uses a strictly necessary session cookie for up to 8
            hours after a team member signs in, plus a short-lived cookie during the GitHub sign-in itself.
          </li>
          <li>
            <strong>URL Shortener allowance cookie.</strong> When you create your first short link, go.toolkit4me.com sets a strictly necessary cookie
            (<code>t4m_vid</code>) holding a random identifier signed by our server. It contains nothing about you and is used only to count your free
            daily short links. It's HttpOnly (page scripts can't read it), sent only to go.toolkit4me.com's shortener, and lasts up to 400 days unless you
            delete it.
          </li>
        </ul>
        <p>
          Apart from the URL Shortener, the tools don't set cookies or store your files in your browser's storage. You can block or delete cookies in your
          browser settings; the tools keep working without them (the shortener then asks your browser to complete its automatic check again).
        </p>
      </PolicySection>

      <PolicySection id="analytics" title="6. Analytics">
        <p>
          We don't currently use an analytics or tracking service, such as Google Analytics, on toolkit4me.com. If we add one, we'll update this policy first and
          describe what it collects. The short-link click counts described in section 8 are the only usage statistics we keep.
        </p>
      </PolicySection>

      <PolicySection id="advertising" title="7. Advertising">
        <p>
          The Service is funded by ads served by Google AdSense. Google and its partners may use cookies and similar technologies to show ads based on your
          visits to this and other websites, and to measure ad performance. Ads are labelled and kept apart from tools' upload areas and download buttons.
        </p>
        <p>
          For visitors in the European Economic Area, a consent message from Google lets you choose whether your data may be used for personalised ads, and you
          can change your choice later. You can learn more about how Google uses data at{" "}
          <ExtLink href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</ExtLink> and manage ad
          personalisation at <ExtLink href="https://adssettings.google.com">adssettings.google.com</ExtLink>.
        </p>
      </PolicySection>

      <PolicySection id="short-links" title="8. Short links (go.toolkit4me.com) and click analytics">
        <p>
          Short links on go.toolkit4me.com are created by the Toolkit4Me team, or by anyone through the free URL Shortener. When you open one, you're
          redirected to its destination and a click is recorded in our short-link analytics database. For each counted click we store only:
        </p>
        <ul>
          <li>the short-link code and the date and time of the click;</li>
          <li>the domain of the page that linked to it (for example www.google.com, not the full page address);</li>
          <li>a two-letter country code, as determined by our network provider; and</li>
          <li>the type of device: mobile, tablet or desktop.</li>
        </ul>
        <p>
          Raw IP addresses and full browser user-agent strings are not stored in the analytics database, and short links don't set cookies. To avoid counting the
          same visit twice, a one-way hash derived from your IP address and browser is held in temporary memory for about a minute and then discarded. Clicks
          from recognised bots and link-preview services aren't recorded. Individual click records are deleted automatically after 365 days; each link's total
          click count is kept.
        </p>
        <p>
          <strong>One-time links.</strong> Some short links work only once. Opening one shows a confirmation page first; nothing is recorded until someone
          presses Continue. At that moment the link is marked as used, with the date and time, and the visit is recorded as one click with the same limited
          fields listed above. The “used” date stays with the link until the team deletes it.
        </p>
        <p>
          <strong>Creating short links with the URL Shortener.</strong> When you shorten a link, we store the destination address, the short code, the time it
          was created and the fact that it came from the public shortener, so that the link can redirect and so that abusive links can be found and
          disabled. We don't store who created it. To enforce the daily allowance (5 links per browser, and a shared limit per network), we keep per-day
          counters keyed by the random identifier in the allowance cookie (see section 5) and by a one-way hash of your network address that is keyed with a
          secret and changes every day, so it can't be turned back into the address or linked across days. These counters are deleted two days after the day
          they cover. To stop automated abuse, your browser solves a small computing puzzle before your first link; this happens on your device, involves no
          third-party CAPTCHA service, and the used puzzle is only remembered until it expires (within about 10 minutes).
        </p>
        <p>
          Separately from that database, Cloudflare processes request information, including your IP address, to deliver the redirect and protect the service
          from abuse (see section 4). The Link Studio tools on toolkit4me.com, such as the UTM Builder and URL Parser &amp; Cleaner, run in your browser; the
          addresses you enter aren't sent to us.
        </p>
      </PolicySection>

      <PolicySection id="team-console" title="9. Team console sign-in">
        <p>
          The Link Studio team console is only for the Toolkit4Me team. Team members sign in with GitHub; the signed session cookie holds their GitHub user ID and
          username for up to 8 hours, and nothing about the sign-in is stored on our servers.
        </p>
      </PolicySection>

      <PolicySection id="providers" title="10. Third-party service providers">
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <caption className="px-3 py-2 text-left text-xs text-neutral-600">Providers involved in running the Service</caption>
            <thead className="bg-neutral-100">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-neutral-900">Provider</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-neutral-900">Role</th>
                <th scope="col" className="px-3 py-2 text-left font-semibold text-neutral-900">Data involved</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className={th}>Amazon Web Services</th>
                <td className={td}>Hosts our file-processing server (api.toolkit4me.com)</td>
                <td className={td}>Files sent to server tools (deleted as described above); request logs</td>
              </tr>
              <tr>
                <th scope="row" className={th}>Vercel</th>
                <td className={td}>Hosts and delivers the website and the team console's sign-in functions</td>
                <td className={td}>Standard request information</td>
              </tr>
              <tr>
                <th scope="row" className={th}>Cloudflare</th>
                <td className={td}>Runs go.toolkit4me.com short links, the URL Shortener and their database</td>
                <td className={td}>Request information; the click fields listed in section 8</td>
              </tr>
              <tr>
                <th scope="row" className={th}>GitHub</th>
                <td className={td}>Sign-in for the Toolkit4Me team only</td>
                <td className={td}>Team members' GitHub identity</td>
              </tr>
              <tr>
                <th scope="row" className={th}>Google</th>
                <td className={td}>AdSense advertising and its consent message</td>
                <td className={td}>Cookies and identifiers, under Google's policies</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          These providers may process data in countries other than your own. Google, as an advertising provider, also uses data for its own purposes as described
          in its policies. We don't sell, rent or trade personal information.
        </p>
      </PolicySection>

      <PolicySection id="security" title="11. Security and abuse prevention">
        <p>
          Connections to the Service are encrypted with HTTPS. Server-processed files are deleted automatically, file sizes are capped, request rates are limited per IP
          address to prevent abuse, and the team console is restricted to approved team members. No system is perfectly secure, so we can't guarantee absolute
          security, and for highly confidential files we suggest choosing a browser-based tool where one is available.
        </p>
      </PolicySection>

      <PolicySection id="retention" title="12. Data retention">
        <ul>
          <li>Files uploaded to server tools: deleted when processing finishes.</li>
          <li>Results of server tools: deleted automatically within one hour.</li>
          <li>Passwords entered in PDF tools: not stored.</li>
          <li>Short-link click records: deleted after 365 days; total counts per link are kept.</li>
          <li>Short-link duplicate-click hash: held in memory for about a minute.</li>
          <li>When a one-time link was used: kept with the link until the link is deleted.</li>
          <li>URL Shortener daily counters (visitor identifier and daily network-address hash): deleted two days after the day they cover.</li>
          <li>URL Shortener allowance cookie: in your browser for up to 400 days, or until you delete it.</li>
          <li>Links created with the URL Shortener: kept so they keep redirecting, unless disabled or deleted for abuse.</li>
          <li>Team console session cookie: up to 8 hours.</li>
          <li>Technical logs: kept for operating, securing and troubleshooting the Service; logs held by our providers follow their own policies.</li>
          <li>Emails you send us: kept as long as needed to deal with your message and any follow-up.</li>
        </ul>
      </PolicySection>

      <PolicySection id="rights" title="13. Your privacy rights">
        <p>
          Depending on where you live, laws such as the EU and UK GDPR or US state privacy laws may give you rights over your personal information, such as the
          right to access, correct or delete it, or to object to certain uses. Because there are no accounts and files are deleted automatically, we usually hold
          very little that relates to you, but we'll respond to any request as the law requires. Email <MailLink email={SUPPORT_EMAIL} /> with enough detail for
          us to find the information (for example, the date and approximate time of a request). For ad personalisation, use Google's consent message or ad
          settings described in section 7. You may also have the right to complain to your local data protection authority.
        </p>
      </PolicySection>

      <PolicySection id="children" title="14. Children's privacy">
        <p>
          The Service is a general-audience tool site and isn't directed at children. Children should use it only with the involvement of a parent or guardian
          where the law where they live requires. We don't knowingly collect personal information from children; if you believe a child has sent us personal
          information, contact us and we'll delete it.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="15. Changes to this policy">
        <p>
          We'll update this policy when the Service changes, for example if a tool changes how it processes files or we add a new provider. The “Last updated”
          date at the top shows the latest revision.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="16. Contact">
        <p>
          Questions about this policy or a privacy request? Email <MailLink email={SUPPORT_EMAIL} />. See also our <PLink to="/terms-of-use">Terms of Use</PLink>{" "}
          and <PLink to="/disclaimer">Disclaimer</PLink>.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

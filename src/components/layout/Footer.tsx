import { Link } from "react-router-dom";
import { toolRegistry } from "../../lib/toolRegistry";
import { openConsentSettings } from "../../lib/analytics";

/** Site-information groups. Contact details live on /contact (the verified support address only). */
const SITE_GROUPS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Toolkit4Me",
    links: [
      { to: "/about", label: "About" },
      { to: "/blog", label: "Blog" },
      { to: "/guides", label: "Guides" },
      { to: "/tools", label: "All Tools" },
    ],
  },
  {
    title: "Legal & Privacy",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms-of-use", label: "Terms of Use" },
      { to: "/disclaimer", label: "Disclaimer" },
    ],
  },
  {
    title: "Editorial",
    links: [
      { to: "/editorial-policy", label: "Editorial Policy" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
];

export function Footer() {
  const convertTools = toolRegistry.getByCategory("convert");
  const compressTools = [...toolRegistry.getByCategory("compress"), ...toolRegistry.getByCategory("merge")];
  const textAndDevTools = [...toolRegistry.getByCategory("text"), ...toolRegistry.getByCategory("web")];

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:grid-cols-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Convert</h3>
          <ul className="flex flex-col gap-2">
            {convertTools.map((t) => (
              <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className="focus-ring rounded text-sm text-neutral-600 hover:text-brand-600">
                  {t.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Compress &amp; Merge</h3>
          <ul className="flex flex-col gap-2">
            {compressTools.map((t) => (
              <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className="focus-ring rounded text-sm text-neutral-600 hover:text-brand-600">
                  {t.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Text &amp; Developer</h3>
          <ul className="flex flex-col gap-2">
            {textAndDevTools.map((t) => (
              <li key={t.slug}>
                <Link to={`/tools/${t.slug}`} className="focus-ring rounded text-sm text-neutral-600 hover:text-brand-600">
                  {t.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {SITE_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">{group.title}</h3>
            <ul className="flex flex-col gap-2">
              {group.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="focus-ring rounded text-sm text-neutral-600 hover:text-brand-600">
                    {l.label}
                  </Link>
                </li>
              ))}
              {group.title === "Legal & Privacy" && (
                <li>
                  {/* A real link (works without JavaScript, or if the consent message is blocked); with the message loaded, it re-opens it instead. */}
                  <a
                    href="/privacy#cookies"
                    onClick={(e) => {
                      if (openConsentSettings()) e.preventDefault();
                    }}
                    className="focus-ring rounded text-sm text-neutral-600 hover:text-brand-600"
                  >
                    Privacy &amp; cookie settings
                  </a>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-200 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-neutral-600">© {new Date().getFullYear()} Toolkit4Me. All rights reserved.</p>
          <span className="text-xs text-neutral-600">English (US)</span>
        </div>
      </div>
    </footer>
  );
}

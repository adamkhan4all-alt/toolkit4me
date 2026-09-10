import { Link } from "react-router-dom";
import { toolRegistry } from "../../lib/toolRegistry";

export function Footer() {
  const convertTools = toolRegistry.getByCategory("convert");
  const compressTools = [...toolRegistry.getByCategory("compress"), ...toolRegistry.getByCategory("merge")];

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4">
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
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Company</h3>
          <ul className="flex flex-col gap-2">
            <li><span className="text-sm text-neutral-600">About</span></li>
            <li><span className="text-sm text-neutral-600">Privacy Policy</span></li>
            <li><span className="text-sm text-neutral-600">Terms of Service</span></li>
            <li><span className="text-sm text-neutral-600">Contact</span></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Resources</h3>
          <ul className="flex flex-col gap-2">
            <li><Link to="/tools" className="focus-ring rounded text-sm text-neutral-600 hover:text-brand-600">All Tools</Link></li>
            <li><span className="text-sm text-neutral-600">Help Center</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-neutral-400">© {new Date().getFullYear()} Toolkit4Me. All rights reserved.</p>
          <span className="text-xs text-neutral-400">English (US)</span>
        </div>
      </div>
    </footer>
  );
}

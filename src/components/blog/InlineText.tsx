import { Link } from "react-router-dom";
import { isExternalHref, parseInline } from "../../lib/blog/inline";

const linkClass = "focus-ring rounded font-medium text-brand-700 underline decoration-brand-100 underline-offset-2 hover:decoration-brand-600";

/**
 * Renders article text with its [links](…) and **bold**. Internal links stay in the same tab; external
 * references open in a new tab with rel="noopener noreferrer" and say so to screen readers.
 */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) => {
        if (seg.type === "bold") return <strong key={i} className="font-semibold text-neutral-900">{seg.text}</strong>;
        if (seg.type === "text") return <span key={i}>{seg.text}</span>;
        if (isExternalHref(seg.href)) {
          return (
            <a key={i} href={seg.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {seg.text}
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          );
        }
        return (
          <Link key={i} to={seg.href} className={linkClass}>
            {seg.text}
          </Link>
        );
      })}
    </>
  );
}

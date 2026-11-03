import { Link } from "react-router-dom";
import type { ToolDefinition } from "../../types/tool";
import { guidesForTool } from "../../data/guides";

/** Links a tool page back to every guide that references it (the reverse of a guide's relatedTools). Renders nothing if none do. */
export function RelatedGuides({ tool }: { tool: ToolDefinition }) {
  const guides = guidesForTool(tool.slug);
  if (guides.length === 0) return null;
  return (
    <section aria-labelledby="related-guides-heading" className="flex flex-col gap-3">
      <h2 id="related-guides-heading" className="text-2xl font-semibold text-neutral-900">
        Helpful guides
      </h2>
      <ul className="flex flex-col gap-2">
        {guides.map((g) => (
          <li key={g.path}>
            <Link to={g.path} className="focus-ring rounded text-sm font-medium text-brand-600 hover:underline">
              {g.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

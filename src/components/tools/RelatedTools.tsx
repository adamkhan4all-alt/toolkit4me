import type { ToolDefinition } from "../../types/tool";
import { toolRegistry } from "../../lib/toolRegistry";
import { ToolCard } from "./ToolCard";

export function RelatedTools({ tool }: { tool: ToolDefinition }) {
  const related = toolRegistry.getRelated(tool);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-tools-heading" className="flex flex-col gap-4">
      <h2 id="related-tools-heading" className="text-2xl font-semibold text-neutral-900">
        Related tools
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}

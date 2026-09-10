import { Link } from "react-router-dom";
import type { ToolDefinition } from "../../types/tool";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="focus-ring group flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 transition-colors hover:border-brand-600"
    >
      <span
        aria-hidden="true"
        className="inline-flex w-fit items-center rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold tracking-tight text-brand-700"
      >
        {tool.icon}
      </span>
      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600">{tool.shortName}</h3>
      <p className="text-sm text-neutral-600">{tool.description}</p>
    </Link>
  );
}

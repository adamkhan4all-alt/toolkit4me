import type { ToolDefinition } from "../../types/tool";
import { Breadcrumb } from "../layout/Breadcrumb";

interface ToolHeaderProps {
  tool: ToolDefinition;
}

/** H1 + description + breadcrumb block shared by every tool page. */
export function ToolHeader({ tool }: ToolHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: tool.categoryLabel, href: `/tools?category=${tool.category}` },
          { label: tool.name },
        ]}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[32px]">{tool.seo.h1}</h1>
        <p className="text-base text-neutral-600">{tool.description}</p>
      </div>
    </div>
  );
}

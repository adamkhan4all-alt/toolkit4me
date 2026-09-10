import { Navigate, useParams } from "react-router-dom";
import { toolRegistry } from "../lib/toolRegistry";
import { ToolPage as ToolPageFramework } from "../components/tools/ToolPage";

/**
 * Route-level wrapper: resolves `:slug` against the ToolRegistry and hands
 * the resulting ToolDefinition to the generic ToolPage framework component.
 * This is the entire integration point between the router and the tool
 * framework — it contains no UI of its own.
 */
export function ToolPageRoute() {
  const { slug } = useParams<{ slug: string }>();
  const tool = slug ? toolRegistry.getBySlug(slug) : undefined;

  if (!tool) {
    return <Navigate to="/tools" replace />;
  }

  return <ToolPageFramework tool={tool} />;
}

// /api/link-studio/analytics?days=30[&code=abc] — click analytics. Admin only.
import { handleAnalytics } from "../_lib/links.js";
import { productionDeps } from "../_lib/deps.js";

export function GET(request: Request): Promise<Response> {
  return handleAnalytics(request, productionDeps());
}

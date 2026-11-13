// /api/link-studio/links/bulk — create up to 50 short links in one Worker request. Admin only.
// A static file takes precedence over [code].ts, so "bulk" never reaches the single-link handler.
import { handleBulkLinks } from "../../_lib/links.js";
import { productionDeps } from "../../_lib/deps.js";

export function POST(request: Request): Promise<Response> {
  return handleBulkLinks(request, productionDeps());
}

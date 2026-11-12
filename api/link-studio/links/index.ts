// /api/link-studio/links — list (GET) and create (POST) short links. Admin only.
import { handleLinks } from "../../_lib/links.js";
import { productionDeps } from "../../_lib/deps.js";

export function GET(request: Request): Promise<Response> {
  return handleLinks(request, productionDeps());
}

export function POST(request: Request): Promise<Response> {
  return handleLinks(request, productionDeps());
}

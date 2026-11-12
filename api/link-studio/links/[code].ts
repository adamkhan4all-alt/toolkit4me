// /api/link-studio/links/:code — read (GET), edit (PUT) and delete (DELETE) one short link. Admin only.
import { handleLink } from "../../_lib/links.js";
import { productionDeps } from "../../_lib/deps.js";

export function GET(request: Request): Promise<Response> {
  return handleLink(request, productionDeps());
}

export function PUT(request: Request): Promise<Response> {
  return handleLink(request, productionDeps());
}

export function DELETE(request: Request): Promise<Response> {
  return handleLink(request, productionDeps());
}

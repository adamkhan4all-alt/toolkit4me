// /api/link-studio/auth/{login|callback|session|logout} — admin sign-in (see api/_lib/auth.ts).
import { handleAuth } from "../../_lib/auth.js";
import { productionDeps } from "../../_lib/deps.js";

export function GET(request: Request): Promise<Response> {
  return handleAuth(request, productionDeps());
}

export function POST(request: Request): Promise<Response> {
  return handleAuth(request, productionDeps());
}

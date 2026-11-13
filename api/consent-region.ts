// /api/consent-region — tells the site whether analytics must wait for consent (EEA, UK, Switzerland) for this
// visitor. Answers only { consentRequired }; the country itself is never returned, logged or stored.
import { consentRequiredFor } from "./_lib/region.js";
import { json } from "./_lib/http.js";

export function GET(request: Request): Response {
  const consentRequired = consentRequiredFor(request.headers.get("x-vercel-ip-country"));
  return json(200, { consentRequired }); // json() adds the security headers, including Cache-Control: no-store
}

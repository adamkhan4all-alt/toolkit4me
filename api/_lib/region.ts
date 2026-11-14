// Where Google Analytics needs prior consent: the EEA, the UK and Switzerland — the same area Google's own consent
// message (AdSense "Privacy & messaging", European regulations) covers. The country comes from Vercel's edge
// geolocation header; it is used for this one decision and never stored or returned.
const CONSENT_REQUIRED = new Set([
  // EU
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // rest of the EEA
  "IS", "LI", "NO",
  // UK and Switzerland
  "GB", "CH",
]);

/** True unless the visitor's country is known and outside the consent area (unknown → required: fail closed). */
export function consentRequiredFor(country: string | null | undefined): boolean {
  const c = (country ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return true;
  return CONSENT_REQUIRED.has(c);
}

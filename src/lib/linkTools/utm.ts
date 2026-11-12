// ---------------------------------------------------------------------
// UTM campaign link builder. Adds Google Analytics campaign parameters to
// a landing-page address while keeping its other parameters and #fragment.
// ---------------------------------------------------------------------

import { splitQuery } from "./urlCleaner";

export interface UtmFields {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  id: string;
}

export const UTM_KEYS: { key: keyof UtmFields; param: string }[] = [
  { key: "source", param: "utm_source" },
  { key: "medium", param: "utm_medium" },
  { key: "campaign", param: "utm_campaign" },
  { key: "id", param: "utm_id" },
  { key: "term", param: "utm_term" },
  { key: "content", param: "utm_content" },
];

export type SpaceStyle = "keep" | "dash" | "underscore";

export interface UtmOptions {
  /** GA treats "Email" and "email" as different values — lowercase avoids split reports. */
  lowercase: boolean;
  spaces: SpaceStyle;
}

/** Medium values Google Analytics 4's default channel grouping recognises. */
export const COMMON_MEDIUMS = ["cpc", "ppc", "paid", "display", "banner", "email", "social", "paid_social", "organic", "referral", "affiliate", "video", "sms", "push", "qr", "print", "audio"];

export type UtmResult = { ok: true; url: string; warnings: string[] } | { ok: false; error: string };

function tidy(value: string, options: UtmOptions): string {
  let v = value.trim().replace(/\s+/g, " ");
  if (options.spaces === "dash") v = v.replace(/ /g, "-");
  if (options.spaces === "underscore") v = v.replace(/ /g, "_");
  return options.lowercase ? v.toLowerCase() : v;
}

export function buildUtmUrl(base: string, fields: UtmFields, options: UtmOptions): UtmResult {
  const raw = base.trim();
  if (raw === "") return { ok: false, error: "Enter the address of the page people should land on." };
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "The landing-page address can't be read — check it for typos." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "The landing page must be an http:// or https:// address." };
  if (!url.hostname.includes(".")) return { ok: false, error: "The landing page needs a full domain, such as example.com." };

  const values: UtmFields = { ...fields };
  for (const { key } of UTM_KEYS) values[key] = tidy(fields[key], options);
  if (values.source === "") return { ok: false, error: "Campaign source is required — it says where the traffic comes from, e.g. newsletter, facebook or google." };

  const warnings: string[] = [];
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) warnings.push("https:// was added to the landing-page address.");
  if (values.medium === "") warnings.push("Add a medium (e.g. email, social or cpc) — without it, Google Analytics files the visits under \"(not set)\".");
  if (values.campaign === "" && values.id === "") warnings.push("Add a campaign name so you can tell this campaign's visits apart from others.");
  if (values.medium !== "" && !COMMON_MEDIUMS.includes(values.medium.toLowerCase())) {
    warnings.push(`"${values.medium}" isn't a medium Google Analytics recognises for its default channels, so visits may show as "Unassigned". Common values: email, social, cpc, referral, display.`);
  }
  if (!options.lowercase && UTM_KEYS.some(({ key }) => /[A-Z]/.test(values[key]))) {
    warnings.push("Values are case-sensitive in analytics: \"Facebook\" and \"facebook\" are reported as two sources. Lowercase keeps reports tidy.");
  }

  // Replace existing utm_* values rather than duplicating them. Every other parameter is kept exactly
  // as written (URLSearchParams would re-encode the whole query string, e.g. turning %20 into +).
  const utmParams = new Set(UTM_KEYS.map((k) => k.param));
  const kept = splitQuery(url.search.slice(1))
    .filter((q) => !utmParams.has(q.name.toLowerCase()))
    .map((q) => q.raw);
  const added = UTM_KEYS.filter(({ key }) => values[key] !== "").map(({ key, param }) => `${param}=${encodeURIComponent(values[key])}`);
  const query = [...kept, ...added].join("&");
  return { ok: true, url: `${url.origin}${url.pathname}${query ? `?${query}` : ""}${url.hash}`, warnings };
}

// ---------------------------------------------------------------------
// Link Studio's public URL tools (Release 4). Each runs entirely in the
// browser — the links people paste are never sent to a server. Short-link
// creation itself is admin-only and lives at /link-studio/admin.
// ---------------------------------------------------------------------

import type { ToolDefinition } from "../types/tool";

const ADDED = "2026-11-12";

const common = {
  hub: "link",
  addedOn: ADDED,
  lastModified: ADDED,
  category: "web",
  categoryLabel: "URL Tools",
  acceptedMime: [],
  maxFileSize: 1,
  inputKind: "text",
  multiple: false,
  processingMode: "CLIENT",
  endpoint: null,
} as const satisfies Partial<ToolDefinition>;

export const LINK_TOOLS: ToolDefinition[] = [
  {
    ...common,
    id: "utm-builder",
    slug: "utm-builder",
    name: "UTM Builder",
    shortName: "UTM Builder",
    description: "Add UTM campaign tags to any link so Google Analytics shows exactly which newsletter, post or ad sent each visitor.",
    acceptedFormats: ["A landing-page URL", "Campaign source, medium and name"],
    inputLimitLabel: "Any http:// or https:// address",
    actionLabel: "Build link",
    icon: "UTM",
    outputExtension: "URL",
    sectionHeadings: {
      intro: "Track where your visitors come from",
      howItWorks: "How to build a UTM link",
    },
    howItWorks: [
      "Paste the address of the page people should land on.",
      "Fill in the campaign source (where the link is posted, e.g. newsletter), the medium (the type of channel, e.g. email) and a campaign name.",
      "Optionally add a term, content label or campaign ID, and choose how spaces are written.",
      "Copy the finished link, or open it in a new tab to check it lands on the right page.",
    ],
    features: [
      "All six UTM parameters, including utm_id for Google Analytics 4 cost imports",
      "Keeps the page's existing parameters and #anchor exactly as they were",
      "Replaces old UTM tags instead of adding duplicates",
      "Optional lowercase and space replacement, so \"Email\" and \"email\" don't split your reports",
      "Warnings for a missing medium or campaign, and for mediums GA4 won't recognise",
    ],
    useCases: [
      "Telling apart visits from two newsletters that link to the same page",
      "Comparing which social network sends the most engaged visitors",
      "Tagging the link behind a printed QR code so offline visits are counted",
      "Measuring an influencer or partner campaign without giving them analytics access",
    ],
    limitations: [
      "UTM tags only describe the visit — your site needs Google Analytics (or another tool that reads them) to report on them",
      "Don't add UTM tags to links between pages of your own site: Google Analytics would credit the visit to your internal link instead of where the visitor really came from",
      "Anyone can see and edit the tags in the address, so they're for reporting, not for security",
    ],
    faq: [
      {
        question: "Which UTM parameters are required?",
        answer:
          "Google Analytics needs utm_source to recognise a campaign link, and you should always add utm_medium and utm_campaign too — without a medium, visits are grouped under \"(not set)\" and can't be placed in a channel such as Email or Organic Social. utm_term, utm_content and utm_id are optional.",
      },
      {
        question: "What should I put in source and medium?",
        answer:
          "Source is the specific place the link appears: newsletter, facebook, partner-site. Medium is the type of channel: email, social, cpc, referral, display. Keep a consistent list — GA4 sorts visits into its default channel groups by medium, so a made-up medium such as \"fb-post\" lands in \"Unassigned\".",
      },
      {
        question: "Are UTM values case-sensitive?",
        answer:
          "Yes. Google Analytics reports \"Facebook\", \"facebook\" and \"FACEBOOK\" as three separate sources. The Lowercase option, on by default, avoids that.",
      },
      {
        question: "Can I shorten a UTM link?",
        answer:
          "Yes — a short link that redirects to the full tagged address keeps every UTM tag, because the visitor's browser lands on the tagged URL. That's a common way to keep long campaign links tidy on print and social media.",
      },
    ],
    relatedTools: ["url-parser-cleaner", "qr-code-generator", "url-validator", "url-encoder-decoder"],
    intro: [
      "Analytics tools can tell you that a visitor came from \"email\" or \"facebook.com\", but not which email or which post. UTM tags fix that: five or six short labels added to the end of a link, which Google Analytics reads when someone clicks it and files the visit under the campaign you named.",
      "This builder adds the tags correctly every time — properly encoded, in a consistent case, without disturbing the page's own parameters — and warns you about the mistakes that quietly ruin campaign reports, such as a missing medium or one GA4 doesn't recognise.",
    ],
    formatsNote: "Enter any http:// or https:// landing-page address (https:// is added if you leave it off). The result is the same address with utm_ parameters added; nothing is sent to a server.",
    seo: {
      title: "UTM Builder – Free Campaign URL Builder for Google Analytics | Toolkit4Me",
      metaDescription:
        "Build UTM tracking links for Google Analytics 4 in seconds. Adds utm_source, utm_medium and utm_campaign correctly, keeps existing parameters, and warns about common mistakes.",
      h1: "UTM Builder",
      keywords: ["utm builder", "campaign url builder", "utm link generator", "google analytics utm"],
    },
  },
  {
    ...common,
    id: "url-parser-cleaner",
    slug: "url-parser-cleaner",
    name: "URL Parser & Cleaner",
    shortName: "URL Cleaner",
    description: "Break any link into its parts and strip tracking junk such as utm_ tags, fbclid and gclid before you share it.",
    acceptedFormats: ["Any web address (URL)"],
    inputLimitLabel: "Any http:// or https:// address",
    actionLabel: "Clean link",
    icon: "✂",
    outputExtension: "URL",
    sectionHeadings: {
      intro: "See what's inside a link — and remove what doesn't belong",
    },
    howItWorks: [
      "Paste a link — from a browser, an app's Share button or an email.",
      "Read the breakdown: scheme, domain, port, path, each query parameter (decoded) and the #fragment. Tracking parameters are marked.",
      "Choose what to remove: tracking parameters (on by default), empty parameters, all parameters, the fragment, a trailing slash or www.",
      "Copy the cleaned link. The list underneath shows exactly what was removed.",
    ],
    features: [
      "Removes 30+ known tracking parameters, including utm_*, fbclid, gclid, msclkid, igshid, mc_eid and _hsenc",
      "Kept parameters stay byte-for-byte as they were, so the link still works",
      "Decoded view of every query parameter and path segment",
      "Optional: remove all parameters, empty ones or the fragment; sort parameters; drop www or a trailing slash",
    ],
    useCases: [
      "Sharing a product or article link without the ad-click IDs a site or app attached to it",
      "Reading what an unfamiliar link actually contains before you click it",
      "Normalising links before comparing them or storing them in a spreadsheet",
      "Debugging a query string that a web form or API is sending",
    ],
    limitations: [
      "Only parameters on a known tracking list are removed automatically; a site's own tracking parameters with ordinary names (such as ref or id) are left alone, because removing them could break the link",
      "\"Remove all parameters\" can break links that need them — search results, product variants and many video links",
      "It reads the address only; it doesn't follow redirects, so a shortened link is parsed as the short link itself",
    ],
    faq: [
      {
        question: "Will a cleaned link still work?",
        answer:
          "With the default setting, almost always — tracking parameters such as utm_source and fbclid are read by analytics scripts, not by the page itself. Kept parameters are copied exactly as written, not re-encoded. Options such as removing every parameter are more aggressive, so open the cleaned link once to check.",
      },
      {
        question: "What are fbclid, gclid and msclkid?",
        answer:
          "Click identifiers added by Facebook/Meta, Google Ads and Microsoft Ads. They let the advertiser match your visit to the ad you clicked. They don't affect the page, and removing them before you re-share a link stops the original click being credited to every later visitor.",
      },
      {
        question: "Why are some parameters marked but my link still has them?",
        answer:
          "Only the clean-ups you tick are applied. If \"Remove tracking parameters\" is off, tracking parameters are shown but kept.",
      },
      {
        question: "Is the link I paste sent anywhere?",
        answer: "No. Parsing and cleaning use your browser's built-in URL parser, so the address never leaves your device.",
      },
    ],
    relatedTools: ["url-validator", "utm-builder", "url-encoder-decoder", "qr-code-generator"],
    intro: [
      "Links copied from apps, emails and ads often carry a tail of tracking codes — utm_source, fbclid, gclid and friends — that make them long, hard to read and quietly tie every later click back to the original campaign. This tool shows what each part of a link is, decodes the query string into a readable table, and removes the tracking parts in one step.",
      "Cleaning works on the original text of the link rather than re-building it, so every parameter you keep stays exactly as it was. Nothing is uploaded: the whole job runs in your browser.",
    ],
    formatsNote: "Paste any http:// or https:// address (https:// is assumed if you paste a bare domain). The output is the cleaned address plus a list of removed parameters; nothing is sent to a server.",
    seo: {
      title: "URL Cleaner & Parser – Remove Tracking Parameters from Links | Toolkit4Me",
      metaDescription:
        "Strip utm_ tags, fbclid, gclid and other tracking parameters from any link, and see its domain, path and query parameters decoded. Free, private and runs in your browser.",
      h1: "URL Parser & Cleaner",
      keywords: ["url cleaner", "remove tracking parameters", "remove fbclid", "url parser", "clean url"],
    },
  },
  {
    ...common,
    id: "url-validator",
    slug: "url-validator",
    name: "URL Validator",
    shortName: "URL Validator",
    description: "Check whether a web address is complete and well-formed, and catch problems such as missing https://, spaces or look-alike domains.",
    acceptedFormats: ["Any web address (URL)"],
    inputLimitLabel: "One address at a time",
    actionLabel: "Check URL",
    icon: "✓",
    outputExtension: "Report",
    howItWorks: [
      "Paste the address you want to check.",
      "Select Check URL. Errors (it won't work), warnings (it works but may cause trouble) and notes are listed separately.",
      "If the address is fixable — for example, it's missing https:// or contains a space — a corrected version is suggested. Use it with one click.",
      "See how browsers will read the address, split into scheme, domain, path, query and fragment.",
    ],
    features: [
      "Checks the scheme, domain structure, label lengths, IP addresses, ports and overall length",
      "Spots spaces and invisible characters that break links copied from documents",
      "Flags addresses with embedded user names, international (punycode) domains and plain http://",
      "Suggests a corrected address when the problem is a simple one",
    ],
    useCases: [
      "Checking a link before it's printed on a flyer or encoded in a QR code, where mistakes can't be fixed later",
      "Finding why a link pasted into an email, app or ad platform is rejected",
      "Checking a suspicious link for disguised domains before you open it",
      "Validating addresses in a content or data-entry workflow",
    ],
    limitations: [
      "It checks the address's structure, not whether the page exists — browsers block websites from requesting other sites' pages, so a reachability check isn't possible from your browser",
      "It can't tell whether a website is safe; a well-formed address can still lead to a harmful page",
      "One address at a time",
    ],
    faq: [
      {
        question: "Does a valid result mean the link works?",
        answer:
          "It means the address is correctly built and any browser or app will read it the same way. It can't confirm the page exists, because a page in your browser isn't allowed to fetch other websites. Open the link once to check it loads.",
      },
      {
        question: "Why does it say my link is missing https://?",
        answer:
          "Browsers fill in https:// when you type example.com in the address bar, but most other places don't — QR codes, emails, apps and short-link services need the full address or they treat the text as plain words. The suggested fix adds it for you.",
      },
      {
        question: "What does the warning about international characters mean?",
        answer:
          "Domains can contain non-Latin letters, which browsers convert to a \"punycode\" form starting with xn--. That's legitimate, but it's also how look-alike domains are built (a Cyrillic \"а\" instead of a Latin \"a\"). The warning shows the real form so you can check it.",
      },
      {
        question: "Is the address I check sent to a server?",
        answer: "No. The check runs entirely in your browser using its built-in URL parser.",
      },
    ],
    relatedTools: ["url-parser-cleaner", "url-encoder-decoder", "qr-code-generator", "utm-builder"],
    intro: [
      "A link that's one character wrong fails silently: a space copied from a document, a missing https://, a stray hyphen in the domain. This validator reads the address the way browsers and apps do and tells you, in plain language, what's wrong and how to fix it — before it goes on a poster, into a QR code or out in an email.",
      "It also points out addresses that work but deserve a second look, such as unencrypted http:// pages, IP addresses in place of domain names, and international domains that can hide look-alike letters.",
    ],
    formatsNote: "Paste one web address. The result is a list of errors, warnings and notes, a suggested fix where possible, and the address split into its parts. Nothing is sent to a server.",
    seo: {
      title: "URL Validator – Check if a Link Is Valid and Well-Formed | Toolkit4Me",
      metaDescription:
        "Check any web address for missing https://, spaces, invalid domains, look-alike characters and other problems — with a suggested fix. Free and private, in your browser.",
      h1: "URL Validator",
      keywords: ["url validator", "check url", "validate link", "is this url valid"],
    },
  },
  {
    ...common,
    id: "url-encoder-decoder",
    slug: "url-encoder-decoder",
    name: "URL Encoder & Decoder",
    shortName: "URL Encoder",
    description: "Percent-encode text for safe use in a link, or decode %20-style sequences back into readable text.",
    acceptedFormats: ["Plain text", "Percent-encoded text"],
    inputLimitLabel: "Up to 100,000 characters",
    actionLabel: "Encode",
    icon: "%",
    outputExtension: "Text",
    howItWorks: [
      "Paste the text or link you want to convert.",
      "To encode, choose what it's for: a single value (a query parameter or path segment), a whole address, or form data where spaces become +.",
      "Select Encode or Decode. When decoding, choose whether + means a space.",
      "Copy the result. If the decoded text still contains % sequences, you'll be told it was probably encoded twice.",
    ],
    features: [
      "Three encoding modes: component (encodeURIComponent), full URL (encodeURI) and form (+ for spaces)",
      "Full UTF-8 support, including accented letters, non-Latin scripts and emoji",
      "Decoding errors point to the exact broken % sequence",
      "Detects double-encoded text such as %2520",
    ],
    useCases: [
      "Putting a search phrase, email address or another URL inside a query parameter",
      "Reading a percent-encoded link from a log file or analytics report",
      "Fixing a redirect URL that's been encoded twice",
      "Building mailto: links with a subject and body",
    ],
    limitations: [
      "Encoding a whole address with \"single value\" mode also encodes its : and / characters — use \"whole address\" mode for complete links",
      "It follows the browser's encoding rules (RFC 3986 with UTF-8); some older systems expect other character sets",
      "Up to 100,000 characters at a time",
    ],
    faq: [
      {
        question: "What is URL encoding?",
        answer:
          "Links may only contain a limited set of characters. Anything else — spaces, accented letters, emoji, and characters that have a special meaning in links such as & and ? — is written as a % followed by two hexadecimal digits for each byte. A space becomes %20 and é becomes %C3%A9.",
      },
      {
        question: "Which mode should I use?",
        answer:
          "Use \"single value\" for anything that goes inside a link — a query parameter's value or one path segment — so its & ? / = characters can't break the surrounding address. Use \"whole address\" to make a complete link safe without breaking its structure. Use \"form\" when a system expects HTML-form encoding, where spaces are +.",
      },
      {
        question: "Why does my decoded text still contain %20?",
        answer:
          "The text was encoded twice — the % of %20 was itself encoded as %25, giving %2520. Decode it again. The tool warns you when it sees this.",
      },
      {
        question: "Is a + a space?",
        answer:
          "Only in form-encoded data (such as query strings submitted by HTML forms). In other parts of a link, + is a literal plus sign. Tick \"Treat + as a space\" only when decoding form data or query strings.",
      },
    ],
    relatedTools: ["url-parser-cleaner", "url-validator", "base64-encoder-decoder", "utm-builder"],
    intro: [
      "Spaces, accented letters, emoji and symbols such as & or ? can't appear in a link as they are — they're written as percent-encoded sequences like %20 and %C3%A9. This tool converts text to that form so it's safe inside a link, and turns encoded links back into readable text.",
      "It uses the same encoding functions as every browser, offers the three modes developers actually need, and explains decoding errors instead of just failing — including spotting text that was encoded twice.",
    ],
    formatsNote: "Paste up to 100,000 characters of text or percent-encoded text. The result is plain text you can copy. Nothing is sent to a server.",
    seo: {
      title: "URL Encoder & Decoder – Percent-Encode and Decode Online | Toolkit4Me",
      metaDescription:
        "Encode text for use in URLs (encodeURIComponent, encodeURI or form encoding) or decode %20-style text back to readable characters. Free, UTF-8, runs in your browser.",
      h1: "URL Encoder & Decoder",
      keywords: ["url encoder", "url decoder", "percent encoding", "urlencode online", "decode url"],
    },
  },
];

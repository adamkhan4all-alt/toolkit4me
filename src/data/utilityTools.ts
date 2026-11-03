// ---------------------------------------------------------------------
// Utility tools added in the 2026-11 expansion (text, developer and image
// utilities). Same ToolDefinition shape as src/data/tools.ts, which merges
// these into TOOL_DEFINITIONS — kept in a separate file only so neither
// file grows unmanageably long. Every one runs entirely in the browser.
// ---------------------------------------------------------------------

import type { ToolDefinition } from "../types/tool";

const ADDED = "2026-11-04";

export const UTILITY_TOOLS: ToolDefinition[] = [
  {
    id: "json-formatter",
    slug: "json-formatter",
    lastModified: ADDED,
    name: "JSON Formatter & Validator",
    shortName: "JSON Formatter",
    category: "web",
    categoryLabel: "Web & Developer",
    description: "Format, validate and minify JSON in your browser. Invalid JSON is pinpointed by line and column so you can fix it fast.",
    acceptedFormats: ["JSON text"],
    acceptedMime: [],
    maxFileSize: 5,
    inputKind: "text",
    inputLimitLabel: "Up to 5,000,000 characters",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Format JSON",
    icon: "{ }",
    outputExtension: "json",
    howItWorks: [
      "Paste your JSON into the box, or load the example.",
      "Choose 2 spaces, 4 spaces or tabs, and whether to sort keys.",
      "Select Format JSON to validate and pretty-print it, or Minify to strip the whitespace.",
      "Copy the result or download it as a .json file.",
    ],
    features: [
      "Errors reported with line and column, plus the offending line",
      "Pretty-print with 2 spaces, 4 spaces or tabs",
      "Minify to a single compact line",
      "Optional alphabetical key sorting for easier comparison",
    ],
    useCases: [
      "Reading a one-line API response that's impossible to scan by eye",
      "Finding the missing comma or bracket that breaks a config file",
      "Minifying JSON before embedding it in a script or request",
    ],
    limitations: [
      "Only strict JSON is accepted — comments, trailing commas and single-quoted strings (JSON5/JSONC) are reported as errors",
      "Integers larger than 9,007,199,254,740,991 can't be stored exactly and are rounded; the tool warns you when it finds them",
      "If an object repeats a key, only the last value is kept, as with JSON.parse everywhere",
      "Up to 5,000,000 characters of input",
    ],
    faq: [
      {
        question: "Why does it say “Unexpected token”?",
        answer:
          "The parser found a character that isn't allowed at that point. The most common causes are a trailing comma after the last item, a missing comma between items, single quotes instead of double quotes, or a comment. The line and column shown point to where the parser gave up — the actual mistake is usually there or just before it.",
      },
      {
        question: "Does formatting change my data?",
        answer:
          "No — only whitespace changes, unless you choose to sort keys (which reorders object keys but keeps every value). The one exception is very large integers, which JavaScript can't represent exactly; the tool warns you if your JSON contains any.",
      },
      {
        question: "What's the difference between Format and Minify?",
        answer:
          "Both validate the JSON first. Format adds line breaks and indentation so it's easy to read; Minify removes all unnecessary whitespace so the JSON is as small as possible for storage or transfer.",
      },
      {
        question: "Is my JSON sent to a server?",
        answer: "No. Parsing and formatting use your browser's built-in JSON engine, so your data never leaves your device — useful for API keys or customer data you shouldn't paste into online services.",
      },
    ],
    relatedTools: ["base64-encoder-decoder", "text-compare", "meta-tag-generator", "word-counter"],
    intro: [
      "JSON is easy for programs to read and surprisingly hard for people to read — especially when an API returns it as one enormous line, or a configuration file refuses to load because of a single misplaced character. This tool parses your JSON, tells you exactly where it's broken if it is, and lays it out with consistent indentation when it isn't.",
      "Everything runs in your browser using the same JSON engine your web apps use, so a file that validates here will parse the same way in JavaScript. Use Minify when you need the opposite: the smallest possible version of valid JSON for a request body or embedded config.",
    ],
    formatsNote: "Paste standard JSON (RFC 8259) of up to 5,000,000 characters. Output is formatted or minified JSON you can copy or download as a .json file.",
    seo: {
      title: "JSON Formatter & Validator – Beautify and Minify JSON | Toolkit4Me",
      metaDescription:
        "Format, validate and minify JSON online for free. Errors are shown with line and column numbers, and everything runs in your browser, so your data stays private.",
      h1: "JSON Formatter & Validator",
      keywords: ["json formatter", "json validator", "json beautifier", "minify json"],
    },
  },
  {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    lastModified: ADDED,
    name: "QR Code Generator",
    shortName: "QR Code Generator",
    category: "web",
    categoryLabel: "Web & Developer",
    description: "Turn a link or any text into a QR code and download it as a PNG or SVG — no sign-up, no expiry, no tracking.",
    acceptedFormats: ["Links (URLs)", "Plain text"],
    acceptedMime: [],
    maxFileSize: 1,
    inputKind: "text",
    inputLimitLabel: "Up to 2,331 bytes at Medium error correction",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Download PNG",
    icon: "QR",
    outputExtension: "png / .svg",
    howItWorks: [
      "Type or paste the link or text you want to encode.",
      "Pick an error-correction level, a PNG size and, if you like, your colours.",
      "Check the live preview with your phone's camera.",
      "Download the code as a PNG for screens or an SVG for print.",
    ],
    features: [
      "Live preview as you type",
      "PNG at 256, 512 or 1024 pixels, or scalable SVG",
      "Four error-correction levels",
      "Custom colours with a contrast check so codes stay scannable",
    ],
    useCases: [
      "Putting your website or menu link on a poster, flyer or table card",
      "Adding a scannable link to a slide or printed handout",
      "Sharing a long URL that would be tedious to type on a phone",
    ],
    limitations: [
      "Codes are static: the content is encoded directly, so it can't be edited after printing and scans can't be counted",
      "Longer text makes a denser code that's harder to scan — keep links short where you can",
      "Logos can't be added; if you overlay one yourself, use High error correction and test it",
      "Capacity ranges from 1,273 bytes (High) to 2,953 bytes (Low)",
    ],
    faq: [
      {
        question: "Do these QR codes expire?",
        answer:
          "No. The link or text is stored in the pattern itself, not on our servers, so the code works for as long as the link it points to works. There's no account and nothing to renew.",
      },
      {
        question: "Which error-correction level should I choose?",
        answer:
          "Medium suits most uses. Choose High if the code may get scuffed or partly covered (for example by a logo); it can be read even with about 30% damage, at the cost of a denser pattern. Low packs in the most data but tolerates little damage.",
      },
      {
        question: "PNG or SVG?",
        answer:
          "PNG is a normal image, ideal for websites, documents and slides — choose a size at least as large as it will appear. SVG is a vector format that stays perfectly sharp at any size, which makes it the better choice for print.",
      },
      {
        question: "Can I track how many people scan my code?",
        answer:
          "Not with a static code like these. Scan tracking requires a “dynamic” code that sends people through a redirect service first; if you need numbers, add tracking parameters to your link and measure visits in your own website analytics.",
      },
    ],
    relatedTools: ["meta-tag-generator", "base64-encoder-decoder", "image-resizer", "json-formatter"],
    intro: [
      "A QR code is a quick way to get someone from paper to a web page: point a phone camera at it and the link opens. This generator encodes your link or text directly into the code, so there's no redirect in the middle, no account to keep alive and nothing that stops working next year.",
      "The preview updates as you type. Choose an error-correction level to balance capacity against durability, pick colours that suit your design — the tool warns you if they'd make the code hard to scan — and download a PNG for screens or an SVG that stays crisp at any print size.",
    ],
    formatsNote: "Encodes links and text, including non-English characters (UTF-8). Capacity depends on the error-correction level: up to 2,953 bytes at Low and 1,273 at High. Output is a PNG (256–1024 px) or an SVG.",
    seo: {
      title: "Free QR Code Generator – PNG & SVG, No Expiry | Toolkit4Me",
      metaDescription:
        "Create a QR code for any link or text and download it as PNG or SVG. Static codes that never expire, custom colours with a scan-safety check, and no sign-up.",
      h1: "QR Code Generator",
      keywords: ["qr code generator", "free qr code", "qr code svg", "create qr code for link"],
    },
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    lastModified: ADDED,
    name: "Image Resizer",
    shortName: "Image Resizer",
    category: "edit",
    categoryLabel: "Edit Image",
    description: "Resize JPG, PNG and WebP images to exact pixel dimensions or a maximum width or height — in your browser, several at once.",
    acceptedFormats: ["JPG", "PNG", "WEBP"],
    acceptedMime: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 25,
    maxFiles: 20,
    multiple: true,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Resize images",
    icon: "RESIZE",
    outputExtension: "jpg / .png / .webp",
    options: [
      { id: "width", label: "Width (px)", type: "text", defaultValue: "", placeholder: "e.g. 1200", helpText: "Leave blank to calculate it from the height." },
      { id: "height", label: "Height (px)", type: "text", defaultValue: "", placeholder: "e.g. 800", helpText: "Leave blank to calculate it from the width." },
      {
        id: "fit",
        label: "When both are set",
        type: "select",
        choices: [
          { value: "contain", label: "Keep aspect ratio (fit inside the box)" },
          { value: "exact", label: "Use exact size (may stretch)" },
        ],
        defaultValue: "contain",
      },
      {
        id: "outputFormat",
        label: "Output format",
        type: "select",
        choices: [
          { value: "original", label: "Same as original" },
          { value: "jpeg", label: "JPG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WebP" },
        ],
        defaultValue: "original",
      },
    ],
    howItWorks: [
      "Add up to 20 JPG, PNG or WebP images.",
      "Enter a width, a height, or both, and choose how to handle the aspect ratio.",
      "Optionally pick a different output format, then select Resize images.",
      "Download each resized image — the new size is added to its file name.",
    ],
    features: [
      "Resize by width, height or both",
      "Keeps the aspect ratio unless you choose an exact size",
      "Batch-resize up to 20 images at once",
      "Save as the original format, JPG, PNG or WebP",
    ],
    useCases: [
      "Meeting an upload form's exact size requirement, such as 600 × 600 pixels",
      "Shrinking phone photos to 1600 pixels wide before posting them online",
      "Making consistently sized product photos for an online shop",
    ],
    limitations: [
      "Enlarging an image can't add detail — upscaled images look softer",
      "Output is limited to about 16.7 megapixels (for example 4096 × 4096) so it works reliably on phones",
      "WebP output needs a browser that can create WebP (Chrome, Edge or Firefox; older Safari can't)",
      "Saving re-encodes the image, which removes embedded metadata such as camera details and location",
    ],
    faq: [
      {
        question: "How do I keep the proportions?",
        answer:
          "Fill in just the width or just the height and the other side is calculated for you. If you fill in both, the default “Keep aspect ratio” option fits the image inside that box without distorting it.",
      },
      {
        question: "How do I get an exact size like 600 × 600?",
        answer:
          "Enter both numbers and choose “Use exact size”. If the original isn't the same shape, it will be stretched to fit; to avoid that, crop the image to the right shape first.",
      },
      {
        question: "Does resizing reduce the file size?",
        answer:
          "Making an image smaller reduces its file size, usually a lot, because there are fewer pixels to store. For even smaller files, save as JPG or WebP, or run the result through Compress Image.",
      },
      {
        question: "Are my images uploaded?",
        answer: "No. Resizing happens in your browser using the Canvas API, so your images never leave your device.",
      },
    ],
    relatedTools: ["compress-image", "webp-converter", "png-to-jpg", "jpg-to-png"],
    intro: [
      "Most image problems online are really size problems: a photo straight off a phone is around 4000 pixels wide, while a website column, an email or an upload form usually wants something between 600 and 2000. This tool scales your images to the dimensions you need — by width, by height, or to an exact box.",
      "By default it keeps the original proportions, so nothing gets squashed; choose the exact-size option only when a form demands specific dimensions. Resizing happens in your browser, so even a batch of large photos is processed without uploading anything.",
    ],
    formatsNote: "Accepts JPG, PNG and WebP images up to 25MB each, up to 20 per batch. Output is JPG, PNG or WebP, up to about 16.7 megapixels.",
    seo: {
      title: "Image Resizer – Resize JPG, PNG & WebP Online Free | Toolkit4Me",
      metaDescription:
        "Resize images to exact pixels or a maximum width or height, keeping the aspect ratio. Batch-resize JPG, PNG and WebP in your browser — nothing is uploaded.",
      h1: "Image Resizer",
      keywords: ["image resizer", "resize image", "resize photo online", "resize jpg"],
    },
  },
];

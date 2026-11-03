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
  {
    id: "word-counter",
    slug: "word-counter",
    lastModified: ADDED,
    name: "Word Counter",
    shortName: "Word Counter",
    category: "text",
    categoryLabel: "Text",
    description: "Count words, characters, sentences and paragraphs as you type, with reading time and your most-used words.",
    acceptedFormats: ["Plain text"],
    acceptedMime: [],
    maxFileSize: 1,
    inputKind: "text",
    inputLimitLabel: "Up to 1,000,000 characters",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Copy counts",
    icon: "WORDS",
    outputExtension: "txt",
    howItWorks: [
      "Type in the box or paste your text.",
      "The counts update instantly as you write.",
      "Check the most frequent words to spot repetition.",
      "Copy the counts if you need to report them.",
    ],
    features: [
      "Words, characters (with and without spaces), sentences, paragraphs and lines",
      "Reading and speaking time estimates",
      "Your ten most frequent words, ignoring filler words",
      "Language-aware counting, including Chinese and Japanese text",
    ],
    useCases: [
      "Keeping an essay or application answer within a word limit",
      "Fitting a meta description or social post into a character limit",
      "Estimating how long a speech or presentation script will take",
    ],
    limitations: [
      "Counts can differ slightly from Word or Google Docs, which treat things like URLs and numbers with symbols in their own ways",
      "Reading and speaking times are estimates based on average speeds (238 and 140 words per minute)",
      "Frequent-word filtering uses an English list of common words",
      "Up to 1,000,000 characters are counted",
    ],
    faq: [
      {
        question: "How are words counted?",
        answer:
          "Words are found using your browser's built-in, language-aware text segmentation, so punctuation isn't counted, contractions like “don't” count as one word, and hyphenated words like “well-known” count as one, as in most word processors. Languages written without spaces, such as Chinese and Japanese, are split into words rather than counted as one long word.",
      },
      {
        question: "Do characters include spaces?",
        answer:
          "Both counts are shown. “Characters” includes spaces and line breaks — the number most character limits (like social media posts) refer to. “Characters (no spaces)” leaves all whitespace out. Emoji and accented letters count as one character each.",
      },
      {
        question: "How is reading time worked out?",
        answer:
          "Reading time divides the word count by 238 words per minute, the average silent-reading speed for adults reading non-fiction; speaking time uses 140 words per minute, a comfortable presentation pace. Technical text and slower speakers will take longer.",
      },
      {
        question: "Is my text saved or uploaded?",
        answer: "No. Everything is counted in your browser and nothing is stored — refreshing the page clears the text.",
      },
    ],
    relatedTools: ["text-compare", "meta-tag-generator", "image-to-text", "json-formatter"],
    intro: [
      "Word limits are everywhere: essays, job applications, grant forms, product descriptions, social posts. This counter shows your word and character counts the moment you start typing, so you can trim or expand while you write instead of checking at the end.",
      "Alongside the basic counts you get sentences, paragraphs, estimated reading and speaking time, and a list of the words you use most — handy for spotting a term you've repeated too often. Counting is language-aware, so contractions, hyphenated words, emoji and non-Latin scripts are all handled sensibly.",
    ],
    formatsNote: "Type or paste plain text of up to 1,000,000 characters. Formatting such as bold or links isn't counted, only the text itself.",
    seo: {
      title: "Word Counter – Count Words & Characters Online | Toolkit4Me",
      metaDescription:
        "Free online word counter: count words, characters (with and without spaces), sentences and paragraphs as you type, plus reading time and most-used words.",
      h1: "Word Counter",
      keywords: ["word counter", "character counter", "count words online", "word count tool"],
    },
  },
  {
    id: "text-compare",
    slug: "text-compare",
    lastModified: ADDED,
    name: "Text Compare (Diff Checker)",
    shortName: "Text Compare",
    category: "text",
    categoryLabel: "Text",
    description: "Compare two versions of a text and see exactly what was added, removed or changed — line by line or word by word.",
    acceptedFormats: ["Plain text", "Code"],
    acceptedMime: [],
    maxFileSize: 1,
    inputKind: "text",
    inputLimitLabel: "Up to 300,000 characters per side",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Compare text",
    icon: "DIFF",
    outputExtension: "diff",
    howItWorks: [
      "Paste the original text on the left and the changed version on the right.",
      "Choose line or word comparison, and whether to ignore case or extra spaces.",
      "Select Compare text to highlight additions in green and removals in red.",
      "Download the result as a standard .diff file if you need to share or apply it.",
    ],
    features: [
      "Line-by-line or word-by-word comparison",
      "Ignore differences in upper/lower case or spacing",
      "Counts of added and removed lines or words",
      "Download a standard unified .diff (patch) file",
    ],
    useCases: [
      "Seeing what changed between two drafts of a contract or policy",
      "Checking which settings differ between two configuration files",
      "Reviewing edits someone made to text you wrote",
    ],
    limitations: [
      "Plain text only — formatting in Word or PDF documents isn't compared (copy the text out first)",
      "Moved paragraphs show up as a removal plus an addition, not as a move",
      "Very large or completely different texts may be too slow to compare and will show a message instead",
      "Up to 300,000 characters on each side",
    ],
    faq: [
      {
        question: "Should I compare by line or by word?",
        answer:
          "Line mode suits code, configuration files, lists and anything where each line is meaningful — it shows which lines changed. Word mode suits prose: it highlights the exact words that were added or removed inside a paragraph.",
      },
      {
        question: "What does “ignore extra spaces” do?",
        answer:
          "In line mode it treats lines as equal if they differ only in leading, trailing or repeated spaces, so re-indented code or a stray double space doesn't show up as a change.",
      },
      {
        question: "What is the .diff download?",
        answer:
          "It's a unified diff, the standard format used by Git and the patch command. Developers can review it in any code editor or apply it to the original file to produce the changed version.",
      },
      {
        question: "Is my text uploaded?",
        answer: "No. The comparison runs in your browser, so neither version is sent anywhere — safe for confidential drafts.",
      },
    ],
    relatedTools: ["word-counter", "json-formatter", "base64-encoder-decoder", "pdf-to-word"],
    intro: [
      "When two versions of a document look almost the same, finding what actually changed by eye is slow and unreliable. Paste both versions here and every difference is highlighted: added text in green, removed text in red, with a count of how much changed.",
      "Compare line by line for code, configuration and lists, or word by word for prose, where you want to see the exact words that were edited. Options to ignore case and spacing help you focus on real changes rather than formatting noise.",
    ],
    formatsNote: "Paste plain text or code, up to 300,000 characters on each side. Results can be downloaded as a unified .diff file.",
    seo: {
      title: "Text Compare – Free Online Diff Checker | Toolkit4Me",
      metaDescription:
        "Compare two texts and highlight every difference, line by line or word by word. Ignore case or spacing, download a .diff, and keep your text private in the browser.",
      h1: "Text Compare (Diff Checker)",
      keywords: ["text compare", "diff checker", "compare two texts", "find differences in text"],
    },
  },
  {
    id: "base64-encoder-decoder",
    slug: "base64-encoder-decoder",
    lastModified: ADDED,
    name: "Base64 Encoder / Decoder",
    shortName: "Base64 Encode / Decode",
    category: "web",
    categoryLabel: "Web & Developer",
    description: "Encode text or files to Base64, or decode Base64 back to text or a downloadable file. Handles UTF-8 and URL-safe Base64.",
    acceptedFormats: ["Text", "Base64", "Any file (to encode)"],
    acceptedMime: [],
    maxFileSize: 10,
    inputKind: "text",
    inputLimitLabel: "10,000,000 characters of text, or files up to 10MB",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Encode",
    icon: "B64",
    outputExtension: "txt",
    howItWorks: [
      "Paste text to encode, or Base64 to decode — or choose a file to encode.",
      "Optionally switch on URL-safe output, or data: URL output for files.",
      "Select Encode or Decode.",
      "Copy the result, or download it; Base64 that decodes to a file (such as an image) downloads as that file.",
    ],
    features: [
      "Correct UTF-8 handling for accented letters, non-Latin scripts and emoji",
      "Standard and URL-safe Base64, with or without padding",
      "Encode any file up to 10MB, optionally as a data: URL",
      "Decodes images and other files back to a downloadable file",
    ],
    useCases: [
      "Decoding a Base64 value from an API response or a JWT payload to read it",
      "Embedding a small image in CSS or HTML as a data: URL",
      "Encoding credentials or binary data for a config file or HTTP header",
    ],
    limitations: [
      "Base64 is an encoding, not encryption — anyone can decode it, so never use it to hide secrets",
      "Encoded output is about a third larger than the original",
      "Text up to 10,000,000 characters and files up to 10MB",
    ],
    faq: [
      {
        question: "What is Base64 used for?",
        answer:
          "Base64 represents binary data using only 64 safe text characters (A–Z, a–z, 0–9, + and /), so it can travel through systems built for text: email attachments, JSON and XML fields, data: URLs in web pages, and HTTP authentication headers.",
      },
      {
        question: "Why does my non-English text decode as gibberish elsewhere?",
        answer:
          "Base64 encodes bytes, not letters, so the text must be turned into bytes first. This tool always uses UTF-8, the web's standard. If another tool used a different character encoding — or the browser's btoa function, which can't handle characters outside Latin-1 at all — the results won't match.",
      },
      {
        question: "What's the difference between standard and URL-safe Base64?",
        answer:
          "Standard Base64 uses + and / and pads the end with =, which have special meanings in URLs. URL-safe Base64 (RFC 4648) uses - and _ instead and usually drops the padding, so the value can sit in a URL or filename unchanged. The decoder accepts both.",
      },
      {
        question: "Is Base64 secure?",
        answer:
          "No — it's an encoding, not encryption, and decoding it takes no key. Use it to transport data, never to protect it. Since this tool runs in your browser, nothing you encode or decode is sent to a server.",
      },
    ],
    relatedTools: ["json-formatter", "qr-code-generator", "meta-tag-generator", "text-compare"],
    intro: [
      "Base64 turns any data — text, an image, a PDF — into plain letters and numbers that can be pasted into JSON, HTML, email or an HTTP header without being corrupted. This tool encodes text and files to Base64 and decodes Base64 back again, telling you clearly when a value is malformed and where.",
      "Text is converted with UTF-8, so accented letters, emoji and non-Latin scripts survive the round trip — the classic btoa function fails on them. Both standard and URL-safe Base64 are supported, and if a value decodes to a file rather than text, you can download that file directly.",
    ],
    formatsNote: "Encodes text (UTF-8) up to 10,000,000 characters and any file up to 10MB. Decodes standard and URL-safe Base64, with or without padding, line breaks or a data: URL prefix.",
    seo: {
      title: "Base64 Encoder & Decoder – Text, Files & UTF-8 | Toolkit4Me",
      metaDescription:
        "Encode text or files to Base64 and decode Base64 back to text or a file. Correct UTF-8 handling, URL-safe Base64 and data URLs — all in your browser.",
      h1: "Base64 Encoder / Decoder",
      keywords: ["base64 encode", "base64 decode", "base64 to image", "base64 converter"],
    },
  },
];

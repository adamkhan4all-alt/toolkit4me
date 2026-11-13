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
    hub: "developer",
    addedOn: "2026-11-04",
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
    hub: "developer",
    featured: true,
    addedOn: "2026-11-04",
    lastModified: "2026-11-11",
    name: "QR Code Generator",
    shortName: "QR Code Generator",
    category: "web",
    categoryLabel: "Web & Developer",
    description: "Turn a link or any text into a QR code and download it as a PNG or SVG — free, with no sign-up, no expiry and no tracking.",
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
    sectionHeadings: {
      intro: "Create a QR code from a link online",
      useCases: "Where can you use QR codes?",
      howItWorks: "How to generate a QR code with Toolkit4Me",
      features: "Why use Toolkit4Me's QR Code Generator?",
    },
    howItWorks: [
      "Paste your link into the box. Copy it from your browser's address bar or a Share button, so it starts with https://.",
      "Watch the preview: the QR code is generated as you type, with nothing else to press.",
      "Optionally choose an error-correction level, a PNG size (256 to 2,048 pixels), the quiet-zone margin and the code and background colours.",
      "Scan the preview with your phone's camera to check it opens the right page.",
      "Select Download PNG for screens and documents, or Download SVG for print.",
    ],
    features: [
      "Free, with no account, no watermark and no limit on how many codes you make",
      "Static codes: your link is stored in the code itself, so there's no redirect that can expire",
      "Live preview as you type, plus checks for links missing https:// or containing stray spaces",
      "PNG at 256, 512, 1,024 or 2,048 pixels, or scalable SVG for print, with an adjustable quiet-zone margin",
      "Four error-correction levels and custom colours, with a contrast check so codes stay scannable",
      "Runs in your browser — the link you encode isn't sent to our servers",
    ],
    useCases: [
      "Websites: send people from a poster, shop window or slide straight to your site",
      "Business cards: link to your website, portfolio or online profile",
      "Marketing materials: flyers, posters and adverts that link to an offer or booking page",
      "Product packaging: instructions, ingredients, warranty registration or reorder pages",
      "Printed documents and handouts: link to the online version, a form or further reading",
      "Education: worksheets and slides that open a video, quiz or reading list",
      "Restaurant menus: table cards that open your online menu",
    ],
    limitations: [
      "Codes are static: the content is encoded directly, so it can't be edited after printing and scans can't be counted",
      "Longer text makes a denser code that's harder to scan — keep links short where you can",
      "Downloads are PNG and SVG; for a JPG, convert the PNG with PNG to JPG",
      "Logos can't be added; if you overlay one yourself, use High error correction and test it",
      "Capacity ranges from 1,273 bytes (High) to 2,953 bytes (Low)",
    ],
    faq: [
      {
        question: "How do I create a QR code from a link?",
        answer:
          "Copy the full link (starting with https://), paste it into the box at the top of this page and the QR code appears in the preview. Scan it with your phone to check it, then select Download PNG or Download SVG.",
      },
      {
        question: "Is Toolkit4Me's QR code generator free?",
        answer:
          "Yes. There's no account, subscription or watermark, and no limit on how many codes you create.",
      },
      {
        question: "Do static QR codes expire?",
        answer:
          "No. A static code stores your link or text in the pattern itself, not on our servers, so there's nothing to expire or renew. It keeps working for as long as the page it points to exists — if that page is removed or moved, the code leads to a dead link.",
      },
      {
        question: "Can I download a QR code as a PNG?",
        answer:
          "Yes. Choose 256, 512, 1,024 or 2,048 pixels and select Download PNG. For print, Download SVG gives a vector file that stays sharp at any size.",
      },
      {
        question: "Can I generate a QR code for my website?",
        answer:
          "Yes. Paste your website's address — the home page or a specific page — and download the code. Linking to a stable address you control means you can update the page later without reprinting the code.",
      },
      {
        question: "What is the difference between static and dynamic QR codes?",
        answer:
          "A static code contains your link directly. A dynamic code contains a short link owned by a QR service, which redirects to your page; that lets the service change the destination and count scans, but the code depends on the service staying active. This generator makes static codes.",
      },
      {
        question: "Do I need to install software to generate a QR code?",
        answer: "No. The generator runs in your web browser on a computer, tablet or phone.",
      },
      {
        question: "Can I scan a QR code with my smartphone?",
        answer:
          "Yes. Current iPhones and most Android phones recognise QR codes in the built-in camera app — point the camera at the code and tap the link that appears. Some older phones need a free scanner app.",
      },
      {
        question: "Which error-correction level should I choose?",
        answer:
          "Medium suits most uses. Choose High if the code may get scuffed or partly covered; it can be read even with about 30% damage, at the cost of a denser pattern. Low packs in the most data but tolerates little damage.",
      },
      {
        question: "Can I track how many people scan my code?",
        answer:
          "Not with a static code itself. Add tracking parameters to your link (for example ?utm_source=qr) and you'll see the visits in your own website analytics.",
      },
    ],
    relatedTools: ["meta-tag-generator", "png-to-jpg", "image-resizer", "base64-encoder-decoder"],
    intro: [
      "To turn a link into a QR code, paste the web address into the box above. The code appears straight away, and anyone who points a phone camera at it is offered your page. It works for any link: your website's home page, a product page, a menu, an online form, a video or a map location — and for plain text, too.",
      "The code is generated in your browser and stores your link directly in its pattern. There's no account, no redirect through our servers and no expiry date, so the code keeps working for as long as the page it points to exists.",
    ],
    extraSections: [
      {
        heading: "Free QR code generator with PNG and SVG download",
        paragraphs: [
          "Every code can be downloaded as a PNG image or an SVG vector file. PNG files use the background colour you choose (white by default) rather than a transparent background. JPG isn't offered because its compression blurs the sharp edges scanners rely on; if a website or printer insists on JPG, convert the PNG with PNG to JPG.",
        ],
        table: {
          caption: "Which download to choose",
          headers: ["Download", "Best for"],
          rows: [
            ["PNG, 256 px", "Web pages, emails and other small on-screen uses"],
            ["PNG, 512 px", "Slides, documents and social media posts"],
            ["PNG, 1024 px", "Large screens and small printed items"],
            ["SVG", "Anything printed — posters, packaging, business cards — because it stays sharp at any size"],
          ],
        },
      },
      {
        heading: "Static vs dynamic QR codes",
        paragraphs: [
          "This generator makes static QR codes: the link you type is the content of the code. Nothing sits between the scan and your page, so there's nothing to expire, but the destination can't be changed after printing and the code doesn't count scans.",
          "A dynamic QR code stores a short link belonging to a QR service, which forwards visitors to your page. That allows the service to change the destination and count scans, but the code only works while the service keeps forwarding — which is why some “free” codes stop working when a trial or subscription ends. To get some of that flexibility with a static code, point it at a page on your own website and update the page instead of the code.",
        ],
      },
    ],
    formatsNote: "Encodes links and text, including non-English characters (UTF-8). Capacity depends on the error-correction level: up to 2,953 bytes at Low and 1,273 at High. Output is a PNG (256–2,048 px) or an SVG.",
    seo: {
      title: "Free QR Code Generator – Create QR Codes from Links | Toolkit4Me",
      metaDescription:
        "Create a QR code from any link or text for free. Download PNG or SVG, pick colours, no sign-up — static codes that never expire, made in your browser.",
      h1: "Free QR Code Generator – Create QR Codes from Links",
      keywords: [
        "free qr code generator",
        "qr code generator online",
        "link to qr code",
        "qr code from link",
        "url to qr code generator",
        "qr code generator no expiration",
        "static qr code generator",
        "qr code generator png",
        "qr code svg",
        "qr code for website",
      ],
    },
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    hub: "image",
    addedOn: "2026-11-04",
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
    hub: "developer",
    addedOn: "2026-11-04",
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
    hub: "developer",
    addedOn: "2026-11-04",
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
    hub: "developer",
    addedOn: "2026-11-04",
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
  {
    id: "pdf-page-numbers",
    slug: "pdf-page-numbers",
    hub: "pdf",
    addedOn: "2026-11-04",
    lastModified: ADDED,
    name: "Add Page Numbers to PDF",
    shortName: "PDF Page Numbers",
    category: "edit",
    categoryLabel: "Edit PDF",
    description: "Add page numbers to a PDF — choose the position, style and starting number, and skip the cover page if you like. Runs in your browser.",
    acceptedFormats: ["PDF"],
    acceptedMime: ["application/pdf"],
    maxFileSize: 50,
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Add page numbers",
    icon: "1 2 3",
    outputExtension: "pdf",
    options: [
      {
        id: "position",
        label: "Position",
        type: "select",
        choices: [
          { value: "bottom-center", label: "Bottom centre" },
          { value: "bottom-right", label: "Bottom right" },
          { value: "bottom-left", label: "Bottom left" },
          { value: "top-center", label: "Top centre" },
          { value: "top-right", label: "Top right" },
          { value: "top-left", label: "Top left" },
        ],
        defaultValue: "bottom-center",
      },
      {
        id: "format",
        label: "Style",
        type: "select",
        choices: [
          { value: "n", label: "1" },
          { value: "page-n", label: "Page 1" },
          { value: "page-n-of-t", label: "Page 1 of 10" },
          { value: "n-of-t", label: "1 / 10" },
        ],
        defaultValue: "n",
      },
      { id: "startAt", label: "Start numbering at", type: "text", defaultValue: "1", placeholder: "1", helpText: "Useful when this PDF continues a longer document." },
      {
        id: "fontSize",
        label: "Text size",
        type: "select",
        choices: [
          { value: "9", label: "Small (9 pt)" },
          { value: "11", label: "Medium (11 pt)" },
          { value: "14", label: "Large (14 pt)" },
        ],
        defaultValue: "11",
      },
      {
        id: "skipFirst",
        label: "First page",
        type: "select",
        choices: [
          { value: "no", label: "Number every page" },
          { value: "yes", label: "Leave the first page (cover) unnumbered" },
        ],
        defaultValue: "no",
      },
    ],
    howItWorks: [
      "Add your PDF (up to 50MB).",
      "Choose where the numbers go, their style, size and starting number.",
      "Decide whether the first page — often a cover — should be left unnumbered.",
      "Select Add page numbers and download the numbered PDF.",
    ],
    features: [
      "Six positions: top or bottom, left, centre or right",
      "Styles: 1, Page 1, Page 1 of 10, or 1 / 10",
      "Custom starting number and optional unnumbered cover page",
      "Correct placement on rotated and cropped pages",
    ],
    useCases: [
      "Numbering a report or thesis before printing or submitting it",
      "Making a merged PDF easier to reference in a meeting (“see page 12”)",
      "Continuing the numbering of a chapter that's part of a larger document",
    ],
    limitations: [
      "Numbers are added on top of the page — if a page already has content where the number goes, they'll overlap, so choose a clear position",
      "Numbers use Arabic numerals (1, 2, 3) in Helvetica; Roman numerals and custom fonts aren't available",
      "Password-protected PDFs need to be unlocked first",
      "One PDF of up to 50MB at a time",
    ],
    faq: [
      {
        question: "Can I leave the cover page without a number?",
        answer:
          "Yes — choose “Leave the first page (cover) unnumbered”. The second page then gets the starting number (1 by default), and “of N” totals count only the numbered pages.",
      },
      {
        question: "Why would I start at a number other than 1?",
        answer:
          "If the PDF is one part of a longer document — say chapter 3 starting on page 41 — set “Start numbering at” to 41 so the numbers match the full document.",
      },
      {
        question: "Will it work on landscape or rotated pages?",
        answer:
          "Yes. The tool reads each page's rotation and visible area, so the number sits upright in the position you chose on every page, including mixed portrait and landscape documents.",
      },
      {
        question: "Is my PDF uploaded?",
        answer: "No. The numbers are added in your browser with the open-source pdf-lib library, so the document never leaves your device.",
      },
    ],
    relatedTools: ["merge-pdf", "split-pdf", "pdf-editor", "compress-pdf"],
    intro: [
      "Page numbers make a long PDF far easier to use — for the reader flipping to a reference, for the reviewer leaving comments, and for anyone who prints it and drops the pages. This tool adds them to every page of an existing PDF in the position and style you choose.",
      "You can leave a cover page unnumbered and start counting from any number, which helps when the PDF is one chapter of something larger. Each page's rotation and visible area are taken into account, so numbers stay upright and on the page even in mixed portrait and landscape documents.",
    ],
    formatsNote: "Accepts one PDF up to 50MB. Output is the same PDF with page numbers added; nothing else about the pages is changed.",
    seo: {
      title: "Add Page Numbers to PDF – Free & In Your Browser | Toolkit4Me",
      metaDescription:
        "Add page numbers to a PDF online for free. Choose position, style (Page 1 of 10), starting number and an unnumbered cover — processed privately in your browser.",
      h1: "Add Page Numbers to PDF",
      keywords: ["add page numbers to pdf", "pdf page numbers", "number pdf pages", "insert page numbers pdf"],
    },
  },
  {
    id: "webp-converter",
    slug: "webp-converter",
    hub: "image",
    addedOn: "2026-11-04",
    lastModified: ADDED,
    name: "WebP Converter",
    shortName: "WebP Converter",
    category: "convert",
    categoryLabel: "Convert Image",
    description: "Convert JPG and PNG images to WebP for faster web pages, or convert WebP back to JPG or PNG — several at once, in your browser.",
    acceptedFormats: ["JPG", "PNG", "WEBP"],
    acceptedMime: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 25,
    maxFiles: 20,
    multiple: true,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Convert images",
    icon: "WEBP",
    outputExtension: "webp / .jpg / .png",
    options: [
      {
        id: "to",
        label: "Convert to",
        type: "select",
        choices: [
          { value: "webp", label: "WebP" },
          { value: "jpeg", label: "JPG" },
          { value: "png", label: "PNG" },
        ],
        defaultValue: "webp",
      },
      {
        id: "quality",
        label: "Quality (WebP and JPG)",
        type: "select",
        choices: [
          { value: "0.9", label: "High (90)" },
          { value: "0.8", label: "Balanced (80)" },
          { value: "0.7", label: "Smaller files (70)" },
        ],
        defaultValue: "0.8",
      },
    ],
    howItWorks: [
      "Add up to 20 JPG, PNG or WebP images.",
      "Choose the format to convert to — WebP, JPG or PNG.",
      "Pick a quality level for WebP or JPG output.",
      "Select Convert images and download the results.",
    ],
    features: [
      "JPG and PNG to WebP, and WebP to JPG or PNG",
      "Transparency kept when converting between PNG and WebP",
      "Three quality levels to balance size and sharpness",
      "Batch-convert up to 20 images at once",
    ],
    useCases: [
      "Making website images load faster by serving WebP",
      "Opening a WebP image you downloaded in an app that only accepts JPG or PNG",
      "Shrinking a folder of PNG screenshots for a blog or documentation site",
    ],
    limitations: [
      "Creating WebP files needs Chrome, Edge or Firefox; older Safari versions can open WebP but not create it (converting from WebP works everywhere)",
      "Animated WebP images are converted as a single still frame",
      "Converting to JPG fills transparent areas with white",
      "Each image up to 25MB, 20 per batch, and up to about 16.7 megapixels",
    ],
    faq: [
      {
        question: "Why use WebP?",
        answer:
          "WebP is an image format designed for the web. At similar visual quality, its files are typically noticeably smaller than JPG for photos and much smaller than PNG for graphics, so pages load faster and use less data. Every current major browser can display it.",
      },
      {
        question: "Will WebP keep my transparent background?",
        answer: "Yes. Unlike JPG, WebP supports transparency, so a PNG logo with a transparent background stays transparent when converted to WebP — and back to PNG.",
      },
      {
        question: "Which quality should I choose?",
        answer:
          "Balanced (80) suits most photos on websites. Choose High (90) for images where fine detail matters, or Smaller files (70) for thumbnails and backgrounds. The result screen shows each file's size before and after so you can compare.",
      },
      {
        question: "Are my images uploaded?",
        answer: "No. Conversion uses your browser's own image encoder, so your images never leave your device.",
      },
    ],
    relatedTools: ["image-resizer", "compress-image", "png-to-jpg", "jpg-to-png"],
    intro: [
      "WebP images are usually smaller than equivalent JPGs and PNGs, which makes them the go-to format for fast-loading websites — but plenty of desktop apps, editors and upload forms still don't accept them. This converter works in both directions: JPG or PNG to WebP for the web, and WebP back to JPG or PNG when you need compatibility.",
      "Transparency is preserved between PNG and WebP, and you can choose a quality level for lossy output. Conversion uses your browser's built-in image engine, so even a batch of images is converted without uploading anything.",
    ],
    formatsNote: "Accepts JPG, PNG and WebP images up to 25MB each, 20 per batch. Output is WebP, JPG or PNG. Creating WebP requires Chrome, Edge or Firefox.",
    seo: {
      title: "WebP Converter – JPG/PNG to WebP and WebP to JPG | Toolkit4Me",
      metaDescription:
        "Convert JPG and PNG to WebP for faster websites, or WebP back to JPG or PNG. Keeps transparency, batch-converts up to 20 images, and runs in your browser.",
      h1: "WebP Converter",
      keywords: ["webp converter", "webp convert", "webp to jpg", "jpg to webp", "png to webp", "webp to png"],
    },
  },
  {
    id: "meta-tag-generator",
    slug: "meta-tag-generator",
    hub: "developer",
    addedOn: "2026-11-04",
    lastModified: ADDED,
    name: "Meta Tag Generator",
    shortName: "Meta Tag Generator",
    category: "web",
    categoryLabel: "Web & Developer",
    description: "Generate the title, description, canonical, Open Graph and Twitter Card tags for a web page, with length checks and a search preview.",
    acceptedFormats: ["Form fields"],
    acceptedMime: [],
    maxFileSize: 1,
    inputKind: "text",
    inputLimitLabel: "Title, description, URLs and names",
    multiple: false,
    processingMode: "CLIENT",
    endpoint: null,
    actionLabel: "Copy tags",
    icon: "<meta>",
    outputExtension: "html",
    howItWorks: [
      "Enter the page's title, description and URL, plus a share image if you have one.",
      "Watch the length guidance and the search-result preview as you type.",
      "Choose the page type and whether search engines may index it.",
      "Copy the generated tags and paste them into your page's <head>.",
    ],
    features: [
      "Standard, Open Graph and X (Twitter) Card tags in one block",
      "Title and description length guidance with a search preview",
      "URL, image and username validation",
      "All values safely HTML-escaped",
    ],
    useCases: [
      "Making a new page show a proper title, description and image when shared on social media",
      "Adding a canonical URL so a page reachable at several addresses is indexed once",
      "Writing a title and description that fit in search results before publishing",
    ],
    limitations: [
      "Tags only help if they're added to your page's <head> — this tool doesn't edit your site",
      "Character guidance is approximate: Google truncates by pixel width, and may rewrite titles and descriptions",
      "Social sites cache previews, so changes can take time to appear (Facebook and LinkedIn have tools to refresh them)",
      "Structured data (JSON-LD), hreflang and favicons aren't generated",
    ],
    faq: [
      {
        question: "How long should a title and description be?",
        answer:
          "Google typically shows around 50–60 characters of a title and roughly 150–160 characters of a description before cutting it off — it actually measures pixel width, so wide letters use up the space faster. Put the most important words first.",
      },
      {
        question: "What are Open Graph and Twitter Card tags?",
        answer:
          "They tell social platforms what title, description and image to show when someone shares your link. Open Graph is read by Facebook, LinkedIn, WhatsApp and many others; X (Twitter) reads its own twitter: tags but falls back to Open Graph.",
      },
      {
        question: "What size should the share image be?",
        answer:
          "1200 × 630 pixels (about 1.91:1) is the widely recommended size for large link previews, and the image URL must be a full https:// address that's publicly reachable. You can use Image Resizer to get the dimensions right.",
      },
      {
        question: "Do meta keywords help SEO?",
        answer: "No. Google has ignored the keywords meta tag for ranking for many years, so this generator leaves it out. A clear title and description matter far more.",
      },
    ],
    relatedTools: ["qr-code-generator", "image-resizer", "word-counter", "json-formatter"],
    intro: [
      "The few lines in a page's <head> decide how it appears in search results and social feeds: the headline, the summary, the preview image. Missing or overly long tags lead to truncated titles, random snippets and link previews with no image. This generator builds the full set from a simple form.",
      "As you type you'll see character guidance, warnings for problems like relative image URLs, and an approximate preview of the search result. The output includes standard tags, a canonical link, Open Graph tags for Facebook, LinkedIn and WhatsApp, and X (Twitter) Card tags — ready to paste.",
    ],
    formatsNote: "Enter text and full URLs into the form. Output is an HTML snippet of <title>, <meta> and <link> tags to paste into the <head> of your page.",
    seo: {
      title: "Meta Tag Generator – SEO, Open Graph & Twitter Cards | Toolkit4Me",
      metaDescription:
        "Generate title, description, canonical, Open Graph and Twitter Card meta tags for any page, with length guidance, URL checks and a search result preview.",
      h1: "Meta Tag Generator",
      keywords: ["meta tag generator", "open graph generator", "twitter card generator", "seo meta tags"],
    },
  },
];

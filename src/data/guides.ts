// ---------------------------------------------------------------------
// Long-form guides. Plain data, like src/data/tools.ts: the React app
// renders it through GuidePage/GuidesIndexPage, and scripts/prerender.ts +
// scripts/generate-seo-files.ts read the same objects, so the static HTML,
// the sitemap and the live app never drift apart.
// ---------------------------------------------------------------------

import { SITE_NAME } from "../config/site";

export interface GuideTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface GuideImage {
  /** Path under /public, e.g. "/images/guides/compress-pdf-levels.webp". */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
  table?: GuideTable;
  image?: GuideImage;
}

export type GuideCategory = "pdf" | "images" | "ocr" | "web" | "writing";

/** Display names for guide categories, in the order the blog lists them. */
export const GUIDE_CATEGORIES: { id: GuideCategory; label: string; description: string }[] = [
  { id: "pdf", label: "PDF & documents", description: "Compressing, converting, merging and protecting PDFs and Office files." },
  { id: "images", label: "Images", description: "Image formats, compression, resizing and conversion." },
  { id: "ocr", label: "OCR", description: "Turning photos and scans into editable text." },
  { id: "web", label: "QR codes & web", description: "QR codes, JSON, Base64 and meta tags." },
  { id: "writing", label: "Writing & text", description: "Word counts, character limits and comparing text." },
];

/** Title/description of the /guides index — shared by GuidesIndexPage and scripts/prerender.ts. */
export const GUIDES_INDEX_META = {
  title: "Guides — PDF, Image, QR Code & Text How-Tos | Toolkit4Me",
  description:
    "Practical, plain-English guides to everyday file and text tasks: shrinking PDFs, choosing image formats, OCR, QR codes, JSON, meta tags and word limits.",
};

/** Shown as the byline on every guide; see the Editorial Policy page for how guides are written and reviewed. */
export const GUIDE_AUTHOR = "Toolkit4Me Editorial Team";

export interface GuideDefinition {
  /** Route path, e.g. "/guides/how-to-reduce-pdf-file-size". */
  path: string;
  /** Visible H1. */
  title: string;
  seoTitle: string;
  metaDescription: string;
  /** Lead paragraph under the H1; also the card text on the guides index. */
  summary: string;
  /** ISO date (YYYY-MM-DD) first published — Article structured data. */
  published: string;
  /** ISO date (YYYY-MM-DD) of the last meaningful content change — shown as "Last updated", and used for the sitemap <lastmod> and Article dateModified. */
  updated: string;
  category: GuideCategory;
  /** Search intent this guide targets — used for editorial planning and the SEO tracker, never emitted as a meta keywords tag. */
  keywords: { primary: string; secondary: string[] };
  /** Shown in the "Featured" row of the blog index. */
  featured?: boolean;
  sections: GuideSection[];
  /** Reader questions answered at the end of the guide (visible content; no FAQPage markup for guides). */
  faq?: { question: string; answer: string }[];
  /** Tool slugs linked at the end of the guide; the first is the guide's main call to action. */
  relatedTools?: string[];
}

const GUIDES_PUBLISHED = "2026-10-26";
const GUIDES_UPDATED = "2026-10-26";

export const GUIDES: GuideDefinition[] = [
  {
    path: "/guides/how-to-reduce-pdf-file-size",
    category: "pdf",
    keywords: { primary: "how to reduce PDF file size without losing quality", secondary: ["compress PDF online", "reduce PDF size", "free PDF compressor", "compress PDF without losing quality"] },
    featured: true,
    title: "How to Reduce PDF File Size Without Losing Quality: A Complete Guide",
    seoTitle: `How to Reduce PDF File Size Without Losing Quality | ${SITE_NAME}`,
    metaDescription: "Why PDFs get so large, what “without losing quality” really means, which compression level to pick, and practical fixes when a PDF still won't fit an email or upload limit.",
    summary: "Email attachments are often capped at 20–25MB and many job portals and government forms accept only 2–5MB. Here is why PDFs grow so large, how compression actually works, and how to shrink a PDF without making it unreadable.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why some PDFs are so large",
        paragraphs: [
          "A PDF that contains only text is usually tiny — a 20-page report can be under 200KB. Size balloons when the file contains images, and especially when those images are stored at a much higher resolution than they will ever be viewed at. A phone photo inserted into a Word document can easily carry 12 megapixels of data even though it is shown at the size of a postcard.",
          "Scanned documents are the other big culprit. A scanner set to 600 DPI in colour produces a full-resolution image for every page, so a 10-page scan can reach 30–50MB. Embedded fonts, duplicated resources from repeated merges, and leftover editing data add smaller amounts on top.",
        ],
      },
      {
        heading: "What “without losing quality” really means",
        paragraphs: [
          "Text and vector graphics — the lines, shapes and letters in a PDF that came from Word, Excel or a design program — aren't affected by compression at all. They're stored as instructions, not pixels, so they stay perfectly sharp at any zoom level. That's why a compressed contract or report usually looks identical to the original.",
          "Images are where the trade-off happens. At 100% zoom, a PDF viewer displays roughly 100–200 pixels per inch depending on the screen, so an image stored at around 150 DPI looks sharp for normal reading, while taking a fraction of the space of a 600 DPI version. Printing is more demanding: around 300 DPI is the usual target for sharp prints. “Without losing quality” therefore means choosing a resolution that matches how the PDF will be used, rather than keeping detail nobody will ever see.",
        ],
      },
      {
        heading: "What compression actually does",
        paragraphs: [
          "PDF compression mainly works on the images inside the file. It reduces their resolution to something appropriate for screen viewing or printing (downsampling) and re-encodes them with more efficient JPEG settings. Text and vector graphics stay sharp because they are not images at all — which is why a compressed text document still looks crisp when you zoom in.",
        ],
      },
      {
        heading: "Choosing a compression level",
        list: [
          "Low compression keeps images at around 300 DPI, print quality. It's best for documents you'll print, but a PDF that is already at or below 300 DPI may barely shrink.",
          "Recommended brings images down to around 150 DPI — still clear on any screen — and is the right choice for most documents being emailed or uploaded.",
          "High brings images down to around 72 DPI. Use it when you must meet a strict limit such as 1–2MB; photos may look soft, but text stays readable.",
        ],
        table: {
          caption: "Compress PDF levels at a glance",
          headers: ["Level", "Image resolution", "Best for", "Trade-off"],
          rows: [
            ["Low", "About 300 DPI", "Printing, detailed photos and diagrams", "Smallest reduction; may barely shrink an already-optimised PDF"],
            ["Recommended", "About 150 DPI", "Email, upload forms, reading on screen", "Photos stay clear on screen; not ideal for large prints"],
            ["High", "About 72 DPI", "Strict limits such as 1–2MB", "Photos look soft; text still readable"],
          ],
        },
      },
      {
        heading: "A real example",
        paragraphs: [
          "To show the difference, we ran a three-page PDF made of 300 DPI page scans (0.94MB) through Compress PDF at each level. Low left it essentially unchanged, because its images were already at print resolution. Recommended cut it by 53% to about 0.45MB, and High by 87% to about 0.12MB. A small PDF containing only text, on the other hand, didn't shrink at all — there were no images to downsample. Your results will depend on your file, which is why the tool shows the real before and after sizes.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open the Compress PDF tool and add your file (up to 100MB).",
          "Start with the Recommended level and select Compress PDF.",
          "Download the result and open it at 100% zoom to check that text, signatures and any small print are still clear.",
          "If it is still too large, run the original (not the already-compressed copy) again at High — compressing twice degrades quality faster than a single stronger pass.",
        ],
        image: {
          src: "/images/guides/compress-pdf-levels.webp",
          alt: "Toolkit4Me Compress PDF tool with a file added and the Low, Recommended and High compression levels shown, Recommended selected",
          width: 712,
          height: 429,
          caption: "Compress PDF with a file added: pick a level, then select Compress PDF.",
        },
      },
      {
        heading: "Tricks when compression isn't enough",
        list: [
          "Scan at 150–200 DPI and in greyscale for text documents; colour 600 DPI scans are rarely necessary.",
          "Remove pages you don't need with Split PDF or the PDF Editor before compressing.",
          "If a form asks for several documents, compress each one separately rather than merging first.",
          "For photo-heavy documents, compress the images first with Compress Image, then build the PDF with JPG to PDF.",
        ],
      },
      {
        heading: "Common mistakes and how to fix them",
        list: [
          "The file got bigger: small, text-only PDFs have nothing to downsample, and re-saving can add a little overhead. Keep the original — it's already as small as it will get.",
          "Photos look blurry: you used High on a document that will be printed or zoomed into. Go back to the original and use Recommended or Low.",
          "“Password-protected” error: the tool can't open an encrypted PDF. Remove the password with Unlock PDF first, compress, then protect it again if needed.",
          "Still over the limit at High: the file has too many pages for the limit. Split it into parts, or remove pages the recipient doesn't need.",
          "Compressing a copy of a copy: every lossy pass removes more detail. Always go back to the original file.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Most oversized PDFs are oversized because of their images, not their text. Matching image resolution to how the file will be used — about 150 DPI for screens, 300 DPI for print — shrinks the file dramatically while keeping it looking the same where it matters. Start with Recommended, check the result at 100% zoom, and only reach for High when a strict upload limit leaves no other choice.",
        ],
      },
    ],
    faq: [
      {
        question: "Will compressing a PDF make the text blurry?",
        answer: "No. Text in a PDF created from a document is stored as text, not as an image, so compression doesn't touch it. Only scanned pages — which are images of text — can soften at the highest compression level.",
      },
      {
        question: "How small can I make my PDF?",
        answer:
          "It depends entirely on what's inside. Image-heavy and scanned PDFs often shrink by half or more at the Recommended level; text-only PDFs may not shrink at all. The tool always shows the real before-and-after size, so you can decide whether to try a stronger level.",
      },
      {
        question: "Can I compress several PDFs at once?",
        answer: "Compress PDF handles one file at a time, up to 100MB. If you need one smaller file from several, compress each PDF and then combine them with Merge PDF.",
      },
      {
        question: "What happens to my file after compression?",
        answer:
          "Compress PDF runs on our server: your upload is deleted as soon as it's processed, and the compressed result is deleted automatically within one hour. The Privacy Policy has the details.",
      },
    ],
    relatedTools: ["compress-pdf", "split-pdf", "compress-image", "jpg-to-pdf"],
  },
  {
    path: "/guides/jpg-vs-png",
    category: "images",
    keywords: { primary: "what is a JPG vs PNG", secondary: ["JPG vs PNG", "JPEG vs PNG", "difference between JPG and PNG", "best image format"] },
    featured: true,
    title: "JPG vs PNG: What's the Difference and Which Format Should You Use?",
    seoTitle: `JPG vs PNG: What's the Difference & Which to Use? | ${SITE_NAME}`,
    metaDescription: "A plain-English comparison of JPG and PNG: lossy vs lossless compression, transparency, file size, and the right format for photos, screenshots, logos and websites.",
    summary: "JPG and PNG are the two most common image formats, and picking the wrong one can mean blurry screenshots or photos that are ten times larger than they need to be. Here is how they differ, when to use each, and where WebP fits in.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-11",
    sections: [
      {
        heading: "The quick answer",
        paragraphs: [
          "Use JPG for photographs and anything that came from a camera. Use PNG for screenshots, logos, icons, diagrams and any image that needs a transparent background. If the image is going on your own website, consider WebP, which can usually do either job in a smaller file. The rest of this guide explains why.",
        ],
      },
      {
        heading: "The key difference: lossy vs lossless",
        paragraphs: [
          "JPG (or JPEG) uses lossy compression. It discards fine detail that the eye is unlikely to notice in natural images, which makes photos dramatically smaller. The trade-off is that every save at a lower quality setting throws a little more information away, and sharp edges — such as text — can pick up faint smudges known as compression artefacts.",
          "PNG uses lossless compression. Every pixel is kept exactly, so text, lines and flat colours stay perfectly crisp no matter how many times the file is saved. The trade-off is size: a photograph saved as PNG can be five to ten times larger than the same photo as a good-quality JPG.",
        ],
        table: {
          caption: "JPG and PNG side by side",
          headers: ["", "JPG / JPEG", "PNG"],
          rows: [
            ["Compression", "Lossy — discards detail to save space", "Lossless — keeps every pixel exactly"],
            ["Transparency", "Not supported", "Supported"],
            ["Best for", "Photos and camera images", "Screenshots, logos, icons, diagrams"],
            ["File size for a photo", "Small", "Often several times larger"],
            ["Re-saving repeatedly", "Loses a little more detail each time", "No loss"],
            ["Opens almost everywhere", "Yes", "Yes"],
          ],
        },
      },
      {
        heading: "What the names mean",
        paragraphs: [
          "JPEG stands for the Joint Photographic Experts Group, the committee that created the standard. “.jpg” and “.jpeg” are the same format — the shorter extension dates from older systems that only allowed three letters. PNG stands for Portable Network Graphics; it was designed in the mid-1990s as a free, patent-unencumbered replacement for GIF, which is why it handles graphics and transparency so well.",
        ],
      },
      {
        heading: "Transparency",
        paragraphs: [
          "PNG supports transparent backgrounds; JPG does not. If you need a logo or icon that sits cleanly on top of any background colour, use PNG. Converting a transparent PNG to JPG fills the transparent areas with a solid colour, usually white.",
        ],
      },
      {
        heading: "Which to use",
        list: [
          "Photographs and camera images → JPG",
          "Screenshots, especially with text or interface elements → PNG",
          "Logos, icons and graphics with transparent backgrounds → PNG",
          "Diagrams, charts and line art → PNG",
          "Images for upload forms with strict size limits → JPG",
          "Images you will keep editing and re-saving → PNG while editing, JPG for the final export if it is a photo",
        ],
      },
      {
        heading: "Converting between them",
        paragraphs: [
          "Converting PNG to JPG is the quickest way to shrink a large photo saved in the wrong format, but remember transparency will be lost. Converting JPG to PNG does not restore detail that JPG compression already removed — it only stops further loss. It is useful when an application requires PNG or when you are about to make several edits.",
          "Both conversions on this site run entirely in your browser, so your images are never uploaded.",
        ],
      },
      {
        heading: "What about WebP?",
        paragraphs: [
          "WebP is a newer format that can do both jobs: lossy compression for photos and lossless compression with transparency for graphics, usually in a smaller file than the JPG or PNG equivalent. Every current major browser displays it, which makes it a good choice for images on your own website.",
          "The catch is compatibility outside the browser — some desktop apps, editors and upload forms still don't accept WebP. Use WebP for the web, and keep JPG or PNG for files you'll email, print or upload elsewhere. The WebP Converter turns JPG and PNG into WebP and back.",
        ],
      },
      {
        heading: "Common mistakes",
        list: [
          "Saving screenshots as JPG: text and interface edges pick up fuzzy artefacts. Keep screenshots as PNG.",
          "Saving photos as PNG: the file is huge with no visible benefit. Convert photos to JPG.",
          "Re-editing and re-saving a JPG many times: each save loses a little more detail. Edit from the original, or work in PNG and export JPG once at the end.",
          "Expecting JPG to PNG to “fix” quality: converting can't bring back detail that's already gone.",
          "Converting a transparent logo to JPG: the background turns white. Keep logos as PNG (or WebP for the web).",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "The choice comes down to what's in the picture. Natural, photographic images compress beautifully as JPG; sharp edges, text, flat colours and transparency belong in PNG. Pick by content rather than habit and you'll avoid both blurry screenshots and bloated photos — and for images on your own website, WebP is worth a look.",
        ],
      },
    ],
    faq: [
      {
        question: "Is JPEG the same as JPG?",
        answer: "Yes. They're the same format with two spellings of the file extension; any program that opens one opens the other.",
      },
      {
        question: "Which has better quality, JPG or PNG?",
        answer:
          "PNG keeps every pixel exactly, so it's technically higher quality, but for photographs a good-quality JPG looks the same to the eye at a fraction of the size. For screenshots and graphics, PNG is visibly sharper.",
      },
      {
        question: "Does converting PNG to JPG reduce quality?",
        answer:
          "Slightly, because JPG is lossy, and any transparency becomes white. At a high quality setting the difference in a photo is usually invisible; in screenshots with small text it can be noticeable, so keep those as PNG.",
      },
      {
        question: "Which format should I use on my website?",
        answer: "JPG for photos and PNG for graphics both work everywhere. WebP is usually smaller for both and is supported by every current major browser, so it's a good choice for images you serve yourself.",
      },
    ],
    relatedTools: ["png-to-jpg", "jpg-to-png", "webp-converter", "compress-image"],
  },
  {
    path: "/guides/how-to-convert-pdf-to-word",
    category: "pdf",
    keywords: { primary: "PDF to Word online", secondary: ["convert PDF to Word free", "PDF to DOCX", "edit a PDF in Word"] },
    title: "How to Convert PDF to Word Online for Free",
    seoTitle: `How to Convert PDF to Word Online Free (and Keep It Editable) | ${SITE_NAME}`,
    metaDescription: "Convert a PDF into an editable Word file for free: what carries over and what doesn't, how scanned PDFs are handled, and what to do when you need the original formatting.",
    summary: "PDFs are designed to look the same everywhere, not to be edited. Converting one to Word gives you editable text — but the layout is a different matter. Here's how to convert for free, what to expect, and what to do when the formatting is what you actually need.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why PDFs are hard to edit",
        paragraphs: [
          "A PDF records where each piece of text and each image sits on the page, but not the structure behind it — it doesn't know which lines form a paragraph, which text is a heading, or where a table begins. Any converter has to guess that structure back, and the more elaborate the design, the more guessing is involved.",
          "Toolkit4Me's PDF to Word takes the dependable route: it extracts the text in reading order and rebuilds it as clean, editable paragraphs in a .docx file. You get every word, ready to edit — but not the original fonts, colours, columns, tables or images.",
        ],
      },
      {
        heading: "What carries over, and what doesn't",
        list: [
          "Carries over: all the text, in reading order, split into paragraphs.",
          "Doesn't carry over: fonts and colours, multi-column layout, tables (cell text comes through as separate lines), images, headers and footers as separate regions.",
          "Scanned PDFs: if a PDF has no selectable text, each page (up to 15) is read with English OCR, so check names and numbers against the original.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open the PDF to Word tool and select your PDF (up to 50MB). If it asks for a password when you open it, remove the password first with Unlock PDF.",
          "Wait a few seconds while the text is extracted on our server.",
          "Download the .docx file and open it in Microsoft Word, Google Docs or LibreOffice Writer.",
          "Apply headings and styles with Word's style gallery — it's faster than formatting paragraph by paragraph.",
        ],
      },
      {
        heading: "Is PDF to Word the right tool for your job?",
        paragraphs: [
          "Converting is the right move when you need to rewrite or reuse the words. When you need to keep the page looking exactly as it is, a different tool usually does the job better.",
        ],
        table: {
          caption: "Choosing the right tool for a PDF task",
          headers: ["What you want to do", "Best tool", "Why"],
          rows: [
            ["Rewrite or reuse the text", "PDF to Word", "Gives you clean, editable paragraphs"],
            ["Add a note, date or label", "PDF Editor", "Adds text on the page without touching the layout"],
            ["Remove, reorder or rotate pages", "PDF Editor or Split PDF", "Works on whole pages; layout untouched"],
            ["Use one page as a picture", "PDF to JPG", "Keeps the page looking exactly the same"],
            ["Read the text of a scan", "Image to Text or PDF to Word", "Runs OCR on the scanned page"],
          ],
        },
      },
      {
        heading: "When you need the formatting, not just the text",
        paragraphs: [
          "Ask first whether you really need to edit the document. If the goal is to fill in a few blanks, add a note or remove a page, editing the PDF directly keeps the layout untouched: the PDF Editor can add text to a page, reorder, rotate and delete pages.",
          "If you need an image of a page exactly as it looks — for a slide or a report — PDF to JPG renders each page as a picture. And if you created the original in Word, the most reliable route is to go back to that .docx rather than converting the PDF.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "“This PDF couldn't be parsed”: the file may be damaged or password-protected. Open and re-save it, or remove the password with Unlock PDF.",
          "The Word file is empty or garbled: the PDF is probably a scan with poor image quality. Try a clearer scan, or extract a single page with Image to Text.",
          "“OCR fallback is limited to 15 pages”: split a long scanned PDF into parts with Split PDF and convert each part.",
          "The text runs together across columns: the converter reads in reading order, but complex layouts can interleave. Fix it in Word, or copy the columns one at a time.",
        ],
      },
      {
        heading: "Converting back",
        paragraphs: [
          "Once you've made your edits, use Word to PDF to turn the document back into a PDF that looks the same for everyone you send it to. That way the version you share can't be accidentally changed.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "PDF to Word is the fastest way to get the words out of a PDF and into something you can edit. Expect clean text rather than a copy of the layout, use the PDF Editor when you only need small changes to the page itself, and convert back to PDF when you're done.",
        ],
      },
    ],
    faq: [
      {
        question: "Is converting PDF to Word free?",
        answer: "Yes. There's no account, no watermark and no limit on how many PDFs you convert, one file at a time, up to 50MB each.",
      },
      {
        question: "Will my tables and images come across?",
        answer: "No — only the text is converted. Table cells come through as separate lines and images are left out, so tables and pictures need to be recreated in Word.",
      },
      {
        question: "Can I convert a scanned PDF?",
        answer: "Yes, up to 15 pages. When a PDF has no selectable text, each page is read with English OCR; accuracy depends on scan quality.",
      },
      {
        question: "What happens to my file?",
        answer: "PDF to Word runs on our server. Your upload is deleted as soon as it's processed, and the Word file is deleted automatically within one hour.",
      },
    ],
    relatedTools: ["pdf-to-word", "word-to-pdf", "pdf-editor", "image-to-text"],
  },
  {
    path: "/guides/how-to-extract-text-from-images-ocr",
    category: "ocr",
    keywords: { primary: "OCR extraction", secondary: ["image to text", "OCR online free", "extract text from image", "convert image to text"] },
    title: "How to Extract Text from Images Using OCR",
    seoTitle: `How to Extract Text from Images Using OCR (Free) | ${SITE_NAME}`,
    metaDescription: "How OCR turns photos, screenshots and scans into editable text, step-by-step extraction for free, capture tips that improve accuracy, and how to fix common OCR problems.",
    summary: "Optical character recognition (OCR) turns the text in a photo, screenshot or scan into words you can copy, search and edit. Accuracy depends heavily on the image you start with — this guide shows how to extract text step by step and how to get clean results instead of gibberish.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-11",
    sections: [
      {
        heading: "How OCR works",
        paragraphs: [
          "OCR software first cleans up the image, then finds lines of text, splits them into characters and matches each shape against what it has learned letters look like. Finally it uses language knowledge to correct likely mistakes. Anything that makes letters harder to see — blur, shadows, low contrast, skewed angles — makes every one of those steps less reliable.",
          "Toolkit4Me's Image to Text tool uses the open-source Tesseract OCR engine, one of the most widely used OCR engines, running on our server.",
        ],
      },
      {
        heading: "What you can use OCR for",
        list: [
          "Copying a paragraph from a printed page without retyping it.",
          "Pulling text out of a screenshot of an error message, a slide or a chat.",
          "Getting the details from a receipt or invoice into a spreadsheet.",
          "Making the text of an old letter or document editable and searchable.",
        ],
      },
      {
        heading: "Step by step: extract text with Image to Text",
        list: [
          "Open Image to Text and add a JPG or PNG image of up to 25MB.",
          "Choose the language of the text — English, Spanish, French or German. Picking the right one noticeably improves accuracy.",
          "Select Extract Text and wait a few seconds.",
          "Copy the recognised text, or download it as a .txt file, then proofread it against the original.",
        ],
        image: {
          src: "/images/guides/image-to-text-language.webp",
          alt: "Toolkit4Me Image to Text tool with a receipt image added, the Text language dropdown set to English, and the Extract Text button",
          width: 712,
          height: 331,
          caption: "Image to Text with a receipt added: choose the text language, then select Extract Text.",
        },
      },
      {
        heading: "Capturing a good image",
        list: [
          "Use even, bright light and avoid shadows from your hand or phone.",
          "Hold the camera directly above the page so lines are straight, not at an angle.",
          "Fill the frame with the text, and make sure it is in sharp focus.",
          "For scanners, 300 DPI is the sweet spot for OCR; higher rarely helps.",
          "Crop away backgrounds such as desks and other pages before uploading.",
        ],
      },
      {
        heading: "What OCR handles well — and what it doesn't",
        paragraphs: [
          "Printed text in common fonts, receipts, book pages, letters and screenshots usually convert with very high accuracy. Handwriting, stylised display fonts, text on busy backgrounds and very small print are harder, and you should expect to correct some words.",
        ],
        table: {
          caption: "What to expect from different sources",
          headers: ["Source", "What to expect", "Tip"],
          rows: [
            ["Screenshot", "Very good", "Capture at full size; don't shrink it first"],
            ["Flatbed scan of a printed page", "Very good", "Scan at 300 DPI in greyscale"],
            ["Phone photo of a page", "Good when flat and well lit", "Shoot straight on, avoid shadows"],
            ["Receipt", "Good; faded thermal paper is harder", "Photograph it soon, on a dark background"],
            ["Handwriting", "Often poor", "Expect to correct many words"],
            ["Text over a photo or pattern", "Often poor", "Crop tightly around the text"],
          ],
        },
      },
      {
        heading: "Languages and file types on Toolkit4Me",
        paragraphs: [
          "Image to Text reads JPG and PNG images in English, Spanish, French or German — pick the language that matches the text, because the recogniser uses it to resolve unclear letters. For a scanned PDF, either convert the pages to images with PDF to JPG and run the page you need through Image to Text, or use PDF to Word, which automatically reads scanned PDFs of up to 15 pages with English OCR.",
        ],
      },
      {
        heading: "After extraction",
        list: [
          "Proofread numbers carefully — OCR can confuse 0 and O, 1 and l, or 5 and S.",
          "Paste the text into a word processor and use spell-check to catch remaining errors quickly.",
          "Remember that OCR gives you text, not layout: columns and tables come out as plain lines that you may need to rearrange.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "The result is gibberish: check that the language setting matches the text, and that the image isn't rotated or upside down.",
          "Words are missing: the image is probably blurred, too small or low in contrast. Retake the photo closer and in better light.",
          "Columns are jumbled together: crop the image to one column at a time and extract each separately.",
          "A PDF was rejected: Image to Text accepts JPG and PNG only. Convert the page with PDF to JPG first, or use PDF to Word for scanned PDFs.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Good OCR starts with a good image: sharp, straight, evenly lit and tightly cropped. Get that right, choose the correct language, and printed text comes out almost perfectly — leaving you only a quick proofread instead of a retyping job.",
        ],
      },
    ],
    faq: [
      {
        question: "Is OCR 100% accurate?",
        answer: "No OCR is. Clean printed text and screenshots come close, but always proofread names, numbers and dates against the original before relying on them.",
      },
      {
        question: "Can it read handwriting?",
        answer: "It can try, but results on handwriting are often poor. OCR engines like Tesseract are designed mainly for printed text.",
      },
      {
        question: "Can I extract text from a PDF?",
        answer: "Image to Text accepts JPG and PNG images. For a PDF, convert the page to an image with PDF to JPG first, or use PDF to Word, which runs OCR automatically on scanned PDFs of up to 15 pages.",
      },
      {
        question: "What happens to my image?",
        answer: "Image to Text runs on our server. Your image is deleted as soon as it's processed, and the extracted text is deleted automatically within one hour.",
      },
    ],
    relatedTools: ["image-to-text", "pdf-to-jpg", "pdf-to-word", "word-counter"],
  },
  {
    path: "/guides/how-to-password-protect-a-pdf",
    category: "pdf",
    keywords: { primary: "password protect PDF", secondary: ["add password to PDF", "encrypt PDF", "PDF open password"] },
    title: "How to Password Protect a PDF (and When You Should)",
    seoTitle: `How to Password Protect a PDF — A Practical Guide | ${SITE_NAME}`,
    metaDescription: "Add a password to a PDF, choose a strong one, understand open vs permissions passwords, and share protected files safely.",
    summary: "Adding a password to a PDF is a simple way to keep payslips, contracts, medical letters and ID documents private when you send them by email or store them in the cloud.",
    published: GUIDES_PUBLISHED,
    updated: GUIDES_UPDATED,
    sections: [
      {
        heading: "Two kinds of PDF password",
        paragraphs: [
          "An open password (sometimes called a user password) is required to view the document at all. Without it, the file's contents are encrypted and unreadable.",
          "A permissions password (owner password) lets anyone open the file but restricts actions such as printing, copying text or editing. These restrictions are respected by mainstream PDF readers but are easier to bypass, so use an open password whenever confidentiality really matters.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open the Protect PDF tool and select your file.",
          "Enter a strong password and confirm it.",
          "Download the protected PDF and test it by opening it — you should be prompted for the password.",
          "Keep the original unprotected copy somewhere safe, or make sure you won't forget the password: there is no way to recover a forgotten one.",
        ],
      },
      {
        heading: "Choosing a good password",
        list: [
          "Use at least 12 characters; a short phrase of unrelated words is both strong and memorable.",
          "Don't reuse the password from your email or bank account.",
          "Avoid obvious choices like dates of birth or the recipient's name.",
        ],
      },
      {
        heading: "Sharing protected files safely",
        paragraphs: [
          "Never send the password in the same email as the file. Share it through a different channel — a text message, a phone call or a messaging app — so someone who intercepts one doesn't automatically have both.",
          "If you later need to remove the password from a document you own, the Unlock PDF tool will do that once you supply the correct password.",
        ],
      },
    ],
    relatedTools: ["protect-pdf", "unlock-pdf", "compress-pdf", "merge-pdf"],
  },
  {
    path: "/guides/how-to-merge-and-organize-pdfs",
    category: "pdf",
    keywords: { primary: "merge PDF online", secondary: ["combine PDF files", "merge multiple PDFs into one", "reorder PDF pages"] },
    title: "How to Merge Multiple PDF Files into One Document",
    seoTitle: `How to Merge PDF Files into One (and Organise the Pages) | ${SITE_NAME}`,
    metaDescription: "Combine several PDFs into one document in the right order, take out pages you don't need, reorder or rotate pages, and finish the file for sending — free and step by step.",
    summary: "Job applications, visa forms, expense claims and insurance requests often ask for a single PDF that contains several documents in a set order. Here's how to merge them cleanly, organise the pages, and keep the final file small enough to send.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-11",
    sections: [
      {
        heading: "Plan the final document first",
        paragraphs: [
          "Before you start, list the documents in the order the recipient expects — for example cover letter, CV, then certificates. Check whether there is a size limit, because merging several scans can produce a large file.",
        ],
      },
      {
        heading: "Merging files",
        list: [
          "Open Merge PDF and add the files you want to combine — up to 20 at a time. For more, merge them in batches and then merge the results.",
          "Use the up and down arrows next to each file to put them in the right order.",
          "Download the combined PDF and flip through it to confirm nothing is missing or upside-down.",
        ],
      },
      {
        heading: "Which tool for which job",
        paragraphs: [
          "Merging is only one part of putting a document together. Three tools cover almost everything, and they work well in sequence: trim with Split PDF, combine with Merge PDF, then tidy individual pages with the PDF Editor.",
        ],
        table: {
          caption: "Merge, split and edit at a glance",
          headers: ["Tool", "What it does", "Limits"],
          rows: [
            ["Merge PDF", "Combines whole PDFs into one, in the order you set", "Up to 20 files, 50MB each"],
            ["Split PDF", "Extracts pages or ranges, or splits every N pages", "One PDF up to 50MB; runs in your browser"],
            ["PDF Editor", "Reorders, rotates and deletes individual pages; adds text", "One PDF up to 50MB; runs in your browser"],
          ],
        },
      },
      {
        heading: "Taking pages out",
        paragraphs: [
          "If you only need part of a long document — say, two pages of a bank statement — use Split PDF to extract those pages into a new file. This keeps the merged result smaller and avoids sharing information the recipient doesn't need.",
        ],
      },
      {
        heading: "Reordering, rotating and deleting pages",
        paragraphs: [
          "The PDF Editor shows a thumbnail of every page, with buttons to move each page earlier or later, rotate it in 90° steps, or delete it — handy for sideways scans and blank or duplicate pages. It runs entirely in your browser, which makes it a good choice for personal documents.",
          "If any of the files are password-protected, unlock them first with Unlock PDF: merging, splitting and editing all need to be able to open the file.",
        ],
      },
      {
        heading: "Finishing touches",
        list: [
          "Compress the merged file if it is over the upload limit.",
          "Add page numbers with PDF Page Numbers, so you and the recipient can refer to “page 7” — you can leave a cover page unnumbered.",
          "Add a password with Protect PDF if the document contains personal information.",
          "Give the file a clear name, such as \"Surname_Firstname_Application.pdf\", so the recipient can find it easily.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "“Accepts up to 20 files”: merge the first 20, then merge that result with the rest.",
          "A file won't merge: it's probably password-protected or damaged. Unlock it with Unlock PDF, or open and re-save it.",
          "Bookmarks or form fields are missing: merging copies the pages, but bookmarks and fillable form fields may not carry over. Fill in forms before merging.",
          "The merged file is too large: compress it with Compress PDF, or remove unneeded pages with Split PDF first.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "A clean combined PDF comes from a little planning: decide the order, trim what the recipient doesn't need, merge, then finish with page numbers, compression and, if needed, a password. Each step takes seconds, and the result is a single document that's easy to send and easy to read.",
        ],
      },
    ],
    faq: [
      {
        question: "How many PDFs can I merge at once?",
        answer: "Up to 20 files per merge, each up to 50MB. To combine more, merge in batches and then merge the batch results together.",
      },
      {
        question: "Does merging reduce quality?",
        answer: "No. Pages are copied into the new PDF as they are; text, images and layout are unchanged.",
      },
      {
        question: "Can I merge PDFs with other file types?",
        answer: "Merge PDF combines PDFs. Convert other files first — JPG to PDF for photos, Word to PDF, Excel to PDF or PowerPoint to PDF for Office files — then merge.",
      },
      {
        question: "What happens to my files?",
        answer: "Merge PDF runs on our server. Your uploads are deleted as soon as they're processed, and the merged PDF is deleted automatically within one hour.",
      },
    ],
    relatedTools: ["merge-pdf", "split-pdf", "pdf-editor", "pdf-page-numbers"],
  },
  {
    path: "/guides/how-to-compress-images",
    category: "images",
    keywords: { primary: "compress images online", secondary: ["reduce image size", "compress images without losing quality", "compress JPG", "optimize images for website"] },
    title: "How to Compress Images Without Losing Quality",
    seoTitle: `How to Compress Images Without Losing Quality (JPG & PNG) | ${SITE_NAME}`,
    metaDescription: "Why photos are so large, how dimensions, format and quality each affect file size, the settings that work for websites, email and upload forms, and how to fix common problems.",
    summary: "A single phone photo is often 3–6MB — far more than a website, email or upload form needs. Three settings decide how small an image gets: its pixel dimensions, its format, and (for JPG) its quality. Here's how to use each one without visibly damaging your pictures.",
    published: "2026-11-03",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why photos are so large",
        paragraphs: [
          "Modern phone cameras capture 12 megapixels or more — roughly 4000 × 3000 pixels. A website column or an email preview rarely displays an image wider than 1000–2000 pixels, so most of that data is never seen. File size grows with the number of pixels, so the biggest savings almost always come from reducing the dimensions, not from fiddling with quality.",
        ],
      },
      {
        heading: "What “without losing quality” means for images",
        paragraphs: [
          "Every compressed JPG loses some information — the goal is to lose only what nobody will notice. At normal viewing size, a JPG saved at around 75–80% quality is very hard to tell apart from the original, and an image scaled down to the size it will actually be shown at loses nothing a viewer could see. Quality only becomes visibly worse when you push the quality setting very low, or display a small image larger than its real size.",
        ],
      },
      {
        heading: "The three settings that matter",
        list: [
          "Dimensions: halving the width and height leaves a quarter of the pixels, and the file shrinks dramatically. In Compress Image, set a maximum width — the height scales to match. For an exact size, such as 600 × 600 for a profile photo, use Image Resizer.",
          "Format: JPG is built for photographs and is usually far smaller than PNG for the same photo. PNG is lossless and suits screenshots, logos and anything with transparency. For images on your own website, WebP is often smaller still — the WebP Converter creates it from JPG or PNG.",
          "Quality (JPG only): a quality around 70–80 typically looks the same as the original at normal viewing size. Below about 50, blocky artefacts start to appear around edges and in smooth areas like skies.",
        ],
      },
      {
        heading: "Step by step with Compress Image",
        list: [
          "Open Compress Image and add one or more JPG or PNG images (up to 25MB each).",
          "Choose an output format — keep the original, or switch a photo saved as PNG to JPG.",
          "Set the quality slider; around 75–80% is a good starting point for photos.",
          "Optionally enter a maximum width in pixels; leave it blank to keep the original dimensions.",
          "Check the estimated output size, then select Compress Image and download the results.",
        ],
        image: {
          src: "/images/guides/compress-image-controls.webp",
          alt: "Toolkit4Me Compress Image tool with a photo added, showing the output format menu, a quality slider at 80%, an optional maximum width box and the estimated output size",
          width: 712,
          height: 639,
          caption: "Compress Image shows an estimated output size as you adjust format, quality and width.",
        },
      },
      {
        heading: "Settings that work for common jobs",
        table: {
          caption: "Suggested starting points — adjust to taste",
          headers: ["Use", "Maximum width", "Format", "Quality"],
          rows: [
            ["Website or online store photos", "1600–2000 px", "JPG (or WebP)", "75–80%"],
            ["Email attachments", "1200–1600 px", "JPG", "About 75%"],
            ["Strict upload limits (e.g. 200KB–1MB)", "Reduce until it fits", "JPG", "Lower step by step"],
            ["Logos, icons and screenshots", "As displayed", "PNG", "Not applicable (lossless)"],
          ],
        },
      },
      {
        heading: "Why a PNG didn't get smaller",
        paragraphs: [
          "PNG compression is lossless, so there is no quality setting to lower — re-saving a PNG at the same size often produces a file of almost the same size. To shrink a PNG, reduce its maximum width, or, if it's a photo without transparency, save it as JPG instead. Converting a transparent logo to JPG would fill the transparent areas with white, so keep those as PNG.",
        ],
      },
      {
        heading: "Things to know before you compress",
        list: [
          "Keep your original. Compression can't be undone, and re-compressing an already-compressed JPG adds new artefacts each time.",
          "Re-saving an image removes embedded metadata such as the camera model and the GPS location where a photo was taken — usually a privacy benefit when you're posting photos online.",
          "Compress Image runs entirely in your browser, so your photos are never uploaded.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "The image looks blocky or smeared: the quality is too low. Raise it to 75–80% and reduce the width instead.",
          "The file is still too big: reduce the maximum width — it saves far more than lowering quality.",
          "The output is bigger than the input: the original was already heavily compressed. Keep the original, or reduce its width.",
          "A transparent background turned white: you converted to JPG. Choose PNG (or WebP) to keep transparency.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Start with dimensions, then format, then quality. Scaling a photo to the size it will actually be shown at and saving it as a JPG around 75–80% quality usually cuts it to a fraction of its size with no difference anyone will notice — and keeping the original means you can always try again.",
        ],
      },
    ],
    faq: [
      {
        question: "How much can I compress a photo without losing quality?",
        answer: "It depends on the photo and how it will be viewed, but resizing a phone photo to the width it will be displayed at and saving at 75–80% JPG quality typically reduces it dramatically with no visible difference at normal size.",
      },
      {
        question: "Can I compress several images at once?",
        answer: "Yes. Add several JPG or PNG images to Compress Image and the same settings are applied to all of them.",
      },
      {
        question: "Are my photos uploaded?",
        answer: "No. Compression happens in your browser, so your images never leave your device.",
      },
      {
        question: "Should I use WebP instead?",
        answer: "For images on your own website, often yes — WebP is usually smaller than JPG at similar quality. For email attachments and upload forms, stick with JPG, which every system accepts.",
      },
    ],
    relatedTools: ["compress-image", "image-resizer", "webp-converter", "png-to-jpg"],
  },
  {
    path: "/guides/convert-office-documents-to-pdf",
    category: "pdf",
    keywords: { primary: "convert Word to PDF without losing formatting", secondary: ["Excel to PDF fit to page", "PowerPoint to PDF", "keep formatting when converting to PDF"] },
    title: "How to Keep Formatting When Converting Word, Excel and PowerPoint to PDF",
    seoTitle: `Convert Word, Excel & PowerPoint to PDF Without Layout Surprises | ${SITE_NAME}`,
    metaDescription: "Why fonts, page breaks and spreadsheet layouts sometimes shift when converting Office files to PDF, and how to prepare your file so the PDF looks right.",
    summary: "Converting a document to PDF should freeze it exactly as you see it. Usually it does — but fonts, page breaks and wide spreadsheets are the usual trouble spots. A few minutes of preparation in Word, Excel or PowerPoint avoids nearly all of them.",
    published: "2026-11-03",
    updated: "2026-11-03",
    sections: [
      {
        heading: "Why layouts can shift",
        paragraphs: [
          "Word, Excel and PowerPoint files don't contain a fixed picture of each page. They contain text and instructions, and the software that opens them works out where every line and page break falls — using the fonts installed on that computer. Toolkit4Me converts Office files with LibreOffice on our server. When your document uses a font the server has, the result matches closely; when it doesn't, a similar font is substituted, and because letters have slightly different widths, a line or page break can move.",
        ],
      },
      {
        heading: "Word documents",
        list: [
          "Use widely available fonts, such as Arial or Times New Roman, for documents where exact line breaks matter, like CVs and forms.",
          "If you use a special font, embed it: in Word, go to File → Options → Save and tick \"Embed fonts in the file\" before saving.",
          "Insert page breaks deliberately (Ctrl+Enter) instead of pressing Enter repeatedly — manual blank lines are the first thing to move when line heights change.",
          "Remove the document password before converting; protected files can't be opened for conversion.",
        ],
      },
      {
        heading: "Excel workbooks",
        list: [
          "The PDF follows each sheet's page setup. Wide sheets spill onto extra pages unless you set Page Layout → Scale to Fit → Width: 1 page.",
          "Set a print area (Page Layout → Print Area) if you only want part of a sheet in the PDF.",
          "Choose landscape orientation for wide tables, and repeat header rows on every page (Page Layout → Print Titles).",
          "Formulas appear as their calculated values — the PDF is a snapshot, not a live spreadsheet.",
        ],
      },
      {
        heading: "PowerPoint presentations",
        list: [
          "Each slide becomes one PDF page. Animations, transitions and embedded video don't carry over, so make sure each slide makes sense in its final, fully built state.",
          "Speaker notes aren't included in the converted PDF.",
          "Embedded fonts help here too: File → Options → Save → \"Embed fonts in the file\".",
        ],
      },
      {
        heading: "Check before you send",
        paragraphs: [
          "Open the PDF and page through it before sending — compare the page count with the original and look at the end of each page, where shifted breaks show up first. If something moved, adjust the original and convert again; it takes seconds.",
        ],
      },
    ],
    relatedTools: ["word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf", "merge-pdf"],
  },
  {
    path: "/guides/how-to-make-a-qr-code-that-scans",
    category: "web",
    keywords: { primary: "QR code not scanning", secondary: ["QR code size for printing", "QR code quiet zone", "QR code colours"] },
    title: "How to Make a QR Code That Actually Scans",
    seoTitle: `How to Make a QR Code That Scans Reliably: Size, Colour & Testing | ${SITE_NAME}`,
    metaDescription: "Why some QR codes won't scan, and how to fix it: keep the content short, print at the right size, leave the quiet zone, choose safe colours and test before printing.",
    summary: "A QR code that won't scan is worse than no code at all — usually because it's too dense, printed too small, cropped, or in colours a phone camera can't separate. Here's how to get one right first time.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "How a QR code stores your link",
        paragraphs: [
          "A QR code is a grid of black and white squares called modules. The more data you put in, the bigger the grid: the smallest QR code is 21 × 21 modules and the largest is 177 × 177. A static code — the kind our generator makes — stores your link or text directly in that pattern, so there's no service in the middle that can expire.",
          "QR codes also carry error correction, extra data that lets a scanner rebuild the content when part of the code is dirty, damaged or covered. There are four levels, able to recover roughly 7% (Low), 15% (Medium), 25% (Quartile) or 30% (High) of the code. Higher levels make a code more robust, but also denser.",
        ],
      },
      {
        heading: "Keep the content short",
        paragraphs: [
          "Density is the main enemy of scanning. A long URL full of tracking parameters needs more modules, so at the same printed size each module is smaller and harder for a camera to resolve. Before you generate a code, strip parameters you don't need, or point the code at a short page on your own site.",
          "Pointing at your own page has a second advantage: a static code can't be changed after it's printed, but a page you control can. If the destination might change — a menu, an event page, a promotion — encode a stable address and update what's on it.",
        ],
      },
      {
        heading: "Print it big enough, with its margin",
        list: [
          "Size: around 2 × 2 cm (0.8 inches) is a sensible minimum for something scanned up close, like a business card or product label. Go larger for denser codes.",
          "Distance: a common rule of thumb is that a code can be scanned from about ten times its width, so a poster read from 2 metres away needs a code around 20 cm wide.",
          "Quiet zone: scanners need an empty margin around the code — four modules wide is the standard. Our generator adds it; don't crop it off or place text and graphics right up to the edge.",
          "For print, download the SVG: it stays perfectly sharp at any size, whereas a small PNG enlarged for a poster will blur.",
        ],
      },
      {
        heading: "Choose colours a camera can read",
        paragraphs: [
          "Scanners look for dark modules on a light background. Keep strong contrast — a dark colour on white or a pale tint is fine — and avoid light codes on dark backgrounds, which many scanners can't read at all. Gradients, photos behind the code and glossy finishes that reflect light all reduce reliability. Our generator warns you when the colours you pick are inverted or too close together.",
          "If you want to place a small logo over the middle of the code, use High error correction so the covered area can be recovered, keep the logo small, and test it thoroughly — you are deliberately damaging the code.",
        ],
      },
      {
        heading: "Test before you print",
        list: [
          "Scan the code with at least two different phones, using the built-in camera app.",
          "Test it at the size it will actually be printed, in the lighting where people will see it.",
          "Check that the link opens the right page and that the page works well on a phone.",
          "If anything fails, shorten the content, make the code larger or increase the contrast, then test again.",
        ],
      },
    ],
    relatedTools: ["qr-code-generator", "image-resizer", "meta-tag-generator", "compress-image"],
  },
  {
    path: "/guides/json-formatting-and-validation",
    category: "web",
    keywords: { primary: "JSON validation errors", secondary: ["fix invalid JSON", "JSON formatter", "trailing comma JSON"] },
    title: "JSON Formatting and Validation: How to Fix Common Errors",
    seoTitle: `JSON Validation Errors Explained — and How to Fix Them | ${SITE_NAME}`,
    metaDescription: "The mistakes that make JSON invalid — trailing commas, single quotes, comments, unescaped characters — how to read the error message, and how to format and minify JSON.",
    summary: "One stray comma is enough to make a whole JSON file unreadable to the program that needs it. Here are the rules JSON actually follows, the mistakes that break it most often, and how to find the problem quickly.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What valid JSON looks like",
        paragraphs: [
          "JSON is built from just a few pieces: objects in curly braces, arrays in square brackets, strings in double quotes, numbers, true, false and null. Object keys must be strings in double quotes, items are separated by commas, and nothing else is allowed — no comments, no trailing commas, and no single quotes. That strictness is what makes JSON so easy for programs to read, and so easy for people to break.",
        ],
      },
      {
        heading: "The mistakes that break JSON most often",
        list: [
          "A trailing comma after the last item, as in {\"a\": 1,} — delete the final comma.",
          "Single quotes, as in {'name': 'Ann'} — JSON only accepts double quotes.",
          "Unquoted keys, as in {name: \"Ann\"} — valid JavaScript, but not valid JSON.",
          "Comments such as // or /* */ — JSON has no comment syntax.",
          "A missing comma between two items or two key-value pairs.",
          "A double quote or line break inside a string. Write \\\" for a quote and \\n for a new line inside the value.",
          "Values like NaN, Infinity or undefined — use null, or a string, instead.",
        ],
      },
      {
        heading: "Reading the error message",
        paragraphs: [
          "Validators report where the parser gave up, as a line and column. The real mistake is usually at that spot or just before it. A missing comma, for example, is typically reported at the start of the next key, because that's the first point at which the parser knows something is wrong. Our JSON Formatter shows the offending line with a marker under the column, which makes these easy to spot.",
          "If you see an error at the very end of the file, look for an opening brace or bracket that was never closed.",
        ],
      },
      {
        heading: "Very large numbers",
        paragraphs: [
          "JavaScript, and many other languages, store JSON numbers as floating-point values that can only represent whole numbers exactly up to 9,007,199,254,740,991. Larger integers — 64-bit database IDs are a common example — are silently rounded when parsed, so an ID can change without any error. If your data contains numbers that large, store them as strings. Our formatter warns you when it finds one.",
        ],
      },
      {
        heading: "Formatting, minifying and comparing",
        list: [
          "Format (pretty-print) to read and edit JSON — two or four spaces of indentation are the most common conventions.",
          "Minify to remove all unnecessary whitespace before sending or storing JSON; the data is unchanged.",
          "Sort keys alphabetically when comparing two versions of a file: formatted, sorted JSON lines up neatly in Text Compare, so only real changes show.",
        ],
      },
      {
        heading: "JSON with comments (JSON5 and JSONC)",
        paragraphs: [
          "Some configuration files, such as VS Code settings or tsconfig.json, are read by tools that accept comments and trailing commas. Those files use a relaxed dialect (JSONC or JSON5), not strict JSON, so a strict validator will flag them. That's expected — the file is fine for the tool that reads it, but it isn't standard JSON.",
        ],
      },
    ],
    relatedTools: ["json-formatter", "text-compare", "base64-encoder-decoder", "meta-tag-generator"],
  },
  {
    path: "/guides/what-is-base64-encoding",
    category: "web",
    keywords: { primary: "what is Base64 encoding", secondary: ["Base64 encode", "Base64 decode", "is Base64 encryption"] },
    title: "What Is Base64 Encoding — and When Should You Use It?",
    seoTitle: `What Is Base64? How It Works, Where It's Used and Its Pitfalls | ${SITE_NAME}`,
    metaDescription: "A plain-English explanation of Base64: how it turns data into text, why the output is a third larger, where you'll meet it, and why it is not encryption.",
    summary: "Base64 shows up everywhere — in data URLs, email attachments, login headers and tokens — usually as a long string of letters ending in “=”. Here's what it actually does, when it's the right tool, and the mistakes people make with it.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What Base64 does",
        paragraphs: [
          "Computers store everything as bytes, and many bytes don't correspond to printable characters. Base64 rewrites any data using just 64 safe characters — A–Z, a–z, 0–9, + and / — so it can travel through systems designed only for text, such as email, JSON, HTML and HTTP headers, without being corrupted.",
          "It works by taking the data three bytes (24 bits) at a time and splitting them into four groups of six bits; each group picks one of the 64 characters. For example, the word “Man” becomes “TWFu”. When the input isn't a multiple of three bytes, the output is padded with one or two “=” signs — “Hi” encodes to “SGk=”.",
        ],
      },
      {
        heading: "The cost: about a third larger",
        paragraphs: [
          "Because every three bytes become four characters, Base64 output is roughly 33% larger than the original. That's a reasonable price for a small icon embedded in CSS or a short value in a header, but not for big files: a 3MB image becomes about 4MB of text that can't be cached separately by the browser.",
        ],
      },
      {
        heading: "Where you'll meet it",
        list: [
          "Data URLs, which embed small images or fonts directly in HTML or CSS (data:image/png;base64,…).",
          "Email attachments, which are sent as Base64 inside the message.",
          "HTTP Basic authentication, where the header carries “username:password” encoded in Base64.",
          "JSON Web Tokens (JWTs), whose sections are URL-safe Base64 — decode the middle section to read a token's claims.",
          "APIs that need to put binary data, such as a file or a signature, inside a JSON field.",
        ],
      },
      {
        heading: "Base64 is not encryption",
        paragraphs: [
          "Anyone can decode Base64 instantly — there's no key or secret involved. The Basic authentication example above is a good illustration: the password in that header is only encoded, which is why Basic authentication must always be sent over HTTPS. Never use Base64 to hide passwords, API keys or personal data.",
        ],
      },
      {
        heading: "Two common pitfalls",
        list: [
          "Non-English text: the browser's built-in btoa function only accepts Latin-1 characters and throws an error on letters like “é”, emoji or any non-Latin script. Text must be converted to UTF-8 bytes first. Our Base64 tool does this automatically, so accented letters and emoji round-trip correctly.",
          "Two alphabets: standard Base64 uses + and / and pads with =, which have special meanings in URLs. The URL-safe variant (used by JWTs) replaces them with - and _ and usually drops the padding. If a value won't decode, it may be in the other alphabet — our decoder accepts both.",
        ],
      },
    ],
    relatedTools: ["base64-encoder-decoder", "json-formatter", "qr-code-generator", "compress-image"],
  },
  {
    path: "/guides/meta-tags-for-seo-and-social-sharing",
    category: "web",
    keywords: { primary: "meta tags for SEO", secondary: ["Open Graph tags", "Twitter card tags", "meta description length"] },
    title: "Meta Tags for SEO and Social Sharing: What Each One Does",
    seoTitle: `Meta Tags Explained: Title, Description, Canonical, Open Graph & More | ${SITE_NAME}`,
    metaDescription: "What the title tag, meta description, canonical link, robots tag, Open Graph and Twitter Card tags each do, how long to make them, and the mistakes to avoid.",
    summary: "A handful of lines in a page's <head> decide how it appears in search results and when it's shared on social media. Here's what each tag does, which ones matter, and the mistakes that quietly cost you clicks.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "The title tag",
        paragraphs: [
          "The title is the clickable headline in search results and the text on the browser tab, which makes it the single most important tag on the page. Give every page its own title that says plainly what the page offers, with the most important words first. Google typically shows around 50–60 characters before cutting a title off — it actually measures pixel width — and it sometimes rewrites titles it considers unhelpful.",
        ],
      },
      {
        heading: "The meta description",
        paragraphs: [
          "The description is the short summary shown under the title. It isn't a ranking factor, but a clear, specific description persuades more people to click. Aim for roughly 120–160 characters that describe the page honestly. If a description is missing, or doesn't match what someone searched for, Google picks text from the page instead.",
        ],
      },
      {
        heading: "The canonical link",
        paragraphs: [
          "The same page is often reachable at several addresses: with and without “www”, with tracking parameters, or with a trailing slash. A canonical link tells search engines which address is the main one, so ranking signals aren't split between duplicates. Use the full https:// address of the preferred version of the page.",
        ],
      },
      {
        heading: "The robots tag",
        paragraphs: [
          "Pages are indexed by default, so you only need a robots tag to keep a page out of search results — “noindex” — for example a thank-you page, an internal search results page or a staging copy. One catch: search engines have to be able to crawl a page to see its noindex tag, so don't also block that page in robots.txt.",
        ],
      },
      {
        heading: "Open Graph and Twitter Card tags",
        list: [
          "Open Graph tags (og:title, og:description, og:image, og:url) control the preview shown when a link is shared on Facebook, LinkedIn, WhatsApp and many other apps.",
          "X (Twitter) reads its own twitter: tags, and falls back to Open Graph for anything missing. The “summary_large_image” card shows a large image above the title.",
          "Use a share image of about 1200 × 630 pixels, and give its full https:// address — social sites can't load relative paths.",
          "Platforms cache link previews. After changing your tags, use Facebook's Sharing Debugger or LinkedIn's Post Inspector to fetch the new version.",
        ],
      },
      {
        heading: "What you can skip",
        paragraphs: [
          "The keywords meta tag has been ignored by Google for ranking for many years, so there's no need to add one; a clear title, description and page content matter far more. The charset and viewport tags aren't about SEO, but every page should still have them so text displays correctly and the page fits phone screens.",
        ],
      },
    ],
    relatedTools: ["meta-tag-generator", "image-resizer", "word-counter", "qr-code-generator"],
  },
  {
    path: "/guides/word-and-character-limits",
    category: "writing",
    keywords: { primary: "word and character limits", secondary: ["character count with spaces", "SMS character limit", "how to reduce word count"] },
    title: "Word and Character Limits: How They're Counted and How to Hit Them",
    seoTitle: `Word & Character Limits Explained — How They're Counted and How to Trim | ${SITE_NAME}`,
    metaDescription: "How word and character counts are calculated, why different tools disagree, common limits for essays, text messages and search snippets, and practical ways to trim.",
    summary: "Word and character limits decide whether your essay is accepted, your text message splits in two, or your search snippet gets cut off. Here's how counts are actually calculated, why tools disagree, and how to trim without losing meaning.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What counts as a word",
        paragraphs: [
          "Most counters treat a word as a run of letters or numbers separated by spaces or punctuation. Contractions like “don't” and hyphenated words like “well-known” usually count as one word. Tools still disagree at the edges — web addresses, numbers with symbols like “£5.99”, and words joined by a dash without spaces are counted differently by different programs — so if a limit is strict, check with the tool the organisation itself uses, and leave yourself a small margin.",
        ],
      },
      {
        heading: "Characters: with or without spaces?",
        paragraphs: [
          "Character limits almost always include spaces and punctuation, unless they say otherwise. Emoji and some symbols complicate things: they look like one character but can count as more, depending on the platform. X (Twitter), for example, counts most emoji as two characters, and a text message containing a single emoji switches to a different encoding with a smaller limit.",
        ],
      },
      {
        heading: "Limits you're likely to meet",
        list: [
          "Text messages (SMS): 160 characters per message using standard characters, but only 70 if the message contains any emoji or non-Latin characters; longer messages are split into parts.",
          "Search results: Google typically shows about 50–60 characters of a title and 150–160 characters of a description.",
          "X (Twitter): 280 characters for a standard post, with every link counted as 23 characters regardless of its real length.",
          "College applications: the Common App personal essay allows up to 650 words.",
          "Forms and applications generally: limits are maximums, and answers well under the limit are usually fine if they answer the question.",
        ],
      },
      {
        heading: "How to trim without losing meaning",
        list: [
          "Cut filler words such as “really”, “very”, “just” and “in order to”.",
          "Replace phrases with single words: “due to the fact that” becomes “because”.",
          "Check your most frequent words — repeated terms are often the easiest place to save space.",
          "Split long sentences, then remove any half that repeats the point.",
          "Compare your before and after versions side by side to make sure nothing important was lost.",
        ],
      },
      {
        heading: "Writing to time",
        paragraphs: [
          "For speeches and presentations, think in words per minute. A comfortable speaking pace is around 140 words per minute, so a five-minute talk is roughly 700 words; silent reading is faster, at around 238 words per minute for typical non-fiction. Our Word Counter shows both estimates as you type.",
        ],
      },
    ],
    relatedTools: ["word-counter", "text-compare", "meta-tag-generator", "image-to-text"],
  },
  {
    path: "/guides/how-to-convert-webp-to-jpg",
    category: "images",
    keywords: { primary: "WebP convert", secondary: ["WebP to JPG", "convert WebP to JPG online", "WebP image converter", "JPG to WebP"] },
    title: "How to Convert WebP to JPG Online for Free",
    seoTitle: `How to Convert WebP to JPG (and JPG to WebP) Free | ${SITE_NAME}`,
    metaDescription: "What WebP files are, why some apps won't open them, and how to convert WebP to JPG or PNG — or JPG and PNG to WebP — for free in your browser.",
    summary: "You saved an image from a website and it turned out to be a .webp file that your photo editor, upload form or messaging app won't accept. Here's what WebP is, how to convert it to JPG or PNG in a few seconds, and when it's worth converting the other way.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What is a WebP file?",
        paragraphs: [
          "WebP is an image format introduced by Google in 2010 to make web pages load faster. It combines the strengths of the older formats: lossy compression for photos like JPG, lossless compression and transparency like PNG, and even animation like GIF. At similar visual quality, WebP files are usually noticeably smaller, which is why so many websites now serve their images as WebP.",
          "Every current major browser displays WebP, so you rarely notice it while browsing. The problem appears when you save an image and try to use it somewhere else.",
        ],
      },
      {
        heading: "Why convert WebP to JPG",
        list: [
          "Older image editors and some desktop apps can't open .webp files.",
          "Many upload forms — job portals, government sites, print services — only accept JPG or PNG.",
          "Some messaging and email workflows show WebP attachments as a generic file rather than an image.",
          "You want one consistent format for an archive or photo library.",
        ],
      },
      {
        heading: "How to convert WebP to JPG with Toolkit4Me",
        list: [
          "Open the WebP Converter and add your .webp images — up to 20 at a time, 25MB each.",
          "Under “Convert to”, choose JPG.",
          "Pick a quality: High (90) for photos you might print or edit, Balanced (80) for most uses, Smaller files (70) for thumbnails.",
          "Select Convert images, then download each JPG. The conversion runs in your browser, so the images never leave your device.",
        ],
        image: {
          src: "/images/guides/webp-converter-options.webp",
          alt: "Toolkit4Me WebP Converter with an image added, showing the Convert to and Quality options and the Convert images button",
          width: 712,
          height: 499,
          caption: "WebP Converter: choose the output format and quality, then select Convert images.",
        },
      },
      {
        heading: "JPG or PNG?",
        paragraphs: [
          "Choose JPG for photographs: it's universally supported and keeps file sizes small. Choose PNG instead if the WebP has a transparent background — a logo or a product cut-out — or if it's a screenshot or graphic with sharp text. JPG can't store transparency, so transparent areas become white when you convert to JPG, whereas PNG keeps them.",
        ],
        table: {
          caption: "Which format to convert a WebP into",
          headers: ["Format", "Transparency", "Compression", "Best for", "Opens almost everywhere?"],
          rows: [
            ["JPG", "No (becomes white)", "Lossy", "Photos, upload forms", "Yes"],
            ["PNG", "Yes", "Lossless", "Logos, screenshots, graphics", "Yes"],
            ["WebP", "Yes", "Lossy or lossless", "Images on your own website", "In browsers; not in every app"],
          ],
        },
      },
      {
        heading: "Going the other way: JPG and PNG to WebP",
        paragraphs: [
          "If you run a website, converting your own JPG and PNG images to WebP is one of the simplest ways to make pages lighter. Use the same tool with “Convert to” set to WebP. Transparency in PNGs is preserved, and the result screen shows each file's size before and after so you can judge the saving for your own images — it varies a lot from image to image.",
          "Creating WebP files needs Chrome, Edge or Firefox; older versions of Safari can display WebP but can't create it. Converting from WebP to JPG or PNG works in all modern browsers.",
        ],
        image: {
          src: "/images/guides/webp-converter-result.webp",
          alt: "Toolkit4Me WebP Converter result screen showing a converted file, its size before and after, and a download button",
          width: 712,
          height: 296,
          caption: "The result screen shows the size before and after (shown here for a simple synthetic test image — real photos will differ).",
        },
      },
      {
        heading: "Troubleshooting",
        list: [
          "“This browser can't create WebP images”: you're converting to WebP in an older Safari. Use Chrome, Edge or Firefox, or convert to JPG or PNG instead.",
          "The background turned white: you converted a transparent image to JPG. Convert to PNG to keep transparency.",
          "Only one frame came out: animated WebP images are converted as a single still frame.",
          "The file was rejected: each image can be up to 25MB and about 16.7 megapixels. Reduce very large images first with Image Resizer.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "WebP is excellent for websites but not yet universal everywhere else. When an app or form won't take a .webp file, converting it to JPG (for photos) or PNG (for graphics and transparency) solves the problem in seconds. And if you publish images online, converting them to WebP is an easy win for page speed.",
        ],
      },
    ],
    faq: [
      {
        question: "Does converting WebP to JPG lose quality?",
        answer:
          "JPG is lossy, so the image is re-encoded, but at the High (90) setting the difference is very hard to see. Converting can't add back detail the WebP had already discarded, so start from the best-quality file you have.",
      },
      {
        question: "Why do websites use WebP?",
        answer: "Because WebP files are usually smaller than equivalent JPGs and PNGs, pages load faster and use less mobile data, which also helps with search performance.",
      },
      {
        question: "Can I convert several WebP files at once?",
        answer: "Yes — add up to 20 images per batch and download each converted file from the results list.",
      },
      {
        question: "Are my images uploaded?",
        answer: "No. The WebP Converter uses your browser's built-in image engine, so the conversion happens entirely on your device.",
      },
    ],
    relatedTools: ["webp-converter", "png-to-jpg", "image-resizer", "compress-image"],
  },
  {
    path: "/guides/how-to-create-a-free-qr-code-that-never-expires",
    category: "web",
    keywords: { primary: "free QR code generator no expiration", secondary: ["static QR code generator", "QR code generator PNG", "create QR code online", "static vs dynamic QR code"] },
    featured: true,
    title: "How to Create a Free QR Code That Never Expires",
    seoTitle: `Free QR Code That Never Expires: Static vs Dynamic Codes | ${SITE_NAME}`,
    metaDescription: "Why some “free” QR codes stop working, the difference between static and dynamic QR codes, and how to create a free static QR code (PNG or SVG) that keeps working.",
    summary: "Plenty of people have printed a “free” QR code on menus or flyers, only to find months later that it leads to an expired-trial page. Here's why that happens, how static and dynamic codes differ, and how to make a free QR code that keeps working for as long as your link does.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why some free QR codes stop working",
        paragraphs: [
          "Many QR code services generate dynamic codes by default. Instead of your link, the code contains a short web address belonging to the service, which then redirects visitors to your real link. That redirect is what lets the service count scans and let you change the destination later — but it also means your code only works while the service keeps that redirect running.",
          "When a free trial ends, a plan lapses or the service shuts down, the redirect can stop or be replaced with a sign-up page. The code printed on your packaging still scans perfectly; it just no longer goes where you meant it to. Nothing about the QR code itself “expired” — the middleman did.",
        ],
      },
      {
        heading: "Static vs dynamic QR codes",
        paragraphs: [
          "A static QR code stores your link or text directly in its pattern. There's no service in between, nothing to renew and nothing that can be switched off, so it works for as long as the destination exists. The trade-offs are that you can't change where it points after printing, and there's no built-in scan counting.",
        ],
        table: {
          caption: "Static and dynamic QR codes compared",
          headers: ["", "Static QR code", "Dynamic QR code"],
          rows: [
            ["What the code contains", "Your link or text itself", "A short link owned by the QR service"],
            ["Can it expire?", "No — it works as long as your link works", "Yes, if the service's redirect stops"],
            ["Change the destination after printing", "No", "Yes, in the service's dashboard"],
            ["Scan statistics", "Not built in (use your own website analytics)", "Usually included"],
            ["Account or subscription", "Not needed", "Usually required"],
          ],
        },
      },
      {
        heading: "How to create a free static QR code",
        list: [
          "Open the QR Code Generator and paste the link or text you want to encode.",
          "Keep Medium error correction unless the code may get damaged or partly covered, in which case choose High.",
          "Optionally pick colours — keep a dark code on a light background, and the tool will warn you if contrast is too low.",
          "Scan the live preview with your phone to check it opens the right page.",
          "Download a PNG (256, 512 or 1024 pixels) for screens and documents, or an SVG for print, which stays sharp at any size.",
        ],
        image: {
          src: "/images/guides/qr-code-generator.webp",
          alt: "Toolkit4Me QR Code Generator with a link entered, error correction and size options, a live QR code preview, and Download PNG and Download SVG buttons",
          width: 712,
          height: 781,
          caption: "The QR Code Generator encodes your link directly, with a live preview and PNG or SVG downloads.",
        },
      },
      {
        heading: "How to check whether a QR code is static",
        paragraphs: [
          "Scan the code with your phone's camera and look at the address it offers to open, before tapping it. If it's your own link, the code is static. If it's a short address on a different domain that you don't recognise, the code is dynamic and depends on that service. Toolkit4Me's generator always encodes exactly what you type — there's no redirect, account or expiry date involved.",
        ],
      },
      {
        heading: "Making a static code future-proof",
        paragraphs: [
          "Because a static code can't be edited after printing, the smart move is to encode an address you control and keep stable — for example www.yourbusiness.com/menu rather than a long link to a document on a file-sharing site. If the menu changes, you update that page and the printed code keeps working.",
          "If you do need scan numbers, add tracking parameters to your link before encoding it (for example ?utm_source=table-card) and read the visits in your own website analytics. You keep the statistics without depending on a third party.",
        ],
      },
      {
        heading: "When a dynamic QR code is worth it",
        paragraphs: [
          "Dynamic codes do have genuine uses: large print runs where the destination is likely to change, campaigns that need detailed scan reports, or businesses that want one dashboard for hundreds of codes. If you choose one, check the plan's terms for what happens to existing codes if you stop paying, and keep in mind that your printed materials will depend on that provider.",
        ],
      },
      {
        heading: "Common mistakes",
        list: [
          "Encoding a temporary link — a shared-document link that later changes permissions, or a link-shortener you don't control.",
          "Printing without testing: always scan a printed proof at its real size before a full run.",
          "Using a small PNG for a large print: download the SVG so the code stays crisp.",
          "Low-contrast colours or a light code on a dark background, which many scanners can't read.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "A QR code doesn't need a subscription to keep working. A static code, which stores your link directly, never expires on its own; it keeps working as long as the page it points to exists. Encode a stable address you control, test it at its printed size, and download an SVG for print — and you won't have to reprint because a free trial ran out.",
        ],
      },
    ],
    faq: [
      {
        question: "Do QR codes from Toolkit4Me expire?",
        answer: "No. They're static codes: your link or text is stored in the code itself, with no redirect, account or time limit. The code works for as long as the destination link works.",
      },
      {
        question: "Can I change the link after printing a static QR code?",
        answer: "No — the link is part of the pattern. That's why it's best to encode a stable page on your own website, whose content you can update without changing the code.",
      },
      {
        question: "Can I see how many people scanned my code?",
        answer: "Static codes don't count scans themselves. Add tracking parameters to the link before encoding it and you'll see the visits in your website analytics.",
      },
      {
        question: "Should I download PNG or SVG?",
        answer: "PNG for websites, documents and slides; SVG for anything printed, because it scales to any size without blurring.",
      },
    ],
    relatedTools: ["qr-code-generator", "meta-tag-generator", "image-resizer", "compress-image"],
  },
  {
    path: "/guides/how-to-convert-jpg-to-pdf",
    category: "pdf",
    keywords: { primary: "JPG to PDF online", secondary: ["convert JPG to PDF without losing quality", "combine images into one PDF", "photo to PDF"] },
    title: "How to Convert JPG to PDF Online Without Losing Quality",
    seoTitle: `How to Convert JPG to PDF Without Losing Quality | ${SITE_NAME}`,
    metaDescription: "Combine photos and scans into one PDF without losing quality: choose the right page size, order the pages, keep the file small, and avoid the common mistakes.",
    summary: "Receipts for an expense claim, photos of a signed form, pages of ID for an application — they're usually JPGs, and the recipient usually wants one PDF. Here's how to combine them into a single, tidy PDF without degrading the images.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why turn JPGs into a PDF",
        paragraphs: [
          "Sending five separate photos is clumsy: they arrive in a random order, some apps compress them, and the recipient has to save each one. A single PDF keeps the pages together and in order, opens the same way on any device, and is the format most forms and offices ask for.",
        ],
      },
      {
        heading: "Does converting JPG to PDF lose quality?",
        paragraphs: [
          "It doesn't have to. A PDF can hold a JPG image exactly as it is, and that's what Toolkit4Me's JPG to PDF tool does: each JPG is placed into the PDF unchanged rather than being re-compressed. We checked this by converting a photo and finding the original JPG data inside the resulting PDF byte for byte. The image you see in the PDF is the same image you started with.",
          "What can make a PDF look worse is the source photo itself — a blurry, dark or skewed picture stays blurry, dark or skewed. The tool doesn't crop, straighten or enhance images, so take good photos first.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open JPG to PDF and add your JPG images — as many as you need, up to 25MB each.",
          "Use the up and down arrows next to each image to put the pages in the right order.",
          "Choose a page size: A4, Letter, or Fit to image.",
          "Select Convert to PDF and download the file. Everything happens in your browser, so your images are never uploaded.",
        ],
        image: {
          src: "/images/guides/jpg-to-pdf-page-size.webp",
          alt: "Toolkit4Me JPG to PDF tool with two photos added, up and down arrows to reorder them, the Page size option set to A4, and the Convert to PDF button",
          width: 712,
          height: 513,
          caption: "Add your images, order them with the arrows, choose a page size and convert.",
        },
      },
      {
        heading: "Choosing a page size",
        paragraphs: [
          "A4 and Letter put each image on a standard sheet, centred and scaled to fit without cropping — the best choice if the PDF may be printed or attached to a form. Fit to image makes each page exactly the size of its photo, with no white border, which suits photo collections and documents read on screen.",
        ],
        table: {
          caption: "Page size options",
          headers: ["Option", "What you get", "Best for"],
          rows: [
            ["A4", "Standard A4 pages; image centred and scaled to fit", "Printing and forms outside North America"],
            ["Letter", "US Letter pages; image centred and scaled to fit", "Printing and forms in the US and Canada"],
            ["Fit to image", "Each page matches its photo's shape; no borders", "Photo collections and on-screen reading"],
          ],
        },
      },
      {
        heading: "Keeping the PDF small",
        paragraphs: [
          "Because the images go in unchanged, the PDF is roughly the size of all your JPGs added together. Ten phone photos at 3–4MB each make a 30–40MB PDF — too big for many forms. If you need a smaller file, shrink the photos first with Compress Image or Image Resizer (1,600 pixels wide is plenty for a document photo), then convert. Alternatively, convert first and run the PDF through Compress PDF.",
        ],
      },
      {
        heading: "Tips for photographing documents",
        list: [
          "Lay the page flat on a dark, plain surface so the edges stand out.",
          "Shoot straight down, in good daylight, without your shadow over the page.",
          "Fill the frame with the page and crop away the background before converting.",
          "Photograph each page separately — one image becomes one PDF page.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "Landscape photos look small on A4: A4 pages are portrait, so a wide photo is scaled down to fit. Use Fit to image, or rotate the photo before converting.",
          "My PNG or screenshot isn't accepted: the tool takes JPG/JPEG files. Convert PNGs first with PNG to JPG.",
          "The pages are in the wrong order: reorder them with the arrows before converting — the PDF follows the list from top to bottom.",
          "The PDF is too big to upload: compress or resize the photos first, as described above.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Turning JPGs into a PDF is quick, and done right it costs nothing in quality: the images go into the PDF untouched. Order the pages, pick A4 or Letter for anything that might be printed, and shrink large phone photos first if the file needs to fit an upload limit.",
        ],
      },
    ],
    faq: [
      {
        question: "How many images can I combine into one PDF?",
        answer: "There's no fixed limit on the number of images; each one can be up to 25MB. Very large batches take longer and produce large PDFs, so resize big photos first.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer: "No. The PDF is built in your browser, so the images never leave your device — a good fit for ID documents and personal paperwork.",
      },
      {
        question: "Can I add PNG images?",
        answer: "JPG to PDF accepts JPG and JPEG files. Convert PNGs with PNG to JPG first; any transparent areas will become white.",
      },
      {
        question: "Can I add a page to an existing PDF?",
        answer: "Convert the new images to a PDF, then combine it with your existing PDF using Merge PDF.",
      },
    ],
    relatedTools: ["jpg-to-pdf", "compress-image", "merge-pdf", "png-to-jpg"],
  },
  {
    path: "/guides/how-to-convert-png-to-jpg",
    category: "images",
    keywords: { primary: "PNG to JPG", secondary: ["convert PNG to JPG online", "PNG to JPG without losing quality", "reduce PNG file size"] },
    title: "How to Convert PNG to JPG Online for Free",
    seoTitle: `How to Convert PNG to JPG Online Free (and When Not To) | ${SITE_NAME}`,
    metaDescription: "Convert PNG images to JPG for free in your browser: when it shrinks files dramatically, what happens to transparency, which images should stay PNG, and how to fix common problems.",
    summary: "PNG is a great format for screenshots and graphics, but photos saved as PNG are often several times bigger than they need to be — and some upload forms won't accept PNG at all. Here's how to convert PNG to JPG, and how to tell when you shouldn't.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "When converting PNG to JPG makes sense",
        list: [
          "A photo was saved as PNG — by a screenshot tool, an editor's default setting or a download — and the file is huge.",
          "An upload form, print service or older app accepts only JPG.",
          "You're emailing several photos and want the attachments to be smaller.",
          "You're adding photos to a document or presentation and want to keep the file size down.",
        ],
      },
      {
        heading: "What happens when you convert",
        paragraphs: [
          "PNG stores every pixel exactly; JPG uses lossy compression designed for photographs. For a photo, that usually means a much smaller file with no visible difference at normal viewing size. Toolkit4Me's PNG to JPG converter saves at a high quality setting (92%) so photos stay clean.",
          "Two things change. First, JPG has no transparency, so any transparent areas are filled with white. Second, JPG's compression can leave faint smudges around sharp edges — invisible in photos, but sometimes noticeable around small text and thin lines.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open PNG to JPG and add one or more PNG images (up to 25MB each).",
          "Select Convert to JPG.",
          "Download each JPG from the results list. The results show each file's size before and after, so you can see the difference.",
        ],
        image: {
          src: "/images/guides/png-to-jpg-upload.webp",
          alt: "Toolkit4Me PNG to JPG tool with a PNG image added, an Add more files button and the Convert to JPG button",
          width: 712,
          height: 293,
          caption: "Add your PNG images and select Convert to JPG — the conversion happens in your browser.",
        },
      },
      {
        heading: "Which images should stay PNG",
        table: {
          caption: "Convert or keep?",
          headers: ["Image", "Convert to JPG?", "Why"],
          rows: [
            ["Photo saved as PNG", "Yes", "Usually much smaller with no visible loss"],
            ["Screenshot with small text", "Usually not", "Text edges can blur slightly; PNG stays crisp"],
            ["Logo or icon with transparency", "No", "The transparent background would turn white"],
            ["Diagram, chart or line art", "Usually not", "Flat colours and thin lines suit PNG better"],
            ["Image for a form that only accepts JPG", "Yes", "Compatibility matters more than tiny quality differences"],
          ],
        },
      },
      {
        heading: "Making the file even smaller",
        paragraphs: [
          "Converting a photo from PNG to JPG is usually the biggest single saving. If the result is still too large — for a strict upload limit, say — run the JPG through Compress Image, where you can lower the quality and reduce the width. For images on your own website, the WebP Converter can produce an even smaller file.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "The background turned white: the PNG was transparent and JPG can't store transparency. Keep it as PNG, or convert to WebP if it's for a website.",
          "Text looks slightly fuzzy: JPG isn't ideal for screenshots and text. Keep those images as PNG.",
          "The JPG isn't much smaller: the PNG was a simple graphic, which PNG already stores efficiently. Keep it as PNG.",
          "A file was rejected: each image can be up to 25MB and about 16.7 megapixels. Reduce very large images with Image Resizer first.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Convert PNG to JPG for photographs and for anywhere that demands JPG; keep PNG for screenshots, graphics and anything with a transparent background. Decide by what's in the image, check the before-and-after sizes, and keep the original in case you need it again.",
        ],
      },
    ],
    faq: [
      {
        question: "Does converting PNG to JPG reduce quality?",
        answer: "Slightly, because JPG is lossy, but at the 92% quality the converter uses, the difference in a photo is very hard to see. Screenshots and text can show it more, so keep those as PNG.",
      },
      {
        question: "Can I convert several PNGs at once?",
        answer: "Yes — add several images and they're all converted in one go; download each from the results list.",
      },
      {
        question: "What happens to transparent areas?",
        answer: "They become white, because JPG doesn't support transparency. If you need the transparency, keep the PNG or use WebP.",
      },
      {
        question: "Are my images uploaded?",
        answer: "No. PNG to JPG runs entirely in your browser, so your images never leave your device.",
      },
    ],
    relatedTools: ["png-to-jpg", "compress-image", "jpg-to-png", "webp-converter"],
  },
  {
    path: "/guides/how-to-split-a-pdf",
    category: "pdf",
    keywords: { primary: "split PDF", secondary: ["extract pages from PDF", "split PDF into separate files", "split PDF every N pages"] },
    title: "How to Split a PDF into Separate Pages or Files",
    seoTitle: `How to Split a PDF into Separate Pages or Files (Free) | ${SITE_NAME}`,
    metaDescription: "Extract specific pages from a PDF, split it into several files by page range, or break it into equal parts every few pages — free, in your browser, step by step.",
    summary: "Sometimes you only need part of a PDF: one invoice from a monthly batch, the two pages a form actually asks for, or a long scan broken into chunks small enough to upload. Here's how to split a PDF exactly the way you need.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Two ways to split a PDF",
        paragraphs: [
          "Split PDF works in one of two modes. Custom page ranges lets you list exactly which pages go into each new file — useful when you know what you need. Split every N pages chops the document into equal parts automatically — useful for very long files or upload limits.",
        ],
        table: {
          caption: "Choosing a split mode",
          headers: ["Mode", "What you enter", "What you get", "Good for"],
          rows: [
            ["Custom page ranges", "e.g. 1-3, 5, 8-10", "One PDF per range, in the order you typed them", "Pulling out specific pages or sections"],
            ["Split every N pages", "e.g. 10", "Files of 10 pages each (the last may be shorter)", "Long documents and upload limits"],
          ],
        },
      },
      {
        heading: "Step by step",
        list: [
          "Open Split PDF and add your PDF (up to 50MB). It's processed in your browser, so the file isn't uploaded.",
          "Choose Custom page ranges or Split every N pages.",
          "Enter your ranges, separated by commas — for example 1-3, 4, 7-9 makes three files — or the number of pages per file.",
          "Select Split PDF, then download each file, or use Download all to save them in one go.",
        ],
      },
      {
        heading: "Writing page ranges",
        list: [
          "A single page: 5",
          "A run of pages: 2-6 (pages 2, 3, 4, 5 and 6)",
          "Several files at once: 1-2, 3-10, 11 — each comma-separated group becomes its own PDF",
          "Page numbers are the PDF's physical pages counted from 1, not the numbers printed on the pages, which often differ in documents with a cover or contents pages.",
        ],
      },
      {
        heading: "Splitting vs deleting pages",
        paragraphs: [
          "If you want one file with a few pages removed, it's often quicker to delete them instead. The PDF Editor shows a thumbnail of every page and lets you delete, reorder and rotate pages, then download a single edited PDF. Splitting is better when you want several separate files, or when you only want to keep a small part of a long document.",
        ],
      },
      {
        heading: "Common uses",
        list: [
          "Sending only the relevant pages of a bank statement or contract, so you don't share more than needed.",
          "Separating a scanned batch of receipts or invoices into one file each.",
          "Breaking a 200-page scan into parts that fit a 10MB upload limit.",
          "Extracting a single chapter of a report to review or print.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "“Page 12 doesn't exist”: the PDF has fewer pages than your range — the message tells you how many it has. Adjust the range to match.",
          "“Couldn't be read as a PDF”: the file is damaged or password-protected. Remove the password with Unlock PDF first.",
          "Bookmarks or form fields are missing in the parts: splitting copies pages, and bookmarks and fillable fields may not carry over.",
          "The parts are still too big: compress each one with Compress PDF.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Use custom ranges when you know which pages you need, and split every N pages when the goal is simply smaller files. Because Split PDF runs in your browser, it's also a sensible choice for statements and other personal documents you'd rather not upload anywhere.",
        ],
      },
    ],
    faq: [
      {
        question: "Does splitting a PDF reduce quality?",
        answer: "No. Pages are copied into the new files exactly as they are; nothing is re-compressed.",
      },
      {
        question: "Can I put pages from different parts of the PDF into one file?",
        answer: "Each comma-separated range becomes its own file. To combine non-adjacent pages into one file, split them out and then join the parts with Merge PDF — or delete the pages you don't want in the PDF Editor.",
      },
      {
        question: "Is my PDF uploaded?",
        answer: "No. Split PDF runs entirely in your browser using the open-source pdf-lib library.",
      },
    ],
    relatedTools: ["split-pdf", "pdf-editor", "merge-pdf", "compress-pdf"],
  },
  {
    path: "/guides/how-to-unlock-a-pdf",
    category: "pdf",
    keywords: { primary: "unlock PDF", secondary: ["remove password from PDF", "unlock PDF with password", "PDF password remover"] },
    title: "How to Unlock a PDF When You Know the Password",
    seoTitle: `How to Remove a Password from a PDF You Own | ${SITE_NAME}`,
    metaDescription: "Remove the open password from a PDF you're entitled to use — such as bank or utility statements — so it opens without a prompt. What it does, what it can't do, and how to do it safely.",
    summary: "Banks, utilities and employers often send PDFs that ask for a password every time you open them. If you know the password and the document is yours, you can save an unlocked copy that opens straight away. Here's how — and what to keep in mind.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "What “unlocking” a PDF means",
        paragraphs: [
          "A PDF with an open password is encrypted: without the password, its contents can't be read at all. Unlocking means opening it once with the correct password and saving a copy without encryption, so it opens normally from then on. Removing the encryption also removes any printing or copying restrictions the PDF had.",
          "Unlocking is not cracking. Toolkit4Me's Unlock PDF only works when you supply the correct password — it never guesses, brute-forces or bypasses protection. If you've forgotten a password, the right step is to ask the sender for a new copy.",
        ],
      },
      {
        heading: "When it's useful",
        list: [
          "Statements you need to open often, or keep in a folder you already protect.",
          "Documents you want to merge, split, compress or edit — those tools can't open an encrypted PDF.",
          "Files you need to archive for years, when you might not remember the password later.",
          "Documents you need to upload to a system that rejects password-protected files.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open Unlock PDF and add the protected PDF (up to 100MB).",
          "Type the PDF's password.",
          "Select Unlock PDF. If the password is wrong you'll see a clear “incorrect password” message and no file is produced.",
          "Download the unlocked copy and check that it opens without a prompt.",
        ],
      },
      {
        heading: "Keep unlocked copies safe",
        paragraphs: [
          "Once the password is removed, anyone who gets the file can read it. Store unlocked statements somewhere that's already protected — an encrypted laptop, a password-protected account — and avoid emailing them. If you need to send one later, add a fresh password with Protect PDF and share the password separately.",
          "Unlock PDF runs on our server: your file and the unlocked copy are deleted automatically within an hour, and your password is used only for that one operation — it's never logged or stored.",
        ],
      },
      {
        heading: "Open password vs restrictions",
        table: {
          caption: "Which tool do you need?",
          headers: ["Your PDF…", "Tool", "Password needed?"],
          rows: [
            ["Asks for a password to open", "Unlock PDF", "Yes — the open password"],
            ["Opens freely but won't let you print or copy", "UnProtect PDF", "Usually not"],
            ["Opens freely, no restrictions", "Nothing to remove", "—"],
          ],
        },
      },
      {
        heading: "Troubleshooting",
        list: [
          "“Incorrect password”: check capital letters, and look for the format the sender described (for example, date of birth as DDMMYYYY). Copy-pasting from an email can add an invisible space.",
          "The PDF opens without a password already: there's no open password to remove. If printing is blocked, use UnProtect PDF instead.",
          "Forgotten password: there's no legitimate way to recover it. Ask the sender to reissue the document.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "If a document is yours and you know its password, saving an unlocked copy removes a daily annoyance and lets you merge, split or compress it. Just treat the unlocked copy as sensitive and store it somewhere already protected.",
        ],
      },
    ],
    faq: [
      {
        question: "Can Unlock PDF remove a password I don't know?",
        answer: "No. It only works with the correct password and never attempts to guess or crack one.",
      },
      {
        question: "Does unlocking change the content of the PDF?",
        answer: "No. Only the encryption is removed; pages, text and images stay the same.",
      },
      {
        question: "Is my password stored?",
        answer: "No. It's used once to decrypt the file and is never logged or stored. The files are deleted automatically within an hour.",
      },
    ],
    relatedTools: ["unlock-pdf", "unprotect-pdf", "protect-pdf", "merge-pdf"],
  },
  {
    path: "/guides/how-to-remove-pdf-restrictions",
    category: "pdf",
    keywords: { primary: "remove PDF restrictions", secondary: ["PDF printing disabled", "can't copy text from PDF", "remove PDF permissions password"] },
    title: "How to Remove Printing and Copying Restrictions from Your Own PDF",
    seoTitle: `PDF Won't Print or Copy? How to Remove Restrictions | ${SITE_NAME}`,
    metaDescription: "Why some PDFs open but won't let you print, copy or edit, the difference between permissions and open passwords, and how to remove restrictions from a PDF you're entitled to use.",
    summary: "Some PDFs open normally but grey out Print, refuse to let you copy a sentence, or block filling in forms. That's a permissions setting, separate from a password to open the file. Here's how it works and how to remove it from documents you own.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why a PDF can open but not print",
        paragraphs: [
          "PDFs can carry two different protections. An open password (sometimes called a user password) stops the file opening at all. A permissions password (owner password) lets anyone open it but tells PDF readers to block certain actions — printing, copying text, editing, adding comments or filling forms.",
          "Permissions are enforced by the reader software rather than by strong secrecy: a PDF with restrictions but no open password can be read by anyone. That's why removing those restrictions is possible without knowing a password — and why it should only be done on documents you have the right to use that way.",
        ],
      },
      {
        heading: "How to tell which protection you have",
        table: {
          caption: "Symptoms and the matching tool",
          headers: ["What you see", "Protection", "Tool"],
          rows: [
            ["A password prompt before the PDF opens", "Open password", "Unlock PDF (needs the password)"],
            ["Opens, but Print or Copy is greyed out", "Permissions restrictions", "UnProtect PDF"],
            ["Opens, but form fields won't take input", "Permissions restrictions (form filling disabled)", "UnProtect PDF"],
          ],
        },
      },
      {
        heading: "Step by step",
        list: [
          "Open UnProtect PDF and add the restricted PDF (up to 100MB).",
          "Leave the password blank if the PDF opens without one. If it also needs a password to open, enter it.",
          "Select Remove Restrictions and download the result.",
          "Open the new copy and check that printing and copying now work.",
        ],
      },
      {
        heading: "What the tool won't do",
        paragraphs: [
          "UnProtect PDF never guesses or cracks passwords, and it doesn't bypass DRM systems. If a PDF needs a password to open and you don't have it, you'll get a clear error rather than a workaround. It's intended for your own documents — a contract you've signed, a statement addressed to you, a form you need to complete — not for removing the protection someone has placed on their copyrighted work.",
        ],
      },
      {
        heading: "Alternatives worth knowing",
        list: [
          "If you only need to print once, ask the sender for an unrestricted copy — they may simply not have realised.",
          "If you only need the words, PDF to Word extracts the text into an editable document.",
          "If you need an image of a page, PDF to JPG renders it as a picture.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "“A password is required”: the PDF also has an open password. Enter it, or ask the sender for it.",
          "Restrictions still apply: some readers cache permissions — close the PDF fully and open the new copy.",
          "The file opens in a viewer that still blocks printing: make sure you're opening the downloaded copy, not the original.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "If a PDF opens but won't print or copy, it has permissions restrictions rather than real encryption. For documents you're entitled to use, removing them takes seconds; for anything that needs a password to open, use Unlock PDF with the correct password instead.",
        ],
      },
    ],
    faq: [
      {
        question: "Is removing PDF restrictions legal?",
        answer: "That depends on the document and where you are. Use it for documents you own or are authorised to print, copy or edit — not to get around the protection on someone else's copyrighted material.",
      },
      {
        question: "What's the difference between UnProtect PDF and Unlock PDF?",
        answer: "Unlock PDF removes a password needed to open a file, using that password. UnProtect PDF removes printing, copying and editing restrictions from a PDF that already opens.",
      },
      {
        question: "Is my file stored?",
        answer: "No. UnProtect PDF runs on our server, and both your file and the result are deleted automatically within an hour.",
      },
    ],
    relatedTools: ["unprotect-pdf", "unlock-pdf", "pdf-to-word", "protect-pdf"],
  },
  {
    path: "/guides/how-to-convert-pdf-to-jpg",
    category: "pdf",
    keywords: { primary: "PDF to JPG", secondary: ["convert PDF pages to images", "PDF to image", "save PDF page as JPG"] },
    title: "How to Convert PDF Pages to JPG Images",
    seoTitle: `How to Convert PDF Pages to JPG Images (Free) | ${SITE_NAME}`,
    metaDescription: "Turn PDF pages into JPG images for slides, social posts, chat apps and previews: how the conversion works, what resolution you get, and when to choose another tool.",
    summary: "Sometimes a PDF page needs to be a picture: a slide in a presentation, a post on social media, a preview in a chat app that won't show PDFs. Here's how to turn PDF pages into JPG images, and what to expect from the result.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "When an image beats a PDF",
        list: [
          "Adding a page — a chart, a certificate, a poster — to a presentation or document.",
          "Sharing a page in a chat app or social network that previews images but not PDFs.",
          "Creating a thumbnail preview of a document for a website.",
          "Sending a single page to someone who only needs to look at it.",
        ],
      },
      {
        heading: "How the conversion works",
        paragraphs: [
          "PDF to JPG renders each page the way a PDF viewer would, then saves the result as a JPG image. Pages are rendered at 150 DPI, which makes an A4 page roughly 1240 × 1754 pixels — sharp on any screen and fine for everyday printing. A one-page PDF downloads as a single JPG; a longer PDF downloads as a ZIP file with one numbered image per page.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open PDF to JPG and add your PDF (up to 50MB).",
          "Select Convert to JPG and wait while the pages are rendered on our server.",
          "Download the JPG, or the ZIP of pages — they're named page-001.jpg, page-002.jpg and so on.",
          "Open the image to check it; for a single page you need from a long PDF, you can extract that page first with Split PDF to get just one image.",
        ],
      },
      {
        heading: "What changes when a page becomes an image",
        table: {
          caption: "PDF page vs JPG image",
          headers: ["", "PDF page", "JPG image"],
          rows: [
            ["Text", "Selectable and searchable", "Part of the picture — not selectable"],
            ["Zooming in", "Text and lines stay sharp", "Becomes soft beyond its resolution"],
            ["Opens in", "PDF readers and browsers", "Almost anything"],
            ["Best for", "Reading, printing, forms", "Slides, posts, previews"],
          ],
        },
      },
      {
        heading: "Choosing the right tool",
        list: [
          "Need the words, not a picture? Use PDF to Word or Image to Text instead — text in a JPG can't be copied.",
          "Need to change the page? Edit it first with the PDF Editor, then convert.",
          "Need images back as a PDF later? JPG to PDF combines them again.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "The PDF won't convert: it may be password-protected or damaged. Unlock it first with Unlock PDF.",
          "Small text looks soft when zoomed in: JPG is a lossy format with a fixed resolution. For a crisper result in a document, keep the original PDF.",
          "The ZIP has too many pages: extract the pages you need with Split PDF before converting.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Converting PDF pages to JPG makes them easy to drop into slides, posts and chats. The 150 DPI images look sharp on screen, but they're pictures, so keep the original PDF for anything that needs selectable text or crisp printing.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I convert just one page?",
        answer: "The tool converts every page. To get a single page, extract it first with Split PDF, then convert that one-page PDF.",
      },
      {
        question: "Why is my download a ZIP file?",
        answer: "A multi-page PDF produces one image per page, so they're bundled into a ZIP. Most computers open ZIP files with a double-click.",
      },
      {
        question: "What happens to my PDF?",
        answer: "PDF to JPG runs on our server. Your upload is deleted as soon as it's processed, and the images are deleted automatically within one hour.",
      },
    ],
    relatedTools: ["pdf-to-jpg", "split-pdf", "jpg-to-pdf", "pdf-to-word"],
  },
  {
    path: "/guides/how-to-add-page-numbers-to-a-pdf",
    category: "pdf",
    keywords: { primary: "add page numbers to PDF", secondary: ["number PDF pages", "PDF page numbers online", "page X of Y PDF"] },
    title: "How to Add Page Numbers to a PDF",
    seoTitle: `How to Add Page Numbers to a PDF (Free, No Upload) | ${SITE_NAME}`,
    metaDescription: "Add page numbers to any PDF: choosing a position and style, skipping a cover page, starting from a custom number, and handling landscape and rotated pages.",
    summary: "Page numbers make long PDFs far easier to discuss, review and print — “see page 14” only works if there is a page 14. Here's how to add them to a finished PDF without going back to the original document.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why number a PDF after the fact",
        paragraphs: [
          "Ideally, page numbers are added in Word or whatever program created the document. But often you're working with a finished PDF: several files merged into one, a scanned document, or a report someone else made. Adding numbers to the PDF itself avoids recreating anything — the existing pages stay exactly as they are, with a small number stamped in the position you choose.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open PDF Page Numbers and add your PDF (up to 50MB). It's processed in your browser, so the file isn't uploaded.",
          "Choose a position: top or bottom, left, centre or right.",
          "Choose a style: 1, Page 1, Page 1 of 10, or 1 / 10.",
          "Optionally set the starting number and choose whether the first page should be left unnumbered.",
          "Select Add page numbers and download the numbered PDF.",
        ],
      },
      {
        heading: "Choosing a style and position",
        table: {
          caption: "Common choices",
          headers: ["Document", "Position", "Style"],
          rows: [
            ["Reports and theses", "Bottom centre", "1 or Page 1"],
            ["Contracts and legal documents", "Bottom right", "Page 1 of 10 — shows nothing is missing"],
            ["Slides exported to PDF", "Bottom right", "1 / 10"],
            ["Documents with busy footers", "Top right", "1"],
          ],
        },
      },
      {
        heading: "Cover pages and custom starting numbers",
        paragraphs: [
          "Choosing “Leave the first page (cover) unnumbered” skips page one; numbering then starts on page two with your starting number, and an “of N” total counts only the numbered pages. A custom starting number helps when a PDF is one part of something larger — if chapter 3 begins on page 41, start at 41 and the numbers match the whole document.",
        ],
      },
      {
        heading: "Landscape and rotated pages",
        paragraphs: [
          "Mixed documents often contain landscape pages, or pages that were scanned sideways and rotated. The tool reads each page's rotation and visible area, so the number appears upright in the position you chose as the reader sees it — not sideways, and not outside the visible part of a cropped page.",
        ],
      },
      {
        heading: "A good order of operations",
        list: [
          "Merge all the parts first with Merge PDF — numbering a single combined file keeps numbers continuous.",
          "Remove or reorder pages in the PDF Editor before numbering, so the numbers match the final order.",
          "Add page numbers.",
          "Compress or password-protect the final file last.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "A number overlaps existing text: the page already has content there. Choose a different position, such as the top instead of the bottom.",
          "“Password-protected”: remove the password with Unlock PDF, number the pages, then protect the file again if needed.",
          "The numbers restart or skip: you numbered the parts before merging. Merge first, then number the combined file.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "Numbering a finished PDF takes seconds and changes nothing else about the pages. Merge and arrange first, pick a position that doesn't clash with existing footers, and use “Page 1 of N” where it matters that nothing is missing.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I use Roman numerals for the introduction?",
        answer: "Not with this tool — it uses ordinary numbers (1, 2, 3) in Helvetica. If you need Roman numerals, add numbering in the original document before exporting it to PDF.",
      },
      {
        question: "Will page numbers change my existing content?",
        answer: "No. The number is added on top of each page; nothing else is moved, re-compressed or removed.",
      },
      {
        question: "Is my PDF uploaded?",
        answer: "No. Page numbers are added in your browser with the open-source pdf-lib library.",
      },
    ],
    relatedTools: ["pdf-page-numbers", "merge-pdf", "pdf-editor", "compress-pdf"],
  },
  {
    path: "/guides/how-to-rotate-pdf-pages",
    category: "pdf",
    keywords: { primary: "rotate PDF pages", secondary: ["rotate PDF and save", "fix sideways PDF", "rotate one page in a PDF"] },
    title: "How to Rotate PDF Pages and Save Them That Way",
    seoTitle: `How to Rotate PDF Pages Permanently (Free) | ${SITE_NAME}`,
    metaDescription: "Fix sideways or upside-down pages in a PDF and save the rotation permanently — including rotating just one page — in your browser, without uploading the file.",
    summary: "Scanned documents often come out with a page or two sideways or upside down. Rotating them in a PDF viewer only changes your view; the next person still sees them wrong. Here's how to fix the pages in the file itself.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why rotating in a viewer isn't enough",
        paragraphs: [
          "Most PDF readers have a rotate button, but in many of them it only changes how the page is displayed to you, right now. Close the file, send it to someone, or open it in a different app, and the page is sideways again. To fix it for everyone, the rotation has to be saved into the PDF itself.",
        ],
      },
      {
        heading: "Step by step with the PDF Editor",
        list: [
          "Open the PDF Editor and add your PDF (up to 50MB). It runs in your browser, so the file isn't uploaded.",
          "Find the sideways page in the thumbnails.",
          "Use the rotate button on that page — each press turns it 90° clockwise. Press twice for upside-down pages.",
          "Rotate any other pages that need it; pages you don't touch stay as they are.",
          "Select Apply edits & download to save a new PDF with the rotation fixed.",
        ],
      },
      {
        heading: "How many presses?",
        table: {
          caption: "Rotate presses for each problem (90° clockwise per press)",
          headers: ["The page is…", "Presses", "Total rotation"],
          rows: [
            ["Turned left (top of the page faces left)", "1", "90°"],
            ["Upside down", "2", "180°"],
            ["Turned right (top of the page faces right)", "3", "270°"],
          ],
        },
      },
      {
        heading: "While you're in the editor",
        list: [
          "Delete blank pages that scanners often add.",
          "Move pages earlier or later to fix the order.",
          "Add a short line of text to a page, such as a date or reference number.",
        ],
      },
      {
        heading: "Preventing sideways scans",
        list: [
          "Place every page the same way on the scanner glass or feeder.",
          "When photographing pages with a phone, hold it in the same orientation for each shot.",
          "Check the first few pages before scanning a whole stack.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "The PDF won't open in the editor: it may be password-protected. Remove the password with Unlock PDF first.",
          "A page still looks sideways in another app: make sure you're opening the newly downloaded file, not the original.",
          "Page numbers ended up sideways: add page numbers after rotating — PDF Page Numbers places them upright on every page.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "A rotation only counts if it's saved in the file. Rotate the affected pages in the PDF Editor, tidy up any blank or out-of-order pages while you're there, and download a corrected copy that looks right for everyone.",
        ],
      },
    ],
    faq: [
      {
        question: "Can I rotate just one page?",
        answer: "Yes. Each page has its own rotate button, so you can turn one page and leave the rest unchanged.",
      },
      {
        question: "Does rotating a page reduce quality?",
        answer: "No. The page's rotation setting is changed; its content isn't re-rendered or re-compressed.",
      },
      {
        question: "Is my PDF uploaded?",
        answer: "No. The PDF Editor works entirely in your browser.",
      },
    ],
    relatedTools: ["pdf-editor", "split-pdf", "pdf-page-numbers", "merge-pdf"],
  },
  {
    path: "/guides/how-to-fit-excel-sheet-on-one-page-pdf",
    category: "pdf",
    keywords: { primary: "Excel to PDF one page", secondary: ["fit Excel sheet to one page PDF", "Excel PDF cut off columns", "Excel to PDF too many pages"] },
    title: "How to Fit an Excel Sheet on One Page When Saving as PDF",
    seoTitle: `Excel to PDF on One Page: Fix Cut-Off Columns | ${SITE_NAME}`,
    metaDescription: "Why Excel sheets split across several PDF pages or lose columns, and the page-setup changes — scaling, orientation, print area and margins — that fit them on one page.",
    summary: "You convert a spreadsheet to PDF and get eight pages, with the last two columns stranded on pages of their own. The fix isn't in the converter — it's in the workbook's page setup. Here's how to get a clean, one-page PDF.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Why sheets spread over several pages",
        paragraphs: [
          "Spreadsheets have no fixed page size: a sheet can be hundreds of columns wide. When it's converted to PDF, it has to be cut into printable pages, and the cuts follow the workbook's page setup — paper size, orientation, margins and scaling. Excel to PDF converters, including ours, respect that setup, so the way to control the PDF is to set the page layout in Excel before converting.",
        ],
      },
      {
        heading: "The fix: scale to fit",
        list: [
          "In Excel, open the Page Layout tab.",
          "In the Scale to Fit group, set Width to 1 page and Height to Automatic. This shrinks columns to fit across one page while letting long sheets continue onto further pages.",
          "For a genuinely one-page result, set Height to 1 page as well — but check the text is still readable.",
          "Save the workbook, then convert it with Excel to PDF.",
        ],
      },
      {
        heading: "Other settings that help",
        table: {
          caption: "Page Layout settings and their effect",
          headers: ["Setting", "Where in Excel", "Effect"],
          rows: [
            ["Orientation: Landscape", "Page Layout → Orientation", "Fits more columns per page"],
            ["Narrow margins", "Page Layout → Margins", "Gains a little space on every edge"],
            ["Print area", "Page Layout → Print Area → Set Print Area", "Includes only the cells you select"],
            ["Print titles", "Page Layout → Print Titles", "Repeats header rows on every page"],
            ["Hide helper columns", "Right-click column → Hide", "Leaves working columns out of the PDF"],
          ],
        },
      },
      {
        heading: "Step by step with Excel to PDF",
        list: [
          "Set the page layout in Excel as above and save the workbook.",
          "Open Excel to PDF and add the .xlsx or .xls file (up to 50MB).",
          "Select Convert to PDF. Every sheet in the workbook is included, each following its own page setup.",
          "Download the PDF and check the page count and that no columns are cut off.",
        ],
      },
      {
        heading: "When one page is too small",
        paragraphs: [
          "Scaling a very wide sheet onto one page can shrink the text below a readable size. If that happens, use landscape with Width set to 1 page and let the rows flow onto more pages, with Print Titles repeating the header row. Or split the data into two sheets that each fit comfortably — a PDF is for reading, and a few readable pages beat one illegible one.",
        ],
      },
      {
        heading: "Troubleshooting",
        list: [
          "Blank pages in the PDF: a stray formatted cell far from your data extends the print area. Set a print area around the real data.",
          "Only some sheets should be in the PDF: the converter includes every sheet, so save a copy of the workbook with just the sheets you need and convert that.",
          "Fonts look different: fonts not installed on our server are replaced with a similar one, which can change column widths slightly. Use common fonts such as Arial for documents you'll convert.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "A spreadsheet's PDF is only as tidy as its page setup. Set Width to 1 page, switch to landscape for wide data, define a print area, and the conversion produces exactly the pages you expect.",
        ],
      },
    ],
    faq: [
      {
        question: "Can the converter fit my sheet on one page automatically?",
        answer: "No — Excel to PDF follows the page setup saved in your workbook, so the page layout has to be set in Excel first.",
      },
      {
        question: "Do formulas still work in the PDF?",
        answer: "No. A PDF shows the calculated values as they were when you converted; it isn't interactive.",
      },
      {
        question: "What happens to my spreadsheet?",
        answer: "Excel to PDF runs on our server. Your upload is deleted as soon as it's converted, and the PDF is deleted automatically within one hour.",
      },
    ],
    relatedTools: ["excel-to-pdf", "word-to-pdf", "compress-pdf", "merge-pdf"],
  },
  {
    path: "/guides/scanned-pdf-vs-text-pdf",
    category: "pdf",
    keywords: { primary: "scanned PDF vs text PDF", secondary: ["can't select text in PDF", "PDF text not searchable", "how to tell if a PDF is scanned"] },
    title: "Scanned PDF vs Text PDF: Why You Can't Select the Text",
    seoTitle: `Scanned vs Text PDF: Why You Can't Select or Search Text | ${SITE_NAME}`,
    metaDescription: "Why some PDFs let you select, search and copy text and others don't, how to tell which kind you have in seconds, and how to get editable text out of a scanned PDF.",
    summary: "You try to copy a sentence from a PDF and end up selecting the whole page as a picture — or search finds nothing even though the word is right there. That PDF is a scan. Here's the difference, how to tell, and what to do about it.",
    published: "2026-11-11",
    updated: "2026-11-11",
    sections: [
      {
        heading: "Two very different kinds of PDF",
        paragraphs: [
          "A text PDF is created by software — exported from Word, saved from a website, generated by an accounting system. It contains real text: characters with a font and a position, which you can select, search, copy and have read aloud.",
          "A scanned PDF is a set of photographs of pages wrapped in a PDF. It looks identical on screen, but to the computer each page is just an image. There are no letters to select or search — until someone runs optical character recognition (OCR) on it.",
        ],
        table: {
          caption: "Text PDF vs scanned PDF",
          headers: ["", "Text PDF", "Scanned PDF"],
          rows: [
            ["Comes from", "Software (Word, browsers, apps)", "Scanners and phone scanning apps"],
            ["Select and copy text", "Yes", "No — selects the whole page image"],
            ["Search with Ctrl+F", "Finds words", "Finds nothing"],
            ["Zoom in", "Text stays sharp", "Text gets blurry or pixelated"],
            ["Typical size per page", "Small", "Larger (it's an image)"],
          ],
        },
      },
      {
        heading: "How to tell in five seconds",
        list: [
          "Try to select a single word. If you can highlight just that word, it's a text PDF.",
          "Press Ctrl+F (Cmd+F on a Mac) and search for a word you can see. No result means it's probably a scan.",
          "Zoom in to 400%. Crisp letters suggest text; soft or pixelated letters suggest an image.",
        ],
      },
      {
        heading: "The in-between case: scanned PDFs with OCR",
        paragraphs: [
          "Some scanners and apps run OCR automatically and add an invisible layer of recognised text behind each page image. These PDFs look like scans but let you search and copy — although the copied text can contain OCR mistakes. If selecting text gives you odd spellings or jumbled words, that's usually what's happening.",
        ],
      },
      {
        heading: "Getting text out of a scanned PDF",
        list: [
          "For editable text from a scan of up to 15 pages, use PDF to Word: when a PDF has no selectable text, it reads each page with English OCR and puts the result in a .docx file.",
          "For one page, or text in Spanish, French or German, convert the page to an image with PDF to JPG, then run it through Image to Text and choose the language.",
          "For long scans, split the PDF into parts with Split PDF first.",
          "Always proofread names, numbers and dates — no OCR is perfect.",
        ],
      },
      {
        heading: "Making better scans next time",
        list: [
          "Scan at 300 DPI — a good balance of OCR accuracy and file size.",
          "Use greyscale for text documents; colour adds size without helping recognition.",
          "If your scanner app offers “searchable PDF” or OCR, turn it on.",
          "Better still, ask for the original digital document instead of a scan of a printout.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "If you can't select a word, the PDF is a picture of text, not text. OCR bridges the gap — PDF to Word for short scans, Image to Text for single pages and other languages — but the cleanest option is always the original digital file.",
        ],
      },
    ],
    faq: [
      {
        question: "Why is my scanned PDF so large?",
        answer: "Each page is stored as an image, often at high resolution and in colour. Compress PDF can downsample those images to shrink the file considerably.",
      },
      {
        question: "Can I make a scanned PDF searchable here?",
        answer: "Not directly — the tools here extract the text into a Word file or plain text, rather than adding a hidden text layer to the PDF.",
      },
      {
        question: "Why does copied text from my PDF come out garbled?",
        answer: "The PDF probably has an OCR text layer with recognition mistakes, or unusual font encoding. Re-running OCR on a clean page image with Image to Text often gives better results.",
      },
    ],
    relatedTools: ["pdf-to-word", "image-to-text", "pdf-to-jpg", "compress-pdf"],
  },
];

/** Words in a guide's visible text (summary, sections, tables, FAQs). */
export function guideWordCount(guide: GuideDefinition): number {
  const text = [
    guide.summary,
    ...guide.sections.flatMap((s) => [s.heading ?? "", ...(s.paragraphs ?? []), ...(s.list ?? []), ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : [])]),
    ...(guide.faq ?? []).flatMap((f) => [f.question, f.answer]),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Estimated reading time in whole minutes, at 238 words per minute (average adult non-fiction reading speed). */
export function readingMinutes(guide: GuideDefinition): number {
  return Math.max(1, Math.round(guideWordCount(guide) / 238));
}

/** Stable anchor id for a section heading, used by the table of contents. */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function guideCategoryLabel(id: GuideCategory): string {
  return GUIDE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Other guides ranked by how many tools they share with `guide` — the most closely related first. */
export function relatedGuidesFor(guide: GuideDefinition, limit = 3): GuideDefinition[] {
  const tools = new Set(guide.relatedTools ?? []);
  return GUIDES.filter((g) => g.path !== guide.path)
    .map((g, index) => ({ g, index, shared: (g.relatedTools ?? []).filter((t) => tools.has(t)).length }))
    .sort((a, b) => b.shared - a.shared || a.index - b.index)
    .slice(0, limit)
    .map(({ g }) => g);
}

export function getGuide(path: string): GuideDefinition | undefined {
  return GUIDES.find((g) => g.path === path);
}

/** Guides that list `slug` in their relatedTools — used to link tool pages back to their guides. */
export function guidesForTool(slug: string): GuideDefinition[] {
  return GUIDES.filter((g) => g.relatedTools?.includes(slug));
}

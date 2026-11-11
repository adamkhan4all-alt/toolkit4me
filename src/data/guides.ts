// ---------------------------------------------------------------------
// Long-form guides. Plain data, like src/data/tools.ts: the React app
// renders it through GuidePage/GuidesIndexPage, and scripts/prerender.ts +
// scripts/generate-seo-files.ts read the same objects, so the static HTML,
// the sitemap and the live app never drift apart.
// ---------------------------------------------------------------------

import { SITE_NAME } from "../config/site";

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

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
  sections: GuideSection[];
  /** Tool slugs linked at the end of the guide. */
  relatedTools?: string[];
}

const GUIDES_PUBLISHED = "2026-10-26";
const GUIDES_UPDATED = "2026-10-26";

export const GUIDES: GuideDefinition[] = [
  {
    path: "/guides/how-to-reduce-pdf-file-size",
    title: "How to Reduce PDF File Size Without Ruining Quality",
    seoTitle: `How to Reduce PDF File Size (Without Losing Quality) | ${SITE_NAME}`,
    metaDescription: "Why PDFs get so large, which compression level to pick, and practical tricks for getting a PDF under an email or upload limit.",
    summary: "Email attachments are often capped at 20–25MB and many job portals and government forms accept only 2–5MB. Here is why PDFs grow so large and how to shrink them without making them unreadable.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-03",
    sections: [
      {
        heading: "Why some PDFs are so large",
        paragraphs: [
          "A PDF that contains only text is usually tiny — a 20-page report can be under 200KB. Size balloons when the file contains images, and especially when those images are stored at a much higher resolution than they will ever be viewed at. A phone photo inserted into a Word document can easily carry 12 megapixels of data even though it is shown at the size of a postcard.",
          "Scanned documents are the other big culprit. A scanner set to 600 DPI in colour produces a full-resolution image for every page, so a 10-page scan can reach 30–50MB. Embedded fonts, duplicated resources from repeated merges, and leftover editing data add smaller amounts on top.",
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
          "Open the Compress PDF tool and add your file.",
          "Start with the recommended level and download the result.",
          "Open the compressed file and zoom to 100% to check that text and any signatures are still clear.",
          "If it is still too large, run the original (not the already-compressed copy) again at a higher level — compressing twice degrades quality faster than a single stronger pass.",
        ],
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
    ],
    relatedTools: ["compress-pdf", "split-pdf", "compress-image", "jpg-to-pdf"],
  },
  {
    path: "/guides/jpg-vs-png",
    title: "JPG vs PNG: Which Image Format Should You Use?",
    seoTitle: `JPG vs PNG — Differences and When to Use Each | ${SITE_NAME}`,
    metaDescription: "A plain-English comparison of JPG and PNG: compression, transparency, file size and the best format for photos, screenshots, logos and the web.",
    summary: "JPG and PNG are the two most common image formats, and picking the wrong one can mean blurry screenshots or photos that are ten times larger than they need to be. Here is how they differ, when to use each, and where WebP fits in.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-11",
    sections: [
      {
        heading: "The key difference: lossy vs lossless",
        paragraphs: [
          "JPG (or JPEG) uses lossy compression. It discards fine detail that the eye is unlikely to notice in natural images, which makes photos dramatically smaller. The trade-off is that every save at a lower quality setting throws a little more information away, and sharp edges — such as text — can pick up faint smudges known as compression artefacts.",
          "PNG uses lossless compression. Every pixel is kept exactly, so text, lines and flat colours stay perfectly crisp no matter how many times the file is saved. The trade-off is size: a photograph saved as PNG can be five to ten times larger than the same photo as a good-quality JPG.",
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
    ],
    relatedTools: ["png-to-jpg", "jpg-to-png", "webp-converter", "compress-image"],
  },
  {
    path: "/guides/how-to-convert-pdf-to-word",
    title: "How to Convert a PDF to Word — and What Happens to the Formatting",
    seoTitle: `How to Convert PDF to Word: Text, Formatting and Scans Explained | ${SITE_NAME}`,
    metaDescription: "Convert a PDF into an editable Word file, understand what carries over and what doesn't, and how to keep formatting when it matters.",
    summary: "PDFs are designed to look the same everywhere, not to be edited. Converting one to Word gives you editable text — but the layout is a different matter. Here's what to expect, and what to do when the formatting is what you actually need.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-03",
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
        heading: "When you need the formatting, not just the text",
        paragraphs: [
          "Ask first whether you really need to edit the document. If the goal is to fill in a few blanks, add a note or remove a page, editing the PDF directly keeps the layout untouched: the PDF Editor can add text to a page, reorder, rotate and delete pages.",
          "If you need an image of a page exactly as it looks — for a slide or a report — PDF to JPG renders each page as a picture. And if you created the original in Word, the most reliable route is to go back to that .docx rather than converting the PDF.",
        ],
      },
      {
        heading: "Converting back",
        paragraphs: [
          "Once you've made your edits, use Word to PDF to turn the document back into a PDF that looks the same for everyone you send it to. That way the version you share can't be accidentally changed.",
        ],
      },
    ],
    relatedTools: ["pdf-to-word", "word-to-pdf", "image-to-text", "pdf-editor"],
  },
  {
    path: "/guides/how-to-extract-text-from-images-ocr",
    title: "How to Extract Text from an Image or Scan (OCR Tips)",
    seoTitle: `Extract Text from Images with OCR — Tips for Accurate Results | ${SITE_NAME}`,
    metaDescription: "Learn how OCR turns photos and scans into editable text, and simple capture tips that dramatically improve accuracy.",
    summary: "Optical character recognition (OCR) turns the text in a photo or scan into words you can copy, search and edit. Accuracy depends heavily on the image you start with — these tips make the difference between clean text and gibberish.",
    published: GUIDES_PUBLISHED,
    updated: "2026-11-03",
    sections: [
      {
        heading: "How OCR works",
        paragraphs: [
          "OCR software first cleans up the image, then finds lines of text, splits them into characters and matches each shape against what it has learned letters look like. Finally it uses language knowledge to correct likely mistakes. Anything that makes letters harder to see — blur, shadows, low contrast, skewed angles — makes every one of those steps less reliable.",
        ],
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
        heading: "Languages and file types on Toolkit4Me",
        paragraphs: [
          "Image to Text reads JPG and PNG images in English, Spanish, French or German — pick the language that matches the text, because the recogniser uses it to resolve unclear letters. For a scanned PDF, either convert the pages to images with PDF to JPG and run the page you need through Image to Text, or use PDF to Word, which automatically reads scanned PDFs of up to 15 pages with English OCR.",
        ],
      },
    ],
    relatedTools: ["image-to-text", "pdf-to-word", "jpg-to-pdf", "compress-image"],
  },
  {
    path: "/guides/how-to-password-protect-a-pdf",
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
    title: "How to Merge, Split and Organise PDF Pages",
    seoTitle: `How to Merge, Split and Reorder PDF Pages | ${SITE_NAME}`,
    metaDescription: "Combine several PDFs into one, pull out just the pages you need, and reorder or rotate pages before sending a document.",
    summary: "Job applications, visa forms, expense claims and insurance requests often ask for a single PDF that contains several documents in a set order. Here is how to put one together cleanly.",
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
    ],
    relatedTools: ["merge-pdf", "split-pdf", "pdf-editor", "pdf-page-numbers"],
  },
  {
    path: "/guides/how-to-compress-images",
    title: "How to Compress Images for Websites, Email and Upload Forms",
    seoTitle: `How to Compress Images (JPG & PNG) Without Wrecking Quality | ${SITE_NAME}`,
    metaDescription: "Why photos are so large, how quality, resolution and format each affect file size, and the settings that work for websites, email and upload forms.",
    summary: "A single phone photo is often 3–6MB — far more than a website, email or upload form needs. Three settings decide how small an image gets: its pixel dimensions, its format, and (for JPG) its quality. Here's how to use each one.",
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
        heading: "The three settings that matter",
        list: [
          "Dimensions: halving the width and height leaves a quarter of the pixels, and the file shrinks dramatically. In Compress Image, set a maximum width — the height scales to match. For an exact size, such as 600 × 600 for a profile photo, use Image Resizer.",
          "Format: JPG is built for photographs and is usually far smaller than PNG for the same photo. PNG is lossless and suits screenshots, logos and anything with transparency. For images on your own website, WebP is often smaller still — the WebP Converter creates it from JPG or PNG.",
          "Quality (JPG only): a quality around 70–80 typically looks the same as the original at normal viewing size. Below about 50, blocky artefacts start to appear around edges and in smooth areas like skies.",
        ],
      },
      {
        heading: "Settings that work for common jobs",
        list: [
          "Website or online store photos: maximum width around 1600–2000 pixels, JPG, quality 75–80.",
          "Email attachments: maximum width around 1200–1600 pixels, JPG, quality around 75.",
          "Strict upload forms (e.g. a 200KB or 1MB limit): reduce the width first, then lower the quality step by step until the file fits.",
          "Logos, icons and screenshots: keep PNG, and reduce the width if the image is larger than it will be displayed.",
        ],
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
    ],
    relatedTools: ["compress-image", "image-resizer", "webp-converter", "png-to-jpg"],
  },
  {
    path: "/guides/convert-office-documents-to-pdf",
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
];

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

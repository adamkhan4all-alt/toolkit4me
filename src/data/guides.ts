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
    summary: "JPG and PNG are the two most common image formats, and picking the wrong one can mean blurry screenshots or photos that are ten times larger than they need to be. Here is how they differ and when to use each.",
    published: GUIDES_PUBLISHED,
    updated: GUIDES_UPDATED,
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
    ],
    relatedTools: ["png-to-jpg", "jpg-to-png", "compress-image", "jpg-to-pdf"],
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
    updated: "2026-11-03",
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
          "Add a password with Protect PDF if the document contains personal information.",
          "Give the file a clear name, such as \"Surname_Firstname_Application.pdf\", so the recipient can find it easily.",
        ],
      },
    ],
    relatedTools: ["merge-pdf", "split-pdf", "pdf-editor", "compress-pdf"],
  },
  {
    path: "/guides/how-to-compress-images",
    title: "How to Compress Images for Websites, Email and Upload Forms",
    seoTitle: `How to Compress Images (JPG & PNG) Without Wrecking Quality | ${SITE_NAME}`,
    metaDescription: "Why photos are so large, how quality, resolution and format each affect file size, and the settings that work for websites, email and upload forms.",
    summary: "A single phone photo is often 3–6MB — far more than a website, email or upload form needs. Three settings decide how small an image gets: its pixel dimensions, its format, and (for JPG) its quality. Here's how to use each one.",
    published: "2026-11-03",
    updated: "2026-11-03",
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
          "Dimensions: halving the width and height leaves a quarter of the pixels, and the file shrinks dramatically. In Compress Image, set a maximum width — the height scales to match.",
          "Format: JPG is built for photographs and is usually far smaller than PNG for the same photo. PNG is lossless and suits screenshots, logos and anything with transparency.",
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
    relatedTools: ["compress-image", "png-to-jpg", "jpg-to-png", "jpg-to-pdf"],
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

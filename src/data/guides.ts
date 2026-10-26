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
  /** Shown as "Last updated" under the H1. */
  updated: string;
  sections: GuideSection[];
  /** Tool slugs linked at the end of the guide. */
  relatedTools?: string[];
}

const GUIDES_UPDATED = "26 October 2026";

export const GUIDES: GuideDefinition[] = [
  {
    path: "/guides/how-to-reduce-pdf-file-size",
    title: "How to Reduce PDF File Size Without Ruining Quality",
    seoTitle: `How to Reduce PDF File Size (Without Losing Quality) | ${SITE_NAME}`,
    metaDescription: "Why PDFs get so large, which compression level to pick, and practical tricks for getting a PDF under an email or upload limit.",
    summary: "Email attachments are often capped at 20–25MB and many job portals and government forms accept only 2–5MB. Here is why PDFs grow so large and how to shrink them without making them unreadable.",
    updated: GUIDES_UPDATED,
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
          "Low compression: best when the PDF will be printed or contains detailed photos or diagrams. Expect a modest reduction.",
          "Recommended / medium: the right choice for most documents being emailed or uploaded. Images remain clear on screen while the file shrinks substantially.",
          "High / extreme: use when you must meet a strict limit such as 1–2MB. Photos may look soft, but text stays readable.",
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
    title: "How to Convert a PDF to an Editable Word Document",
    seoTitle: `How to Convert PDF to Word (and Keep the Formatting) | ${SITE_NAME}`,
    metaDescription: "Convert a PDF into an editable Word file, understand why some layouts shift, and fix common problems with scanned or complex PDFs.",
    summary: "PDFs are designed to look the same everywhere, not to be edited. Converting one to Word gives you an editable document — here is how to do it and how to get the cleanest result.",
    updated: GUIDES_UPDATED,
    sections: [
      {
        heading: "Why PDFs are hard to edit",
        paragraphs: [
          "A PDF records where each piece of text and each image sits on the page, but not the document structure behind it — it doesn't know which lines form a paragraph, which text is a heading, or where a table begins. A converter has to reconstruct that structure, which is why simple documents convert almost perfectly while elaborate designs may need some tidying.",
        ],
      },
      {
        heading: "Step by step",
        list: [
          "Open the PDF to Word tool and select your PDF (up to 50MB).",
          "Wait a few seconds while the file is converted on our server.",
          "Download the .docx file and open it in Microsoft Word, Google Docs or LibreOffice Writer.",
          "Scroll through and check tables, headers and footers, and any multi-column sections.",
        ],
      },
      {
        heading: "Getting the best result",
        list: [
          "Text-based PDFs (exported from Word or another program) convert far better than scans.",
          "If your PDF is a scan or photo of paper, the text is really an image. Run it through Image to Text (OCR) first if you mainly need the words rather than the layout.",
          "Multi-column layouts may come through as text boxes. In Word, you can copy the text out of the boxes into normal paragraphs if you need to reflow it.",
          "Unusual fonts may be substituted with a similar font if they are not installed on your computer.",
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
    updated: GUIDES_UPDATED,
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
          "If you need an editable document that keeps the page layout, try PDF to Word on a text-based PDF instead.",
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
    updated: GUIDES_UPDATED,
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
          "Open Merge PDF and add all the files you want to combine.",
          "Arrange them in the correct order before merging.",
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
          "The PDF Editor shows a thumbnail of every page so you can drag pages into a new order, rotate sideways scans, and delete blank or duplicate pages. It runs entirely in your browser, which makes it a good choice for personal documents.",
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
];

export function getGuide(path: string): GuideDefinition | undefined {
  return GUIDES.find((g) => g.path === path);
}

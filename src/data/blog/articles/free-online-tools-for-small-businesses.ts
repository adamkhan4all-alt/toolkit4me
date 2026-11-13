import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "free-online-tools-for-small-businesses",
  status: "published",
  title: "10 Free Online Tools That Help Small Businesses Save Time and Money",
  seoTitle: "10 Free Online Tools for Small Businesses (Documents, Images, Pricing) | Toolkit4Me",
  metaDescription:
    "Ten free online tools that take routine work off a small business's plate: PDFs that fit in an email, sharper product photos, trackable marketing links, QR codes and pricing maths.",
  excerpt:
    "Most small businesses don't need another subscription. They need a quote to fit in an email, product photos that load quickly and prices that actually cover costs. Here are ten free tools that handle those jobs, with when to use each one and where its limits are.",
  category: "freelancers-small-business",
  tags: ["small-business", "freelancers", "pdf", "images", "marketing", "calculators", "productivity"],
  author: "editorial-team",
  published: "2026-11-13",
  updated: "2026-11-13",
  featured: true,
  hero: {
    src: "/images/blog/free-online-tools-for-small-businesses/hero.svg",
    alt: "Illustration of a small shop's desk with a PDF invoice, a product photo, a QR code, a price tag and a calculator arranged around a laptop",
    width: 1200,
    height: 630,
    kind: "illustration",
    caption: "The everyday digital jobs this article covers: documents, images, links and prices.",
  },
  takeaways: [
    "Most routine digital work in a small business falls into four groups: documents, images, marketing links and pricing maths. A free tool covers each.",
    "Send documents as PDFs, compressed to fit email limits; for example, a personal Gmail account accepts up to 25 MB of attachments per message.",
    "Margin and markup aren't the same number. Pricing with the wrong one is an easy way to undercharge.",
    "Check where a tool processes your file. Many run entirely in your browser, while conversions such as Word to PDF run on a server.",
  ],
  intro: [
    "Running a small business means doing a dozen small digital jobs every week that nobody budgeted time for: sending a quote, updating a product photo, printing a flyer, working out a price. None of these jobs justifies buying desktop software, but doing them badly costs time and sometimes money.",
    "This article walks through ten free tools on Toolkit4Me that cover those jobs. For each one we explain the problem it solves, how to use it well and where it stops being the right choice. Nothing here needs an account, and each tool says up front whether your file stays in your browser or is processed on our server.",
  ],
  sections: [
    {
      heading: "Documents: quotes, invoices and paperwork",
      paragraphs: [
        "Documents are where small businesses lose the most time to formatting problems. A quote that looks perfect in your word processor can arrive with shifted lines, missing fonts or a file too large to attach. PDF solves most of this: it looks the same on every device, and the recipient doesn't need the program you wrote it in.",
      ],
      subsections: [
        {
          heading: "1. Word to PDF (and Excel or PowerPoint to PDF)",
          paragraphs: [
            "[Word to PDF](/tools/word-to-pdf) turns a .doc or .docx file into a PDF that looks the same on any device. [Excel to PDF](/tools/excel-to-pdf) does the same for price lists and order forms, and [PowerPoint to PDF](/tools/powerpoint-to-pdf) for pitch decks. These conversions run on our server, which deletes your files within an hour.",
            "One limit is worth knowing: fonts our server doesn't have are replaced with similar ones, which can move a line or page break. If your quote uses a special brand font, check the PDF before you send it, or export directly from your editor. The [Office to PDF guide](/guides/convert-office-documents-to-pdf) covers the details.",
          ],
        },
        {
          heading: "2. Compress PDF",
          paragraphs: [
            "Scanned contracts and brochures full of photos easily exceed email limits. A personal Gmail account, for example, accepts up to 25 MB of attachments per message and turns anything larger into a Drive link. [Compress PDF](/tools/compress-pdf) shrinks the images inside a PDF. Text and vector graphics stay sharp because they aren't images.",
            "Start with the Recommended level, open the result at 100% zoom and check that signatures and small print are still clear. Our guide on [reducing PDF file size](/guides/how-to-reduce-pdf-file-size) shows a real before-and-after test.",
          ],
        },
        {
          heading: "3. Merge PDF",
          paragraphs: [
            "Clients rarely want five attachments. [Merge PDF](/tools/merge-pdf) combines up to 20 PDFs into one file in the order you choose, such as cover letter, quote, terms and brochure, so nothing gets lost in a reply chain. If you only need a few pages from a long document, take them out first with [Split PDF](/tools/split-pdf), which runs in your browser.",
          ],
        },
        {
          heading: "4. Protect PDF",
          paragraphs: [
            "Documents containing bank details, ID numbers or salary information deserve more than an ordinary attachment. [Protect PDF](/tools/protect-pdf) adds a password with AES-256 encryption, so only people who know the password can open the file. Send the password a different way, by phone or text message rather than in the same email. Use a long passphrase rather than a short word.",
          ],
        },
      ],
    },
    {
      heading: "Images: product photos and listings",
      paragraphs: [
        "Product photos straight from a phone are often several megabytes each. On a website that slows every page they appear on. In an email or a marketplace listing they can be rejected outright. Two browser-based tools fix most image problems, and your photos never leave your device while they work.",
      ],
      subsections: [
        {
          heading: "5. Compress Image",
          paragraphs: [
            "[Compress Image](/tools/compress-image) reduces JPG and PNG files with a quality setting, a format choice and optional resizing, and it can handle several images at once. The quality setting affects JPG output; PNG is lossless, so a PNG shrinks mainly by being resized or saved as a JPG. As a side benefit, re-saving removes hidden camera metadata such as the location where a photo was taken.",
          ],
        },
        {
          heading: "6. Image Resizer",
          paragraphs: [
            "Marketplaces, social networks and website themes each ask for specific dimensions. [Image Resizer](/tools/image-resizer) sets exact pixel sizes for up to 20 images at a time, so a whole product range comes out consistent. The guide [what size should website images be](/guides/what-size-should-website-images-be) explains how to choose dimensions for your own site.",
          ],
        },
      ],
      figure: {
        src: "/images/blog/free-online-tools-for-small-businesses/toolkit-map.svg",
        alt: "Diagram grouping ten small-business tasks into four areas: documents (Word to PDF, Compress PDF, Merge PDF, Protect PDF), images (Compress Image, Image Resizer), marketing (QR Code Generator, UTM Builder) and money (Profit Margin and Markup calculators), plus Image to Text for paper records",
        width: 1200,
        height: 720,
        kind: "diagram",
        caption: "The ten tools in this article, grouped by the kind of job they do.",
      },
    },
    {
      heading: "Marketing: QR codes and trackable links",
      subsections: [
        {
          heading: "7. QR Code Generator",
          paragraphs: [
            "A QR code on a menu, flyer, shop window or business card takes people straight to your website, booking page or reviews. The [QR Code Generator](/tools/qr-code-generator) makes static codes. The link is encoded in the image itself, so the code doesn't depend on a subscription and won't stop working. The trade-off is that you can't change where a static code points after printing, so point it at a page you control.",
            "Before printing hundreds of copies, scan a test print from arm's length with two different phones. Our guide to [QR codes for menus and small businesses](/guides/qr-codes-for-restaurant-menus-and-small-businesses) covers sizing and placement.",
          ],
        },
        {
          heading: "8. UTM Builder",
          paragraphs: [
            "If you share the same link in a newsletter, an Instagram bio and a printed flyer, your analytics can't tell which one brought the visitor. The [UTM Builder](/tools/utm-builder) adds campaign tags to the link: utm_source (where it was shared), utm_medium (the type of channel) and utm_campaign (which promotion). These three are the ones [Google's own Analytics help](https://support.google.com/analytics/answer/10917952) says you should always use.",
            "The tool runs in your browser. It can lowercase values for you and warns about common mistakes, such as a missing medium, or mixed capitals that would split one campaign into several rows in your reports. You can then turn the tagged link into a QR code, so even a printed flyer gets its own line in your analytics.",
          ],
        },
      ],
      figure: {
        src: "/images/blog/free-online-tools-for-small-businesses/utm-builder.webp",
        alt: "Toolkit4Me UTM Builder with a shop's landing page URL, source set to flyer, medium set to print and campaign set to spring_sale, showing the finished tagged link",
        width: 960,
        height: 999,
        kind: "screenshot",
        caption: "The UTM Builder tagging a link for a printed spring-sale flyer. The finished link updates as you type.",
      },
    },
    {
      heading: "Money: pricing that covers your costs",
      paragraphs: [
        "Pricing mistakes are expensive precisely because they're invisible: every sale goes through, it just earns less than you thought. The most common one is mixing up margin and markup, which describe the same sale from two different angles.",
      ],
      subsections: [
        {
          heading: "9. Profit Margin and Markup calculators",
          paragraphs: [
            "The [Profit Margin Calculator](/calculators/profit-margin-calculator) works out profit as a share of the selling price. The [Markup Calculator](/calculators/markup-calculator) works it out as a share of your cost. Both run in your browser. Use whichever matches how your supplier, accountant or marketplace quotes figures, and don't swap one for the other.",
          ],
        },
      ],
      table: {
        caption: "The same sale described as margin and as markup (cost 60, price 100)",
        headers: ["Measure", "Formula", "Result"],
        rows: [
          ["Profit", "Price − cost = 100 − 60", "40"],
          ["Margin", "Profit ÷ price = 40 ÷ 100", "40%"],
          ["Markup", "Profit ÷ cost = 40 ÷ 60", "66.7%"],
        ],
      },
      callout: {
        tone: "example",
        title: "Why the difference matters",
        body: [
          "Suppose you want a 40% margin and buy an item for 60. Adding 40% markup gives a price of 84 (60 × 1.4), and the margin on that sale is only 24 ÷ 84 ≈ 28.6%. To reach a true 40% margin you need to charge 100 (60 ÷ 0.6). Check prices with the calculator that matches the number you actually want.",
        ],
      },
    },
    {
      heading: "Paper records: getting text off the page",
      subsections: [
        {
          heading: "10. Image to Text (OCR)",
          paragraphs: [
            "Supplier price lists, printed receipts and old letters often exist only on paper. [Image to Text](/tools/image-to-text) reads the printed text in a JPG or PNG photo so you can copy it into a spreadsheet or document instead of retyping it. It supports English, Spanish, French and German, and works best on clear, printed, well-lit text. Handwriting and decorative fonts are often misread. It returns plain lines of text, so tables need tidying afterwards.",
            "Always check numbers, names and dates against the original; no OCR system is perfectly accurate. Our guide on [digitising receipts](/guides/how-to-digitise-receipts) walks through a full workflow.",
          ],
        },
      ],
    },
    {
      heading: "Which tool for which job",
      paragraphs: ["A quick reference, including where each tool processes your file, so you can decide what's appropriate for confidential material."],
      table: {
        caption: "The ten tools at a glance",
        headers: ["Job", "Tool", "Where it runs", "Main limit"],
        rows: [
          ["Send a document that looks the same everywhere", "[Word to PDF](/tools/word-to-pdf)", "Our server (deleted within 1 hour)", "Missing fonts are substituted"],
          ["Fit a PDF into an email or upload form", "[Compress PDF](/tools/compress-pdf)", "Our server", "Text-only PDFs barely shrink"],
          ["Send one file instead of several", "[Merge PDF](/tools/merge-pdf)", "Our server", "Up to 20 files, 50 MB each"],
          ["Password-protect a document", "[Protect PDF](/tools/protect-pdf)", "Our server", "A forgotten password can't be recovered"],
          ["Lighter product photos", "[Compress Image](/tools/compress-image)", "Your browser", "PNG shrinks mainly by resizing"],
          ["Exact image dimensions", "[Image Resizer](/tools/image-resizer)", "Your browser", "Up to 20 images at a time"],
          ["Printed link to your site", "[QR Code Generator](/tools/qr-code-generator)", "Your browser", "Static codes can't be re-pointed"],
          ["Know which campaign worked", "[UTM Builder](/tools/utm-builder)", "Your browser", "Only useful if you use analytics"],
          ["Price for a target profit", "[Profit Margin Calculator](/calculators/profit-margin-calculator)", "Your browser", "Results are only as good as your cost figures"],
          ["Copy text from paper", "[Image to Text](/tools/image-to-text)", "Our server", "Printed text only; check every number"],
        ],
      },
    },
    {
      heading: "When a free tool isn't the right choice",
      list: [
        "**You do the same task hundreds of times a day.** Online tools handle one job at a time well. High-volume, automated workflows belong in software built for them.",
        "**The file is highly confidential and can't leave your control.** Prefer the browser-based tools, which don't upload your file, or desktop software you manage yourself.",
        "**You need legal or tax certainty.** Calculators give arithmetic, not advice. Confirm pricing, tax and contract questions with a qualified professional.",
        "**You need advanced editing.** Our PDF Editor reorders, rotates and deletes pages and adds new text, but it can't change existing text in a PDF.",
      ],
    },
  ],
  faq: [
    {
      question: "Are these tools really free?",
      answer:
        "Yes. Every tool mentioned here can be used without an account, payment or watermark. Toolkit4Me is funded by advertising, which is labelled and kept away from upload areas and download buttons.",
    },
    {
      question: "Is it safe to upload business documents?",
      answer:
        "It depends on the tool and the document. Browser-based tools, such as Compress Image, Image Resizer, Split PDF and the calculators, never upload your file. Server tools, such as Word to PDF, Compress PDF and Merge PDF, send the file over an encrypted connection, delete the upload once it's processed and delete the result within one hour. For highly confidential documents, prefer a browser-based tool or software you control. Our [Privacy Policy](/privacy) has the full details.",
    },
    {
      question: "Do QR codes from the generator expire?",
      answer:
        "No. The QR Code Generator makes static codes, which contain the link itself, so there's no service behind them that could be switched off. The guide [how to create a free QR code that never expires](/guides/how-to-create-a-free-qr-code-that-never-expires) explains the difference from dynamic codes.",
    },
    {
      question: "Can I use these tools on a phone?",
      answer:
        "Yes. The site works in mobile browsers. Very large files are slower to process on a phone than on a computer, especially for browser-based tools, which use your device's own memory and processor.",
    },
  ],
  relatedTools: ["compress-pdf", "merge-pdf", "word-to-pdf", "compress-image", "qr-code-generator", "utm-builder", "profit-margin-calculator", "image-to-text"],
  relatedGuides: ["/guides/how-to-reduce-pdf-file-size", "/guides/qr-codes-for-restaurant-menus-and-small-businesses", "/guides/how-to-digitise-receipts"],
  relatedArticles: ["professional-documents-for-freelancers-without-expensive-software", "improve-your-digital-workflow-with-browser-based-tools"],
  references: [
    {
      title: "Send attachments with your Gmail message",
      publisher: "Gmail Help (Google)",
      url: "https://support.google.com/mail/answer/6584",
      note: "Source for the 25 MB attachment limit on personal Gmail accounts.",
    },
    {
      title: "URL builders: Collect campaign data with custom URLs",
      publisher: "Analytics Help (Google)",
      url: "https://support.google.com/analytics/answer/10917952",
      note: "Describes the UTM parameters and recommends always using utm_source, utm_medium and utm_campaign.",
    },
  ],
};

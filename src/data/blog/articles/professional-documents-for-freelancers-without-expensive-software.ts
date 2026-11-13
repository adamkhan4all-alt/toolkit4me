import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "professional-documents-for-freelancers-without-expensive-software",
  status: "published",
  title: "How Freelancers Can Prepare Professional Documents Without Expensive Software",
  seoTitle: "Professional Documents for Freelancers Without Expensive Software | Toolkit4Me",
  metaDescription:
    "Proposals, quotes, invoices and deliverables that look professional, using the editor you already have plus free tools: clean PDFs, one combined file, page numbers, sensible names and correct pricing.",
  excerpt:
    "Clients judge a freelancer partly by the files they receive. A professional-looking proposal or invoice doesn't need expensive design software. It needs a consistent format, one tidy file, sensible names and numbers that add up. Here's a repeatable process.",
  category: "career-development",
  tags: ["freelancers", "small-business", "office-documents", "pdf", "file-sharing", "calculators"],
  author: "editorial-team",
  published: "2026-11-13",
  updated: "2026-11-13",
  hero: {
    src: "/images/blog/professional-documents-for-freelancers-without-expensive-software/hero.svg",
    alt: "Illustration of a freelancer's finished deliverable: a proposal PDF with a cover page, numbered pages, a price table and a padlock, ready to send to a client",
    width: 1200,
    height: 630,
    kind: "illustration",
    caption: "A client-ready document: one PDF, numbered, priced correctly and named sensibly.",
  },
  takeaways: [
    "Write in whatever editor you already use. Professionalism comes from the finished file, not the software.",
    "Send PDFs. They look the same on every device, and the client doesn't need your program to open them.",
    "Combine a proposal's parts into one numbered file, and give it a name that tells the client what it is.",
    "Check your prices with the right calculator: a 30% markup is not a 30% margin.",
    "Open the final PDF on a phone before you send it. That's where most clients will see it first.",
  ],
  intro: [
    "When you work for yourself, your documents are part of your service. A proposal that arrives as three attachments with names like “final_v3_NEW.docx”, a quote whose table breaks on the client's computer, or an invoice that's too large to attach all make an otherwise good freelancer look disorganised.",
    "None of this requires a design suite or a paid PDF subscription. You can write in the editor you already have, whether that's Microsoft Word, Google Docs, LibreOffice or Pages, and use a few free tools for the finishing steps. This article sets out a process you can repeat for every proposal, quote, report and invoice.",
  ],
  sections: [
    {
      heading: "What makes a document look professional",
      paragraphs: ["Clients notice a handful of things, and none of them are fancy design:"],
      list: [
        "**It opens properly** on whatever device they use, with the layout you intended.",
        "**It's one file**, in a logical order, not a scattering of attachments.",
        "**It's easy to discuss**: page numbers let you both say “see page 4” on a call.",
        "**It's named clearly**, so they can find it again in their inbox or downloads folder.",
        "**The numbers are right**, with totals, discounts and taxes that add up.",
        "**It's a sensible size**, so it attaches to an email and loads quickly on a phone.",
      ],
      figure: {
        src: "/images/blog/professional-documents-for-freelancers-without-expensive-software/deliverable-checklist.svg",
        alt: "Process diagram for a client deliverable: write the draft, export to PDF, combine the parts, add page numbers, check the size, protect if sensitive, name the file and send",
        width: 1200,
        height: 520,
        kind: "diagram",
        caption: "The finishing steps between a draft and a client-ready file.",
      },
    },
    {
      heading: "Step 1: Export to PDF",
      paragraphs: [
        "Unless the client has asked for an editable file, send a PDF. It keeps your fonts, spacing and tables exactly where you put them, and anyone can open it without your software.",
        "Most editors export directly. Microsoft documents the steps for [saving Word, Excel and PowerPoint files as PDF](https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-office-desktop-apps-d85416c5-7d77-4fd6-a216-6f4bf7c7c110). If your editor can't, or you're working from someone else's file, [Word to PDF](/tools/word-to-pdf), [Excel to PDF](/tools/excel-to-pdf) and [PowerPoint to PDF](/tools/powerpoint-to-pdf) convert online. They run on our server, which deletes files within an hour.",
      ],
      callout: {
        tone: "warning",
        title: "Check fonts and spreadsheets",
        body: [
          "Online conversion replaces fonts our server doesn't have with similar ones, which can move line or page breaks, so open the PDF and check it. Spreadsheets need their print area and page setup set before converting, or wide sheets split across pages. The guide [how to fit an Excel sheet on one page](/guides/how-to-fit-excel-sheet-on-one-page-pdf) shows how.",
        ],
      },
    },
    {
      heading: "Step 2: Combine everything into one file",
      paragraphs: [
        "A typical proposal has several parts: a cover letter, the proposal itself, a few portfolio samples and your terms. [Merge PDF](/tools/merge-pdf) combines up to 20 PDFs in the order you choose. If a sample comes from a long PDF, take just the pages you want with [Split PDF](/tools/split-pdf) first. Use the [PDF Editor](/tools/pdf-editor) to rotate a landscape page, remove a blank one or add a short label.",
      ],
      subsections: [
        {
          heading: "Portfolio images",
          paragraphs: [
            "High-resolution images make documents heavy. Before placing images in your proposal, resize them to the size they'll actually appear at with [Image Resizer](/tools/image-resizer), or compress them with [Compress Image](/tools/compress-image). Both run in your browser. To turn a set of JPG samples straight into pages, use [JPG to PDF](/tools/jpg-to-pdf).",
          ],
        },
      ],
    },
    {
      heading: "Step 3: Add page numbers",
      paragraphs: [
        "[Add Page Numbers to PDF](/tools/pdf-page-numbers) stamps numbers on the merged file. Choose from six positions and styles such as “Page 1 of 10”, start from any number, and optionally leave the cover page unnumbered. It runs in your browser. Choose a position that doesn't overlap existing content such as a footer; the numbers are added on top of the page.",
      ],
    },
    {
      heading: "Step 4: Get the numbers right",
      paragraphs: [
        "Pricing errors are the most damaging mistakes a document can contain, because they're usually only noticed after the client has agreed. Three calculators cover most freelance pricing, and all run in your browser:",
      ],
      list: [
        "[Markup Calculator](/calculators/markup-calculator): add a percentage on top of your costs, such as materials, software licences or subcontractors you pass on.",
        "[Profit Margin Calculator](/calculators/profit-margin-calculator): check what share of the final price you actually keep.",
        "[Discount Calculator](/calculators/discount-calculator): work out a discounted price, including a second discount on top.",
      ],
      table: {
        caption: "Markup and margin are different measures of the same sale",
        headers: ["You pay", "You charge", "Markup (profit ÷ cost)", "Margin (profit ÷ price)"],
        rows: [
          ["500", "650", "30%", "23.1%"],
          ["500", "714.29", "42.9%", "30%"],
          ["500", "1,000", "100%", "50%"],
        ],
      },
      callout: {
        tone: "example",
        title: "Passing on a subcontractor's cost",
        body: [
          "A designer subcontracts illustrations for 500 and wants to keep 30% of what the client pays. Adding 30% markup gives 650, which is only a 23.1% margin. To keep 30% of the price, divide the cost by 0.7: 500 ÷ 0.7 ≈ 714.29. The table above shows both.",
        ],
      },
    },
    {
      heading: "Step 5: Protect documents that contain personal details",
      paragraphs: [
        "Contracts and invoices often include bank details, addresses or tax numbers. [Protect PDF](/tools/protect-pdf) encrypts the file with a password (AES-256). Send the password separately, for example by text message if the file goes by email. Before you protect a document, make sure it doesn't contain things the client shouldn't see at all; our article on [protecting sensitive information before sharing](/blog/how-to-protect-sensitive-information-before-sharing-documents) covers hidden comments, metadata and proper redaction.",
      ],
    },
    {
      heading: "Step 6: Name the file and do a final check",
      paragraphs: ["A consistent naming pattern helps the client, and helps you find the file again when they reply three weeks later."],
      table: {
        caption: "File names that tell the client what they're opening",
        headers: ["Instead of", "Use"],
        rows: [
          ["final_v3_NEW.pdf", "acme-website-proposal-2026-11.pdf"],
          ["invoice.pdf", "invoice-0142-acme-2026-11.pdf"],
          ["Document1.pdf", "acme-brand-guidelines-v1.pdf"],
        ],
      },
      list: [
        "Open the PDF on your phone. Can you read it without zooming in on every line?",
        "Click every link and email address to check it still works in the PDF.",
        "Check the total, the dates, the client's name and your payment details one last time.",
        "Check the file size. If it's large, [Compress PDF](/tools/compress-pdf) at the Recommended level usually fixes it without visible loss.",
      ],
    },
    {
      heading: "When it's worth paying for software",
      paragraphs: [
        "Free tools cover the finishing steps for most freelancers. Paid software earns its cost when you need features these tools don't have: editing the existing text of a PDF, collecting legally binding e-signatures, filling and creating form fields, or generating hundreds of invoices automatically. Our PDF Editor, for example, can add new text to a PDF but can't change what's already there.",
      ],
    },
  ],
  faq: [
    {
      question: "Should I send clients a Word file or a PDF?",
      answer:
        "Send a PDF for anything final, such as proposals, quotes, invoices and reports, so it looks the way you intended. Send an editable file only when the client needs to edit it, and say so in your email.",
    },
    {
      question: "Will merging PDFs reduce their quality?",
      answer:
        "No. Merge PDF combines the pages as they are, without re-compressing them. Bookmarks and fillable form fields from the original files may not carry over.",
    },
    {
      question: "Can I edit the text of a PDF a client sent me?",
      answer:
        "Our PDF Editor can add new text, rotate, reorder and delete pages, but it can't change existing text. To edit the wording, convert with [PDF to Word](/tools/pdf-to-word). It extracts the text into editable paragraphs but doesn't reproduce the original layout, so expect to reformat.",
    },
    {
      question: "Do these calculators handle tax?",
      answer:
        "They do the arithmetic for markup, margin and discounts. Tax rules depend on where you and your client are, so confirm tax treatment with an accountant or your local tax authority.",
    },
  ],
  relatedTools: ["merge-pdf", "word-to-pdf", "pdf-page-numbers", "markup-calculator", "profit-margin-calculator", "protect-pdf", "compress-pdf", "image-resizer"],
  relatedGuides: ["/guides/convert-office-documents-to-pdf", "/guides/how-to-add-page-numbers-to-a-pdf", "/guides/how-to-fit-excel-sheet-on-one-page-pdf"],
  relatedArticles: ["free-online-tools-for-small-businesses", "how-to-protect-sensitive-information-before-sharing-documents"],
  references: [
    {
      title: "Save or convert to PDF or XPS in Office desktop apps",
      publisher: "Microsoft Support",
      url: "https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-office-desktop-apps-d85416c5-7d77-4fd6-a216-6f4bf7c7c110",
      note: "Steps for exporting Word, Excel and PowerPoint files to PDF from the desktop apps.",
    },
  ],
};

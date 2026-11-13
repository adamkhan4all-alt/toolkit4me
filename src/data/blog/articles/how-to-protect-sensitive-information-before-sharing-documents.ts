import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "how-to-protect-sensitive-information-before-sharing-documents",
  status: "published",
  title: "How to Protect Sensitive Information Before Sharing Documents",
  seoTitle: "How to Protect Sensitive Information Before Sharing a Document | Toolkit4Me",
  metaDescription:
    "A practical checklist before you send a file: remove hidden data, redact properly (a black box isn't enough), hide details in photos, add a password and clean tracking from links.",
  excerpt:
    "Documents carry more than what's on the page: author names, tracked changes, hidden spreadsheet rows, photo locations. And a black box drawn over text often hides nothing at all. Here is a step-by-step checklist for sharing files without sharing more than you meant to.",
  category: "security-privacy",
  tags: ["privacy", "metadata", "file-sharing", "pdf", "images"],
  author: "editorial-team",
  published: "2026-11-13",
  updated: "2026-11-13",
  editorsPick: true,
  hero: {
    src: "/images/blog/how-to-protect-sensitive-information-before-sharing-documents/hero.svg",
    alt: "Illustration of a document with its personal details blacked out, a padlock and a magnifying glass revealing hidden layers of metadata behind the page",
    width: 1200,
    height: 630,
    kind: "illustration",
    caption: "What you see on the page is only part of what a file contains.",
  },
  takeaways: [
    "Share only what's needed. Remove whole pages or sheets the recipient doesn't need before worrying about anything else.",
    "Office files can hide comments, tracked changes, author names and hidden rows. Clean them in the source file before converting to PDF.",
    "Drawing a black box over text in a PDF usually leaves the text underneath. Real redaction removes it.",
    "Photos can reveal faces, addresses and their location metadata. Hide details with a solid box and share a re-saved copy.",
    "A password controls who can open a file, not what's in it. Use both redaction and a password when the content calls for it.",
  ],
  intro: [
    "Most accidental leaks aren't hacks. They're files sent with something left in: a spreadsheet with a hidden tab of salaries, a contract with the previous client's name in its comments, a scanned ID with the number badly covered, a photo whose metadata shows where it was taken. The UK's data protection regulator, the ICO, publishes [specific guidance on hidden personal information](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/disclosing-documents-to-the-public-securely/) for organisations because it's such a common cause of breaches.",
    "This checklist works for individuals and small teams alike. Follow it in order. The early steps remove the most risk for the least effort.",
  ],
  sections: [
    {
      heading: "What counts as sensitive information",
      paragraphs: [
        "Anything that could harm you or someone else if it reached the wrong person. In everyday documents that usually means:",
      ],
      list: [
        "Identity details: ID and passport numbers, dates of birth, signatures, home addresses.",
        "Financial details: bank account and card numbers, salaries, invoices for other clients.",
        "Other people's information: names, phone numbers and email addresses of colleagues, customers or students.",
        "Business information: prices, internal comments, draft wording you didn't intend to share.",
      ],
    },
    {
      heading: "Step 1: Share only the pages you need to",
      paragraphs: [
        "The simplest protection is not sending something at all. If a landlord needs page 1 of a bank statement, send page 1. [Split PDF](/tools/split-pdf) extracts chosen pages into a new file, and the [PDF Editor](/tools/pdf-editor) deletes pages you don't want. Both run in your browser, so the original never leaves your device.",
        "For spreadsheets, copy just the needed rows into a new workbook instead of hiding rows or sheets in the original. Hidden still means included.",
      ],
    },
    {
      heading: "Step 2: Remove hidden data before you convert",
      paragraphs: [
        "Word, Excel and PowerPoint files can contain things you can't see in normal view. Microsoft's [Document Inspector](https://support.microsoft.com/en-us/office/remove-hidden-data-and-personal-information-by-inspecting-documents-presentations-or-workbooks-356b7b5d-77af-44fe-a07f-9aa4d085966f) lists them, including:",
      ],
      list: [
        "comments, and tracked changes that were never accepted or rejected;",
        "document properties such as the author's name and who last saved the file;",
        "hidden text in Word, and hidden rows, columns and worksheets in Excel;",
        "speaker notes and objects placed off the slide in PowerPoint.",
      ],
      figure: {
        src: "/images/blog/how-to-protect-sensitive-information-before-sharing-documents/hidden-data-layers.svg",
        alt: "Diagram showing a document as stacked layers: the visible page on top, then comments and tracked changes, document properties such as author name, hidden rows and sheets, and photo metadata such as GPS location",
        width: 1200,
        height: 640,
        kind: "diagram",
        caption: "The layers a typical office document or photo can carry beneath what you see.",
      },
      callout: {
        tone: "tip",
        title: "Clean first, then convert",
        body: [
          "Converting to PDF isn't a privacy step in itself. Depending on how the document was last viewed, comments or tracked changes can appear in the PDF, and document properties such as the title or author can be copied into it. Microsoft's own PDF export even has an option to include document properties. Run the Document Inspector in the source file first (or delete comments and accept or reject every change), then convert with [Word to PDF](/tools/word-to-pdf) or your editor's export, and check the PDF.",
        ],
      },
    },
    {
      heading: "Step 3: Redact properly. A black box is not enough",
      paragraphs: [
        "This is the most common mistake. Drawing a black rectangle over text in a PDF, or highlighting it in black, usually changes only what's displayed. The text is still in the file. Anyone can select it, copy it or remove the shape. Real redaction deletes the content underneath.",
        "Toolkit4Me doesn't have a dedicated PDF redaction tool, and our PDF Editor adds content rather than removing it, so it isn't suitable for redaction. If your PDF software has a proper redaction feature, use it. If not, this method genuinely removes the information by turning the pages into images:",
      ],
      steps: [
        "Convert the PDF's pages to images with [PDF to JPG](/tools/pdf-to-jpg). This runs on our server, which deletes the files within an hour. If the document can't leave your control at all, use desktop software instead.",
        "Open each page that needs redacting in the [Face Blur & Privacy Editor](/tools/blur-image-areas) and cover the details with a **solid black box**. A light blur can sometimes be partly reversed; a solid box can't.",
        "Download the edited pages and rebuild the document with [JPG to PDF](/tools/jpg-to-pdf), which runs in your browser.",
        "Check the result: try to select or search for the redacted words. Nothing should be found.",
      ],
      figure: {
        src: "/images/blog/how-to-protect-sensitive-information-before-sharing-documents/redaction-before-after.webp",
        alt: "Before and after: a sample invoice image with a customer name, address and account number, and the same image after the Face Blur & Privacy Editor covered those details with solid black boxes",
        width: 1200,
        height: 600,
        kind: "result",
        caption: "A sample invoice (made up for this article) before and after the Face Blur & Privacy Editor. The covered pixels are replaced, not hidden.",
      },
      table: {
        caption: "Ways of hiding text, and whether they actually remove it",
        headers: ["Method", "Is the text removed?", "Notes"],
        rows: [
          ["Black highlight or shape drawn over PDF text", "No", "The text usually remains selectable and searchable underneath"],
          ["Changing the text colour to white", "No", "The words are still there and can be copied"],
          ["A proper redaction tool in PDF software", "Yes", "Check the tool states it removes content, then test the result"],
          ["Page converted to an image, then covered with a solid box", "Yes", "The page is no longer searchable, and the file may be larger"],
          ["Light blur over text in a photo", "Not reliably", "Use a solid box or strong pixelation for anything sensitive"],
        ],
      },
    },
    {
      heading: "Step 4: Check photos and screenshots",
      paragraphs: [
        "Photos leak information in two ways: what's visible, and what's stored inside the file.",
      ],
      list: [
        "**Visible details:** faces, car number plates, addresses on envelopes, screens and whiteboards in the background. Cover them in the [Face Blur & Privacy Editor](/tools/blur-image-areas). It runs in your browser, and you choose the areas by hand; there's no automatic face detection, so check the whole image.",
        "**Hidden metadata:** phone photos usually record the date, the device and often the GPS location. Re-saving the photo through a browser tool such as [Compress Image](/tools/compress-image) writes a new file without that metadata. Our guide [what is EXIF data](/guides/what-is-exif-data-and-how-to-remove-it) explains what's stored and how to check.",
        "**Screenshots:** crop out notification banners, open tabs and other people's messages before you share.",
      ],
      callout: {
        tone: "warning",
        title: "Share the edited copy, not the original",
        body: [
          "Covering a detail protects only the file you edited. If you've already sent or uploaded the original photo somewhere, the hidden detail and its metadata are still in that copy.",
        ],
      },
    },
    {
      heading: "Step 5: Add a password, and send it separately",
      paragraphs: [
        "When a document has to contain sensitive details, such as a contract with bank details or a payslip, encrypt it. [Protect PDF](/tools/protect-pdf) adds a password with AES-256 encryption, so the file can't be opened without it.",
      ],
      list: [
        "Use a long passphrase (several unrelated words) rather than a short word or a date of birth.",
        "Send the password by a different route from the file, for example by phone or text message if the PDF goes by email.",
        "Remember the limits: anyone who has the password can open the file and pass it on. A password controls access; it doesn't redact anything.",
        "Keep the password safe. A forgotten password can't be recovered, by you or by us; we never store it.",
      ],
    },
    {
      heading: "Step 6: Clean the links you share",
      paragraphs: [
        "Links copied from emails, ads and social networks often carry tracking parameters such as utm_source, fbclid or gclid, which can reveal where you found the link and which campaign or account it came from. [URL Parser & Cleaner](/tools/url-parser-cleaner) removes more than 30 known tracking parameters while keeping the ones a link needs to work. It runs in your browser.",
      ],
    },
    {
      heading: "A checklist before you press send",
      table: {
        caption: "Pre-sharing checklist",
        headers: ["Check", "How"],
        rows: [
          ["Only the necessary pages or rows", "[Split PDF](/tools/split-pdf) or a fresh spreadsheet with only the needed rows"],
          ["No comments, tracked changes or hidden sheets", "Document Inspector in the source file, then convert"],
          ["Redactions actually remove the text", "Try to select or search the redacted words"],
          ["No faces, addresses or numbers visible in photos", "[Face Blur & Privacy Editor](/tools/blur-image-areas) with a solid box"],
          ["No location metadata in photos", "Share a re-saved copy, e.g. from [Compress Image](/tools/compress-image)"],
          ["Sensitive documents encrypted", "[Protect PDF](/tools/protect-pdf), with the password sent separately"],
          ["Links free of tracking parameters", "[URL Parser & Cleaner](/tools/url-parser-cleaner)"],
          ["Right recipient", "Re-read the address field. Autocomplete causes many misdirected emails"],
        ],
      },
    },
  ],
  faq: [
    {
      question: "Is a black highlight enough to hide text in a PDF?",
      answer:
        "Usually not. A highlight or shape drawn over text normally leaves the text in the file, where it can be selected, copied or searched. Use a redaction feature that removes content, or the image-based method in Step 3, and then test that the words can't be found.",
    },
    {
      question: "Does a PDF password stop someone forwarding the file?",
      answer:
        "No. A password stops people who don't know it from opening the file. Anyone you give the password to can open it, save it and share it. Redact what the recipient shouldn't see, and use a password to keep everyone else out.",
    },
    {
      question: "Does Toolkit4Me keep the files I process?",
      answer:
        "Browser-based tools such as Split PDF, the PDF Editor, the Face Blur & Privacy Editor, JPG to PDF and Compress Image never upload your file. Server tools such as PDF to JPG and Protect PDF delete your upload once it's processed and the result within one hour, and the passwords you enter are used for that one operation only and never stored. See the [Privacy Policy](/privacy).",
    },
    {
      question: "Do social networks remove photo location data?",
      answer:
        "Many large platforms strip location metadata from images they publish, but email attachments, file transfers, messaging apps that send “original quality” files and many websites keep it. Removing it yourself before sharing means you don't have to rely on the platform.",
    },
  ],
  relatedTools: ["blur-image-areas", "protect-pdf", "split-pdf", "pdf-to-jpg", "jpg-to-pdf", "compress-image", "url-parser-cleaner"],
  relatedGuides: ["/guides/what-is-exif-data-and-how-to-remove-it", "/guides/how-to-password-protect-a-pdf", "/guides/how-to-split-a-pdf"],
  relatedArticles: ["improve-your-digital-workflow-with-browser-based-tools", "professional-documents-for-freelancers-without-expensive-software"],
  references: [
    {
      title: "Disclosing documents to the public securely: hidden personal information and how to avoid an accidental breach",
      publisher: "Information Commissioner's Office (ICO), UK",
      url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/disclosing-documents-to-the-public-securely/",
      note: "Regulator guidance on checking documents for hidden personal information and redacting it before disclosure.",
    },
    {
      title: "Remove hidden data and personal information by inspecting documents, presentations, or workbooks",
      publisher: "Microsoft Support",
      url: "https://support.microsoft.com/en-us/office/remove-hidden-data-and-personal-information-by-inspecting-documents-presentations-or-workbooks-356b7b5d-77af-44fe-a07f-9aa4d085966f",
      note: "Lists the hidden data the Document Inspector finds: comments, revisions, document properties, hidden rows and sheets, and more.",
    },
    {
      title: "Save or convert to PDF or XPS in Office desktop apps",
      publisher: "Microsoft Support",
      url: "https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-office-desktop-apps-d85416c5-7d77-4fd6-a216-6f4bf7c7c110",
      note: "Shows that Office's PDF export can include document properties in the PDF.",
    },
  ],
};

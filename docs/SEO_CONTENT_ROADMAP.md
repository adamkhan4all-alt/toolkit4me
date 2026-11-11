# Toolkit4Me — SEO content roadmap (next 20 guides)

Prepared 2026-11-11. Every topic is backed by a tool that exists and works
today, and none targets the same primary query as an existing guide (see
`docs/seo-tracker.csv` for the current list). Keyword targets describe search
intent — they are not search-volume or difficulty figures, which we don't
have.

**Before writing each guide:** check Search Console (Performance → Queries)
for related queries you already get impressions for, and improve an existing
page instead if one already covers the intent. Publish one or two a week,
checked against how the tool actually behaves — never in bulk.

Adding a guide = one entry in `src/data/guides.ts` (category, keywords,
sections, FAQs, related tools). The page, sitemap entry, structured data,
blog listing and tool-page links are all generated from it.

## PDF tools cluster

| # | Working title | Primary keyword | Intent | Main tool |
|---|---|---|---|---|
| 1 | How to Split a PDF into Separate Pages or Files | split PDF | How-to | Split PDF |
| 2 | How to Unlock a PDF When You Know the Password | unlock PDF | How-to | Unlock PDF |
| 3 | How to Remove Printing and Copying Restrictions from Your Own PDF | remove PDF restrictions | How-to | UnProtect PDF |
| 4 | How to Convert PDF Pages to JPG Images | PDF to JPG | How-to | PDF to JPG |
| 5 | How to Add Page Numbers to a PDF | add page numbers to PDF | How-to | PDF Page Numbers |
| 6 | How to Rotate PDF Pages and Save Them That Way | rotate PDF pages | How-to | PDF Editor |
| 7 | How to Fit an Excel Sheet on One Page When Saving as PDF | Excel to PDF one page | How-to / troubleshooting | Excel to PDF |
| 8 | Scanned PDF vs Text PDF: Why You Can't Select the Text | scanned PDF vs text PDF | Informational | PDF to Word, Image to Text |

## Image tools cluster

| # | Working title | Primary keyword | Intent | Main tool |
|---|---|---|---|---|
| 9 | How to Resize an Image to Exact Pixel Dimensions | resize image to exact pixels | How-to | Image Resizer |
| 10 | How to Convert JPG to PNG (and When It Actually Helps) | JPG to PNG | How-to | JPG to PNG |
| 11 | What Size Should Website Images Be? | image size for website | Informational | Image Resizer, WebP Converter |
| 12 | What Is EXIF Data — and How to Remove Location from Photos | remove EXIF data | Informational / how-to | Compress Image, Image Resizer |

## OCR cluster

| # | Working title | Primary keyword | Intent | Main tool |
|---|---|---|---|---|
| 13 | How to Copy Text from a Screenshot | copy text from screenshot | How-to | Image to Text |
| 14 | How to Digitise Receipts for Expense Claims | scan receipts to PDF | How-to | Image to Text, JPG to PDF |

## QR code and web cluster

| # | Working title | Primary keyword | Intent | Main tool |
|---|---|---|---|---|
| 15 | How Do QR Codes Work? | how do QR codes work | Informational | QR Code Generator |
| 16 | QR Codes for Restaurant Menus and Small Businesses | QR code for menu | Commercial / how-to | QR Code Generator |
| 17 | How to Decode a JWT and Read What's Inside | decode JWT | How-to | Base64 Encoder / Decoder |
| 18 | How to Write a Meta Description That Gets Clicks | how to write a meta description | How-to | Meta Tag Generator |

## Writing and text cluster

| # | Working title | Primary keyword | Intent | Main tool |
|---|---|---|---|---|
| 19 | How to Compare Two Versions of a Document | compare two documents | How-to | Text Compare |
| 20 | How Many Words Is a 5-Minute Speech? | how many words is a 5 minute speech | Informational | Word Counter |

## Overlap checks against existing guides

- #4 vs "How to Convert PDF to Word": different output and intent (images, not editable text).
- #7 vs "How to Keep Formatting When Converting Word, Excel and PowerPoint to PDF": #7 is a narrow troubleshooting query; link to it rather than repeating its Office tips.
- #10 vs "JPG vs PNG": that guide compares formats; #10 is the step-by-step conversion with its limits.
- #11 vs "How to Compress Images": #11 is about dimensions per use (hero images, thumbnails); link to the compression guide for the file-size side.
- #15 vs "How to Make a QR Code That Actually Scans" and "…Never Expires": #15 explains the mechanism only; link to both for practical advice.
- #20 vs "Word and Character Limits": #20 targets one specific question; link back for counting rules.

## Not recommended

- Pages targeting competitor brand names (e.g. other QR code sites).
- Guides for tools that don't exist (PDF to Excel, PDF to PowerPoint, HEIC).
- Multiple near-identical "convert X to Y" articles where the tool page already answers the query.

# Existing Tools Inventory

Generated from the registry (`src/lib/toolRegistry.ts`) on 2026-11-12. "Status" was checked with the real-browser sweep (every page loads with no console errors on desktop and mobile) and the per-tool end-to-end checks run during earlier releases. SEO status: every tool has a unique title, description and H1, intro copy, steps, use cases, limitations, FAQ, related tools and at least one linked guide.

| Tool | URL | Category | Frontend | Backend | Status | Main dependencies | Linked guides | Proposed improvements |
|---|---|---|---|---|---|---|---|---|
| PDF to Word | /tools/pdf-to-word | PDF | Upload workspace | `POST /api/v1/process/pdf-to-word` | Working | pdfjs-dist, docx, tesseract.js (server) | 7 | Explain text-only output earlier in the page |
| Word to PDF | /tools/word-to-pdf | PDF | Upload workspace | `word-to-pdf` | Working | LibreOffice (server) | 3 | — |
| JPG to PDF | /tools/jpg-to-pdf | PDF | Client processor | — | Working | pdf-lib (browser) | 6 | — |
| PDF to JPG | /tools/pdf-to-jpg | PDF | Upload workspace | `pdf-to-jpg` | Working | pdfjs-dist + @napi-rs/canvas (server) | 3 | Candidate to move to the browser (pdfjs already ships to the PDF Editor) — would cut AWS load |
| Compress PDF | /tools/compress-pdf | PDF | Upload workspace | `compress-pdf` | Working | Ghostscript (server) | 8 | — |
| Merge PDF | /tools/merge-pdf | PDF | Upload workspace | `merge-pdf` | Working | pdf-lib / qpdf (server) | 9 | Candidate to move to the browser (pdf-lib already used client-side) |
| Split PDF | /tools/split-pdf | PDF | Client processor | — | Working | pdf-lib (browser) | 5 | — |
| PDF Editor | /tools/pdf-editor | PDF | Dedicated workspace | — | Working | pdf-lib, pdfjs-dist, jsPDF (browser) | 5 | — |
| Add Page Numbers | /tools/pdf-page-numbers | PDF | Client processor | — | Working | pdf-lib (browser) | 3 | — |
| PowerPoint to PDF | /tools/powerpoint-to-pdf | PDF | Upload workspace | `powerpoint-to-pdf` | Working | LibreOffice (server) | 1 | Add a second guide |
| Excel to PDF | /tools/excel-to-pdf | PDF | Upload workspace | `excel-to-pdf` | Working | LibreOffice (server) | 2 | — |
| Protect PDF | /tools/protect-pdf | PDF security | Upload workspace | `protect-pdf` | Working | qpdf (server) | 3 | — |
| Unlock PDF | /tools/unlock-pdf | PDF security | Upload workspace | `unlock-pdf` | Working | qpdf (server) | 3 | — |
| UnProtect PDF | /tools/unprotect-pdf | PDF security | Upload workspace | `unprotect-pdf` | Working | qpdf (server) | 2 | — |
| Compress Image | /tools/compress-image | Image | Client processor | — | Working | Canvas API | 15 | — |
| Image Resizer | /tools/image-resizer | Image | Client processor | — | Working | Canvas API | 14 | — |
| JPG to PNG | /tools/jpg-to-png | Image | Client processor | — | Working | Canvas API | 3 | — |
| PNG to JPG | /tools/png-to-jpg | Image | Client processor | — | Working | Canvas API | 9 | — |
| WebP Converter | /tools/webp-converter | Image | Client processor | — | Working | Canvas API | 8 | — |
| Image to Text (OCR) | /tools/image-to-text | Image / OCR | Upload workspace | `image-to-text` | Working | tesseract.js (server) | 8 | Could run in the browser with tesseract.js (≈ several MB of language data per visit) — evaluate before moving |
| JSON Formatter & Validator | /tools/json-formatter | Developer | Custom workspace | — | Working | Browser JSON engine | 3 | — |
| Base64 Encoder / Decoder | /tools/base64-encoder-decoder | Developer | Custom workspace | — | Working | Browser APIs | 5 | — |
| Meta Tag Generator | /tools/meta-tag-generator | Developer | Custom workspace | — | Working | — | 14 | — |
| QR Code Generator | /tools/qr-code-generator | Developer / Link | Custom workspace | — | Working | qrcode (MIT) | 11 | Also list under Link Studio once it exists |
| Word Counter | /tools/word-counter | Text | Custom workspace | — | Working | Intl.Segmenter | 7 | — |
| Text Compare | /tools/text-compare | Text | Custom workspace | — | Working | diff (BSD-3) | 7 | — |

**Totals:** 26 tools — 16 run entirely in the browser, 10 use the AWS backend.

## Tools named in the brief that don't exist

| Tool | Decision |
|---|---|
| PDF to Excel, PDF to PowerPoint | Not implemented; would need server conversion with poor fidelity. Not listed anywhere. |
| JSON Generator | Not implemented. Low distinct value next to JSON Formatter; reconsider later. |
| SQL Query Fixer, SQL Query Generator | Not implemented. Without an AI model these would be thin; deferred. |
| HEIC to JPG | Previously deferred by the owner. |

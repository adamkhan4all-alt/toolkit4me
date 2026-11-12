# Dependency and Licence Report

Updated 2026-11-12 (Releases 1–2). Earlier reviews: `OPEN_SOURCE_DEPENDENCIES.md` (utility tools, 2026-11-04).

## Runtime dependencies shipped to visitors

| Package | Version | Licence | Used by | Loaded |
|---|---|---|---|---|
| react, react-dom | 19.x | MIT | Whole app | Every page |
| react-router-dom | 7.x | MIT | Routing | Every page |
| react-helmet-async | 3.x | Apache-2.0 | Head tags | Every page |
| pdf-lib | 1.17.1 | MIT | Browser PDF tools | PDF tool pages only |
| pdfjs-dist | 4.x | Apache-2.0 | PDF Editor | PDF Editor only |
| jspdf | 4.x | MIT | PDF Editor, JPG to PDF | Those pages only |
| qrcode | 1.5.4 | MIT | QR Code Generator | QR page only |
| diff | 9.0.0 | BSD-3-Clause | Text Compare | Text Compare only |
| **gifenc** (new, Release 2) | **1.0.3** | **MIT** | Video to GIF | Video to GIF only — inside its Web Worker (9.6 KB chunk) |

`gifenc` review: no dependencies; small (5 KB source); last published 2022 (a finished, single-purpose encoder, not abandoned in a way that matters — no network, file-system or parser attack surface beyond encoding pixels we generate ourselves). Verified by a unit test that produces a valid looping GIF89a, and a browser test that decodes the output frame by frame.

## Release 1–2 additions that are not dependencies

- **Fonts:** system font stacks only (Segoe UI/Roboto/Helvetica/Arial; Impact and Arial Black where installed). No font files are downloaded or redistributed.
- **Icons and graphics:** text glyphs and CSS gradients; no icon library, no third-party images or GIFs.
- **Pixel processing:** our own code (`src/lib/pixel/`) — colour adjustments, colour keying with flood fill, box blur, pixelation, colour-dodge sketch, median-cut palette, text layout.
- **Unicode text styles** (Fancy Text Generator): character mappings from the Unicode Standard (Mathematical Alphanumeric Symbols, Enclosed Alphanumerics, Halfwidth and Fullwidth Forms); no third-party tables copied.
- **AI models:** none. See `AI_FEASIBILITY.md` for evaluated and rejected models and their licences.

## Development-only

vitest, @testing-library/*, jsdom, oxlint, typescript, vite, tailwindcss, tsx, jsqr (test decoding of QR codes). Not shipped to visitors.

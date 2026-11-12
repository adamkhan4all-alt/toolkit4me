# Open-source dependencies — utility tools (2026-11)

Dependencies reviewed for the ten utility tools added in November 2026. Every
new tool runs entirely in the browser; none adds backend code, servers or
paid services. Checked on 2026-11-04 (npm registry metadata, repository,
licence, `npm audit`).

## Added

| Package | Version | Licence | Used by | Shipped to visitors? | Notes |
|---|---|---|---|---|---|
| [`qrcode`](https://github.com/soldair/node-qrcode) | 1.5.4 | MIT | QR Code Generator | Yes — only on `/tools/qr-code-generator` (8.8 KB gzipped, dynamically imported) | Most widely used JS QR encoder; browser build excludes its Node-only CLI dependencies (`yargs`, `pngjs`). |
| [`diff`](https://github.com/kpdecker/jsdiff) (jsdiff) | 9.0.0 | BSD-3-Clause | Text Compare | Yes — only on `/tools/text-compare` (bundled into its 6.7 KB gzipped chunk) | Actively maintained (2026 release); used with its documented `timeout` + async `callback` options so large diffs never block the page. |
| [`jsqr`](https://github.com/cozmo/jsQR) | 1.4.0 | Apache-2.0 | Tests only | No (devDependency) | Independent QR decoder used to verify generated codes round-trip to the exact input. |
| `@types/qrcode` | 1.5.6 | MIT | Type checking | No (devDependency) | |

## Reused (already in the project)

| Package | Licence | Used by |
|---|---|---|
| [`pdf-lib`](https://github.com/Hopding/pdf-lib) 1.17.1 | MIT | PDF Page Numbers (stamping text) |
| [`pdfjs-dist`](https://github.com/mozilla/pdf.js) | Apache-2.0 | Tests only, to verify page-number placement on rotated/cropped pages |

## Browser platform APIs (no dependency)

- **Canvas API** — Image Resizer, WebP Converter (`toBlob` encoding, with an explicit check that the browser really produced WebP).
- **`Intl.Segmenter`** — Word Counter's language-aware word, sentence and grapheme counting (regex fallback where unavailable).
- **`TextEncoder` / `TextDecoder`, `btoa` / `atob`** — UTF-8-correct Base64.
- **`JSON.parse` / `JSON.stringify`** — JSON Formatter.
- **Clipboard API** (with `execCommand` fallback) — copy buttons.

## Evaluated and not adopted

**HEIC to JPG** — the site owner decided on 2026-11-11 not to offer this
tool, for the licensing and cost reasons below. Revisit only if a
permissively licensed HEIC decoder becomes available.

| Option | Licence | Why not |
|---|---|---|
| `heic2any` 0.0.4 | MIT wrapper, but bundles **libheif (LGPL-3.0)** | Unmaintained since 2023; bundles an old libheif without later security fixes; ~2.7 MB. |
| `heic-to` 1.6.7 / `libheif-js` 1.23.5 | **LGPL-3.0** | Maintained, but LGPL obligations apply to distributing it in a web bundle, and the decoder adds several MB. |
| Server-side (libheif / ImageMagick on the existing EC2 backend) | LGPL-3.0 / Apache-2.0 | Adds backend CPU load and upload traffic (contrary to the browser-first, low-AWS-cost goal). |

All options also decode **HEVC**, which is covered by patent pools in some
jurisdictions.

## Security

`npm audit` reported three advisories that pre-dated this work
(`dompurify` via jspdf — critical; `vite` and `source-map-js` — high, build
tooling only). All were fixed with a non-breaking `npm audit fix`
(dompurify 3.4.17, vite 8.3.5, source-map-js 1.2.2). `npm audit` now reports
0 vulnerabilities.

## Added for Pixel Playground (2026-11-12)

| Package | Version | Licence | Used by | Shipped to visitors? | Notes |
|---|---|---|---|---|---|
| [`gifenc`](https://github.com/mattdesl/gifenc) | 1.0.3 | MIT | Video to GIF | Yes — only inside the Video to GIF Web Worker (9.6 KB chunk) | No dependencies. Per-frame 256-colour palettes; frames are encoded off the main thread. |

All other Pixel Playground tools use the Canvas API and our own pixel code (`src/lib/pixel/`), with no new dependencies. Full report: `docs/DEPENDENCY_AND_LICENSE_REPORT.md`.

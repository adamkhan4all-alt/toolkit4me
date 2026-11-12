# Performance Baseline

Measured 2026-11-12 on the local production build (`vite preview`), headless Chromium, 375 × 740 mobile viewport, 4× CPU slowdown, no network throttling (localhost). Script: `pw/perf.mjs` (kept outside the repo). These are lab numbers for comparing releases, not field Core Web Vitals; use PageSpeed Insights / Search Console for field data.

| Page | JS requested (KB, uncompressed) | JS files | LCP (ms) | CLS | DOMContentLoaded (ms) |
|---|---|---|---|---|---|
| / | 564 | 5 | 848 | 0.000 | 265 |
| /tools | 564 | 6 | 808 | 0.000 | 109 |
| /tools/compress-pdf | 564 | 10 | 176 | 0.000 | 121 |
| /tools/qr-code-generator | 589 | 14 | 296 | 0.028 | 169 |
| /guides | 564 | 6 | 692 | 0.000 | 157 |
| /guides/how-to-reduce-pdf-file-size | 564 | 8 | 936 | 0.000 | 173 |

## Largest build chunks

| Chunk | Raw | Gzip | Loaded on |
|---|---|---|---|
| pdf.worker (pdfjs) | 1,376 KB | 403 KB | PDF Editor only |
| es-* (pdfjs) | 510 KB | 204 KB | PDF Editor only |
| jspdf | 399 KB | 127 KB | PDF Editor only |
| index (app shell, router, helmet, tool registry) | 383 KB | 118 KB | Every page |
| pdf (pdf-lib) | 329 KB | 96 KB | PDF client tools |
| SeoHead (includes all guide text) | 194 KB | 64 KB | **Every page** |

## Findings

1. **Guide text on every page (R1).** `src/lib/seo/structuredData.ts` imports `guideCategoryLabel` and `guideWordCount` from `src/data/guides.ts`, so the whole 41-guide content file lands in the shared `SeoHead` chunk. Fix in Release 1.
2. Heavy PDF libraries are already split and load only where used.
3. CLS is near zero everywhere; the QR page's 0.028 comes from the preview canvas appearing after the dynamic `qrcode` import — under the 0.1 "good" threshold.
4. The app shell (118 KB gzip) includes every tool's full page copy via the registry. Acceptable now; revisit if the registry grows past ~100 tools (split page copy from discovery metadata).

# Performance Report

Lab measurements on the local production build: headless Chromium, 375 × 740 mobile viewport, 4× CPU slowdown, localhost (no network throttling). Method and baseline: `PERFORMANCE_BASELINE.md`. Field data (Core Web Vitals from real visitors) must come from PageSpeed Insights / Search Console after deployment.

## After Release 1 (2026-11-12)

| Page | JS before (KB) | JS after (KB) | Change | LCP after (ms) | CLS after |
|---|---|---|---|---|---|
| / | 564 | 401 | −29% | 768 | 0.000 |
| /tools | 564 | 388 | −31% | 700 | 0.000 |
| /pdf-tools (new) | — | 401 | — | 712 | 0.000 |
| /tools/compress-pdf | 564 | 388 | −31% | 292 | 0.000 |
| /tools/qr-code-generator | 589 | 413 | −30% | 160 | 0.003 |
| /guides | 564 | 568 | +1% | 772 | 0.000 |
| /guides/how-to-reduce-pdf-file-size | 564 | 568 | +1% | 728 | 0.000 |

What changed:
- Guide types and helpers moved to `src/data/guideMeta.ts`; tool pages, hub pages and the homepage use a generated 41-entry index (`src/data/guideIndex.generated.ts`) instead of importing every guide's full text. That text (~190 KB raw) now loads only on guide pages.
- No new runtime dependencies. The redesign uses CSS only (gradients, blurred background shapes, short fade/lift transitions), all disabled under `prefers-reduced-motion`, and the system font stack (no web-font download).
- Guide pages are +4 KB for the new header menu.

Lab LCP varies by ±100 ms between runs on this machine; the differences above that size are noise, the JavaScript reductions are not.

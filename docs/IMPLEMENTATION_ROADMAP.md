# Implementation Roadmap

Status key: ✅ done · 🔄 in progress · ⏳ planned · ⏸ deferred (reason given) · 🔒 blocked on owner action

Every batch runs the same steps: inspect the code → implement → unit tests → type check, lint, build → dist SEO audit → real-browser checks (desktop and 375 px) → commit on the `platform-expansion` branch. **Nothing is deployed to production without the owner's go-ahead**, because these releases change every page while AdSense review is in progress.

## Release 0 — Audit and baseline ✅
Audit, tools inventory, architecture decisions, performance and SEO baselines (`docs/`).

## Release 1 — Foundation and redesign ✅ (on branch, awaiting deployment approval)
| Batch | Scope |
|---|---|
| ✅ 1A | Performance fix R1 (guide text off the shared chunk); hub definitions (`src/data/hubs.ts`); registry fields `hub`, `popular`, `addedOn` |
| ✅ 1B | Design tokens refresh (palette, accent gradient, shadows, motion, reduced-motion) applied through shared components |
| ✅ 1C | Header navigation by hub (desktop dropdown, mobile expandable), only hubs with released tools |
| ✅ 1D | Homepage: "Everything You Need. One Toolkit." hero, search, popular, hub sections, recently added, FAQ |
| ✅ 1E | Hub landing pages (`/pdf-tools`, `/image-tools`, `/developer-tools`, later `/pixel-playground`, `/calculators`) with prerender + sitemap; `/tools` directory with hub filter and search |
| ✅ 1F | Sitemap split per hub + `npm run seo:validate` (XML, status, canonical host, uniqueness, indexability) |

## Release 2 — Pixel Playground ✅ (on branch, awaiting deployment approval)
| Batch | Tools | Status |
|---|---|---|
| 2A | Photo Filter Studio, Border & Frame Maker, Image Shadow Generator, Colour Palette Extractor, Transparent Background Maker (colour-based), Face Blur & Privacy Editor (manual areas), Profile Picture Border Maker, Fancy Text Generator, Photo to Sketch (filter) | ✅ |
| 2B | Meme Generator, Instagram Story Maker, YouTube Thumbnail Maker, WhatsApp Sticker Maker, Collage Maker | ✅ |
| 2C | Passport Photo Maker, Video to GIF (Web Worker + gifenc) | ✅ |
| 2D | AI feasibility study — `docs/AI_FEASIBILITY.md` | ✅ |
| ⏸ | Hashtag Generator | Deferred: without a model or live data it's only a word list — thin (ADR-08) |
| ⏸ | Image Watermark Remover | Deferred: needs inpainting models; high misuse risk |

16 tools in total, all running in the browser; the only new dependency is gifenc (MIT). Legal pages (Disclaimer, Terms) updated for the creative tools.

### AI tools — assessment (details in AI_FEASIBILITY.md)
| Tool | Browser feasibility | Status |
|---|---|---|
| AI Background Remover | Possible with small segmentation models (e.g. MediaPipe Selfie Segmentation, Apache-2.0, for people; general-object models need licence review — the popular RMBG-1.4 weights are **non-commercial**) | ⏳ evaluate |
| AI Background Changer | Same model as remover + compositing | ⏳ after remover |
| Photo to Anime / Cartoonizer | Small style-transfer ONNX models exist; licences vary, quality uneven | ⏳ evaluate; until then only a labelled filter |
| AI Image Enhancer (upscaling) | Small ESRGAN-type ONNX models (tens of MB) can run via WebGPU/WASM, slow on phones | ⏳ evaluate |
| AI Image Generator, Avatar, Headshots, Outpainting, Hairstyle Preview, Photo Restoration | Need diffusion models (GBs) and a GPU; not acceptable in a browser for most visitors | ⏸ deferred — would need approved paid GPU/API, which the brief forbids |

## Release 3 — Calculator Hub ⏳
Reusable engine (`src/lib/calculators/`: pure formula functions + field schema + formatter), one generic calculator page, 30 calculators from the brief with unit tests for every formula, disclaimers for finance and health. Marla/Kanal converters let the user choose the Marla standard (225 / 250 / 272.25 sq ft) and show the basis used.

## Release 4 — Link Studio 🔒
| Part | Status |
|---|---|
| `LINK_STUDIO_ARCHITECTURE.md` (Cloudflare Workers + D1, limits, costs, DNS steps, security, one-time link atomicity) | ⏳ |
| Browser-only utilities: UTM Builder, URL Parser/Cleaner, URL Encoder/Decoder, URL Validator; QR Code Generator listed here too | ⏳ |
| Short links on `go.toolkit4me.com` (custom alias, expiry, disable, one-time, basic analytics) | 🔒 needs owner approval of a Cloudflare account, cost and a DNS record |

## Release 5 — Browser AI (optional) ⏳
Per-model evaluation documents (source, licence, size, RAM, speed, browsers) before any integration; models load only on their own tool page.

## Release 6 — Existing tools refinement ⏳
Re-test every existing tool; candidates to move from AWS to the browser to reduce server load: Merge PDF (pdf-lib), PDF to JPG (pdfjs). Legal pages updated to match whatever shipped. Final reports listed in brief §18.

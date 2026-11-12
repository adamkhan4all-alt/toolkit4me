# Implementation Roadmap

Status key: ✅ done · 🔄 in progress · ⏳ planned · ⏸ deferred (reason given) · 🔒 blocked on owner action

Every batch runs the same steps: inspect the code → implement → unit tests → type check, lint, build → dist SEO audit → real-browser checks (desktop and 375 px) → commit on the `platform-expansion` branch. **Nothing is deployed to production without the owner's go-ahead**, because these releases change every page while AdSense review is in progress.

## Release 0 — Audit and baseline ✅
Audit, tools inventory, architecture decisions, performance and SEO baselines (`docs/`).

## Release 1 — Foundation and redesign ✅ (deployed 2026-11-12)
| Batch | Scope |
|---|---|
| ✅ 1A | Performance fix R1 (guide text off the shared chunk); hub definitions (`src/data/hubs.ts`); registry fields `hub`, `popular`, `addedOn` |
| ✅ 1B | Design tokens refresh (palette, accent gradient, shadows, motion, reduced-motion) applied through shared components |
| ✅ 1C | Header navigation by hub (desktop dropdown, mobile expandable), only hubs with released tools |
| ✅ 1D | Homepage: "Everything You Need. One Toolkit." hero, search, popular, hub sections, recently added, FAQ |
| ✅ 1E | Hub landing pages (`/pdf-tools`, `/image-tools`, `/developer-tools`, later `/pixel-playground`, `/calculators`) with prerender + sitemap; `/tools` directory with hub filter and search |
| ✅ 1F | Sitemap split per hub + `npm run seo:validate` (XML, status, canonical host, uniqueness, indexability) |

## Release 2 — Pixel Playground ✅ (deployed 2026-11-12)
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

## Release 3 — Calculator Hub ✅ (details, accuracy report and tests in `CALCULATOR_HUB.md`)
| Part | Status |
|---|---|
| Reusable engine (`src/lib/calculators/`: pure formulas, field schemas + validation, result model, formatting), one generic UI and page | ✅ |
| 30 calculators: Everyday Math (8), Finance & Money (7), Education & Students (6), Developer & Technology (4), Home & Construction (5) | ✅ |
| Formula tests against independently computed values; edge-case tests; browser tests of all 30 | ✅ |
| Marla/Kanal: user chooses 272.25 / 250 / 225 sq ft; basis shown; all standards compared | ✅ |
| Calculators load lazily per group; shared bundle unchanged (ADR-11) | ✅ |
| Health & Fitness, Business & E-commerce, Travel, Social Media & Creator, Agriculture, Weird & Wonderful | ⏸ next batches — categories appear only once they have calculators |

## Release 4 — Link Studio ✅ (details, security review and tests in `LINK_STUDIO.md`)
| Part | Status |
|---|---|
| Short-link backend: existing Cloudflare Worker `toolkit4me-shortlinks` + D1 on `go.toolkit4me.com` (set up by the owner) | ✅ used as-is, not modified |
| Public hub `/link-studio` + browser tools: UTM Builder, URL Parser & Cleaner, URL Validator, URL Encoder & Decoder; QR Code Generator listed | ✅ |
| Secure integration: Vercel Functions `api/link-studio/*` in the same project; key server-side only | ✅ |
| Admin console `/link-studio/admin`: create (alias, redirect type, expiry, status, QR, copy, share), manage (search, filter, sort, paginate, edit, disable, delete), analytics (summary + per link, 7/30/90/365 days) | ✅ |
| Admin sign-in (GitHub OAuth, allow-listed ids) | ✅ code · 🔧 owner adds a GitHub OAuth App + 4 env vars (`LINK_STUDIO.md` §6) |
| Privacy Policy disclosure | ✅ |
| One-time links, bulk shortener | ⏸ not supported by the Worker; needs a separate approved Worker/D1 change |

## Release 5 — Browser AI (optional) ⏳
Per-model evaluation documents (source, licence, size, RAM, speed, browsers) before any integration; models load only on their own tool page.

## Release 6 — Existing tools refinement ⏳
Re-test every existing tool; candidates to move from AWS to the browser to reduce server load: Merge PDF (pdf-lib), PDF to JPG (pdfjs). Legal pages updated to match whatever shipped. Final reports listed in brief §18.

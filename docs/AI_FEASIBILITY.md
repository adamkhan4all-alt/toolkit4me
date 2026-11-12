# Browser AI Feasibility — Pixel Playground (Release 2D)

Purpose: decide which "AI" tools from the brief can run acceptably **in the visitor's browser**, with no paid APIs, no cloud GPU and no new AWS workload (ADR-04, ADR-06). Nothing below has been integrated; each "candidate" needs the per-model checklist at the end before any code is written.

Licence notes reflect what the projects published when last reviewed. **Licences of model weights often differ from the code licence and can change — re-verify from the model card before integrating.** Items marked "verify" were not confirmed for this document.

## Summary

| Tool | Verdict | Why |
|---|---|---|
| AI Background Remover (people) | **Candidate** — Release 5 | Small person-segmentation models run in real time in browsers (e.g. MediaPipe Selfie Segmentation, Apache-2.0). Good for portraits; weak for objects. |
| AI Background Remover (any object) | **Blocked on licensing** | The best-known browser-ready models have restrictive terms: BRIA RMBG-1.4/2.0 weights are non-commercial; `@imgly/background-removal` is AGPL-3.0. U²-Net (Apache-2.0) is usable but lower quality — evaluate. |
| AI Background Changer | After the remover | Same model + compositing. |
| AI Image Enhancer (upscaling) | **Candidate, desktop-only** | Real-ESRGAN (BSD-3-Clause code; check each ONNX export's terms) can run via ONNX Runtime Web; tens of MB download and slow on phones without WebGPU. Needs a clear "large download, best on a computer" warning and a tile-based worker. |
| Photo to Anime / Image Cartoonizer | **Shipped as a labelled filter only** (Photo to Sketch) | AnimeGAN-family repositories restrict commercial use of their pretrained weights (verify current notice). No permissively licensed, good-quality browser model identified. |
| AI Photo Restoration | Deferred | Face restoration models (GFPGAN, CodeFormer) are large, need GPUs for usable speed, and CodeFormer's licence is non-commercial (verify). |
| AI Image Generator | Deferred | Diffusion models are gigabytes and need WebGPU on a high-end GPU; unusable for most visitors. Needs a paid API or GPU server — not approved. |
| AI Avatar Generator, Professional Headshot Generator | Deferred | Require diffusion models plus per-person fine-tuning or identity adapters — GPU-server work, not browser work. |
| AI Image Outpainting | Deferred | Diffusion inpainting/outpainting — same constraints as the generator. |
| Hairstyle Preview | Deferred | Needs face landmarks (feasible: MediaPipe Face Mesh, Apache-2.0) **plus** a generative hair model (not feasible in-browser at acceptable quality). A sticker-style overlay would be a gimmick, not the advertised tool. |
| Image Watermark Remover | Deferred | Needs inpainting models; also high misuse risk (removing other people's watermarks). |

## Recommended order for Release 5

1. **People background removal** with MediaPipe Selfie Segmentation (Apache-2.0): small download, fast, works on phones. Ship as "Remove background from portraits", saying clearly it's for people.
2. **Upscaler** with a compact Real-ESRGAN variant via ONNX Runtime Web (MIT), WebGPU when available and WASM fallback, processing in tiles inside a Web Worker, behind an explicit "download the model (≈ N MB)" button.
3. Re-check object background-removal models for a permissive licence.

## Per-model checklist (complete before integrating)

- Source repository and exact model file (URL, version, checksum)
- Code licence **and** weights licence, with a link to the licence text and commercial-use statement
- Download size (compressed) and where it's hosted (same origin preferred; cache with the Cache API)
- Peak memory on a mid-range Android phone and an iPhone
- Inference time: desktop with WebGPU, desktop WASM, mid-range phone
- Browser support (WebGPU availability, WASM SIMD/threads, Safari specifics)
- Quality on a fixed set of test images, reviewed by a person
- Fallback when the device can't run it (clear message, no fake output)
- Privacy: model and inference stay on the device; no image leaves the browser

## Rules that apply regardless

- No tool is labelled "AI" unless a model actually runs.
- Models load only on their own tool page, after the visitor chooses to use the tool.
- No paid AI APIs, no third-party upload services, no new AWS workload.

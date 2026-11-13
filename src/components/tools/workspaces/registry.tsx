// ---------------------------------------------------------------------
// Interactive tools whose input is text or settings rather than an
// uploaded file get their own workspace component. Each is lazy-loaded,
// and any library it needs (qrcode, diff) is imported inside it, so a
// visitor only downloads the code for the tool page they're actually on.
//
// File-based browser tools (image resizer, WebP, PDF page numbers) don't
// belong here — they register a processor in
// src/lib/processing/clientProcessors.ts and reuse ClientToolWorkspace.
// ---------------------------------------------------------------------

import { lazy, type ComponentType, type ReactNode } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { STUDIO_SPECS } from "../../../lib/pixel/specs";

/**
 * One shared workspace for every canvas tool driven by a StudioSpec (src/lib/pixel/specs). Each tool gets its own
 * lazy component that loads the workspace and that tool's spec together, so the page appears complete in one step.
 */
const ImageStudio = (toolId: string) =>
  lazy(async () => {
    const [{ default: Workspace }, { default: spec }] = await Promise.all([import("./ImageStudioWorkspace"), STUDIO_SPECS[toolId]()]);
    return { default: ({ tool }: { tool: ToolDefinition }) => <Workspace tool={tool} spec={spec} /> };
  });

const WORKSPACES: Record<string, ComponentType<{ tool: ToolDefinition }>> = {
  "json-formatter": lazy(() => import("./JsonFormatterWorkspace")),
  "qr-code-generator": lazy(() => import("./QrCodeWorkspace")),
  "word-counter": lazy(() => import("./WordCounterWorkspace")),
  "text-compare": lazy(() => import("./TextCompareWorkspace")),
  "base64-encoder-decoder": lazy(() => import("./Base64Workspace")),
  "meta-tag-generator": lazy(() => import("./MetaTagWorkspace")),
  // Pixel Playground
  "photo-filters": ImageStudio("photo-filters"),
  "image-border-frame": ImageStudio("image-border-frame"),
  "image-shadow-generator": ImageStudio("image-shadow-generator"),
  "transparent-background": ImageStudio("transparent-background"),
  "profile-picture-border": ImageStudio("profile-picture-border"),
  "photo-to-sketch": ImageStudio("photo-to-sketch"),
  "color-palette-extractor": lazy(() => import("./PaletteWorkspace")),
  "blur-image-areas": lazy(() => import("./BlurAreasWorkspace")),
  "fancy-text-generator": lazy(() => import("./FancyTextWorkspace")),
  "meme-generator": ImageStudio("meme-generator"),
  "story-maker": ImageStudio("story-maker"),
  "youtube-thumbnail-maker": ImageStudio("youtube-thumbnail-maker"),
  "whatsapp-sticker-maker": ImageStudio("whatsapp-sticker-maker"),
  "collage-maker": lazy(() => import("./CollageWorkspace")),
  "passport-photo-maker": ImageStudio("passport-photo-maker"),
  "picture-to-anime": ImageStudio("picture-to-anime"),
  "picture-avatar": ImageStudio("picture-avatar"),
  "video-to-gif": lazy(() => import("./VideoToGifWorkspace")),
  // Link Studio URL tools
  "utm-builder": lazy(() => import("./UtmBuilderWorkspace")),
  "url-parser-cleaner": lazy(() => import("./UrlCleanerWorkspace")),
  "url-validator": lazy(() => import("./UrlValidatorWorkspace")),
  "url-encoder-decoder": lazy(() => import("./UrlCodecWorkspace")),
  "url-shortener": lazy(() => import("./UrlShortenerWorkspace")),
};

/** The tool's custom workspace, ready to render, or null if it uses one of the standard workspaces. */
export function renderCustomWorkspace(tool: ToolDefinition): ReactNode | null {
  const Workspace = WORKSPACES[tool.id];
  if (!Workspace) return null;
  // No Suspense boundary of its own: the page waits (in the route-level boundary in App.tsx) until the workspace
  // code has loaded, then appears in one piece. A local "Loading tool…" placeholder was ~100 px tall and the
  // workspace 200–330 px taller, so the sections below jumped when it arrived (CLS up to 0.58 on mobile).
  // Client-side navigation is a transition, so the previous page stays on screen meanwhile.
  // Keyed by tool so tools sharing a component (Image Studio) start with fresh state on navigation.
  return <Workspace key={tool.id} tool={tool} />;
}

/** Tool ids with a custom workspace — used by tests. */
export const CUSTOM_WORKSPACE_IDS = Object.keys(WORKSPACES);

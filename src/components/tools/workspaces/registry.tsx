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

import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { LoadingState } from "../../ui/LoadingState";

/** One shared workspace for every canvas tool driven by a StudioSpec (src/lib/pixel/specs). */
const ImageStudio = lazy(() => import("./ImageStudioWorkspace"));

const WORKSPACES: Record<string, ComponentType<{ tool: ToolDefinition }>> = {
  "json-formatter": lazy(() => import("./JsonFormatterWorkspace")),
  "qr-code-generator": lazy(() => import("./QrCodeWorkspace")),
  "word-counter": lazy(() => import("./WordCounterWorkspace")),
  "text-compare": lazy(() => import("./TextCompareWorkspace")),
  "base64-encoder-decoder": lazy(() => import("./Base64Workspace")),
  "meta-tag-generator": lazy(() => import("./MetaTagWorkspace")),
  // Pixel Playground
  "photo-filters": ImageStudio,
  "image-border-frame": ImageStudio,
  "image-shadow-generator": ImageStudio,
  "transparent-background": ImageStudio,
  "profile-picture-border": ImageStudio,
  "photo-to-sketch": ImageStudio,
  "color-palette-extractor": lazy(() => import("./PaletteWorkspace")),
  "blur-image-areas": lazy(() => import("./BlurAreasWorkspace")),
  "fancy-text-generator": lazy(() => import("./FancyTextWorkspace")),
  "meme-generator": ImageStudio,
  "story-maker": ImageStudio,
  "youtube-thumbnail-maker": ImageStudio,
  "whatsapp-sticker-maker": ImageStudio,
  "collage-maker": lazy(() => import("./CollageWorkspace")),
  "passport-photo-maker": ImageStudio,
  "video-to-gif": lazy(() => import("./VideoToGifWorkspace")),
};

/** The tool's custom workspace, ready to render, or null if it uses one of the standard workspaces. */
export function renderCustomWorkspace(tool: ToolDefinition): ReactNode | null {
  const Workspace = WORKSPACES[tool.id];
  if (!Workspace) return null;
  return (
    <Suspense fallback={<LoadingState label="Loading tool…" />}>
      <Workspace tool={tool} />
    </Suspense>
  );
}

/** Tool ids with a custom workspace — used by tests. */
export const CUSTOM_WORKSPACE_IDS = Object.keys(WORKSPACES);

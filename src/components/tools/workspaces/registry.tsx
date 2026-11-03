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

const WORKSPACES: Record<string, ComponentType<{ tool: ToolDefinition }>> = {
  "json-formatter": lazy(() => import("./JsonFormatterWorkspace")),
  "qr-code-generator": lazy(() => import("./QrCodeWorkspace")),
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

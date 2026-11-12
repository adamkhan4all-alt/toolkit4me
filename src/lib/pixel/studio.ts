// ---------------------------------------------------------------------
// The contract between the shared Image Studio workspace and each
// Pixel Playground tool. A tool supplies its controls, defaults,
// optional presets and a render function; the workspace handles upload,
// validation, live preview, downloads and reset.
//
// render() is called twice: on a preview-sized copy of the photo while
// settings change, and on the full-resolution photo when downloading.
// Sizes and strengths must therefore be relative to the image (e.g. a
// percentage of the shorter side), so both renders look the same.
// ---------------------------------------------------------------------
import type { OutputFormat } from "./imageIO";

export type StudioValues = Record<string, number | string | boolean>;

export type StudioControl =
  | { type: "range"; key: string; label: string; min: number; max: number; step?: number; unit?: string }
  | { type: "select"; key: string; label: string; options: { value: string; label: string }[] }
  | { type: "color"; key: string; label: string }
  | { type: "toggle"; key: string; label: string; help?: string }
  | { type: "text"; key: string; label: string; placeholder?: string; maxLength?: number };

export interface StudioSpec<S extends StudioValues = StudioValues> {
  defaults: S;
  /** Controls, optionally depending on the current values (e.g. show colour only for a solid background). */
  controls: StudioControl[] | ((values: S) => StudioControl[]);
  presets?: { label: string; values: Partial<S> }[];
  /** Allowed download formats; the first is the default. */
  formats: OutputFormat[];
  /** Draws the result for `source` (preview-sized or full-size) and returns the output canvas. */
  render: (source: HTMLCanvasElement, values: S, options: { preview: boolean }) => HTMLCanvasElement;
  /** Called when the visitor clicks the original image, with the clicked pixel's colour and position (0–1). */
  pick?: (hit: { x: number; y: number; hex: string }, values: S) => Partial<S>;
  pickHint?: string;
  /** Values derived from the uploaded image (e.g. its background colour), applied after loading. */
  initFromSource?: (source: HTMLCanvasElement) => Partial<S>;
  /** Appended to the original file name for downloads. */
  fileSuffix: string;
  /** When true, the preview shows the original beside the result instead of the result alone. */
  showOriginal?: boolean;
}

export function controlsFor<S extends StudioValues>(spec: StudioSpec<S>, values: S): StudioControl[] {
  return typeof spec.controls === "function" ? spec.controls(values) : spec.controls;
}

/** Shorter side of a canvas — the reference for size settings given as a percentage. */
export const shorterSide = (c: { width: number; height: number }) => Math.min(c.width, c.height);

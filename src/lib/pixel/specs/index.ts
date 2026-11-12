// Lazy loaders for the Image Studio tool specs, keyed by tool id. Each spec
// (and the pixel code it uses) is downloaded only on its own tool page.
import type { StudioSpec, StudioValues } from "../studio";

type Loader = () => Promise<{ default: StudioSpec<StudioValues> }>;
const cast = (p: Promise<{ default: unknown }>) => p as Promise<{ default: StudioSpec<StudioValues> }>;

export const STUDIO_SPECS: Record<string, Loader> = {
  "photo-filters": () => cast(import("./photoFilters")),
  "image-border-frame": () => cast(import("./borderFrame")),
  "image-shadow-generator": () => cast(import("./shadow")),
  "transparent-background": () => cast(import("./transparentBackground")),
  "profile-picture-border": () => cast(import("./profileBorder")),
  "photo-to-sketch": () => cast(import("./photoToSketch")),
  "meme-generator": () => cast(import("./meme")),
  "story-maker": () => cast(import("./story")),
  "youtube-thumbnail-maker": () => cast(import("./thumbnail")),
  "whatsapp-sticker-maker": () => cast(import("./sticker")),
};

// Pure helpers for Video to GIF (frame timing, size and limits).

/** Longest clip that can be turned into a GIF. GIFs this long are already several megabytes. */
export const MAX_CLIP_SECONDS = 15;
export const MAX_VIDEO_MB = 200;
export const FPS_OPTIONS = [5, 8, 10, 12, 15];
export const WIDTH_OPTIONS = [240, 320, 480, 640];

/** Timestamps (seconds) to capture between start and end at `fps`, clamped to the clip limit and video duration. */
export function frameTimes(start: number, end: number, fps: number, duration: number): number[] {
  const s = Math.max(0, Math.min(start, duration));
  const e = Math.min(duration, end, s + MAX_CLIP_SECONDS);
  if (e <= s || fps <= 0) return [];
  const count = Math.max(1, Math.floor((e - s) * fps));
  // Stay a hair inside the end: seeking exactly to `duration` shows a blank frame in some browsers.
  return Array.from({ length: count }, (_, i) => Math.min(s + i / fps, Math.max(s, duration - 0.05)));
}

/** GIF frame delay in milliseconds for an fps (GIF stores delays in hundredths of a second). */
export function frameDelay(fps: number): number {
  return Math.round(100 / fps) * 10;
}

/** Output size for a target width, keeping the video's aspect ratio (even numbers, never upscaled). */
export function gifSize(videoWidth: number, videoHeight: number, targetWidth: number): { width: number; height: number } {
  const width = Math.min(targetWidth, videoWidth);
  const height = Math.max(2, Math.round((videoHeight * width) / videoWidth / 2) * 2);
  return { width: Math.max(2, Math.round(width / 2) * 2), height };
}

/** Rough upper-bound size estimate, used to warn before creating very large GIFs. */
export function estimateGifBytes(width: number, height: number, frames: number): number {
  // LZW on photographic frames typically lands at 0.3–0.6 bytes per pixel; use the high end.
  return Math.round(width * height * frames * 0.6);
}

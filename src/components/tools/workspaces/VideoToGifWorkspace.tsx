import { useEffect, useRef, useState } from "react";
import type { ToolDefinition } from "../../../types/tool";
import { FileDropZone } from "../FileDropZone";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { downloadBlob } from "../../../lib/downloadBlob";
import { formatFileSize } from "../../../lib/format";
import { FPS_OPTIONS, MAX_CLIP_SECONDS, MAX_VIDEO_MB, WIDTH_OPTIONS, estimateGifBytes, frameDelay, frameTimes, gifSize } from "../../../lib/pixel/gif";
import { PrivacyLine, inputClass, labelClass, panelClass } from "./shared";

type Status = { kind: "idle" } | { kind: "working"; done: number; total: number; stage: string } | { kind: "done"; url: string; size: number; width: number; height: number; frames: number };

/** Seeks a video and resolves once the frame at `time` is ready to draw (with a timeout for stubborn files). */
function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener("seeked", done);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, 3000);
    video.addEventListener("seeked", done);
    video.currentTime = time;
  });
}

export default function VideoToGifWorkspace({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(3);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  // Release object URLs when they're replaced or the page closes.
  useEffect(() => () => void (videoUrl && URL.revokeObjectURL(videoUrl)), [videoUrl]);
  const gifUrl = status.kind === "done" ? status.url : null;
  useEffect(() => () => void (gifUrl && URL.revokeObjectURL(gifUrl)), [gifUrl]);
  useEffect(() => () => cancelRef.current?.(), []);

  const onFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError(null);
    setStatus({ kind: "idle" });
    if (!f.type.startsWith("video/") && !/\.(mp4|m4v|mov|webm|ogv)$/i.test(f.name)) {
      setError(`"${f.name}" isn't a video file.`);
      return;
    }
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`"${f.name}" is larger than ${MAX_VIDEO_MB}MB. Trim the video first, or use a shorter clip.`);
      return;
    }
    setMeta(null);
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
  };

  const times = meta ? frameTimes(start, end, fps, meta.duration) : [];
  const size = meta ? gifSize(meta.width, meta.height, width) : { width: 0, height: 0 };
  const estimate = estimateGifBytes(size.width, size.height, times.length);

  const create = async () => {
    if (!videoUrl || !meta || times.length === 0) return;
    setError(null);
    let cancelled = false;
    const worker = new Worker(new URL("../../../lib/pixel/gifWorker.ts", import.meta.url), { type: "module" });
    const video = document.createElement("video");
    cancelRef.current = () => {
      cancelled = true;
      worker.terminate();
      video.removeAttribute("src");
      video.load();
    };
    try {
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = videoUrl;
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("decode"));
      });
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const finished = new Promise<ArrayBuffer>((resolve) => {
        worker.onmessage = (e: MessageEvent<{ type: string; frames?: number; bytes?: ArrayBuffer }>) => {
          if (e.data.type === "progress") setStatus({ kind: "working", done: e.data.frames!, total: times.length, stage: "Encoding" });
          if (e.data.type === "done") resolve(e.data.bytes!);
        };
      });
      worker.postMessage({ type: "start", width: size.width, height: size.height, delay: frameDelay(fps) });
      for (let i = 0; i < times.length; i++) {
        if (cancelled) return;
        await seek(video, times[i]);
        ctx.drawImage(video, 0, 0, size.width, size.height);
        const data = ctx.getImageData(0, 0, size.width, size.height).data.buffer;
        worker.postMessage({ type: "frame", data }, [data]);
        setStatus({ kind: "working", done: i + 1, total: times.length, stage: "Capturing frames" });
      }
      worker.postMessage({ type: "finish" });
      const bytes = await finished;
      if (cancelled) return;
      const blob = new Blob([bytes], { type: "image/gif" });
      setStatus({ kind: "done", url: URL.createObjectURL(blob), size: blob.size, width: size.width, height: size.height, frames: times.length });
    } catch {
      if (!cancelled) {
        setError("This video couldn't be read. Your browser may not support its format — MP4 (H.264) and WebM work in all major browsers.");
        setStatus({ kind: "idle" });
      }
    } finally {
      worker.terminate();
      cancelRef.current = null;
    }
  };

  if (!file || !videoUrl) {
    return (
      <div className={panelClass}>
        <FileDropZone acceptedFormats={tool.acceptedFormats} acceptedMime={tool.acceptedMime} maxFileSizeMB={tool.maxFileSize} multiple={false} onFilesAdded={onFiles} />
        {error && <Alert variant="error">{error}</Alert>}
        <PrivacyLine>Your video is converted in your browser and never uploaded.</PrivacyLine>
      </div>
    );
  }

  const working = status.kind === "working";
  return (
    <div className={panelClass}>
      <video
        src={videoUrl}
        controls
        muted
        playsInline
        className="max-h-[360px] w-full rounded-lg border border-neutral-200 bg-black"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (!v.videoWidth) {
            setError("This video has no picture track, or your browser can't decode it.");
            return;
          }
          setMeta({ duration: v.duration, width: v.videoWidth, height: v.videoHeight });
          setStart(0);
          setEnd(Math.min(v.duration, 3));
        }}
        onError={() => setError("Your browser can't play this video format. MP4 (H.264) and WebM work in all major browsers; iPhone HEVC videos may only open in Safari.")}
      />

      {meta && (
        <>
          <p className="text-xs text-neutral-600">
            {file.name} · {meta.width} × {meta.height} · {meta.duration.toFixed(1)} s. Play the video to find your moment, then set the start and end below.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gif-start" className={labelClass}>
                Start (seconds)
              </label>
              <input id="gif-start" type="number" min={0} max={meta.duration} step={0.1} value={start} onChange={(e) => setStart(Math.max(0, Number(e.target.value)))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="gif-end" className={labelClass}>
                End (seconds)
              </label>
              <input id="gif-end" type="number" min={0} max={meta.duration} step={0.1} value={end} onChange={(e) => setEnd(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label htmlFor="gif-fps" className={labelClass}>
                Frames per second
              </label>
              <select id="gif-fps" value={fps} onChange={(e) => setFps(Number(e.target.value))} className={inputClass}>
                {FPS_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f} fps{f === 10 ? " — recommended" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="gif-width" className={labelClass}>
                Width
              </label>
              <select id="gif-width" value={width} onChange={(e) => setWidth(Number(e.target.value))} className={inputClass}>
                {WIDTH_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w} px{w > meta.width ? " (video is smaller)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-neutral-700">
            {times.length > 0 ? (
              <>
                {times.length} frames · {size.width} × {size.height} px · up to about {formatFileSize(estimate)}
                {end - start > MAX_CLIP_SECONDS && ` · clips are limited to ${MAX_CLIP_SECONDS} seconds`}
              </>
            ) : (
              "Set an end time after the start time."
            )}
          </p>
          {estimate > 15 * 1024 * 1024 && <Alert variant="warning">This GIF may be large. A shorter clip, fewer frames per second or a smaller width will make it smaller.</Alert>}
        </>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {working && (
        <div className="flex flex-col gap-1.5" role="status" aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full bg-brand-600 transition-[width]" style={{ width: `${Math.round((status.done / status.total) * 100)}%` }} />
          </div>
          <p className="text-xs text-neutral-600">
            {status.stage}… {status.done} of {status.total}
          </p>
        </div>
      )}

      {status.kind === "done" && (
        <div className="flex flex-col items-center gap-2">
          <img src={status.url} alt="Your GIF" width={status.width} height={status.height} className="h-auto max-w-full rounded-lg border border-neutral-200" />
          <p className="text-xs text-neutral-600">
            {status.width} × {status.height} px · {status.frames} frames · {formatFileSize(status.size)}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {status.kind === "done" ? (
          <Button onClick={() => fetch(status.url).then((r) => r.blob()).then((b) => downloadBlob(b, `${file.name.replace(/\.[^.]+$/, "") || "video"}.gif`))}>Download GIF</Button>
        ) : (
          <Button onClick={create} disabled={!meta || working || times.length === 0}>
            {working ? "Creating…" : "Create GIF"}
          </Button>
        )}
        {working && (
          <Button
            variant="secondary"
            onClick={() => {
              cancelRef.current?.();
              setStatus({ kind: "idle" });
            }}
          >
            Cancel
          </Button>
        )}
        {status.kind === "done" && (
          <Button variant="secondary" onClick={() => setStatus({ kind: "idle" })}>
            Change settings
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={working}
          onClick={() => {
            setFile(null);
            setVideoUrl(null);
            setStatus({ kind: "idle" });
            setError(null);
          }}
        >
          Choose another video
        </Button>
      </div>
      <PrivacyLine>Your video is converted in your browser and never uploaded.</PrivacyLine>
    </div>
  );
}

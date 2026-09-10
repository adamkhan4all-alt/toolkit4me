import { useCallback, useRef, useState } from "react";
import type { ToolDefinition } from "../types/tool";
import { apiUrl } from "../config/api";

export type WorkflowState = "empty" | "selected" | "uploading" | "processing" | "completed" | "error" | "expired";

// Minimal mirror of the backend's JobPublicView (tier1-backend/src/jobs/types.ts).
// Duplicated rather than shared across repos — these two fields are the only
// ones this hook actually reads, kept in sync by hand since the two projects
// don't share a package boundary.
interface JobResultView {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  originalSizeBytes?: number;
  reductionPercent?: number;
}
interface JobPublicView {
  id: string;
  status: "queued" | "processing" | "completed" | "failed" | "expired";
  result?: JobResultView;
  error?: { code: string; message: string };
}

interface UseServerProcessingResult {
  state: WorkflowState;
  uploadPercent: number;
  outputFileName: string | null;
  outputSizeBytes: number | null;
  originalSizeBytes: number | null;
  reductionPercent: number | null;
  errorMessage: string | null;
  setFiles: (hasFiles: boolean) => void;
  start: (files: File[], options: Record<string, string>) => void;
  cancel: () => void;
  reset: () => void;
  download: () => void;
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 3 * 60 * 1000; // client-side safety net — the backend enforces its own, shorter, per-tool timeout server-side; this just stops an abandoned poll loop if something upstream goes very wrong.

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body) {
    const err = (body as { error?: { message?: unknown } }).error;
    if (err && typeof err.message === "string" && err.message.trim()) return err.message;
  }
  return fallback;
}

/**
 * Real server-mode processing: uploads the file(s) via multipart POST to
 * the tool's backend endpoint, tracks real upload progress via XHR, and
 * either uses the immediate response (sync tools — compress-pdf,
 * merge-pdf) or polls GET /jobs/:id (async tools) until the job
 * completes or fails, then downloads the real result. Every size/
 * reduction figure shown afterward comes from the backend's actual
 * response — never fabricated client-side.
 */
export function useServerProcessing(tool: ToolDefinition): UseServerProcessingResult {
  const [state, setState] = useState<WorkflowState>("empty");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [outputFileName, setOutputFileName] = useState<string | null>(null);
  const [outputSizeBytes, setOutputSizeBytes] = useState<number | null>(null);
  const [originalSizeBytes, setOriginalSizeBytes] = useState<number | null>(null);
  const [reductionPercent, setReductionPercent] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const pollTimeoutRef = useRef<number | null>(null);
  const resultBlobRef = useRef<Blob | null>(null);
  const generationRef = useRef(0);

  const stopAll = useCallback(() => {
    generationRef.current += 1; // invalidates any in-flight poll/timeout callbacks
    xhrRef.current?.abort();
    xhrRef.current = null;
    pollAbortRef.current?.abort();
    pollAbortRef.current = null;
    if (pollTimeoutRef.current !== null) {
      window.clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const setFiles = useCallback(
    (hasFiles: boolean) => {
      stopAll();
      setState(hasFiles ? "selected" : "empty");
      setErrorMessage(null);
    },
    [stopAll]
  );

  const fail = useCallback((message: string) => {
    setErrorMessage(message);
    setState("error");
  }, []);

  const fetchResult = useCallback(
    async (job: JobPublicView, generation: number) => {
      if (!job.result) {
        fail("Processing finished but no result was returned. Please try again.");
        return;
      }
      try {
        const res = await fetch(apiUrl(job.result.downloadUrl));
        if (generation !== generationRef.current) return; // superseded by a reset/cancel
        if (!res.ok) {
          fail("The processed file could not be downloaded. It may have expired — please try again.");
          return;
        }
        const blob = await res.blob();
        if (generation !== generationRef.current) return;
        resultBlobRef.current = blob;
        setOutputFileName(job.result.fileName);
        setOutputSizeBytes(job.result.sizeBytes);
        setOriginalSizeBytes(job.result.originalSizeBytes ?? null);
        setReductionPercent(job.result.reductionPercent ?? null);
        setState("completed");
      } catch {
        if (generation !== generationRef.current) return;
        fail("We couldn't reach the server to download your file. Check your connection and try again.");
      }
    },
    [fail]
  );

  const poll = useCallback(
    (jobId: string, generation: number, startedAt: number) => {
      if (generation !== generationRef.current) return;

      const controller = new AbortController();
      pollAbortRef.current = controller;

      fetch(apiUrl(`/api/v1/jobs/${jobId}`), { signal: controller.signal })
        .then(async (res) => {
          if (generation !== generationRef.current) return;
          if (!res.ok) {
            const body = await res.json().catch(() => null);
            fail(extractErrorMessage(body, "This job could not be found — it may have expired."));
            return;
          }
          const job = (await res.json()) as JobPublicView;
          if (generation !== generationRef.current) return;

          if (job.status === "completed") {
            await fetchResult(job, generation);
            return;
          }
          if (job.status === "failed") {
            fail(job.error?.message ?? "Processing failed. Please try a different file.");
            return;
          }
          if (job.status === "expired") {
            setState("expired");
            return;
          }
          // still queued/processing
          if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
            fail("This is taking longer than expected. Please try again in a moment.");
            return;
          }
          pollTimeoutRef.current = window.setTimeout(() => poll(jobId, generation, startedAt), POLL_INTERVAL_MS);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || generation !== generationRef.current) return;
          fail("We lost connection to the server while processing your file. Please try again.");
        });
    },
    [fail, fetchResult]
  );

  const start = useCallback(
    (files: File[], options: Record<string, string>) => {
      if (!tool.endpoint) {
        fail("This tool has no server endpoint configured.");
        return;
      }
      stopAll();
      const generation = generationRef.current;
      setState("uploading");
      setUploadPercent(0);
      setErrorMessage(null);
      resultBlobRef.current = null;

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file, file.name));
      Object.entries(options).forEach(([key, value]) => formData.append(key, value));

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", apiUrl(tool.endpoint));
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (generation !== generationRef.current) return;
        if (event.lengthComputable) {
          setUploadPercent(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (generation !== generationRef.current) return;
        const body = xhr.response as JobPublicView | { error?: { code: string; message: string } } | null;

        if (xhr.status >= 400) {
          fail(extractErrorMessage(body, `The server rejected this request (HTTP ${xhr.status}).`));
          return;
        }
        if (!body || !("status" in body)) {
          fail("The server returned an unexpected response. Please try again.");
          return;
        }

        const job = body as JobPublicView;
        setState("processing");

        if (job.status === "completed") {
          void fetchResult(job, generation);
        } else if (job.status === "failed") {
          fail(job.error?.message ?? "Processing failed. Please try a different file.");
        } else {
          poll(job.id, generation, Date.now());
        }
      };

      xhr.onerror = () => {
        if (generation !== generationRef.current) return;
        fail("We couldn't reach the server. Check your connection and try again.");
      };

      xhr.onabort = () => {
        // Cancelled by the user — cancel()/reset() already set the desired state.
      };

      xhr.send(formData);
    },
    [tool, stopAll, fail, fetchResult, poll]
  );

  const cancel = useCallback(() => {
    stopAll();
    setState("selected");
    setUploadPercent(0);
  }, [stopAll]);

  const reset = useCallback(() => {
    stopAll();
    setState("empty");
    setUploadPercent(0);
    setOutputFileName(null);
    setOutputSizeBytes(null);
    setOriginalSizeBytes(null);
    setReductionPercent(null);
    setErrorMessage(null);
    resultBlobRef.current = null;
  }, [stopAll]);

  const download = useCallback(() => {
    if (!resultBlobRef.current || !outputFileName) return;
    const url = URL.createObjectURL(resultBlobRef.current);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = outputFileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [outputFileName]);

  return {
    state,
    uploadPercent,
    outputFileName,
    outputSizeBytes,
    originalSizeBytes,
    reductionPercent,
    errorMessage,
    setFiles,
    start,
    cancel,
    reset,
    download,
  };
}

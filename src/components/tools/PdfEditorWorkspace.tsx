import { useState } from "react";
import type { ToolDefinition } from "../../types/tool";
import { loadPdfDocument, renderPageThumbnail, PdfLoadError } from "../../lib/processing/pdfThumbnails";
import { applyPdfEdits, PdfEditError, type PdfEditorPage, type PdfTextAnnotation } from "../../lib/processing/pdfEditorApply";
import { FileDropZone } from "./FileDropZone";
import { PrivacyNotice } from "./PrivacyNotice";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { ProgressIndicator } from "../ui/ProgressIndicator";
import { DownloadButton } from "../ui/DownloadButton";
import { downloadBlob } from "../../lib/downloadBlob";

interface EditorPage extends PdfEditorPage {
  thumbnail: string;
}

type Phase = "empty" | "loading" | "editing" | "applying" | "completed" | "error";

const THUMB_SIZES: Record<"small" | "medium" | "large", number> = { small: 110, medium: 160, large: 220 };

/**
 * Dedicated MVP PDF editor workspace — page management (reorder, rotate,
 * delete) via PDF.js previews + pdf-lib edits, plus adding simple text
 * annotations by clicking a position on a page. This intentionally does
 * NOT fit the generic UploadWorkspace/ClientToolWorkspace mold (a single
 * upload -> one-click process -> result flow): editing is inherently
 * interactive and per-page, so it gets its own workspace, still built
 * from the same reusable primitives (FileDropZone, PrivacyNotice,
 * Button, Alert, ProgressIndicator, DownloadButton) as every other tool.
 *
 * Freehand drawing, highlighting, shapes, and signature images are
 * deliberately NOT implemented — see the tool's own FAQ entry — rather
 * than shipping an unreliable approximation of them.
 */
export function PdfEditorWorkspace({ tool }: { tool: ToolDefinition }) {
  const [phase, setPhase] = useState<Phase>("empty");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<EditorPage[]>([]);
  const [annotations, setAnnotations] = useState<PdfTextAnnotation[]>([]);
  const [thumbSize, setThumbSize] = useState<"small" | "medium" | "large">("medium");
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [pendingText, setPendingText] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFile = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPhase("loading");
    setErrorMessage(null);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await loadPdfDocument(file);
      const nextPages: EditorPage[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const thumbnail = await renderPageThumbnail(doc, i, THUMB_SIZES[thumbSize]);
        nextPages.push({ originalIndex: i - 1, rotation: 0, deleted: false, thumbnail });
      }
      setOriginalBytes(bytes);
      setPages(nextPages);
      setFileName(file.name);
      setPhase("editing");
    } catch (err) {
      setErrorMessage(err instanceof PdfLoadError ? err.message : "This file couldn't be opened as a PDF.");
      setPhase("error");
    }
  };

  const movePage = (from: number, to: number) => {
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (((p.rotation + 90) % 360) as 0 | 90 | 180 | 270) } : p))
    );
  };

  const toggleDeletePage = (index: number) => {
    setPages((prev) => prev.map((p, i) => (i === index ? { ...p, deleted: !p.deleted } : p)));
  };

  const addAnnotation = () => {
    if (activePageIndex === null || !pendingText.trim()) return;
    const page = pages[activePageIndex];
    setAnnotations((prev) => [...prev, { originalIndex: page.originalIndex, xPct: 0.1, yPct: 0.1, text: pendingText.trim() }]);
    setPendingText("");
  };

  const handleApply = async () => {
    if (!originalBytes) return;
    setPhase("applying");
    setErrorMessage(null);
    try {
      const blob = await applyPdfEdits(originalBytes, pages, annotations);
      setResultBlob(blob);
      setPhase("completed");
    } catch (err) {
      setErrorMessage(err instanceof PdfEditError ? err.message : "Something went wrong applying your edits.");
      setPhase("editing");
    }
  };

  const handleReset = () => {
    setPhase("empty");
    setOriginalBytes(null);
    setPages([]);
    setAnnotations([]);
    setActivePageIndex(null);
    setPendingText("");
    setResultBlob(null);
    setErrorMessage(null);
  };

  const activePageCount = pages.filter((p) => !p.deleted).length;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
      {phase === "empty" && (
        <>
          <FileDropZone
            acceptedFormats={tool.acceptedFormats}
            acceptedMime={tool.acceptedMime}
            maxFileSizeMB={tool.maxFileSize}
            multiple={false}
            onFilesAdded={handleFile}
          />
          <PrivacyNotice processingMode={tool.processingMode} />
        </>
      )}

      {phase === "loading" && <ProgressIndicator variant="indeterminate" label="Opening your PDF…" />}

      {(phase === "editing" || phase === "applying") && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">{fileName}</p>
              <p className="text-xs text-neutral-600">
                {pages.length} page{pages.length === 1 ? "" : "s"} · {activePageCount} will be kept
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="thumb-size" className="text-xs text-neutral-600">
                Zoom
              </label>
              <select
                id="thumb-size"
                value={thumbSize}
                onChange={(e) => setThumbSize(e.target.value as "small" | "medium" | "large")}
                className="focus-ring h-9 rounded-[var(--radius-control)] border border-neutral-200 bg-white px-2 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {pages.map((page, i) => (
              <div
                key={`${page.originalIndex}-${i}`}
                className={`flex flex-col gap-2 rounded-lg border p-2 ${
                  page.deleted ? "border-error-600/40 bg-error-50 opacity-60" : activePageIndex === i ? "border-brand-600" : "border-neutral-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActivePageIndex(i)}
                  className="focus-ring relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-50"
                  aria-label={`Page ${i + 1}${page.deleted ? " (deleted)" : ""}`}
                >
                  <img
                    src={page.thumbnail}
                    alt=""
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                    className="w-full transition-transform"
                  />
                  {annotations.some((a) => a.originalIndex === page.originalIndex) && (
                    <span className="absolute left-1 top-1 rounded bg-error-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Aa</span>
                  )}
                </button>
                <p className="text-center text-xs text-neutral-600">Page {i + 1}</p>
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => movePage(i, i - 1)}
                    className="focus-ring rounded p-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                    aria-label="Move page earlier"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={i === pages.length - 1}
                    onClick={() => movePage(i, i + 1)}
                    className="focus-ring rounded p-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
                    aria-label="Move page later"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => rotatePage(i)}
                    className="focus-ring rounded p-1 text-neutral-600 hover:bg-neutral-100"
                    aria-label="Rotate page 90 degrees"
                  >
                    ⟳
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDeletePage(i)}
                    className="focus-ring rounded p-1 text-error-600 hover:bg-error-50"
                    aria-label={page.deleted ? "Restore page" : "Delete page"}
                  >
                    {page.deleted ? "↺" : "✕"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-neutral-900">Add text</p>
            {activePageIndex === null ? (
              <p className="text-xs text-neutral-600">Click a page above to add text to it.</p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={pendingText}
                  onChange={(e) => setPendingText(e.target.value)}
                  placeholder={`Text to add to page ${activePageIndex + 1}`}
                  className="focus-ring h-11 flex-1 rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
                />
                <Button variant="secondary" onClick={addAnnotation} disabled={!pendingText.trim()}>
                  Add to page {activePageIndex + 1}
                </Button>
              </div>
            )}
          </div>

          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

          <PrivacyNotice processingMode={tool.processingMode} />

          {phase === "applying" ? (
            <ProgressIndicator variant="indeterminate" label="Applying your edits…" />
          ) : (
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleApply} disabled={activePageCount === 0}>
                Apply edits & download
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                Start over
              </Button>
            </div>
          )}
        </div>
      )}

      {phase === "completed" && resultBlob && (
        <div className="flex flex-col items-center gap-4 rounded-xl border-t-[3px] border-success-600 bg-white p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-50 text-xl text-success-600" aria-hidden="true">
            ✓
          </span>
          <p className="text-base font-semibold text-neutral-900">Your edited PDF is ready</p>
          <DownloadButton
            fileName={`edited-${fileName || "document.pdf"}`}
            onDownload={() => downloadBlob(resultBlob, `edited-${fileName || "document.pdf"}`)}
          />
          <button type="button" onClick={handleReset} className="focus-ring rounded text-sm font-medium text-brand-600 hover:underline">
            Edit another PDF
          </button>
        </div>
      )}

      {phase === "error" && pages.length === 0 && (
        <div className="flex flex-col gap-4">
          <Alert variant="error" title="We couldn't open this PDF">
            {errorMessage}
          </Alert>
          <Button variant="primary" onClick={handleReset}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

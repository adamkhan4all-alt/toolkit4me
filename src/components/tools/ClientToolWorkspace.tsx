import { useEffect, useRef, useState } from "react";
import type { ToolDefinition } from "../../types/tool";
import type { PdfPageSize } from "../../lib/processing/pdfProcessing";
import { getClientProcessor } from "../../lib/processing/clientProcessors";
import { convertImage, getImageDimensions } from "../../lib/processing/imageProcessing";
import { useClientProcessing } from "../../hooks/useClientProcessing";
import { validateFiles } from "../../lib/validateFiles";
import { formatFileSize } from "../../lib/format";
import { FileDropZone } from "./FileDropZone";
import { FileList } from "./FileList";
import { ProcessButton } from "./ProcessButton";
import { PrivacyNotice } from "./PrivacyNotice";
import { ClientResultList } from "./ClientResultList";
import { CompressionControls } from "./CompressionControls";
import { ToolOptions } from "./ToolOptions";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { ProgressIndicator } from "../ui/ProgressIndicator";

const PAGE_SIZE_CHOICES: { value: PdfPageSize; label: string }[] = [
  { value: "a4", label: "A4" },
  { value: "letter", label: "Letter" },
  { value: "fit", label: "Fit to image" },
];

/**
 * Real, client-side workspace for tools backed by a registered
 * ClientProcessor (Compress Image, JPG↔PNG, JPG to PDF). Files are never
 * uploaded — everything here runs via Canvas / jsPDF in the browser.
 * Falls back gracefully (renders nothing usable) if a tool has no
 * registered processor; ToolPage only mounts this when one exists.
 */
export function ClientToolWorkspace({ tool }: { tool: ToolDefinition }) {
  const processor = getClientProcessor(tool.id);
  const [files, setFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // compress-image controls
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("original");
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number | undefined>(undefined);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);

  // jpg-to-pdf controls
  const [pageSize, setPageSize] = useState<PdfPageSize>("a4");

  // split-pdf controls — reuses the same generic ToolOptions component
  // SERVER-mode tools use, driven by tool.options from the ToolDefinition.
  const [splitOptionValues, setSplitOptionValues] = useState<Record<string, string>>(
    () => Object.fromEntries((tool.options ?? []).map((o) => [o.id, o.defaultValue]))
  );

  const { state, results, errorMessage, setHasFiles, run, cancel, reset } = useClientProcessing(
    processor ?? (async () => [])
  );

  const isCompress = tool.id === "compress-image";
  const isPdf = tool.id === "jpg-to-pdf";
  const isSplit = tool.id === "split-pdf";

  // Load original dimensions for the live compression estimate.
  useEffect(() => {
    if (!isCompress || files.length !== 1) {
      setOriginalWidth(undefined);
      return;
    }
    let cancelled = false;
    getImageDimensions(files[0])
      .then((d) => !cancelled && setOriginalWidth(d.width))
      .catch(() => !cancelled && setOriginalWidth(undefined));
    return () => {
      cancelled = true;
    };
  }, [files, isCompress]);

  // Debounced live estimate: only for a single file, to keep this cheap.
  const estimateToken = useRef(0);
  useEffect(() => {
    if (!isCompress || files.length !== 1 || state !== "selected") {
      setEstimatedSize(null);
      return;
    }
    const token = ++estimateToken.current;
    setEstimating(true);
    const timeout = window.setTimeout(async () => {
      try {
        const targetFormat: "jpeg" | "png" =
          outputFormat === "png" ? "png" : outputFormat === "jpeg" ? "jpeg" : files[0].type === "image/png" ? "png" : "jpeg";
        const { blob } = await convertImage(files[0], {
          format: targetFormat,
          quality: quality / 100,
          maxWidth: maxWidth ?? undefined,
        });
        if (estimateToken.current === token) {
          setEstimatedSize(blob.size);
        }
      } catch {
        if (estimateToken.current === token) setEstimatedSize(null);
      } finally {
        if (estimateToken.current === token) setEstimating(false);
      }
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [files, isCompress, outputFormat, quality, maxWidth, state]);

  if (!processor) {
    return (
      <Alert variant="error" title="This tool isn't available yet">
        Client-side processing for this tool hasn't been implemented.
      </Alert>
    );
  }

  const addFiles = (incoming: File[]) => {
    const { valid, error } = validateFiles(tool, incoming, files.length);
    if (error) {
      setValidationError(error.message);
      return;
    }
    setValidationError(null);
    const next = tool.multiple ? [...files, ...valid] : valid;
    setFiles(next);
    setHasFiles(next.length > 0);
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setHasFiles(next.length > 0);
    setValidationError(null);
  };

  const replaceFile = () => {
    setFiles([]);
    setHasFiles(false);
    setValidationError(null);
  };

  const reorderFiles = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleReset = () => {
    setFiles([]);
    setValidationError(null);
    setMaxWidth(null);
    reset();
  };

  const handleStart = () => {
    run(files, {
      quality,
      outputFormat,
      maxWidth: maxWidth ?? undefined,
      pageSize,
      mode: splitOptionValues.mode,
      ranges: splitOptionValues.ranges,
      everyN: splitOptionValues.everyN,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
      {(state === "empty" || state === "selected") && (
        <>
          {files.length === 0 ? (
            <FileDropZone
              acceptedFormats={tool.acceptedFormats}
              acceptedMime={tool.acceptedMime}
              maxFileSizeMB={tool.maxFileSize}
              multiple={tool.multiple}
              onFilesAdded={addFiles}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <FileList
                files={files}
                multiple={tool.multiple}
                onRemove={removeFile}
                onReplace={replaceFile}
                showDimensions
                reorderable={isPdf}
                onReorder={reorderFiles}
              />

              {tool.multiple && (
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => document.getElementById(`add-more-${tool.slug}`)?.click()}>
                    Add more files
                  </Button>
                  <input
                    id={`add-more-${tool.slug}`}
                    type="file"
                    accept={tool.acceptedMime.join(",")}
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) addFiles(Array.from(e.target.files));
                      // Reset so re-selecting the same file(s) after removal fires onChange again.
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {isCompress && (
                <>
                  <CompressionControls
                    quality={quality}
                    onQualityChange={setQuality}
                    outputFormat={outputFormat}
                    onOutputFormatChange={setOutputFormat}
                    maxWidth={maxWidth}
                    onMaxWidthChange={setMaxWidth}
                    originalWidth={originalWidth}
                  />
                  {files.length === 1 && (
                    <p className="text-sm text-neutral-600">
                      Estimated output size:{" "}
                      {estimating ? (
                        <span className="text-neutral-400">calculating…</span>
                      ) : estimatedSize !== null ? (
                        <span className="font-medium text-neutral-900">
                          {formatFileSize(estimatedSize)}
                          {files[0].size > 0 && (
                            <span className="ml-1 text-neutral-400">
                              (original {formatFileSize(files[0].size)})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-neutral-400">unavailable</span>
                      )}
                    </p>
                  )}
                </>
              )}

              {isPdf && (
                <div className="rounded-lg border border-neutral-200 bg-white p-4">
                  <label className="mb-2 block text-sm font-semibold text-neutral-900" htmlFor="page-size">
                    Page size
                  </label>
                  <select
                    id="page-size"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as PdfPageSize)}
                    className="focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
                  >
                    {PAGE_SIZE_CHOICES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {files.length > 1 && (
                    <p className="mt-2 text-xs text-neutral-400">Use the ▲▼ controls above to reorder pages.</p>
                  )}
                </div>
              )}

              {isSplit && tool.options && (
                <ToolOptions
                  options={tool.options}
                  values={splitOptionValues}
                  onChange={(id, value) => setSplitOptionValues((prev) => ({ ...prev, [id]: value }))}
                />
              )}
            </div>
          )}

          {validationError && <Alert variant="error">{validationError}</Alert>}

          <PrivacyNotice processingMode={tool.processingMode} />

          <ProcessButton label={tool.actionLabel} disabled={files.length === 0} onClick={handleStart} />
        </>
      )}

      {state === "processing" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <ProgressIndicator variant="indeterminate" label="Processing your file…" />
          <p className="text-xs text-neutral-400">Running locally in your browser — usually just a moment</p>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
        </div>
      )}

      {state === "completed" && <ClientResultList results={results} onReset={handleReset} />}

      {state === "error" && (
        <div className="flex flex-col gap-4">
          <Alert variant="error" title="We couldn't process your file">
            {errorMessage}
          </Alert>
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleReset}>
              Try again
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Start over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

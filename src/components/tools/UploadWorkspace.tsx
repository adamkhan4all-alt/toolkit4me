import { useState } from "react";
import type { ToolDefinition } from "../../types/tool";
import { useServerProcessing } from "../../hooks/useServerProcessing";
import { FileDropZone } from "./FileDropZone";
import { FileList } from "./FileList";
import { ToolOptions } from "./ToolOptions";
import { ProcessButton } from "./ProcessButton";
import { ProcessingState } from "./ProcessingState";
import { ResultCard } from "./ResultCard";
import { PrivacyNotice } from "./PrivacyNotice";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { formatFileSize } from "../../lib/format";
import { validateFiles } from "../../lib/validateFiles";

/**
 * The single reusable upload/process/result workspace for every SERVER-
 * mode tool. Every such tool page renders exactly this component,
 * parameterized by its ToolDefinition — no tool-specific branching lives
 * here beyond reading fields off `tool`. Real file upload, job polling,
 * and download all go through `useServerProcessing`, which talks to the
 * actual backend (src/config/api.ts) — nothing here is simulated.
 */
export function UploadWorkspace({ tool }: { tool: ToolDefinition }) {
  const [files, setFilesState] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [optionValues, setOptionValues] = useState<Record<string, string>>(
    () => Object.fromEntries((tool.options ?? []).map((o) => [o.id, o.defaultValue]))
  );

  const {
    state,
    uploadPercent,
    outputFileName,
    outputSizeBytes,
    reductionPercent,
    errorMessage,
    setFiles: setWorkflowFiles,
    start,
    cancel,
    reset,
    download,
  } = useServerProcessing(tool);

  const addFiles = (incoming: File[]) => {
    const { valid, error } = validateFiles(tool, incoming, files.length);
    if (error) {
      setValidationError(error.message);
      return;
    }
    setValidationError(null);
    const next = tool.multiple ? [...files, ...valid] : valid;
    setFilesState(next);
    setWorkflowFiles(next.length > 0);
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFilesState(next);
    setWorkflowFiles(next.length > 0);
    setValidationError(null);
  };

  const replaceFile = () => {
    setFilesState([]);
    setWorkflowFiles(false);
    setValidationError(null);
  };

  const handleStart = () => {
    // Generic, tool-agnostic convention: a tool that collects a
    // "confirmPassword" option alongside "password" (protect-pdf) gets its
    // match checked client-side before anything is uploaded. This is a
    // UX safety net only — the backend never receives or needs the
    // confirmation field itself.
    if ("confirmPassword" in optionValues) {
      if (optionValues.password !== optionValues.confirmPassword) {
        setValidationError("Passwords don't match.");
        return;
      }
      if (!optionValues.password) {
        setValidationError("Enter a password.");
        return;
      }
    }
    setValidationError(null);
    const { confirmPassword: _confirmPassword, ...submitValues } = optionValues;
    start(files, submitValues);
  };

  const handleReset = () => {
    setFilesState([]);
    setValidationError(null);
    reset();
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
              <FileList files={files} multiple={tool.multiple} onRemove={removeFile} onReplace={replaceFile} />

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

              {tool.options && tool.options.length > 0 && (
                <ToolOptions
                  options={tool.options}
                  values={optionValues}
                  onChange={(id, value) => setOptionValues((prev) => ({ ...prev, [id]: value }))}
                />
              )}
            </div>
          )}

          {validationError && <Alert variant="error">{validationError}</Alert>}

          <PrivacyNotice processingMode={tool.processingMode} />

          <ProcessButton label={tool.actionLabel} disabled={files.length === 0} onClick={handleStart} />
        </>
      )}

      {state === "uploading" && (
        <div className="flex flex-col gap-4">
          <FileList files={files} disabled multiple={tool.multiple} onRemove={() => {}} />
          <ProcessingState phase="uploading" percent={uploadPercent} onCancel={cancel} />
        </div>
      )}

      {state === "processing" && <ProcessingState phase="processing" onCancel={cancel} />}

      {state === "completed" && outputFileName && (
        <ResultCard
          fileName={outputFileName}
          fileSizeLabel={outputSizeBytes != null ? formatFileSize(outputSizeBytes) : undefined}
          statLabel={reductionPercent != null && reductionPercent > 0 ? `Reduced by ${reductionPercent}%` : undefined}
          onDownload={download}
          onReset={handleReset}
        />
      )}

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

      {state === "expired" && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-warning-600/30 bg-warning-50 p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-600 text-lg text-white" aria-hidden="true">
            ⏱
          </span>
          <p className="text-base font-semibold text-neutral-900">This file is no longer available</p>
          <p className="max-w-sm text-sm text-neutral-600">
            For your privacy, converted files are automatically deleted after 1 hour.
          </p>
          <Button variant="primary" onClick={handleReset}>
            Convert again
          </Button>
        </div>
      )}
    </div>
  );
}

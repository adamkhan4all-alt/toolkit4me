import type { ClientProcessOutput } from "../../lib/processing/clientProcessors";
import { formatFileSize } from "../../lib/format";
import { DownloadButton } from "../ui/DownloadButton";
import { Button } from "../ui/Button";
import { downloadBlob } from "../../lib/downloadBlob";

interface ClientResultListProps {
  results: ClientProcessOutput[];
  onReset: () => void;
}

function ReductionStat({ before, after }: { before: number; after: number }) {
  if (before <= 0) return null;
  const delta = Math.round((1 - after / before) * 100);
  if (delta <= 0) {
    return <p className="mt-1 text-sm font-medium text-neutral-600">No size reduction for this file</p>;
  }
  return <p className="mt-1 text-sm font-medium text-success-600">Reduced by {delta}%</p>;
}

/**
 * Renders one or more real, downloadable results — a single combined file
 * (JPG to PDF) or one row per input file (Compress Image, JPG to PNG, PNG
 * to JPG) — each with an accurate before/after file size comparison.
 */
export function ClientResultList({ results, onReset }: ClientResultListProps) {
  const isBatch = results.length > 1;

  const downloadAll = () => {
    results.forEach((r, i) => {
      window.setTimeout(() => downloadBlob(r.blob, r.fileName), i * 200);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border-t-[3px] border-success-600 bg-white p-6">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-50 text-xl text-success-600"
            aria-hidden="true"
          >
            ✓
          </span>
          <div>
            <p className="text-base font-semibold text-neutral-900">
              {isBatch ? `${results.length} files ready` : "Your file is ready"}
            </p>
            <p className="text-sm text-neutral-600">Processed locally in your browser.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <div
              key={r.fileName}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{r.fileName}</p>
                <p className="text-xs text-neutral-600">
                  {formatFileSize(r.originalSizeBytes)} → {formatFileSize(r.outputSizeBytes)}
                  {r.width && r.height ? ` · ${r.width} × ${r.height}px` : ""}
                </p>
                <ReductionStat before={r.originalSizeBytes} after={r.outputSizeBytes} />
              </div>
              <DownloadButton fileName={r.fileName} onDownload={() => downloadBlob(r.blob, r.fileName)} />
            </div>
          ))}
        </div>

        {isBatch && (
          <Button variant="secondary" onClick={downloadAll}>
            Download all ({results.length})
          </Button>
        )}
      </div>

      <button type="button" onClick={onReset} className="focus-ring self-center rounded text-sm font-medium text-brand-600 hover:underline">
        Convert another file
      </button>
    </div>
  );
}

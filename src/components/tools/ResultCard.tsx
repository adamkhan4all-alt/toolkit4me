import { DownloadButton } from "../ui/DownloadButton";

interface ResultCardProps {
  fileName: string;
  fileSizeLabel?: string;
  statLabel?: string;
  onDownload: () => void;
  onReset: () => void;
  extraAction?: { label: string; onClick: () => void };
}

export function ResultCard({ fileName, fileSizeLabel, statLabel, onDownload, onReset, extraAction }: ResultCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border-t-[3px] border-success-600 bg-white p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-2xl text-success-600" aria-hidden="true">
        ✓
      </span>
      <div>
        <p className="text-base font-semibold text-neutral-900">{fileName}</p>
        {fileSizeLabel && <p className="text-sm text-neutral-600">{fileSizeLabel}</p>}
        {statLabel && <p className="mt-1 text-sm font-medium text-success-600">{statLabel}</p>}
      </div>
      <DownloadButton fileName={fileName} onDownload={onDownload} />
      <div className="flex items-center gap-4">
        <button type="button" onClick={onReset} className="focus-ring rounded text-sm font-medium text-brand-600 hover:underline">
          Convert another file
        </button>
        {extraAction && (
          <button
            type="button"
            onClick={extraAction.onClick}
            className="focus-ring rounded text-sm font-medium text-brand-600 hover:underline"
          >
            {extraAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

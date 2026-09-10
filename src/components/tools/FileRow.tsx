import { formatFileSize } from "../../lib/format";
import { FilePreview } from "./FilePreview";
import { DimensionsBadge } from "./DimensionsBadge";

interface FileRowProps {
  file: File;
  disabled?: boolean;
  onRemove: () => void;
  onReplace?: () => void;
  /** Shows the image's pixel dimensions next to its size (client-side image tools). */
  showDimensions?: boolean;
  /** Reorder controls, used by multi-file tools like JPG to PDF. */
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function FileRow({ file, disabled, onRemove, onReplace, showDimensions, onMoveUp, onMoveDown }: FileRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
      {(onMoveUp || onMoveDown) && (
        <div className="flex shrink-0 flex-col gap-0.5">
          <button
            type="button"
            disabled={disabled || !onMoveUp}
            onClick={onMoveUp}
            aria-label={`Move ${file.name} earlier`}
            className="focus-ring flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={disabled || !onMoveDown}
            onClick={onMoveDown}
            aria-label={`Move ${file.name} later`}
            className="focus-ring flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 disabled:opacity-30"
          >
            ▼
          </button>
        </div>
      )}
      <FilePreview file={file} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900">{file.name}</p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-neutral-600">{formatFileSize(file.size)}</p>
          {showDimensions && <DimensionsBadge file={file} />}
        </div>
      </div>
      {onReplace && (
        <button
          type="button"
          disabled={disabled}
          onClick={onReplace}
          className="focus-ring rounded text-sm font-medium text-brand-600 hover:underline disabled:opacity-50"
        >
          Replace
        </button>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-error-50 hover:text-error-600 disabled:opacity-50"
      >
        ✕
      </button>
    </div>
  );
}

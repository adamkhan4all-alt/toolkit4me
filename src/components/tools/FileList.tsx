import { FileRow } from "./FileRow";
import { formatFileSize } from "../../lib/format";

interface FileListProps {
  files: File[];
  disabled?: boolean;
  multiple: boolean;
  onRemove: (index: number) => void;
  onReplace?: () => void;
  showDimensions?: boolean;
  /** Enables drag-order (▲▼) controls — used by JPG to PDF to reorder pages before converting. */
  reorderable?: boolean;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

/** Renders the list of currently-selected files plus an aggregate size summary for multi-file tools. */
export function FileList({
  files,
  disabled,
  multiple,
  onRemove,
  onReplace,
  showDimensions,
  reorderable,
  onReorder,
}: FileListProps) {
  if (files.length === 0) return null;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="flex flex-col gap-2">
      {files.map((file, i) => (
        <FileRow
          key={`${file.name}-${file.size}-${i}`}
          file={file}
          disabled={disabled}
          onRemove={() => onRemove(i)}
          onReplace={!multiple ? onReplace : undefined}
          showDimensions={showDimensions}
          onMoveUp={reorderable && i > 0 ? () => onReorder?.(i, i - 1) : undefined}
          onMoveDown={reorderable && i < files.length - 1 ? () => onReorder?.(i, i + 1) : undefined}
        />
      ))}
      {multiple && (
        <p className="text-xs text-neutral-600">
          {files.length} file{files.length > 1 ? "s" : ""} · {formatFileSize(totalSize)} total
        </p>
      )}
    </div>
  );
}

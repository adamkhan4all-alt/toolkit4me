import { useRef, useState, type DragEvent } from "react";

interface FileDropZoneProps {
  acceptedFormats: string[];
  acceptedMime: string[];
  maxFileSizeMB: number;
  multiple: boolean;
  onFilesAdded: (files: File[]) => void;
}

/** Reusable drag-and-drop + file-picker upload surface used by every tool. */
export function FileDropZone({
  acceptedFormats,
  acceptedMime,
  maxFileSizeMB,
  multiple,
  onFilesAdded,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFilesAdded(Array.from(fileList));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload ${acceptedFormats.join(", ")} file${multiple ? "s" : ""}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`focus-ring flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:min-h-[240px] ${
        dragging ? "border-brand-600 bg-brand-50" : "border-neutral-200 bg-white hover:border-brand-600"
      }`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-2xl" aria-hidden="true">
        ⬆
      </span>
      <div>
        <p className="text-base font-semibold text-neutral-900">Drag &amp; drop your file{multiple ? "s" : ""} here</p>
        <p className="text-sm text-neutral-600">or click to browse</p>
      </div>
      <p className="text-xs text-neutral-400">
        Supported format{acceptedFormats.length > 1 ? "s" : ""}: {acceptedFormats.join(", ")} · Max size: {maxFileSizeMB}MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedMime.join(",")}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

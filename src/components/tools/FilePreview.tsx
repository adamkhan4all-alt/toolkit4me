import { useEffect, useState } from "react";

/**
 * Small thumbnail preview for an image file. Falls back to a type-glyph
 * badge for non-image files (PDF, DOCX, ...) since there's nothing to
 * render as an image. Object URLs are created/revoked per file so
 * previews never leak memory as files are added/removed.
 */
export function FilePreview({ file }: { file: File }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (isImage && objectUrl) {
    return (
      <img
        src={objectUrl}
        alt={`Preview of ${file.name}`}
        className="h-10 w-10 shrink-0 rounded-md object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-xs font-semibold text-neutral-600"
    >
      {file.name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE"}
    </span>
  );
}

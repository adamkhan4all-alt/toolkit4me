import { useEffect, useState } from "react";
import { getImageDimensions } from "../../lib/processing/imageProcessing";

/** Reads and displays an image file's pixel dimensions (e.g. "1920 × 1080 px"). */
export function DimensionsBadge({ file }: { file: File }) {
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getImageDimensions(file)
      .then((d) => {
        if (!cancelled) setDims(d);
      })
      .catch(() => {
        if (!cancelled) setDims(null);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (!dims) return null;
  return (
    <span className="text-xs text-neutral-400">
      {dims.width} × {dims.height} px
    </span>
  );
}

interface CompressionControlsProps {
  quality: number;
  onQualityChange: (value: number) => void;
  outputFormat: string;
  onOutputFormatChange: (value: string) => void;
  maxWidth: number | null;
  onMaxWidthChange: (value: number | null) => void;
  originalWidth?: number;
}

const OUTPUT_FORMAT_CHOICES = [
  { value: "original", label: "Keep original format" },
  { value: "jpeg", label: "JPG" },
  { value: "png", label: "PNG" },
];

/** Quality, output format, and optional resize controls for Compress Image. */
export function CompressionControls({
  quality,
  onQualityChange,
  outputFormat,
  onOutputFormatChange,
  maxWidth,
  onMaxWidthChange,
  originalWidth,
}: CompressionControlsProps) {
  const qualityDisabled = outputFormat === "png";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-neutral-900" htmlFor="output-format">
          Output format
        </label>
        <select
          id="output-format"
          value={outputFormat}
          onChange={(e) => onOutputFormatChange(e.target.value)}
          className="focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
        >
          {OUTPUT_FORMAT_CHOICES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-semibold text-neutral-900" htmlFor="quality-slider">
            Quality
          </label>
          <span className="text-sm text-neutral-600">{qualityDisabled ? "Lossless (PNG)" : `${quality}%`}</span>
        </div>
        <input
          id="quality-slider"
          type="range"
          min={10}
          max={100}
          step={5}
          value={quality}
          disabled={qualityDisabled}
          onChange={(e) => onQualityChange(Number(e.target.value))}
          className="focus-ring h-2 w-full cursor-pointer accent-[var(--color-brand-600)] disabled:cursor-not-allowed disabled:opacity-50"
          aria-valuetext={`${quality}%`}
        />
        <div className="mt-1 flex justify-between text-xs text-neutral-400">
          <span>Smaller file</span>
          <span>Higher quality</span>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-neutral-900" htmlFor="max-width">
          Resize (optional)
        </label>
        <div className="flex items-center gap-2">
          <input
            id="max-width"
            type="number"
            min={1}
            placeholder={originalWidth ? `Original: ${originalWidth}px wide` : "Max width in px"}
            value={maxWidth ?? ""}
            onChange={(e) => onMaxWidthChange(e.target.value ? Number(e.target.value) : null)}
            className="focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
          />
          <span className="shrink-0 text-sm text-neutral-600">px wide</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">Leave blank to keep the original dimensions.</p>
      </div>
    </div>
  );
}

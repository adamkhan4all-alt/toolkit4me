import { Button } from "../ui/Button";

interface ProcessButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

/** The primary per-tool call-to-action (e.g. "Convert to Word", "Compress PDF"). Sticky on mobile once enabled. */
export function ProcessButton({ label, disabled, onClick }: ProcessButtonProps) {
  return (
    <Button variant="primary" fullWidth disabled={disabled} onClick={onClick} className="sticky bottom-4 sm:static">
      {label}
    </Button>
  );
}

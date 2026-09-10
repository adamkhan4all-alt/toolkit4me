import { Button } from "../ui/Button";
import { ProgressIndicator } from "../ui/ProgressIndicator";

interface UploadingProps {
  phase: "uploading";
  percent: number;
  onCancel: () => void;
}

interface ProcessingProps {
  phase: "processing";
  onCancel: () => void;
}

type ProcessingStateProps = UploadingProps | ProcessingProps;

/**
 * Shared visual for the two in-flight states (Uploading / Processing).
 * Uploading shows a real, measurable determinate bar; Processing shows an
 * indeterminate bar with honest copy — never a fabricated percentage,
 * per the UI/UX spec.
 */
export function ProcessingState(props: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      {props.phase === "uploading" ? (
        <ProgressIndicator variant="determinate" percent={props.percent} label={`Uploading — ${props.percent}%`} />
      ) : (
        <>
          <ProgressIndicator variant="indeterminate" label="Processing your file…" />
          <p className="text-xs text-neutral-400">Usually takes a few seconds</p>
        </>
      )}
      <Button variant="secondary" onClick={props.onCancel}>
        Cancel
      </Button>
    </div>
  );
}

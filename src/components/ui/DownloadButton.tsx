import { Button } from "./Button";

interface DownloadButtonProps {
  fileName: string;
  onDownload: () => void;
}

/** Primary action on the Completed state. Standalone so a result card, a text-result panel, etc. can all reuse it. */
export function DownloadButton({ fileName, onDownload }: DownloadButtonProps) {
  return (
    <Button variant="primary" fullWidth onClick={onDownload}>
      Download {fileName}
    </Button>
  );
}

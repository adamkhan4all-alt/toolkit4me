import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title = "Something went wrong", message, onRetry, retryLabel = "Try again" }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-error-600/30 bg-error-50 p-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-600 text-lg font-bold text-white" aria-hidden="true">
        ✕
      </span>
      <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
      <p className="max-w-sm text-sm text-neutral-600">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

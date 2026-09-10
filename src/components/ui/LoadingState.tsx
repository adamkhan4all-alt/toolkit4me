export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center" role="status" aria-live="polite">
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600"
        aria-hidden="true"
      />
      <p className="text-sm text-neutral-600">{label}</p>
    </div>
  );
}

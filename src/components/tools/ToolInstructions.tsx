/** "How it works" numbered step list, unique copy per tool (SEO requirement — no shared boilerplate text). */
export function ToolInstructions({ steps }: { steps: string[] }) {
  return (
    <section aria-labelledby="how-it-works-heading" className="flex flex-col gap-4">
      <h2 id="how-it-works-heading" className="text-2xl font-semibold text-neutral-900">
        How it works
      </h2>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <span className="text-sm text-neutral-900">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

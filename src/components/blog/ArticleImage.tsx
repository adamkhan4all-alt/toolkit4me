import type { ArticleFigure, FigureKind } from "../../data/blog/types";

/** Every figure says what it is, so an illustration is never mistaken for real tool output. */
const FIGURE_KIND_LABEL: Record<FigureKind, string> = {
  illustration: "Illustration",
  diagram: "Diagram",
  screenshot: "Screenshot",
  result: "Real result",
};

/**
 * Article figure with fixed width/height (no layout shift). Below-the-fold images lazy-load;
 * the hero passes `priority` so it loads straight away.
 */
export function ArticleImage({ figure, priority = false, className = "" }: { figure: ArticleFigure; priority?: boolean; className?: string }) {
  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <img
        src={figure.src}
        alt={figure.alt}
        width={figure.width}
        height={figure.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="h-auto w-full rounded-xl border border-neutral-200 bg-white"
      />
      <figcaption className="text-xs leading-5 text-neutral-600">
        <span className="font-semibold text-neutral-700">{FIGURE_KIND_LABEL[figure.kind]}</span>
        {figure.caption ? <> — {figure.caption}</> : null}
      </figcaption>
    </figure>
  );
}

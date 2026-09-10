import { useState } from "react";
import type { ToolFaqEntry } from "../../types/tool";

/** Accordion FAQ block, one per tool page, driven by ToolDefinition.faq. */
export function FAQ({ items }: { items: ToolFaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span className="text-sm font-semibold text-neutral-900">{item.question}</span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
            {isOpen && <p className="px-5 pb-4 text-sm text-neutral-600">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

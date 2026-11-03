/**
 * Plain bulleted list section used for a tool's "Common uses" and
 * "Limitations" — unique, verified copy per tool from its ToolDefinition.
 * Styled like the page's other text sections; renders nothing when empty.
 */
export function ToolNotes({ id, heading, items }: { id: string; heading: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-2xl font-semibold text-neutral-900">
        {heading}
      </h2>
      <ul className="ml-5 flex list-disc flex-col gap-1.5 text-sm leading-6 text-neutral-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

import type { GuideSection } from "../../data/guideMeta";
import type { ToolContentSection } from "../../types/tool";

/** Body of a content section (paragraphs, list, table, figure) — shared by guide articles and tool pages' extra sections. */
export function SectionBody({ section }: { section: GuideSection | ToolContentSection }) {
  return (
    <>
      {section.paragraphs?.map((p) => (
        <p key={p} className="text-sm leading-7 text-neutral-600">
          {p}
        </p>
      ))}
      {section.list && (
        <ul className="ml-5 flex list-disc flex-col gap-1.5 text-sm leading-6 text-neutral-600">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.table && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <caption className="px-3 py-2 text-left text-xs text-neutral-600">{section.table.caption}</caption>
            <thead className="bg-neutral-100 text-neutral-900">
              <tr>
                {section.table.headers.map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row) => (
                <tr key={row.join("|")} className="border-t border-neutral-200">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="px-3 py-2 font-medium text-neutral-900">
                        {cell}
                      </th>
                    ) : (
                      <td key={i} className="px-3 py-2 text-neutral-600">
                        {cell}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {"image" in section && section.image && (
        <figure className="flex flex-col gap-2">
          <img
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width}
            height={section.image.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-lg border border-neutral-200"
          />
          {section.image.caption && <figcaption className="text-xs text-neutral-600">{section.image.caption}</figcaption>}
        </figure>
      )}
    </>
  );
}

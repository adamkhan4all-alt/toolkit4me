import type { ToolOption } from "../../types/tool";

interface ToolOptionsProps {
  options: ToolOption[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

/** Renders a tool's schema-driven options (select/radio) — e.g. compression level, language, page size. */
export function ToolOptions({ options, values, onChange }: ToolOptionsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4">
      {options.map((option) => (
        <div key={option.id}>
          <label className="mb-2 block text-sm font-semibold text-neutral-900" htmlFor={option.id}>
            {option.label}
          </label>

          {option.type === "select" ? (
            <select
              id={option.id}
              value={values[option.id] ?? option.defaultValue}
              onChange={(e) => onChange(option.id, e.target.value)}
              className="focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900"
            >
              {option.choices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-col gap-2">
              {option.choices.map((c) => (
                <label
                  key={c.value}
                  className="focus-ring flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 p-2.5 text-sm text-neutral-900 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    name={option.id}
                    value={c.value}
                    checked={(values[option.id] ?? option.defaultValue) === c.value}
                    onChange={(e) => onChange(option.id, e.target.value)}
                    className="h-4 w-4 accent-[var(--color-brand-600)]"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

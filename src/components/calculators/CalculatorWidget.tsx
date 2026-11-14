import { useId, useState, type FormEvent } from "react";
import { resultToText, visibleFields, type CalcResult, type CalculatorDefinition, type ColumnField, type Field, type RowValue, type Values } from "../../lib/calculators/engine";
import { copyToClipboard } from "../../lib/clipboard";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { useToast } from "../ui/ToastProvider";
import { calculatorEventBase, trackEvent } from "../../lib/analytics";
import type { CalculatorGroup } from "../../data/calculators/catalog";

const inputClass = "focus-ring h-11 w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white px-3 text-sm text-neutral-900 aria-[invalid=true]:border-error-600";
const labelClass = "mb-1.5 block text-sm font-semibold text-neutral-900";

function cloneValues(v: Values): Values {
  return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, Array.isArray(val) ? val.map((row) => ({ ...row })) : val]));
}

/**
 * Renders any calculator spec: fields, Calculate / Reset / example, and the result with copy.
 *
 * Analytics: only explicit actions are reported (Calculate, example, Reset, Copy), each once, with parameters from the
 * catalog (`calculatorId` / `category`, checked by calculatorEventBase). Live recalculation while editing is not
 * reported, and no value, result or text from the form is ever sent.
 */
export function CalculatorWidget({ definition, title, calculatorId, category }: { definition: CalculatorDefinition; title: string; calculatorId: string; category: CalculatorGroup }) {
  const { spec } = definition;
  const id = useId();
  const { showToast } = useToast();
  const [values, setValues] = useState<Values>(() => cloneValues(spec.defaults));
  const [result, setResult] = useState<CalcResult | null>(null);
  // After the first Calculate, results update live as values change.
  const [live, setLive] = useState(false);
  const analyticsBase = calculatorEventBase(calculatorId, category);

  const compute = (next: Values): CalcResult => {
    const r = spec.calculate(next);
    setResult(r);
    return r;
  };

  /** One explicit calculation: calculator_calculate, then calculator_result (ok / invalid). */
  const calculateExplicitly = (next: Values, trigger: "button" | "example") => {
    const r = compute(next);
    if (!analyticsBase) return;
    trackEvent("calculator_calculate", { ...analyticsBase, trigger });
    trackEvent("calculator_result", { ...analyticsBase, result_status: r.ok ? "ok" : "invalid" });
  };

  const update = (next: Values) => {
    setValues(next);
    if (live) compute(next); // live update: not reported
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLive(true);
    calculateExplicitly(values, "button");
  };

  const reset = () => {
    setValues(cloneValues(spec.defaults));
    setResult(null);
    setLive(false);
    if (analyticsBase) trackEvent("calculator_reset", { ...analyticsBase });
  };

  const loadExample = () => {
    const ex = cloneValues(spec.example);
    setValues(ex);
    setLive(true);
    calculateExplicitly(ex, "example");
  };

  const errors = result && !result.ok ? result.errors : {};
  const fields = visibleFields(spec, values);

  const copy = async () => {
    if (!result?.ok) return;
    const ok = await copyToClipboard(resultToText(title, result));
    showToast(ok ? "Result copied" : "Couldn't copy — select the result and copy it manually", ok ? "success" : "error");
    if (analyticsBase) trackEvent("calculator_copy_result", { ...analyticsBase, copy_status: ok ? "success" : "failed" });
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <FieldInput key={f.key} field={f} idPrefix={id} values={values} errors={errors} onChange={update} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Calculate</Button>
          <Button type="button" variant="secondary" onClick={reset}>
            Reset
          </Button>
          <Button type="button" variant="tertiary" onClick={loadExample}>
            Try the example
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {result && !result.ok && (
          <Alert variant="error" title="Check the highlighted fields">
            {result.message ?? Object.values(result.errors)[0] ?? "Some values aren't valid."}
          </Alert>
        )}
        {result?.ok && (
          <section aria-label="Result" className="flex flex-col gap-4 rounded-lg border border-brand-100 bg-brand-50 p-4 sm:p-5">
            <div>
              <p className="text-sm font-medium text-neutral-700">{result.headline.label}</p>
              <p className="text-2xl font-extrabold break-words text-neutral-900 sm:text-3xl">{result.headline.value}</p>
            </div>
            {result.rows && result.rows.length > 0 && (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <dt className="text-neutral-600">{row.label}</dt>
                    <dd className="font-semibold break-words text-neutral-900">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {result.steps && result.steps.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-neutral-600 uppercase">Working</p>
                {result.steps.map((s) => (
                  <p key={s} className="font-mono text-xs leading-6 break-words text-neutral-800">
                    {s}
                  </p>
                ))}
              </div>
            )}
            {result.notes?.map((n) => (
              <p key={n} className="text-sm text-neutral-700">
                {n}
              </p>
            ))}
            {result.table && (
              <div className="max-h-96 overflow-auto rounded-lg border border-neutral-200 bg-white">
                <table className="w-full text-left text-sm">
                  <caption className="px-3 py-2 text-left text-xs text-neutral-600">{result.table.caption}</caption>
                  <thead className="sticky top-0 bg-neutral-100 text-neutral-900">
                    <tr>
                      {result.table.headers.map((h) => (
                        <th key={h} scope="col" className="px-3 py-2 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.table.rows.map((row, i) => (
                      <tr key={i} className="border-t border-neutral-200">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-1.5 text-neutral-700 tabular-nums">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div>
              <Button type="button" variant="secondary" onClick={copy}>
                Copy result
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function FieldInput({ field, idPrefix, values, errors, onChange }: { field: Field; idPrefix: string; values: Values; errors: Record<string, string>; onChange: (v: Values) => void }) {
  const inputId = `${idPrefix}-${field.key}`;
  const error = errors[field.key];
  const value = typeof values[field.key] === "string" ? (values[field.key] as string) : "";
  const set = (v: string) => onChange({ ...values, [field.key]: v });
  const describedBy = [error ? `${inputId}-err` : "", field.help ? `${inputId}-help` : ""].filter(Boolean).join(" ") || undefined;
  const footer = (
    <>
      {field.help && !error && (
        <p id={`${inputId}-help`} className="mt-1 text-xs text-neutral-600">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${inputId}-err`} className="mt-1 text-xs text-error-600">
          {error}
        </p>
      )}
    </>
  );

  if (field.type === "rows") return <RowsInput field={field} idPrefix={idPrefix} values={values} errors={errors} onChange={onChange} />;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 self-end text-sm text-neutral-900 sm:col-span-2">
        <input type="checkbox" checked={value === "true"} onChange={(e) => set(e.target.checked ? "true" : "false")} className="h-4 w-4" />
        {field.label}
      </label>
    );
  }

  const wide = field.type === "textarea" || (field.type === "select" && field.options.some((o) => o.label.length > 34));
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={inputId} className={labelClass}>
        {field.label}
        {field.type === "number" && field.unit && <span className="font-normal text-neutral-600"> ({field.unit})</span>}
      </label>
      {field.type === "select" ? (
        <select id={inputId} value={value} onChange={(e) => set(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={describedBy} className={inputClass}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => set(e.target.value)}
          rows={4}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="focus-ring w-full rounded-[var(--radius-control)] border border-neutral-200 bg-white p-3 font-mono text-sm text-neutral-900 aria-[invalid=true]:border-error-600"
        />
      ) : (
        <input
          id={inputId}
          type={field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          step={field.type === "datetime" ? 1 : undefined}
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder={field.type === "number" || field.type === "text" ? field.placeholder : undefined}
          maxLength={field.type === "text" ? field.maxLength : 40}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={inputClass}
        />
      )}
      {footer}
    </div>
  );
}

function RowsInput({ field, idPrefix, values, errors, onChange }: { field: Extract<Field, { type: "rows" }>; idPrefix: string; values: Values; errors: Record<string, string>; onChange: (v: Values) => void }) {
  const rows = (Array.isArray(values[field.key]) ? values[field.key] : []) as RowValue[];
  const setRows = (next: RowValue[]) => onChange({ ...values, [field.key]: next });
  const blank = (): RowValue => Object.fromEntries(field.columns.map((c: ColumnField) => [c.key, c.type === "select" ? c.options[0].value : ""]));

  return (
    <fieldset className="flex flex-col gap-3 sm:col-span-2">
      <legend className={labelClass}>{field.label}</legend>
      {rows.map((row, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-600">
              {field.rowLabel} {i + 1}
            </span>
            {rows.length > field.minRows && (
              <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="focus-ring rounded px-1 text-xs font-semibold text-error-600 hover:underline" aria-label={`Remove ${field.rowLabel.toLowerCase()} ${i + 1}`}>
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {field.columns.map((col) => {
              const cellId = `${idPrefix}-${field.key}-${i}-${col.key}`;
              const err = errors[`${field.key}.${i}.${col.key}`];
              const v = row[col.key] ?? "";
              const setCell = (nv: string) => setRows(rows.map((r, j) => (j === i ? { ...r, [col.key]: nv } : r)));
              return (
                <div key={col.key}>
                  <label htmlFor={cellId} className="mb-1 block text-xs font-medium text-neutral-700">
                    {col.label}
                  </label>
                  {col.type === "select" ? (
                    <select id={cellId} value={v} onChange={(e) => setCell(e.target.value)} className={inputClass}>
                      {col.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={cellId}
                      value={v}
                      onChange={(e) => setCell(e.target.value)}
                      inputMode={col.type === "number" ? "decimal" : undefined}
                      maxLength={col.type === "text" ? col.maxLength : 40}
                      autoComplete="off"
                      aria-invalid={Boolean(err)}
                      aria-describedby={err ? `${cellId}-err` : undefined}
                      className={inputClass}
                    />
                  )}
                  {err && (
                    <p id={`${cellId}-err`} className="mt-1 text-xs text-error-600">
                      {err}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {errors[field.key] && <p className="text-xs text-error-600">{errors[field.key]}</p>}
      {rows.length < field.maxRows && (
        <div>
          <Button type="button" variant="secondary" onClick={() => setRows([...rows, blank()])}>
            + {field.addLabel}
          </Button>
        </div>
      )}
    </fieldset>
  );
}

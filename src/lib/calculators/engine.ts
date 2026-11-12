// ---------------------------------------------------------------------
// Calculator engine. A calculator is data: a list of fields, default and
// example values, and a pure `calculate(values)` that returns a result or
// field-level errors. One generic UI (components/calculators) renders any
// calculator; formulas live in ./formulas and are unit-tested on their own.
// ---------------------------------------------------------------------

import { parseDate, type PlainDate } from "./formulas/dates";
import type { ToolFaqEntry } from "../../types/tool";

export type RowValue = Record<string, string>;
export type Values = Record<string, string | RowValue[]>;

interface FieldBase {
  key: string;
  label: string;
  help?: string;
  /** Hide the field (and skip its validation) unless this returns true. */
  showIf?: (values: Values) => boolean;
}

export interface NumberField extends FieldBase {
  type: "number";
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  /** When true, `min` itself isn't allowed (e.g. a divisor that must be > 0). */
  minExclusive?: boolean;
  integer?: boolean;
  optional?: boolean;
}

export interface SelectField extends FieldBase {
  type: "select";
  options: { value: string; label: string }[];
}

export interface DateField extends FieldBase {
  type: "date";
}

export interface DateTimeField extends FieldBase {
  type: "datetime";
}

export interface TextField extends FieldBase {
  type: "text" | "textarea";
  placeholder?: string;
  maxLength?: number;
}

export interface CheckboxField extends FieldBase {
  type: "checkbox";
}

export type ColumnField = NumberField | SelectField | TextField;

export interface RowsField extends FieldBase {
  type: "rows";
  columns: ColumnField[];
  minRows: number;
  maxRows: number;
  addLabel: string;
  /** Row heading, e.g. "Course" → "Course 1". */
  rowLabel: string;
}

export type Field = NumberField | SelectField | DateField | DateTimeField | TextField | CheckboxField | RowsField;

export interface ResultRow {
  label: string;
  value: string;
}

export interface CalcSuccess {
  ok: true;
  headline: ResultRow;
  rows?: ResultRow[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  /** The formula with the visitor's numbers substituted. */
  steps?: string[];
  notes?: string[];
}

export interface CalcFailure {
  ok: false;
  /** Field key (or "rowsKey.index.column") → message. */
  errors: Record<string, string>;
  message?: string;
}

export type CalcResult = CalcSuccess | CalcFailure;

export interface CalculatorSpec {
  fields: Field[];
  defaults: Values;
  /** Values for "Try the example" — must match the worked example in the page content. */
  example: Values;
  calculate(values: Values): CalcResult;
}

export type DisclaimerKind = "finance" | "education" | "property";

export interface CalculatorContent {
  seo: { title: string; metaDescription: string; h1: string };
  intro: string[];
  howTo: string[];
  formula: { lines: string[]; explanation: string[] };
  workedExample: string[];
  faq: ToolFaqEntry[];
  disclaimer?: DisclaimerKind;
  /** Calculator ids. */
  related: string[];
}

export interface CalculatorDefinition {
  id: string;
  spec: CalculatorSpec;
  content: CalculatorContent;
}

export const DISCLAIMERS: Record<DisclaimerKind, string> = {
  finance:
    "Results are estimates based only on the figures you enter and the formula shown. They don't include fees, taxes, charges or rate changes, they aren't a guarantee of any return, and they aren't financial advice — check the exact terms with your bank, lender or a qualified adviser.",
  education:
    "Grading rules differ between schools, universities and examination boards. This calculator uses the common convention described on this page; always check your institution's official scale and policies.",
  property:
    "Marla and kanal sizes differ between areas, authorities and housing schemes. Check which standard your property documents use before relying on a conversion for a purchase or legal matter.",
};

/** Fields currently shown for these values. */
export function visibleFields(spec: CalculatorSpec, values: Values): Field[] {
  return spec.fields.filter((f) => !f.showIf || f.showIf(values));
}

const THOUSANDS = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;

/** Parses a typed number: allows thousands separators (1,250.5) and surrounding spaces; rejects everything else. */
export function parseNumber(raw: string): number | null {
  let s = raw.trim();
  if (s === "") return null;
  if (THOUSANDS.test(s)) s = s.replace(/,/g, "");
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function checkNumber(field: NumberField, raw: string): { value: number | null; error?: string } {
  if (raw.trim() === "") return field.optional ? { value: null } : { value: null, error: `Enter ${field.label.toLowerCase()}.` };
  const n = parseNumber(raw);
  if (n === null) return { value: null, error: `${field.label} must be a number.` };
  if (field.integer && !Number.isInteger(n)) return { value: null, error: `${field.label} must be a whole number.` };
  if (field.min !== undefined && (field.minExclusive ? n <= field.min : n < field.min)) {
    return { value: null, error: field.minExclusive ? `${field.label} must be greater than ${field.min}.` : `${field.label} must be at least ${field.min}.` };
  }
  if (field.max !== undefined && n > field.max) return { value: null, error: `${field.label} must be at most ${field.max.toLocaleString("en-US")}.` };
  return { value: n };
}

/** Reads and validates values against the spec's field definitions, collecting every error at once. */
export class Reader {
  readonly errors: Record<string, string> = {};
  private readonly spec: CalculatorSpec;
  private readonly values: Values;

  constructor(spec: CalculatorSpec, values: Values) {
    this.spec = spec;
    this.values = values;
  }

  private field<T extends Field>(key: string): T {
    const f = this.spec.fields.find((x) => x.key === key);
    if (!f) throw new Error(`Unknown field ${key}`);
    return f as T;
  }

  private raw(key: string): string {
    const v = this.values[key];
    return typeof v === "string" ? v : "";
  }

  /** A required number (NaN when invalid — check `failed` before using it). */
  num(key: string): number {
    const r = checkNumber(this.field<NumberField>(key), this.raw(key));
    if (r.error) this.errors[key] = r.error;
    return r.value ?? NaN;
  }

  /** An optional number: null when empty. */
  optNum(key: string): number | null {
    const r = checkNumber({ ...this.field<NumberField>(key), optional: true }, this.raw(key));
    if (r.error) this.errors[key] = r.error;
    return r.value;
  }

  select<T extends string = string>(key: string): T {
    const f = this.field<SelectField>(key);
    const v = this.raw(key);
    if (!f.options.some((o) => o.value === v)) {
      this.errors[key] = `Choose ${f.label.toLowerCase()}.`;
      return f.options[0].value as T;
    }
    return v as T;
  }

  bool(key: string): boolean {
    return this.raw(key) === "true";
  }

  text(key: string): string {
    return this.raw(key).trim();
  }

  date(key: string): PlainDate | null {
    const f = this.field<DateField>(key);
    const raw = this.raw(key);
    if (!raw) {
      this.errors[key] = `Enter ${f.label.toLowerCase()}.`;
      return null;
    }
    const d = parseDate(raw);
    if (!d) this.errors[key] = `${f.label} isn't a valid date.`;
    return d;
  }

  rows(key: string): RowValue[] {
    const v = this.values[key];
    return Array.isArray(v) ? v : [];
  }

  /** A number from a row; errors are keyed "rowsKey.index.column". */
  rowNum(rowsKey: string, index: number, column: string): number {
    const f = this.field<RowsField>(rowsKey).columns.find((c) => c.key === column) as NumberField;
    const r = checkNumber(f, this.rows(rowsKey)[index]?.[column] ?? "");
    if (r.error) this.errors[`${rowsKey}.${index}.${column}`] = r.error;
    return r.value ?? NaN;
  }

  rowOptNum(rowsKey: string, index: number, column: string): number | null {
    const f = this.field<RowsField>(rowsKey).columns.find((c) => c.key === column) as NumberField;
    const r = checkNumber({ ...f, optional: true }, this.rows(rowsKey)[index]?.[column] ?? "");
    if (r.error) this.errors[`${rowsKey}.${index}.${column}`] = r.error;
    return r.value;
  }

  rowSelect(rowsKey: string, index: number, column: string): string {
    const f = this.field<RowsField>(rowsKey).columns.find((c) => c.key === column) as SelectField;
    const v = this.rows(rowsKey)[index]?.[column] ?? "";
    if (!f.options.some((o) => o.value === v)) {
      this.errors[`${rowsKey}.${index}.${column}`] = `Choose ${f.label.toLowerCase()}.`;
      return f.options[0].value;
    }
    return v;
  }

  fail(key: string, message: string): void {
    this.errors[key] = message;
  }

  get failed(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  failure(message?: string): CalcFailure {
    return { ok: false, errors: { ...this.errors }, message };
  }
}

/** Plain-text version of a result for the clipboard. */
export function resultToText(title: string, r: CalcSuccess): string {
  const lines = [`${title}`, `${r.headline.label}: ${r.headline.value}`, ...(r.rows ?? []).map((row) => `${row.label}: ${row.value}`)];
  if (r.steps?.length) lines.push("", ...r.steps);
  return lines.join("\n");
}

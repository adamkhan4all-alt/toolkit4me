// Everyday maths: percentages, averages, ratios and fractions. Pure functions; callers validate inputs.

export function percentOf(percent: number, value: number): number {
  return (percent / 100) * value;
}

/** part is what percent of whole (whole ≠ 0). */
export function whatPercent(part: number, whole: number): number {
  return (part / whole) * 100;
}

/** part is `percent`% of what (percent ≠ 0). */
export function wholeFromPercent(part: number, percent: number): number {
  return (part * 100) / percent;
}

/** Percentage change from `from` to `to` (from ≠ 0); relative to |from| so the sign always means up/down. */
export function percentChange(from: number, to: number): number {
  return ((to - from) / Math.abs(from)) * 100;
}

export function applyPercent(value: number, percent: number, direction: "increase" | "decrease"): number {
  return value * (1 + (direction === "increase" ? percent : -percent) / 100);
}

export interface Stats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  /** Most frequent values; empty when every value appears the same number of times. */
  modes: number[];
  min: number;
  max: number;
  range: number;
}

/** Parses numbers separated by commas, spaces, semicolons or new lines. Returns the bad tokens, if any. */
export function parseNumberList(text: string): { numbers: number[]; invalid: string[] } {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  const numbers: number[] = [];
  const invalid: string[] = [];
  for (const t of tokens) {
    const n = Number(t);
    if (Number.isFinite(n) && /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) numbers.push(n);
    else invalid.push(t);
  }
  return { numbers, invalid };
}

export function stats(values: number[]): Stats {
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((s, v) => s + v, 0);
  const mid = Math.floor(count / 2);
  const median = count % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const freq = new Map<number, number>();
  for (const v of sorted) freq.set(v, (freq.get(v) ?? 0) + 1);
  const top = Math.max(...freq.values());
  // No mode when every value is unique, or when several values all appear equally often.
  const allEqual = freq.size > 1 && new Set(freq.values()).size === 1;
  const modes = top === 1 || allEqual ? [] : [...freq].filter(([, f]) => f === top).map(([v]) => v);
  return { count, sum, mean: sum / count, median, modes, min: sorted[0], max: sorted[count - 1], range: sorted[count - 1] - sorted[0] };
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function decimals(n: number): number {
  const s = String(n);
  if (s.includes("e")) return 0;
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/** Simplest whole-number form of a:b (both ≥ 0, not both 0). Decimals are scaled up first (up to 6 places). */
export function simplifyRatio(a: number, b: number): { a: number; b: number } {
  const scale = 10 ** Math.min(6, Math.max(decimals(a), decimals(b)));
  const x = Math.round(a * scale);
  const y = Math.round(b * scale);
  const g = gcd(x, y) || 1;
  return { a: x / g, b: y / g };
}

/** Solves a : b = c : x for x (a ≠ 0). */
export function solveProportion(a: number, b: number, c: number): number {
  return (b * c) / a;
}

export interface Fraction {
  n: number;
  d: number;
}

export class FractionError extends Error {}

export function simplify(f: Fraction): Fraction {
  if (f.d === 0) throw new FractionError("The denominator can't be zero.");
  const g = gcd(f.n, f.d) || 1;
  const sign = f.d < 0 ? -1 : 1;
  return { n: (sign * f.n) / g || 0, d: (sign * f.d) / g };
}

function checked(f: Fraction): Fraction {
  if (!Number.isSafeInteger(f.n) || !Number.isSafeInteger(f.d)) throw new FractionError("The numbers are too large to calculate exactly.");
  return simplify(f);
}

export function fractionOp(a: Fraction, b: Fraction, op: "+" | "-" | "×" | "÷"): Fraction {
  if (a.d === 0 || b.d === 0) throw new FractionError("The denominator can't be zero.");
  switch (op) {
    case "+":
      return checked({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
    case "-":
      return checked({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
    case "×":
      return checked({ n: a.n * b.n, d: a.d * b.d });
    case "÷":
      if (b.n === 0) throw new FractionError("You can't divide by zero.");
      return checked({ n: a.n * b.d, d: a.d * b.n });
  }
}

/** 7/3 → { whole: 2, n: 1, d: 3 }; -7/3 → { whole: -2, n: 1, d: 3 }. */
export function toMixed(f: Fraction): { whole: number; n: number; d: number } {
  const s = simplify(f);
  const whole = Math.trunc(s.n / s.d);
  return { whole, n: Math.abs(s.n % s.d), d: s.d };
}

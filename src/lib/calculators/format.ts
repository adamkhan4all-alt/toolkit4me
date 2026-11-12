// Number formatting for calculator results (en-US grouping; no currency symbol, since visitors use many currencies).

/** Up to `maxDp` decimals, trailing zeros dropped; very large/small numbers in scientific notation. */
export function fmt(n: number, maxDp = 2, minDp = 0): string {
  if (!Number.isFinite(n)) return "—";
  // Drop binary floating-point noise before rounding: 87.5 × 1.15 is 100.62499999999999, which should show as 100.63.
  n = Number(n.toPrecision(15));
  const abs = Math.abs(n);
  if (abs >= 1e15 || (abs > 0 && abs < 10 ** -Math.max(maxDp, 6))) return n.toPrecision(6).replace(/\.?0+e/, "e");
  const out = n.toLocaleString("en-US", { maximumFractionDigits: maxDp, minimumFractionDigits: Math.min(minDp, maxDp) });
  return out === "-0" || /^-0\.?0*$/.test(out) ? out.replace("-", "") : out;
}

/** Money: always two decimals. */
export function money(n: number): string {
  return fmt(n, 2, 2);
}

export function pct(n: number, dp = 2): string {
  return `${fmt(n, dp)}%`;
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${fmt(n, 0)} ${n === 1 ? one : many}`;
}

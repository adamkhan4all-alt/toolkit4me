// Money calculations. Results are unrounded; the UI rounds for display. Rates are percentages (5 = 5%).

export function discount(price: number, firstPct: number, secondPct = 0): { finalPrice: number; saved: number; effectivePct: number } {
  const finalPrice = price * (1 - firstPct / 100) * (1 - secondPct / 100);
  return { finalPrice, saved: price - finalPrice, effectivePct: price === 0 ? 0 : (1 - finalPrice / price) * 100 };
}

/** With roundUp, each person's share is rounded up to a whole currency unit and the tip absorbs the difference. */
export function tip(bill: number, tipPct: number, people: number, roundUp: boolean): { tip: number; total: number; perPerson: number } {
  let total = bill * (1 + tipPct / 100);
  let perPerson = total / people;
  if (roundUp) {
    perPerson = Math.ceil(perPerson - 1e-9);
    total = perPerson * people;
  }
  return { tip: total - bill, total, perPerson };
}

/** Margin is profit ÷ revenue; markup is profit ÷ cost. */
export function profitMargin(cost: number, revenue: number): { profit: number; marginPct: number | null; markupPct: number | null } {
  const profit = revenue - cost;
  return { profit, marginPct: revenue === 0 ? null : (profit / revenue) * 100, markupPct: cost === 0 ? null : (profit / cost) * 100 };
}

export function priceFromMarkup(cost: number, markupPct: number): { price: number; profit: number; marginPct: number | null } {
  const price = cost * (1 + markupPct / 100);
  return { price, profit: price - cost, marginPct: price === 0 ? null : ((price - cost) / price) * 100 };
}

/** Converts a markup percentage to the equivalent margin percentage and back. */
export const markupToMargin = (markupPct: number) => (markupPct / (100 + markupPct)) * 100;
export const marginToMarkup = (marginPct: number) => (marginPct / (100 - marginPct)) * 100;

export function simpleInterest(principal: number, ratePct: number, years: number): { interest: number; total: number } {
  const interest = (principal * ratePct * years) / 100;
  return { interest, total: principal + interest };
}

/** Compounding periods per year; "continuous" uses e^(rt). */
export type Compounding = 1 | 2 | 4 | 12 | 52 | 365 | "continuous";

export function compoundAmount(principal: number, ratePct: number, years: number, n: Compounding): number {
  const r = ratePct / 100;
  return n === "continuous" ? principal * Math.exp(r * years) : principal * (1 + r / n) ** (n * years);
}

export function compoundInterest(
  principal: number,
  ratePct: number,
  years: number,
  n: Compounding
): { total: number; interest: number; effectiveAnnualPct: number; byYear: { year: number; balance: number; interest: number }[] } {
  const total = compoundAmount(principal, ratePct, years, n);
  const r = ratePct / 100;
  const effectiveAnnualPct = (n === "continuous" ? Math.exp(r) - 1 : (1 + r / n) ** n - 1) * 100;
  const byYear: { year: number; balance: number; interest: number }[] = [];
  let prev = principal;
  for (let y = 1; y <= Math.ceil(years) && y <= 100; y++) {
    const balance = compoundAmount(principal, ratePct, Math.min(y, years), n);
    byYear.push({ year: y, balance, interest: balance - prev });
    prev = balance;
  }
  return { total, interest: total - principal, effectiveAnnualPct, byYear };
}

export interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  /** Year-by-year totals (year 1 = first 12 payments). */
  schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[];
}

/** Equated monthly instalment for a reducing-balance loan: P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate. */
export function loanEmi(principal: number, annualRatePct: number, months: number): EmiResult {
  const r = annualRatePct / 12 / 100;
  const emi = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  const schedule: EmiResult["schedule"] = [];
  let balance = principal;
  let yearPrincipal = 0;
  let yearInterest = 0;
  for (let k = 1; k <= months; k++) {
    const interest = balance * r;
    const principalPart = k === months ? balance : emi - interest;
    balance = Math.max(0, balance - principalPart);
    yearPrincipal += principalPart;
    yearInterest += interest;
    if (k % 12 === 0 || k === months) {
      schedule.push({ year: Math.ceil(k / 12), principalPaid: yearPrincipal, interestPaid: yearInterest, balance: Math.abs(balance) < 1e-6 ? 0 : balance });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }
  return { emi, totalPayment: emi * months, totalInterest: emi * months - principal, schedule };
}

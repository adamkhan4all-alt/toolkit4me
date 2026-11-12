// Finance & Money calculators — specs + page content. Loaded only on these calculators' pages.
import { Reader, type CalculatorDefinition, type Values } from "../../lib/calculators/engine";
import { fmt, money, pct } from "../../lib/calculators/format";
import { compoundInterest, discount, loanEmi, priceFromMarkup, profitMargin, simpleInterest, tip, type Compounding } from "../../lib/calculators/formulas/finance";

const is = (key: string, ...vals: string[]) => (v: Values) => vals.includes(String(v[key]));

const discountCalc: CalculatorDefinition = {
  id: "discount-calculator",
  spec: {
    fields: [
      { type: "number", key: "price", label: "Original price", min: 0 },
      { type: "number", key: "d1", label: "Discount", unit: "%", min: 0, max: 100 },
      { type: "number", key: "d2", label: "Extra discount (optional)", unit: "%", min: 0, max: 100, optional: true, help: "For offers like \"an extra 10% off sale prices\", applied after the first discount." },
    ],
    defaults: { price: "", d1: "", d2: "" },
    example: { price: "200", d1: "20", d2: "10" },
    calculate(v) {
      const r = new Reader(this, v);
      const price = r.num("price");
      const d1 = r.num("d1");
      const d2 = r.optNum("d2") ?? 0;
      if (r.failed) return r.failure();
      const res = discount(price, d1, d2);
      return {
        ok: true,
        headline: { label: "Price after discount", value: money(res.finalPrice) },
        rows: [
          { label: "You save", value: money(res.saved) },
          ...(d2 ? [{ label: "Total discount (not " + fmt(d1 + d2) + "%)", value: pct(res.effectivePct) }] : []),
        ],
        steps: d2
          ? [`${money(price)} × (1 − ${fmt(d1, 4)}%) × (1 − ${fmt(d2, 4)}%) = ${money(res.finalPrice)}`]
          : [`${money(price)} × (1 − ${fmt(d1, 4)} ÷ 100) = ${money(res.finalPrice)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Discount Calculator – Sale Price & Savings | Toolkit4Me",
      metaDescription: "Work out the sale price and how much you save from a percentage discount, including stacked offers such as an extra 10% off. Free discount calculator.",
      h1: "Discount Calculator",
    },
    intro: [
      "Shop signs say \"30% off\" but rarely say what you'll actually pay. Enter the original price and the discount to get the sale price and the amount you save — and if there's an extra discount on top, such as a voucher or \"an extra 10% off sale prices\", add it to see the real combined saving.",
      "Stacked discounts are applied one after the other, so 20% plus 10% is a 28% saving, not 30%. The calculator shows the true total so you can compare offers fairly.",
    ],
    howTo: ["Enter the original price.", "Enter the discount percentage, and any extra discount applied afterwards.", "Select Calculate to see the final price and your saving."],
    formula: {
      lines: ["Sale price = price × (1 − discount ÷ 100)", "Stacked: price × (1 − d₁ ÷ 100) × (1 − d₂ ÷ 100)", "Saving = price − sale price"],
      explanation: ["The second discount is taken off the already-reduced price, which is why stacked percentages are always worth a little less than their sum."],
    },
    workedExample: ["A 200 coat at 20% off costs 200 × 0.8 = 160. With an extra 10% off at the till: 160 × 0.9 = 144. You save 56 in total — 28%, not 30%."],
    faq: [
      { question: "Is 20% off plus 10% off the same as 30% off?", answer: "No. The second discount applies to the reduced price, so the combined discount is 1 − 0.8 × 0.9 = 28%. Only a single 30% discount gives 30% off." },
      { question: "How do I find the original price from a sale price?", answer: "Divide the sale price by (1 − discount ÷ 100). A 75 item that's been reduced by 25% was originally 75 ÷ 0.75 = 100." },
      { question: "Does it include sales tax or VAT?", answer: "No. Enter the price as shown — if tax is added at the till, apply it to the discounted price afterwards, for example with the Percentage Increase/Decrease Calculator." },
    ],
    disclaimer: "finance",
    related: ["percentage-calculator", "percentage-change-calculator", "markup-calculator", "tip-calculator"],
  },
};

const tipCalc: CalculatorDefinition = {
  id: "tip-calculator",
  spec: {
    fields: [
      { type: "number", key: "bill", label: "Bill amount", min: 0 },
      { type: "number", key: "tip", label: "Tip", unit: "%", min: 0, max: 100 },
      { type: "number", key: "people", label: "Number of people", min: 1, max: 1000, integer: true },
      { type: "checkbox", key: "roundUp", label: "Round each person's share up to a whole amount" },
    ],
    defaults: { bill: "", tip: "15", people: "1", roundUp: "false" },
    example: { bill: "87.50", tip: "15", people: "3", roundUp: "false" },
    calculate(v) {
      const r = new Reader(this, v);
      const bill = r.num("bill");
      const t = r.num("tip");
      const people = r.num("people");
      if (r.failed) return r.failure();
      const res = tip(bill, t, people, r.bool("roundUp"));
      return {
        ok: true,
        headline: { label: people > 1 ? "Each person pays" : "Total to pay", value: money(people > 1 ? res.perPerson : res.total) },
        rows: [
          { label: "Tip", value: money(res.tip) },
          { label: "Total with tip", value: money(res.total) },
          ...(people > 1 ? [{ label: "Tip per person", value: money(res.tip / people) }] : []),
          ...(r.bool("roundUp") ? [{ label: "Effective tip", value: pct(bill ? (res.tip / bill) * 100 : 0) }] : []),
        ],
        steps: [`Tip = ${money(bill)} × ${fmt(t, 4)}% = ${money((bill * t) / 100)}`, `Per person = ${money((bill * (1 + t / 100)))} ÷ ${people}${r.bool("roundUp") ? ", rounded up" : ""}`],
      };
    },
  },
  content: {
    seo: {
      title: "Tip Calculator – Tip Amount & Split the Bill | Toolkit4Me",
      metaDescription: "Calculate the tip, total bill and each person's share. Choose any tip percentage, split between any number of people and round up to whole amounts.",
      h1: "Tip Calculator",
    },
    intro: [
      "At the end of a meal nobody wants to do percentages on a phone. Enter the bill, choose a tip percentage and the number of people, and the calculator shows the tip, the total and exactly what each person owes.",
      "Turn on rounding to make each share a whole amount — handy when paying cash. The difference goes to the tip, and the effective tip percentage is shown so you know what you've actually left.",
    ],
    howTo: ["Enter the bill total (before tip).", "Set the tip percentage and the number of people sharing.", "Optionally round each share up, then select Calculate."],
    formula: {
      lines: ["Tip = bill × tip % ÷ 100", "Total = bill + tip", "Each person = total ÷ people (rounded up if chosen)"],
      explanation: ["When rounding up, each share becomes the next whole amount, and the extra is added to the tip."],
    },
    workedExample: ["A bill of 87.50 with a 15% tip: the tip is 13.13 and the total 100.63. Split three ways, each person pays 33.54 — or 34.00 each with rounding, which makes the tip 14.50 (about 16.6%)."],
    faq: [
      { question: "Should I tip on the amount before or after tax?", answer: "Customs differ by country. In the US, many people tip on the pre-tax amount; elsewhere a service charge may already be included. Enter whichever amount you want the tip to be based on." },
      { question: "What's a normal tip?", answer: "It depends on where you are. In the US, 15–20% at restaurants is common; in much of Europe and Asia, tipping is smaller or a service charge is already on the bill. Check the bill before adding a tip." },
      { question: "Why doesn't the rounded total match the bill plus my tip?", answer: "Rounding each person's share up adds a little to the total. The calculator puts the difference into the tip and shows the effective percentage." },
    ],
    related: ["discount-calculator", "percentage-calculator", "fuel-cost-calculator", "average-calculator"],
  },
};

const marginCalc: CalculatorDefinition = {
  id: "profit-margin-calculator",
  spec: {
    fields: [
      { type: "number", key: "cost", label: "Cost", min: 0, help: "What the item costs you to make or buy." },
      { type: "number", key: "revenue", label: "Selling price (revenue)", min: 0 },
    ],
    defaults: { cost: "", revenue: "" },
    example: { cost: "60", revenue: "100" },
    calculate(v) {
      const r = new Reader(this, v);
      const cost = r.num("cost");
      const revenue = r.num("revenue");
      if (!r.failed && revenue === 0) r.fail("revenue", "The selling price must be more than zero to have a margin.");
      if (r.failed) return r.failure();
      const res = profitMargin(cost, revenue);
      return {
        ok: true,
        headline: { label: "Profit margin", value: pct(res.marginPct ?? 0) },
        rows: [
          { label: res.profit >= 0 ? "Profit" : "Loss", value: money(Math.abs(res.profit)) },
          { label: "Markup", value: res.markupPct === null ? "— (cost is zero)" : pct(res.markupPct) },
        ],
        steps: [`Margin = (${money(revenue)} − ${money(cost)}) ÷ ${money(revenue)} × 100 = ${fmt(res.marginPct ?? 0)}%`],
        notes: res.profit < 0 ? ["The selling price is below cost, so the margin is negative (a loss)."] : undefined,
      };
    },
  },
  content: {
    seo: {
      title: "Profit Margin Calculator – Margin, Profit & Markup | Toolkit4Me",
      metaDescription: "Enter cost and selling price to get gross profit, profit margin and markup. Explains the difference between margin and markup. Free business calculator.",
      h1: "Profit Margin Calculator",
    },
    intro: [
      "Profit margin tells you how much of every sale you keep after covering what the product cost you. Enter the cost and the selling price to get the profit, the margin as a percentage of the price, and the markup as a percentage of the cost.",
      "Margin and markup describe the same profit from two angles and are easy to mix up — a 50% markup is only a 33% margin. Seeing both side by side helps when you set prices or compare suppliers.",
    ],
    howTo: ["Enter your cost per item (or in total).", "Enter the selling price for the same quantity.", "Select Calculate to see profit, margin and markup."],
    formula: {
      lines: ["Profit = selling price − cost", "Margin % = profit ÷ selling price × 100", "Markup % = profit ÷ cost × 100"],
      explanation: ["This is gross margin: it covers the direct cost of the item only. Rent, wages, shipping and taxes come out of it later, so net margin is lower."],
    },
    workedExample: ["Buy at 60, sell at 100: the profit is 40. The margin is 40 ÷ 100 = 40%, and the markup is 40 ÷ 60 ≈ 66.67%."],
    faq: [
      { question: "What's the difference between margin and markup?", answer: "Both use the same profit. Margin divides it by the selling price; markup divides it by the cost. Because the price is bigger than the cost, the margin percentage is always smaller than the markup percentage for a profitable sale." },
      { question: "Can a margin be over 100%?", answer: "No. The profit can never be larger than the price, so margins top out just under 100% (when the cost is close to zero). Markups have no upper limit." },
      { question: "What is a good profit margin?", answer: "It varies widely by industry — grocery retail often runs on low single-digit net margins while software can be much higher. Compare with businesses like yours rather than a universal number." },
    ],
    disclaimer: "finance",
    related: ["markup-calculator", "discount-calculator", "percentage-change-calculator", "percentage-calculator"],
  },
};

const markupCalc: CalculatorDefinition = {
  id: "markup-calculator",
  spec: {
    fields: [
      {
        type: "select",
        key: "mode",
        label: "What do you know?",
        options: [
          { value: "price", label: "Cost and markup % → selling price" },
          { value: "markup", label: "Cost and selling price → markup %" },
        ],
      },
      { type: "number", key: "cost", label: "Cost", min: 0 },
      { type: "number", key: "markup", label: "Markup", unit: "%", min: 0, showIf: is("mode", "price") },
      { type: "number", key: "price", label: "Selling price", min: 0, showIf: is("mode", "markup") },
    ],
    defaults: { mode: "price", cost: "", markup: "", price: "" },
    example: { mode: "price", cost: "50", markup: "30", price: "" },
    calculate(v) {
      const r = new Reader(this, v);
      const mode = r.select("mode");
      const cost = r.num("cost");
      if (mode === "price") {
        const m = r.num("markup");
        if (r.failed) return r.failure();
        const res = priceFromMarkup(cost, m);
        return {
          ok: true,
          headline: { label: "Selling price", value: money(res.price) },
          rows: [
            { label: "Profit", value: money(res.profit) },
            { label: "Equivalent margin", value: res.marginPct === null ? "—" : pct(res.marginPct) },
          ],
          steps: [`${money(cost)} × (1 + ${fmt(m, 4)} ÷ 100) = ${money(res.price)}`],
        };
      }
      const price = r.num("price");
      if (!r.failed && cost === 0) r.fail("cost", "Markup is a percentage of cost, so the cost must be more than zero.");
      if (r.failed) return r.failure();
      const res = profitMargin(cost, price);
      return {
        ok: true,
        headline: { label: "Markup", value: pct(res.markupPct ?? 0) },
        rows: [
          { label: res.profit >= 0 ? "Profit" : "Loss", value: money(Math.abs(res.profit)) },
          { label: "Equivalent margin", value: res.marginPct === null ? "—" : pct(res.marginPct) },
        ],
        steps: [`(${money(price)} − ${money(cost)}) ÷ ${money(cost)} × 100 = ${fmt(res.markupPct ?? 0)}%`],
      };
    },
  },
  content: {
    seo: {
      title: "Markup Calculator – Selling Price from Cost & Markup | Toolkit4Me",
      metaDescription: "Find the selling price from cost and markup percentage, or the markup from cost and price, with the equivalent profit margin. Free pricing calculator.",
      h1: "Markup Calculator",
    },
    intro: [
      "Markup is how much you add on top of what something costs you. Retailers, caterers and freelancers often price this way: \"cost plus 30%\". Enter your cost and markup to get the selling price — or enter both cost and price to see what markup you're actually charging.",
      "The calculator also shows the equivalent profit margin, because buyers, investors and accountants usually talk in margins, and a 30% markup is only a 23% margin.",
    ],
    howTo: ["Choose whether you know the markup or the selling price.", "Enter the cost and the other figure.", "Select Calculate."],
    formula: {
      lines: ["Selling price = cost × (1 + markup ÷ 100)", "Markup % = (price − cost) ÷ cost × 100", "Margin % = markup ÷ (100 + markup) × 100"],
      explanation: ["To hit a target margin rather than a markup, convert it first: markup = margin ÷ (100 − margin) × 100. A 25% margin needs a 33.33% markup."],
    },
    workedExample: ["An item costing 50 with a 30% markup sells for 50 × 1.3 = 65. The profit is 15, which is 15 ÷ 65 ≈ 23.08% of the price — the margin."],
    faq: [
      { question: "What markup do I need for a 50% margin?", answer: "100%. Doubling the cost (cost 10, price 20) makes the profit equal to half the price." },
      { question: "Should I price with markup or margin?", answer: "Either works as long as you're consistent. Markup is easy to apply to a cost; margin is easier to compare with your expenses and with other businesses." },
      { question: "Does the cost include shipping and fees?", answer: "Include whatever you consider the item's direct cost — purchase price, shipping in, packaging. The more complete the cost, the more meaningful the markup." },
    ],
    disclaimer: "finance",
    related: ["profit-margin-calculator", "discount-calculator", "percentage-calculator", "percentage-change-calculator"],
  },
};

const simpleInterestCalc: CalculatorDefinition = {
  id: "simple-interest-calculator",
  spec: {
    fields: [
      { type: "number", key: "principal", label: "Principal (amount)", min: 0 },
      { type: "number", key: "rate", label: "Annual interest rate", unit: "% per year", min: 0, max: 1000 },
      { type: "number", key: "time", label: "Time", min: 0, max: 100000 },
      {
        type: "select",
        key: "unit",
        label: "Time unit",
        options: [
          { value: "years", label: "Years" },
          { value: "months", label: "Months" },
          { value: "days", label: "Days (365-day year)" },
        ],
      },
    ],
    defaults: { principal: "", rate: "", time: "", unit: "years" },
    example: { principal: "5000", rate: "4", time: "3", unit: "years" },
    calculate(v) {
      const r = new Reader(this, v);
      const p = r.num("principal");
      const rate = r.num("rate");
      const t = r.num("time");
      const unit = r.select("unit");
      if (r.failed) return r.failure();
      const years = unit === "years" ? t : unit === "months" ? t / 12 : t / 365;
      const res = simpleInterest(p, rate, years);
      return {
        ok: true,
        headline: { label: "Interest", value: money(res.interest) },
        rows: [
          { label: "Total (principal + interest)", value: money(res.total) },
          { label: "Interest per year", value: money((p * rate) / 100) },
        ],
        steps: [`${money(p)} × ${fmt(rate, 4)}% × ${fmt(years, 6)} years = ${money(res.interest)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Simple Interest Calculator – Interest & Total Amount | Toolkit4Me",
      metaDescription: "Calculate simple interest on a principal at an annual rate over years, months or days, with the total amount repaid or earned. Free simple interest calculator.",
      h1: "Simple Interest Calculator",
    },
    intro: [
      "Simple interest is charged or paid only on the original amount, never on interest that has already built up. It's used for many short-term loans, some car finance, certain bonds and plenty of school maths. Enter the principal, the annual rate and the time to see the interest and the total.",
      "Time can be entered in years, months or days; days are converted using a 365-day year. For savings or loans where interest is added to the balance, use the Compound Interest Calculator instead.",
    ],
    howTo: ["Enter the principal — the amount borrowed or invested.", "Enter the annual interest rate.", "Enter the time and choose its unit, then select Calculate."],
    formula: {
      lines: ["Interest = P × R × T ÷ 100", "Total = P + interest", "P = principal, R = annual rate (%), T = time in years"],
      explanation: ["Because interest never earns interest, the amount grows by the same sum every year — a straight line rather than a curve."],
    },
    workedExample: ["5,000 at 4% a year for 3 years: 5,000 × 4 × 3 ÷ 100 = 600 interest, for a total of 5,600. Each year adds 200."],
    faq: [
      { question: "What's the difference between simple and compound interest?", answer: "Simple interest is always calculated on the original principal. Compound interest is calculated on the principal plus interest already added, so it grows faster over time." },
      { question: "How are months and days converted?", answer: "Months are divided by 12 and days by 365. Some lenders use 360-day years or actual/actual day counts, which give slightly different results." },
      { question: "Is a flat-rate loan the same as simple interest?", answer: "Usually yes: interest is worked out on the full amount for the whole term, even though you repay it gradually. That makes the true (effective) rate much higher than the quoted flat rate." },
    ],
    disclaimer: "finance",
    related: ["compound-interest-calculator", "loan-emi-calculator", "percentage-calculator", "discount-calculator"],
  },
};

const FREQUENCIES: { value: string; label: string; n: Compounding }[] = [
  { value: "1", label: "Yearly", n: 1 },
  { value: "2", label: "Half-yearly", n: 2 },
  { value: "4", label: "Quarterly", n: 4 },
  { value: "12", label: "Monthly", n: 12 },
  { value: "52", label: "Weekly", n: 52 },
  { value: "365", label: "Daily", n: 365 },
  { value: "continuous", label: "Continuously", n: "continuous" },
];

const compoundCalc: CalculatorDefinition = {
  id: "compound-interest-calculator",
  spec: {
    fields: [
      { type: "number", key: "principal", label: "Starting amount", min: 0 },
      { type: "number", key: "rate", label: "Annual interest rate", unit: "% per year", min: 0, max: 1000 },
      { type: "number", key: "years", label: "Time", unit: "years", min: 0, max: 100 },
      { type: "select", key: "freq", label: "Compounding", options: FREQUENCIES.map(({ value, label }) => ({ value, label })) },
    ],
    defaults: { principal: "", rate: "", years: "", freq: "12" },
    example: { principal: "1000", rate: "5", years: "10", freq: "12" },
    calculate(v) {
      const r = new Reader(this, v);
      const p = r.num("principal");
      const rate = r.num("rate");
      const years = r.num("years");
      const freq = r.select("freq");
      if (r.failed) return r.failure();
      const n = FREQUENCIES.find((f) => f.value === freq)!.n;
      const res = compoundInterest(p, rate, years, n);
      return {
        ok: true,
        headline: { label: `Value after ${fmt(years, 4)} years`, value: money(res.total) },
        rows: [
          { label: "Interest earned", value: money(res.interest) },
          { label: "Effective annual rate", value: pct(res.effectiveAnnualPct, 4) },
        ],
        table: res.byYear.length > 1 ? { caption: "Balance at the end of each year", headers: ["Year", "Interest that year", "Balance"], rows: res.byYear.map((y) => [String(y.year), money(y.interest), money(y.balance)]) } : undefined,
        steps: [n === "continuous" ? `${money(p)} × e^(${fmt(rate / 100, 6)} × ${fmt(years, 4)}) = ${money(res.total)}` : `${money(p)} × (1 + ${fmt(rate / 100, 6)} ÷ ${n})^(${n} × ${fmt(years, 4)}) = ${money(res.total)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Compound Interest Calculator – Future Value & Growth | Toolkit4Me",
      metaDescription: "Compound interest with yearly, monthly, daily or continuous compounding: future value, interest earned, effective annual rate and a year-by-year table.",
      h1: "Compound Interest Calculator",
    },
    intro: [
      "Compound interest is interest on interest: each period, what you've earned is added to the balance and starts earning too. Over long periods the effect is dramatic, which is why it matters for savings, investments and debts alike. Enter a starting amount, an annual rate, a number of years and how often interest is added.",
      "You'll get the final value, the interest earned, the effective annual rate (what the compounding is really worth per year) and a year-by-year table of the balance.",
    ],
    howTo: ["Enter the starting amount.", "Enter the annual interest rate and the number of years.", "Choose how often interest is compounded, then select Calculate."],
    formula: {
      lines: ["A = P × (1 + r ÷ n)^(n × t)", "Continuous: A = P × e^(r × t)", "Effective annual rate = (1 + r ÷ n)^n − 1"],
      explanation: ["P is the starting amount, r the annual rate as a decimal, n the number of compounding periods per year and t the time in years. The more often interest is compounded, the higher the effective rate, though the gains shrink quickly beyond monthly."],
    },
    workedExample: ["1,000 at 5% a year, compounded monthly for 10 years: 1,000 × (1 + 0.05 ÷ 12)^120 ≈ 1,647.01, so 647.01 is interest. Yearly compounding would give 1,628.89."],
    faq: [
      { question: "Does this include regular deposits?", answer: "No — it shows how a single amount grows. Regular contributions each earn interest for a different length of time, so they need a savings-plan calculation." },
      { question: "What's the rule of 72?", answer: "A quick estimate of doubling time: divide 72 by the annual rate. At 6%, money roughly doubles in 12 years. The calculator gives the exact figure." },
      { question: "Are taxes and fees included?", answer: "No. Real returns are reduced by taxes, account fees and inflation, and investment returns aren't fixed or guaranteed." },
    ],
    disclaimer: "finance",
    related: ["simple-interest-calculator", "loan-emi-calculator", "percentage-change-calculator", "percentage-calculator"],
  },
};

const emiCalc: CalculatorDefinition = {
  id: "loan-emi-calculator",
  spec: {
    fields: [
      { type: "number", key: "principal", label: "Loan amount", min: 0, minExclusive: true },
      { type: "number", key: "rate", label: "Annual interest rate", unit: "% per year", min: 0, max: 100 },
      { type: "number", key: "tenure", label: "Loan term", min: 0, minExclusive: true },
      {
        type: "select",
        key: "unit",
        label: "Term unit",
        options: [
          { value: "years", label: "Years" },
          { value: "months", label: "Months" },
        ],
      },
    ],
    defaults: { principal: "", rate: "", tenure: "", unit: "years" },
    example: { principal: "500000", rate: "12", tenure: "5", unit: "years" },
    calculate(v) {
      const r = new Reader(this, v);
      const p = r.num("principal");
      const rate = r.num("rate");
      const tenure = r.num("tenure");
      const unit = r.select("unit");
      const months = unit === "years" ? tenure * 12 : tenure;
      if (!r.failed && !Number.isInteger(Math.round(months * 1e9) / 1e9)) r.fail("tenure", "The term must be a whole number of months (for example 2.5 years = 30 months).");
      else if (!r.failed && months > 600) r.fail("tenure", "The term can be at most 50 years (600 months).");
      if (r.failed) return r.failure();
      const n = Math.round(months);
      const res = loanEmi(p, rate, n);
      return {
        ok: true,
        headline: { label: "Monthly instalment (EMI)", value: money(res.emi) },
        rows: [
          { label: "Total interest", value: money(res.totalInterest) },
          { label: "Total of all payments", value: money(res.totalPayment) },
          { label: "Number of payments", value: fmt(n, 0) },
        ],
        table: { caption: "Repayment by year", headers: ["Year", "Principal paid", "Interest paid", "Balance left"], rows: res.schedule.map((y) => [String(y.year), money(y.principalPaid), money(y.interestPaid), money(y.balance)]) },
        steps: rate === 0 ? [`${money(p)} ÷ ${n} = ${money(res.emi)}`] : [`r = ${fmt(rate, 4)}% ÷ 12 = ${fmt(rate / 12, 6)}% per month`, `EMI = ${money(p)} × r × (1 + r)^${n} ÷ ((1 + r)^${n} − 1) = ${money(res.emi)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Loan EMI Calculator – Monthly Payment & Total Interest | Toolkit4Me",
      metaDescription: "Calculate the EMI (equated monthly instalment) for a home, car or personal loan, the total interest and a year-by-year repayment schedule. Free loan calculator.",
      h1: "Loan EMI Calculator",
    },
    intro: [
      "An EMI — equated monthly instalment — is the fixed amount you repay every month on a reducing-balance loan, such as most home, car and personal loans. Enter the amount, the annual interest rate and the term to see the monthly payment, the total interest over the life of the loan and how the balance falls year by year.",
      "Early payments are mostly interest; later ones are mostly principal. The schedule makes that visible and shows how much a shorter term or lower rate would really save.",
    ],
    howTo: ["Enter the loan amount.", "Enter the annual interest rate quoted by the lender.", "Enter the term in years or months, then select Calculate."],
    formula: {
      lines: ["EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)", "r = annual rate ÷ 12 ÷ 100, n = number of monthly payments"],
      explanation: ["Each month, interest is charged on the outstanding balance and the rest of the EMI repays principal. The formula finds the single payment that clears the loan exactly after n months. At a 0% rate the EMI is simply P ÷ n."],
    },
    workedExample: ["A 500,000 loan at 12% a year for 5 years (60 months): r = 1% a month, so EMI = 500,000 × 0.01 × 1.01⁶⁰ ÷ (1.01⁶⁰ − 1) ≈ 11,122.22. Over 60 payments you repay about 667,333, of which about 167,333 is interest."],
    faq: [
      { question: "Does the EMI include fees or insurance?", answer: "No. Processing fees, insurance and taxes vary by lender and aren't included. Ask for the annual percentage rate (APR), which includes most fees, to compare loans fairly." },
      { question: "Is a flat interest rate the same as this rate?", answer: "No. This calculator uses a reducing balance, where interest is charged only on what you still owe. A flat rate charges interest on the original amount throughout, which costs much more for the same quoted rate." },
      { question: "How can I reduce the total interest?", answer: "A shorter term, a lower rate or extra payments towards principal all cut the interest. Try a shorter term here to see the difference, and check your lender's prepayment rules." },
    ],
    disclaimer: "finance",
    related: ["compound-interest-calculator", "simple-interest-calculator", "percentage-calculator", "profit-margin-calculator"],
  },
};

export const CALCULATORS: CalculatorDefinition[] = [discountCalc, tipCalc, marginCalc, markupCalc, simpleInterestCalc, compoundCalc, emiCalc];

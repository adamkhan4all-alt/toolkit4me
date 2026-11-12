// Everyday Math calculators — specs + page content. Loaded only on these calculators' pages.
import { Reader, type CalculatorDefinition, type Values } from "../../lib/calculators/engine";
import { fmt, pct, plural } from "../../lib/calculators/format";
import { applyPercent, FractionError, fractionOp, parseNumberList, percentChange, percentOf, simplifyRatio, solveProportion, stats, toMixed, whatPercent, wholeFromPercent } from "../../lib/calculators/formulas/math";
import { age, compareDates, dateDifference, daysBetween, formatDate, todayPlain } from "../../lib/calculators/formulas/dates";

const today = () => formatDate(todayPlain());
const is = (key: string, ...vals: string[]) => (v: Values) => vals.includes(String(v[key]));

const percentage: CalculatorDefinition = {
  id: "percentage-calculator",
  spec: {
    fields: [
      {
        type: "select",
        key: "mode",
        label: "Question",
        options: [
          { value: "of", label: "What is X% of Y?" },
          { value: "what", label: "X is what percent of Y?" },
          { value: "whole", label: "X is Y% of what?" },
        ],
      },
      { type: "number", key: "percent", label: "Percentage", unit: "%", showIf: is("mode", "of", "whole") },
      { type: "number", key: "value", label: "Of the number", showIf: is("mode", "of") },
      { type: "number", key: "part", label: "Part (X)", showIf: is("mode", "what", "whole") },
      { type: "number", key: "whole", label: "Whole (Y)", showIf: is("mode", "what") },
    ],
    defaults: { mode: "of", percent: "", value: "", part: "", whole: "" },
    example: { mode: "of", percent: "15", value: "200", part: "", whole: "" },
    calculate(v) {
      const r = new Reader(this, v);
      const mode = r.select("mode");
      if (mode === "of") {
        const p = r.num("percent");
        const x = r.num("value");
        if (r.failed) return r.failure();
        const res = percentOf(p, x);
        return { ok: true, headline: { label: `${fmt(p, 6)}% of ${fmt(x, 6)}`, value: fmt(res, 6) }, steps: [`${fmt(p, 6)} ÷ 100 × ${fmt(x, 6)} = ${fmt(res, 6)}`] };
      }
      if (mode === "what") {
        const part = r.num("part");
        const whole = r.num("whole");
        if (!r.failed && whole === 0) r.fail("whole", "The whole can't be zero — no number is a percentage of zero.");
        if (r.failed) return r.failure();
        const res = whatPercent(part, whole);
        return { ok: true, headline: { label: `${fmt(part, 6)} is this percent of ${fmt(whole, 6)}`, value: pct(res, 4) }, steps: [`${fmt(part, 6)} ÷ ${fmt(whole, 6)} × 100 = ${fmt(res, 4)}%`] };
      }
      const part = r.num("part");
      const p = r.num("percent");
      if (!r.failed && p === 0) r.fail("percent", "The percentage can't be zero.");
      if (r.failed) return r.failure();
      const res = wholeFromPercent(part, p);
      return { ok: true, headline: { label: `${fmt(part, 6)} is ${fmt(p, 6)}% of`, value: fmt(res, 6) }, steps: [`${fmt(part, 6)} × 100 ÷ ${fmt(p, 6)} = ${fmt(res, 6)}`] };
    },
  },
  content: {
    seo: {
      title: "Percentage Calculator – What Is X% of Y? | Toolkit4Me",
      metaDescription: "Free percentage calculator: find X% of a number, what percent one number is of another, or the original number from a percentage — with the working shown.",
      h1: "Percentage Calculator",
    },
    intro: [
      "Percentages turn up everywhere — a 15% service charge, a test score of 42 out of 60, a deposit that's 20% of a price. Almost every percentage question is one of three forms, and this calculator answers all of them: what is X% of a number, what percentage one number is of another, and what the whole was if you only know a part and its percentage.",
      "Pick the question, type two numbers, and you get the answer with the working underneath, so you can check it or copy the method into homework, a report or a spreadsheet.",
    ],
    howTo: ["Choose the question that matches yours.", "Enter the two numbers it asks for.", "Select Calculate. The answer and the sum used to get it appear below.", "Change any number and the result updates."],
    formula: {
      lines: ["X% of Y = X ÷ 100 × Y", "X as a % of Y = X ÷ Y × 100", "Whole = X × 100 ÷ P"],
      explanation: ["\"Per cent\" means \"per hundred\", so a percentage is a fraction with 100 underneath. Each formula is the same relationship — part = percentage ÷ 100 × whole — rearranged to find the missing piece."],
    },
    workedExample: ["What is 15% of 200? Divide 15 by 100 to get 0.15, then multiply by 200: 0.15 × 200 = 30.", "Reverse it: 30 is what percent of 200? 30 ÷ 200 = 0.15, × 100 = 15%. And 30 is 15% of what? 30 × 100 ÷ 15 = 200."],
    faq: [
      { question: "How do I work out a percentage of a number in my head?", answer: "Find 10% by moving the decimal point one place left, then scale: 10% of 240 is 24, so 5% is 12 and 15% is 36. For 1%, move the point two places." },
      { question: "Is X% of Y the same as Y% of X?", answer: "Yes. 8% of 50 and 50% of 8 are both 4, because both are 8 × 50 ÷ 100. Swapping them can make mental arithmetic much easier." },
      { question: "Can a percentage be more than 100?", answer: "Yes. If the part is bigger than the whole, the percentage is over 100 — 150 is 150% of 100. Negative numbers work too and give negative percentages." },
    ],
    related: ["percentage-change-calculator", "discount-calculator", "percentage-to-grade-calculator", "exam-marks-calculator"],
  },
};

const percentageChange: CalculatorDefinition = {
  id: "percentage-change-calculator",
  spec: {
    fields: [
      {
        type: "select",
        key: "mode",
        label: "What do you want to do?",
        options: [
          { value: "change", label: "Find the % change between two values" },
          { value: "apply", label: "Increase or decrease a value by a %" },
        ],
      },
      { type: "number", key: "from", label: "Original value", showIf: is("mode", "change") },
      { type: "number", key: "to", label: "New value", showIf: is("mode", "change") },
      { type: "number", key: "value", label: "Starting value", showIf: is("mode", "apply") },
      { type: "number", key: "percent", label: "Percentage", unit: "%", min: 0, showIf: is("mode", "apply") },
      {
        type: "select",
        key: "direction",
        label: "Direction",
        options: [
          { value: "increase", label: "Increase" },
          { value: "decrease", label: "Decrease" },
        ],
        showIf: is("mode", "apply"),
      },
    ],
    defaults: { mode: "change", from: "", to: "", value: "", percent: "", direction: "increase" },
    example: { mode: "change", from: "50", to: "75", value: "", percent: "", direction: "increase" },
    calculate(v) {
      const r = new Reader(this, v);
      if (r.select("mode") === "change") {
        const from = r.num("from");
        const to = r.num("to");
        if (!r.failed && from === 0) r.fail("from", "The percentage change from zero is undefined — any increase from 0 is infinitely large.");
        if (r.failed) return r.failure();
        const c = percentChange(from, to);
        const word = c > 0 ? "increase" : c < 0 ? "decrease" : "change";
        return {
          ok: true,
          headline: { label: `Percentage ${word}`, value: pct(Math.abs(c), 4) },
          rows: [{ label: "Difference", value: fmt(to - from, 6) }],
          steps: [`(${fmt(to, 6)} − ${fmt(from, 6)}) ÷ |${fmt(from, 6)}| × 100 = ${fmt(c, 4)}%`],
        };
      }
      const value = r.num("value");
      const p = r.num("percent");
      const dir = r.select<"increase" | "decrease">("direction");
      if (r.failed) return r.failure();
      const res = applyPercent(value, p, dir);
      return {
        ok: true,
        headline: { label: `${fmt(value, 6)} ${dir === "increase" ? "increased" : "decreased"} by ${fmt(p, 6)}%`, value: fmt(res, 6) },
        rows: [{ label: dir === "increase" ? "Amount added" : "Amount taken off", value: fmt(Math.abs(res - value), 6) }],
        steps: [`${fmt(value, 6)} × (1 ${dir === "increase" ? "+" : "−"} ${fmt(p, 6)} ÷ 100) = ${fmt(res, 6)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Percentage Increase & Decrease Calculator | Toolkit4Me",
      metaDescription: "Calculate the percentage increase or decrease between two numbers, or add or subtract a percentage from a value. Shows the working. Free and instant.",
      h1: "Percentage Increase/Decrease Calculator",
    },
    intro: [
      "Prices rise, salaries change, website visits fall — and the honest way to compare those changes is as a percentage of where you started. This calculator gives the percentage increase or decrease between any two values, or does the reverse: adds or takes a percentage away from a number.",
      "It measures change relative to the size of the original value, so the sign always tells you the direction, even when the numbers are negative (for example a loss that shrinks from −50 to −25 is a 50% improvement).",
    ],
    howTo: ["Choose whether to find a change or to apply one.", "Enter the original and new values — or a starting value, a percentage and a direction.", "Select Calculate to see the percentage, the difference and the working."],
    formula: {
      lines: ["% change = (new − original) ÷ |original| × 100", "New value = original × (1 ± P ÷ 100)"],
      explanation: [
        "The difference is divided by the original value, not the new one, because a change is always measured against where you started. That's why going up 50% and then down 50% doesn't bring you back: 100 → 150 → 75.",
      ],
    },
    workedExample: ["A price goes from 50 to 75. The difference is 25; 25 ÷ 50 = 0.5, so it's a 50% increase.", "To apply a change instead: 200 increased by 15% is 200 × 1.15 = 230; decreased by 15% it's 200 × 0.85 = 170."],
    faq: [
      { question: "Why can't I calculate a percentage change from zero?", answer: "The change is divided by the original value. Dividing by zero is undefined — going from 0 to anything is an infinitely large percentage increase. Describe it as an absolute change instead." },
      { question: "What's the difference between percentage change and percentage points?", answer: "If an interest rate moves from 4% to 5%, it rose by 1 percentage point but by 25% in relative terms (1 ÷ 4). This calculator gives the relative change; subtract the two percentages yourself for percentage points." },
      { question: "If something falls by 20%, what increase gets it back?", answer: "25%. After a 20% fall, 100 becomes 80, and 80 needs to rise by 20 — which is 25% of 80 — to return to 100." },
    ],
    related: ["percentage-calculator", "discount-calculator", "profit-margin-calculator", "compound-interest-calculator"],
  },
};

const average: CalculatorDefinition = {
  id: "average-calculator",
  spec: {
    fields: [{ type: "textarea", key: "numbers", label: "Numbers", placeholder: "e.g. 12, 15, 15, 18, 20, 22", help: "Separate numbers with commas, spaces or new lines.", maxLength: 100_000 }],
    defaults: { numbers: "" },
    example: { numbers: "12, 15, 15, 18, 20, 22" },
    calculate(v) {
      const r = new Reader(this, v);
      const text = r.text("numbers");
      const { numbers, invalid } = parseNumberList(text);
      if (!text) r.fail("numbers", "Enter at least one number.");
      else if (invalid.length) r.fail("numbers", `These aren't numbers: ${invalid.slice(0, 5).join(", ")}${invalid.length > 5 ? "…" : ""}`);
      else if (numbers.length > 10_000) r.fail("numbers", "Enter up to 10,000 numbers.");
      if (r.failed) return r.failure();
      const s = stats(numbers);
      return {
        ok: true,
        headline: { label: "Mean (average)", value: fmt(s.mean, 6) },
        rows: [
          { label: "Median", value: fmt(s.median, 6) },
          { label: "Mode", value: s.modes.length ? s.modes.map((m) => fmt(m, 6)).join(", ") : "None (no value repeats more than the others)" },
          { label: "Count", value: fmt(s.count, 0) },
          { label: "Sum", value: fmt(s.sum, 6) },
          { label: "Smallest / largest", value: `${fmt(s.min, 6)} / ${fmt(s.max, 6)}` },
          { label: "Range", value: fmt(s.range, 6) },
        ],
        steps: [`Mean = ${fmt(s.sum, 6)} ÷ ${s.count} = ${fmt(s.mean, 6)}`],
      };
    },
  },
  content: {
    seo: {
      title: "Average Calculator – Mean, Median, Mode & Range | Toolkit4Me",
      metaDescription: "Paste a list of numbers to get the mean, median, mode, sum, count and range in one go. Free online average calculator with the working shown.",
      h1: "Average Calculator",
    },
    intro: [
      "\"Average\" can mean three different things, and they can tell very different stories. The mean adds everything up and shares it out equally; the median is the middle value once the numbers are sorted; the mode is the value that turns up most often. This calculator gives all three, plus the count, sum, smallest and largest values and the range.",
      "Paste numbers straight from a spreadsheet column, a list of marks or a set of measurements — commas, spaces and line breaks all work as separators.",
    ],
    howTo: ["Type or paste your numbers.", "Select Calculate.", "Read the mean, median and mode side by side, with the count, sum and range underneath."],
    formula: {
      lines: ["Mean = sum of values ÷ number of values", "Median = middle value of the sorted list (or the mean of the two middle values)", "Mode = the most frequent value(s)", "Range = largest − smallest"],
      explanation: ["The mean uses every value, so a single very large or small number pulls it a long way. The median isn't affected by extremes, which is why house prices and salaries are usually reported as medians."],
    },
    workedExample: ["For 12, 15, 15, 18, 20, 22: the sum is 102 and there are 6 values, so the mean is 102 ÷ 6 = 17.", "Sorted, the middle two values are 15 and 18, so the median is 16.5. 15 appears twice, so it's the mode. The range is 22 − 12 = 10."],
    faq: [
      { question: "When should I use the median instead of the mean?", answer: "When a few values are much larger or smaller than the rest. Five salaries of 30,000 and one of 300,000 have a mean of 75,000, which describes nobody; the median of 30,000 is far more typical." },
      { question: "Why does it say there's no mode?", answer: "If every number appears once, or several numbers all appear equally often, no single value is most common, so there's no mode. If two or three values tie for most frequent, they're all listed." },
      { question: "Can I include negative numbers and decimals?", answer: "Yes — any ordinary number works, including negatives, decimals and numbers in scientific notation such as 2.5e3." },
    ],
    related: ["percentage-calculator", "gpa-calculator", "exam-marks-calculator", "ratio-calculator"],
  },
};

const ratio: CalculatorDefinition = {
  id: "ratio-calculator",
  spec: {
    fields: [
      {
        type: "select",
        key: "mode",
        label: "What do you want to do?",
        options: [
          { value: "simplify", label: "Simplify a ratio (A : B)" },
          { value: "solve", label: "Solve a proportion (A : B = C : ?)" },
        ],
      },
      { type: "number", key: "a", label: "A", min: 0 },
      { type: "number", key: "b", label: "B", min: 0 },
      { type: "number", key: "c", label: "C", min: 0, showIf: is("mode", "solve") },
    ],
    defaults: { mode: "simplify", a: "", b: "", c: "" },
    example: { mode: "simplify", a: "1920", b: "1080", c: "" },
    calculate(v) {
      const r = new Reader(this, v);
      const mode = r.select("mode");
      const a = r.num("a");
      const b = r.num("b");
      if (mode === "simplify") {
        if (!r.failed && a === 0 && b === 0) r.fail("a", "At least one side of the ratio must be more than zero.");
        if (r.failed) return r.failure();
        const s = simplifyRatio(a, b);
        return {
          ok: true,
          headline: { label: "Simplest form", value: `${fmt(s.a, 0)} : ${fmt(s.b, 0)}` },
          rows: [
            { label: "As 1 : n", value: a === 0 ? "—" : `1 : ${fmt(b / a, 6)}` },
            { label: "As n : 1", value: b === 0 ? "—" : `${fmt(a / b, 6)} : 1` },
            { label: "A as a share of the total", value: pct((a / (a + b)) * 100) },
          ],
          steps: [`Divide both sides by their greatest common divisor → ${fmt(s.a, 0)} : ${fmt(s.b, 0)}`],
        };
      }
      const c = r.num("c");
      if (!r.failed && a === 0) r.fail("a", "A can't be zero when solving a proportion.");
      if (r.failed) return r.failure();
      const x = solveProportion(a, b, c);
      return { ok: true, headline: { label: "Missing value", value: fmt(x, 6) }, steps: [`${fmt(a, 6)} : ${fmt(b, 6)} = ${fmt(c, 6)} : x  →  x = ${fmt(b, 6)} × ${fmt(c, 6)} ÷ ${fmt(a, 6)} = ${fmt(x, 6)}`] };
    },
  },
  content: {
    seo: {
      title: "Ratio Calculator – Simplify Ratios & Solve Proportions | Toolkit4Me",
      metaDescription: "Simplify any ratio to its lowest terms (e.g. 1920:1080 = 16:9) or find the missing value in a proportion. Works with decimals. Free ratio calculator.",
      h1: "Ratio Calculator",
    },
    intro: [
      "A ratio compares two quantities — 2 parts cement to 3 parts sand, a 16 : 9 screen, 3 teachers to 40 pupils. This calculator reduces any ratio to its simplest whole-number form and shows it as 1 : n and n : 1, or solves a proportion when you know three of the four numbers.",
      "It handles decimals too: 1.5 : 2.25 is scaled up to whole numbers before it's simplified, giving 2 : 3.",
    ],
    howTo: ["Choose Simplify or Solve.", "Enter A and B (and C when solving).", "Select Calculate to see the simplified ratio or the missing value, with the working."],
    formula: {
      lines: ["Simplest form: A ÷ g : B ÷ g, where g = greatest common divisor of A and B", "Proportion: A : B = C : x  →  x = B × C ÷ A"],
      explanation: ["Two ratios are equal when their cross-products are equal (A × x = B × C), which is how the missing value is found."],
    },
    workedExample: ["1920 : 1080 — both divide by 120, giving 16 : 9, the standard widescreen shape.", "If 2 cups of flour make 3 dozen biscuits, how much flour for 10 dozen? 2 : 3 = x : 10 is solved as 2 × 10 ÷ 3 ≈ 6.67 cups (enter A = 3, B = 2, C = 10)."],
    faq: [
      { question: "How do I simplify a ratio with decimals?", answer: "Multiply both sides by the same power of 10 until they're whole numbers, then divide by their greatest common divisor. 0.75 : 1.5 becomes 75 : 150, which simplifies to 1 : 2. The calculator does this automatically." },
      { question: "How do I split an amount in a given ratio?", answer: "Add the parts, then share the amount by each part's fraction. To split 500 in the ratio 2 : 3, there are 5 parts of 100 each, so the shares are 200 and 300. The \"share of the total\" line gives A's fraction." },
      { question: "What is an aspect ratio?", answer: "The ratio of an image's width to its height. 1920 × 1080 pixels simplifies to 16 : 9; 1080 × 1350 is 4 : 5, Instagram's tallest portrait format." },
    ],
    related: ["fraction-calculator", "percentage-calculator", "average-calculator", "square-feet-calculator"],
  },
};

const fraction: CalculatorDefinition = {
  id: "fraction-calculator",
  spec: {
    fields: [
      { type: "number", key: "n1", label: "First numerator", integer: true },
      { type: "number", key: "d1", label: "First denominator", integer: true },
      {
        type: "select",
        key: "op",
        label: "Operation",
        options: [
          { value: "+", label: "+ add" },
          { value: "-", label: "− subtract" },
          { value: "×", label: "× multiply" },
          { value: "÷", label: "÷ divide" },
        ],
      },
      { type: "number", key: "n2", label: "Second numerator", integer: true },
      { type: "number", key: "d2", label: "Second denominator", integer: true },
    ],
    defaults: { n1: "", d1: "", op: "+", n2: "", d2: "" },
    example: { n1: "1", d1: "2", op: "+", n2: "1", d2: "3" },
    calculate(v) {
      const r = new Reader(this, v);
      const a = { n: r.num("n1"), d: r.num("d1") };
      const op = r.select<"+" | "-" | "×" | "÷">("op");
      const b = { n: r.num("n2"), d: r.num("d2") };
      if (!r.failed && a.d === 0) r.fail("d1", "A denominator can't be zero.");
      if (!r.failed && b.d === 0) r.fail("d2", "A denominator can't be zero.");
      if (!r.failed && op === "÷" && b.n === 0) r.fail("n2", "You can't divide by zero.");
      if (r.failed) return r.failure();
      try {
        const res = fractionOp(a, b, op);
        const mixed = toMixed(res);
        const text = res.d === 1 ? fmt(res.n, 0) : `${res.n}/${res.d}`;
        return {
          ok: true,
          headline: { label: `${a.n}/${a.d} ${op} ${b.n}/${b.d}`, value: text },
          rows: [
            { label: "Mixed number", value: res.d === 1 || mixed.whole === 0 ? text : `${mixed.whole} ${mixed.n}/${mixed.d}` },
            { label: "Decimal", value: fmt(res.n / res.d, 8) },
          ],
          steps:
            op === "+" || op === "-"
              ? [`(${a.n} × ${b.d} ${op} ${b.n} × ${a.d}) / (${a.d} × ${b.d}) = ${a.n * b.d + (op === "+" ? 1 : -1) * b.n * a.d}/${a.d * b.d} → ${text}`]
              : op === "×"
                ? [`(${a.n} × ${b.n}) / (${a.d} × ${b.d}) = ${a.n * b.n}/${a.d * b.d} → ${text}`]
                : [`${a.n}/${a.d} × ${b.d}/${b.n} = ${a.n * b.d}/${a.d * b.n} → ${text}`],
        };
      } catch (err) {
        return { ok: false, errors: {}, message: err instanceof FractionError ? err.message : "That couldn't be calculated." };
      }
    },
  },
  content: {
    seo: {
      title: "Fraction Calculator – Add, Subtract, Multiply & Divide | Toolkit4Me",
      metaDescription: "Add, subtract, multiply or divide two fractions and get the answer in lowest terms, as a mixed number and as a decimal, with the working shown.",
      h1: "Fraction Calculator",
    },
    intro: [
      "Fractions are easy to get wrong by hand — especially adding ones with different denominators. Enter two fractions and an operation and this calculator gives the exact answer in lowest terms, as a mixed number where it's bigger than one, and as a decimal.",
      "It works with whole numbers only, so answers are exact rather than rounded. Negative fractions work too: put the minus sign on the numerator.",
    ],
    howTo: ["Enter the numerator (top) and denominator (bottom) of the first fraction.", "Choose add, subtract, multiply or divide.", "Enter the second fraction and select Calculate."],
    formula: {
      lines: ["a/b + c/d = (a·d + c·b) / (b·d)", "a/b − c/d = (a·d − c·b) / (b·d)", "a/b × c/d = (a·c) / (b·d)", "a/b ÷ c/d = (a·d) / (b·c)"],
      explanation: ["Every answer is then divided by the greatest common divisor of its numerator and denominator, so it's always in lowest terms. To divide, multiply by the second fraction turned upside down."],
    },
    workedExample: ["1/2 + 1/3: cross-multiply to get (1 × 3 + 1 × 2) / (2 × 3) = 5/6, which can't be simplified further. As a decimal it's 0.8333…"],
    faq: [
      { question: "How do I enter a mixed number like 2 1/4?", answer: "Convert it to an improper fraction first: multiply the whole number by the denominator and add the numerator — 2 × 4 + 1 = 9, so 2 1/4 is 9/4." },
      { question: "Why must the numbers be whole?", answer: "A fraction's top and bottom are whole numbers by definition. Keeping them whole means the answer is exact — 1/3 stays 1/3 instead of becoming 0.333…" },
      { question: "What does lowest terms mean?", answer: "The numerator and denominator share no common factor other than 1. 6/8 isn't in lowest terms because both divide by 2; 3/4 is." },
    ],
    related: ["ratio-calculator", "percentage-calculator", "average-calculator", "required-marks-calculator"],
  },
};

const ageCalc: CalculatorDefinition = {
  id: "age-calculator",
  spec: {
    fields: [
      { type: "date", key: "dob", label: "Date of birth" },
      { type: "date", key: "on", label: "Age on this date", help: "Defaults to today." },
    ],
    defaults: { dob: "", on: today() },
    example: { dob: "1990-06-15", on: "2026-11-13" },
    calculate(v) {
      const r = new Reader(this, v);
      const dob = r.date("dob");
      const on = r.date("on");
      if (dob && on && compareDates(dob, on) > 0) r.fail("dob", "The date of birth must be on or before the other date.");
      if (r.failed || !dob || !on) return r.failure();
      const a = age(dob, on);
      return {
        ok: true,
        headline: { label: "Age", value: `${plural(a.years, "year")}, ${plural(a.months, "month")}, ${plural(a.days, "day")}` },
        rows: [
          { label: "In months", value: `${fmt(a.totalMonths, 0)} months and ${plural(a.days, "day")}` },
          { label: "In weeks", value: `${fmt(a.totalWeeks, 0)} weeks and ${plural(a.totalDays % 7, "day")}` },
          { label: "In days", value: fmt(a.totalDays, 0) },
          { label: "Next birthday", value: `${formatDate(a.nextBirthday)} — turning ${a.nextAge}, in ${plural(a.daysToNextBirthday, "day")}` },
        ],
      };
    },
  },
  content: {
    seo: {
      title: "Age Calculator – Exact Age in Years, Months & Days | Toolkit4Me",
      metaDescription: "Calculate exact age from a date of birth in years, months and days, plus total weeks and days and a countdown to the next birthday. Handles leap years.",
      h1: "Age Calculator",
    },
    intro: [
      "Forms, visas, school admissions and insurance quotes often need an exact age — not just the years, but the months and days too. Enter a date of birth and this calculator gives the age today, or on any other date you choose, along with the same span in total months, weeks and days and how long it is until the next birthday.",
      "Leap years are handled properly. Someone born on 29 February completes another year on 28 February in years that don't have a 29th, the convention most official systems follow.",
    ],
    howTo: ["Enter the date of birth.", "Leave the second date as today, or change it to find the age on another date — such as a cut-off date on an application.", "Select Calculate."],
    formula: {
      lines: ["Age = whole months from birth to the date, split into years and months, plus the remaining days"],
      explanation: [
        "The calculator counts how many complete months fit between the two dates (if the birth day doesn't exist in a month, such as the 31st, the last day of that month is used), then counts the days left over. This matches how ages are counted on paper.",
      ],
    },
    workedExample: ["Born on 15 June 1990, on 13 November 2026 the age is 36 years, 4 months and 29 days: 36 years takes you to 15 June 2026, 4 more months to 15 October, and 29 days to 13 November."],
    faq: [
      { question: "How is age counted for someone born on 29 February?", answer: "In a non-leap year they turn a year older on 28 February, and the next-birthday countdown uses 28 February. Some countries use 1 March for legal purposes, so check if it matters for an official deadline." },
      { question: "Does it use my time zone?", answer: "\"Today\" comes from your device's date. The calculation itself uses whole calendar days, so time zones and daylight saving can't shift it." },
      { question: "Why do the total months and weeks have leftover days?", answer: "Months have different lengths, so an age can't be an exact number of months. The extra days are shown so the totals are exact." },
    ],
    related: ["date-difference-calculator", "days-between-dates-calculator", "unix-timestamp-converter", "percentage-calculator"],
  },
};

const dateDiff: CalculatorDefinition = {
  id: "date-difference-calculator",
  spec: {
    fields: [
      { type: "date", key: "start", label: "Start date" },
      { type: "date", key: "end", label: "End date" },
      { type: "checkbox", key: "includeEnd", label: "Include the end date (count both the first and last day)" },
    ],
    defaults: { start: today(), end: "", includeEnd: "false" },
    example: { start: "2026-01-01", end: "2026-12-25", includeEnd: "false" },
    calculate(v) {
      const r = new Reader(this, v);
      const a = r.date("start");
      const b = r.date("end");
      if (r.failed || !a || !b) return r.failure();
      const d = dateDifference(a, b, r.bool("includeEnd"));
      return {
        ok: true,
        headline: { label: "Difference", value: `${plural(d.years, "year")}, ${plural(d.months, "month")}, ${plural(d.days, "day")}` },
        rows: [
          { label: "Total days", value: fmt(d.totalDays, 0) },
          { label: "Weeks", value: `${fmt(d.weeks, 0)} weeks and ${plural(d.remainderDays, "day")}` },
          { label: "Total months", value: `${fmt(d.totalMonths, 0)} months and ${plural(d.days, "day")}` },
          { label: "Hours (whole days)", value: fmt(d.totalDays * 24, 0) },
        ],
        notes: d.swapped ? ["The end date was before the start date, so the dates were swapped."] : undefined,
      };
    },
  },
  content: {
    seo: {
      title: "Date Difference Calculator – Years, Months & Days | Toolkit4Me",
      metaDescription: "Find the time between two dates in years, months and days, plus total weeks, days and months. Optional end-date counting. Free date duration calculator.",
      h1: "Date Difference Calculator",
    },
    intro: [
      "How long has an employee been with the company, how long until a lease ends, how long a project actually took? This calculator gives the exact span between two dates as years, months and days — the way durations are written in contracts and CVs — and also as total weeks, months and days.",
      "Tick \"Include the end date\" when both the first and the last day should count, as with a hotel stay counted in days or a course that runs from one date to another inclusive.",
    ],
    howTo: ["Enter the start date and the end date.", "Decide whether the end date itself should be counted.", "Select Calculate."],
    formula: {
      lines: ["Duration = complete months between the dates (shown as years + months) + remaining days", "Total days = end date − start date (+ 1 if the end date is included)"],
      explanation: ["Months are counted by calendar, not as 30-day blocks, so 31 January to 1 March is 1 month and 1 day. If the start day doesn't exist in a month, that month's last day is used."],
    },
    workedExample: ["From 1 January 2026 to 25 December 2026 is 11 months and 24 days — 358 days in total, or 51 weeks and 1 day."],
    faq: [
      { question: "What's the difference between this and the days-between-dates calculator?", answer: "This one breaks the span into years, months and days. The Days Between Dates Calculator focuses on day counts and splits them into weekdays and weekend days." },
      { question: "Should I include the end date?", answer: "Include it when you're counting days on which something happens — a 1–5 May event lasts 5 days. Leave it out when you're measuring elapsed time — 1 May to 5 May is 4 days later." },
      { question: "Does it handle leap years?", answer: "Yes. Every date is placed on the real calendar, so 29 February is counted in leap years and doesn't exist in others." },
    ],
    related: ["days-between-dates-calculator", "age-calculator", "unix-timestamp-converter", "attendance-percentage-calculator"],
  },
};

const daysBetweenCalc: CalculatorDefinition = {
  id: "days-between-dates-calculator",
  spec: {
    fields: [
      { type: "date", key: "start", label: "First date" },
      { type: "date", key: "end", label: "Second date" },
      { type: "checkbox", key: "includeEnd", label: "Count both the first and the last day" },
    ],
    defaults: { start: today(), end: "", includeEnd: "true" },
    example: { start: "2026-03-01", end: "2026-03-31", includeEnd: "true" },
    calculate(v) {
      const r = new Reader(this, v);
      const a = r.date("start");
      const b = r.date("end");
      if (r.failed || !a || !b) return r.failure();
      const d = daysBetween(a, b, r.bool("includeEnd"));
      return {
        ok: true,
        headline: { label: "Days", value: fmt(d.totalDays, 0) },
        rows: [
          { label: "Weekdays (Mon–Fri)", value: fmt(d.weekdays, 0) },
          { label: "Weekend days (Sat–Sun)", value: fmt(d.weekendDays, 0) },
          { label: "Weeks", value: `${fmt(Math.floor(d.totalDays / 7), 0)} weeks and ${plural(d.totalDays % 7, "day")}` },
        ],
        notes: [
          ...(d.swapped ? ["The second date was earlier, so the dates were swapped."] : []),
          "Weekdays don't account for public holidays, which differ by country.",
        ],
      };
    },
  },
  content: {
    seo: {
      title: "Days Between Dates Calculator – Count Days & Weekdays | Toolkit4Me",
      metaDescription: "Count the number of days between two dates, with weekdays and weekend days shown separately. Choose whether to include the end date. Free day counter.",
      h1: "Days Between Dates Calculator",
    },
    intro: [
      "Notice periods, visa stays, delivery windows and countdowns all come down to counting days. This calculator counts the days between two dates and splits them into weekdays (Monday to Friday) and weekend days, so you can see the working days at a glance.",
      "By default both the first and last day are counted, which is how most people count days \"from … to …\" on a calendar. Untick the box to count only the days that pass in between.",
    ],
    howTo: ["Enter the two dates, in either order.", "Choose whether to count both the first and the last day.", "Select Calculate to see the total, weekdays and weekend days."],
    formula: {
      lines: ["Days = second date − first date (+ 1 when both days are counted)", "Weekdays = days falling Monday to Friday"],
      explanation: ["Each date is converted to a day number on the calendar, so the subtraction is exact across months and leap years. Weekdays are counted from full weeks (5 each) plus the leftover days."],
    },
    workedExample: ["1 to 31 March 2026, counting both days, is 31 days. 1 March 2026 is a Sunday, so the span is 4 full weeks (20 weekdays) plus Sunday, Monday and Tuesday — 22 weekdays and 9 weekend days."],
    faq: [
      { question: "Are public holidays excluded?", answer: "No. Holidays vary by country and region, so the weekday count is Monday to Friday only. Subtract any holidays that fall in your range." },
      { question: "Why is my count one day different from another calculator?", answer: "It depends on whether both ends are counted. 1–3 May is 3 days if both days count, but only 2 days pass between them. Use the tick box to match the convention you need." },
      { question: "Can the dates be years apart?", answer: "Yes — any dates from year 1 to 9999 work, and leap years are included." },
    ],
    related: ["date-difference-calculator", "age-calculator", "attendance-percentage-calculator", "unix-timestamp-converter"],
  },
};

export const CALCULATORS: CalculatorDefinition[] = [percentage, percentageChange, average, ratio, fraction, ageCalc, dateDiff, daysBetweenCalc];

import { describe, expect, it } from "vitest";
import { ALL_CALCULATORS } from "../all";
import { CALCULATOR_CATALOG } from "../catalog";
import type { CalcResult, CalculatorDefinition, Values } from "../../../lib/calculators/engine";
import { parseNumber, visibleFields } from "../../../lib/calculators/engine";

const byId = new Map(ALL_CALCULATORS.map((c) => [c.id, c]));
const calc = (id: string) => byId.get(id) as CalculatorDefinition;
const run = (id: string, values: Values): CalcResult => calc(id).spec.calculate({ ...calc(id).spec.defaults, ...values });
const ok = (r: CalcResult) => {
  if (!r.ok) throw new Error(`Expected success, got ${JSON.stringify(r)}`);
  return r;
};
const errs = (r: CalcResult) => (r.ok ? {} : r.errors);

describe("catalogue and definitions", () => {
  it("has exactly the 30 calculators from the brief, one definition each", () => {
    expect(CALCULATOR_CATALOG).toHaveLength(30);
    expect(ALL_CALCULATORS).toHaveLength(30);
    expect(new Set(CALCULATOR_CATALOG.map((c) => c.id))).toEqual(new Set(ALL_CALCULATORS.map((c) => c.id)));
  });

  it("every calculator has complete, unique page content", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const c of ALL_CALCULATORS) {
      const { content } = c;
      expect(content.seo.title.length, c.id).toBeLessThanOrEqual(75);
      expect(content.seo.metaDescription.length, c.id).toBeGreaterThanOrEqual(110);
      expect(content.seo.metaDescription.length, c.id).toBeLessThanOrEqual(160);
      expect(content.intro.length, c.id).toBeGreaterThanOrEqual(2);
      expect(content.howTo.length, c.id).toBeGreaterThanOrEqual(3);
      expect(content.formula.lines.length, c.id).toBeGreaterThanOrEqual(1);
      expect(content.workedExample.length, c.id).toBeGreaterThanOrEqual(1);
      expect(content.faq.length, c.id).toBeGreaterThanOrEqual(3);
      expect(content.related.length, c.id).toBeGreaterThanOrEqual(3);
      for (const r of content.related) expect(byId.has(r), `${c.id} → ${r}`).toBe(true);
      expect(content.related).not.toContain(c.id);
      expect(titles.has(content.seo.title)).toBe(false);
      expect(descriptions.has(content.seo.metaDescription)).toBe(false);
      titles.add(content.seo.title);
      descriptions.add(content.seo.metaDescription);
      expect(content.seo.h1).toBe(CALCULATOR_CATALOG.find((x) => x.id === c.id)?.name);
    }
  });

  it("finance and education calculators carry their disclaimers", () => {
    for (const c of ALL_CALCULATORS) {
      const group = CALCULATOR_CATALOG.find((x) => x.id === c.id)?.group;
      if (group === "education") expect(c.content.disclaimer, c.id).toBe("education");
      if (["discount-calculator", "profit-margin-calculator", "markup-calculator", "simple-interest-calculator", "compound-interest-calculator", "loan-emi-calculator"].includes(c.id)) expect(c.content.disclaimer, c.id).toBe("finance");
      if (c.id.includes("marla") || c.id.includes("kanal")) expect(c.content.disclaimer, c.id).toBe("property");
    }
  });

  it("every example calculates successfully and every empty form is rejected with field errors", () => {
    for (const c of ALL_CALCULATORS) {
      expect(c.spec.calculate(c.spec.example).ok, c.id).toBe(true);
      const empty = c.spec.calculate(c.spec.defaults);
      expect(empty.ok, c.id).toBe(false);
      if (!empty.ok) expect(Object.keys(empty.errors).length + (empty.message ? 1 : 0), c.id).toBeGreaterThan(0);
      for (const f of c.spec.fields) expect(f.key in c.spec.defaults, `${c.id}.${f.key} default`).toBe(true);
    }
  });
});

describe("worked examples match the page copy", () => {
  const head = (id: string) => ok(calc(id).spec.calculate(calc(id).spec.example)).headline.value;
  it.each([
    ["percentage-calculator", "30"],
    ["percentage-change-calculator", "50%"],
    ["average-calculator", "17"],
    ["ratio-calculator", "16 : 9"],
    ["fraction-calculator", "5/6"],
    ["age-calculator", "36 years, 4 months, 29 days"],
    ["date-difference-calculator", "0 years, 11 months, 24 days"],
    ["days-between-dates-calculator", "31"],
    ["discount-calculator", "144.00"],
    ["tip-calculator", "33.54"],
    ["profit-margin-calculator", "40%"],
    ["markup-calculator", "65.00"],
    ["simple-interest-calculator", "600.00"],
    ["compound-interest-calculator", "1,647.01"],
    ["loan-emi-calculator", "11,122.22"],
    ["gpa-calculator", "3.12"],
    ["cgpa-calculator", "3.39"],
    ["percentage-to-grade-calculator", "B"],
    ["exam-marks-calculator", "84.44%"],
    ["required-marks-calculator", "92%"],
    ["attendance-percentage-calculator", "90%"],
    ["download-time-calculator", "10 min 40 s"],
    ["upload-time-calculator", "2 h 46 min 40 s"],
    ["data-storage-converter", "1,073.741824 MB"],
    ["unix-timestamp-converter", "2023-11-14 22:13:20 UTC"],
    ["electricity-cost-calculator", "36.00"],
    ["fuel-cost-calculator", "47.25"],
    ["square-feet-calculator", "180 sq ft"],
    ["marla-to-square-feet-converter", "1,125 sq ft"],
    ["kanal-to-marla-converter", "20 marla"],
  ])("%s → %s", (id, expected) => {
    expect(head(id)).toBe(expected);
  });

  it("supporting figures quoted in the copy", () => {
    const rows = (id: string, values: Values = {}) => Object.fromEntries((ok(run(id, { ...calc(id).spec.example, ...values })).rows ?? []).map((r) => [r.label, r.value]));
    expect(rows("days-between-dates-calculator")["Weekdays (Mon–Fri)"]).toBe("22");
    expect(rows("date-difference-calculator")["Total days"]).toBe("358");
    expect(rows("loan-emi-calculator")["Total interest"]).toBe("167,333.43");
    expect(rows("compound-interest-calculator")["Interest earned"]).toBe("647.01");
    expect(ok(run("compound-interest-calculator", { ...calc("compound-interest-calculator").spec.example, freq: "1" })).headline.value).toBe("1,628.89");
    expect(rows("tip-calculator")["Total with tip"]).toBe("100.63");
    expect(rows("tip-calculator", { roundUp: "true" })["Tip"]).toBe("14.50");
    expect(rows("markup-calculator")["Equivalent margin"]).toBe("23.08%");
    expect(rows("electricity-cost-calculator")["Per year (365 days)"]).toMatch(/^438\.00/);
    expect(ok(run("download-time-calculator", { ...calc("download-time-calculator").spec.example, overhead: "15" })).headline.value).toBe("12 min 33 s");
    expect(ok(run("kanal-to-marla-converter", calc("kanal-to-marla-converter").spec.example)).table?.rows.map((r) => r[1])).toEqual(["5,445", "5,000", "4,500"]);
    expect(ok(run("marla-to-square-feet-converter", calc("marla-to-square-feet-converter").spec.example)).table?.rows[0][1]).toBe("1,361.25");
    expect(rows("required-marks-calculator")["If you score 100% on the final"]).toBe("87.4%");
    expect(ok(run("attendance-percentage-calculator", { attended: "29", total: "40", target: "75" })).rows?.[1].value).toMatch(/^4 classes/);
  });
});

describe("validation and edge cases", () => {
  it("parses numbers strictly", () => {
    expect(parseNumber("1,250.5")).toBe(1250.5);
    expect(parseNumber(" 42 ")).toBe(42);
    expect(parseNumber("-0.5")).toBe(-0.5);
    for (const bad of ["", "12abc", "1,2,3", "0x10", "Infinity", "NaN", "1e400"]) expect(parseNumber(bad), bad).toBeNull();
  });

  it("division by zero is reported, not returned as Infinity", () => {
    expect(errs(run("percentage-calculator", { mode: "what", part: "5", whole: "0" }))).toHaveProperty("whole");
    expect(errs(run("percentage-calculator", { mode: "whole", part: "5", percent: "0" }))).toHaveProperty("percent");
    expect(errs(run("percentage-change-calculator", { from: "0", to: "10" }))).toHaveProperty("from");
    expect(errs(run("fraction-calculator", { n1: "1", d1: "0", n2: "1", d2: "2" }))).toHaveProperty("d1");
    expect(errs(run("fraction-calculator", { n1: "1", d1: "2", op: "÷", n2: "0", d2: "3" }))).toHaveProperty("n2");
    expect(errs(run("ratio-calculator", { mode: "simplify", a: "0", b: "0" }))).toHaveProperty("a");
    expect(errs(run("ratio-calculator", { mode: "solve", a: "0", b: "2", c: "3" }))).toHaveProperty("a");
    expect(errs(run("profit-margin-calculator", { cost: "5", revenue: "0" }))).toHaveProperty("revenue");
    expect(errs(run("markup-calculator", { mode: "markup", cost: "0", price: "10" }))).toHaveProperty("cost");
    expect(errs(run("attendance-percentage-calculator", { attended: "0", total: "0", target: "75" }))).toHaveProperty("total");
  });

  it("rejects out-of-range, negative and non-integer inputs where they make no sense", () => {
    expect(errs(run("discount-calculator", { price: "100", d1: "120" }))).toHaveProperty("d1");
    expect(errs(run("discount-calculator", { price: "-5", d1: "10" }))).toHaveProperty("price");
    expect(errs(run("tip-calculator", { bill: "50", tip: "15", people: "2.5" }))).toHaveProperty("people");
    expect(errs(run("tip-calculator", { bill: "50", tip: "15", people: "0" }))).toHaveProperty("people");
    expect(errs(run("fraction-calculator", { n1: "1.5", d1: "2", n2: "1", d2: "2" }))).toHaveProperty("n1");
    expect(errs(run("loan-emi-calculator", { principal: "1000", rate: "5", tenure: "1.05", unit: "years" }))).toHaveProperty("tenure");
    expect(errs(run("loan-emi-calculator", { principal: "1000", rate: "5", tenure: "51", unit: "years" }))).toHaveProperty("tenure");
    expect(errs(run("loan-emi-calculator", { principal: "0", rate: "5", tenure: "12", unit: "months" }))).toHaveProperty("principal");
    expect(errs(run("exam-marks-calculator", { subjects: [{ name: "", obtained: "60", total: "50" }] }))).toHaveProperty("subjects.0.obtained");
    expect(errs(run("attendance-percentage-calculator", { attended: "41", total: "40", target: "75" }))).toHaveProperty("attended");
    expect(errs(run("average-calculator", { numbers: "1, two, 3" }))).toHaveProperty("numbers");
    expect(errs(run("unix-timestamp-converter", { mode: "toDate", ts: "abc" }))).toHaveProperty("ts");
    expect(errs(run("unix-timestamp-converter", { mode: "toDate", ts: "99999999999999999999" }))).toHaveProperty("ts");
    expect(errs(run("unix-timestamp-converter", { mode: "toTimestamp", date: "2023-02-30T10:00", zone: "utc" }))).toHaveProperty("date");
    expect(errs(run("age-calculator", { dob: "2030-01-01", on: "2026-01-01" }))).toHaveProperty("dob");
    expect(errs(run("age-calculator", { dob: "2023-02-29", on: "2026-01-01" }))).toHaveProperty("dob");
  });

  it("allows negatives where they're meaningful", () => {
    expect(ok(run("percentage-calculator", { mode: "of", percent: "-10", value: "50" })).headline.value).toBe("-5");
    expect(ok(run("percentage-change-calculator", { from: "-50", to: "-25" })).headline).toEqual({ label: "Percentage increase", value: "50%" });
    expect(ok(run("fraction-calculator", { n1: "-1", d1: "2", op: "+", n2: "1", d2: "3" })).headline.value).toBe("-1/6");
    expect(ok(run("average-calculator", { numbers: "-4 -2 0" })).headline.value).toBe("-2");
  });

  it("handles zero inputs gracefully", () => {
    expect(ok(run("simple-interest-calculator", { principal: "0", rate: "5", time: "3", unit: "years" })).headline.value).toBe("0.00");
    expect(ok(run("loan-emi-calculator", { principal: "12000", rate: "0", tenure: "12", unit: "months" })).headline.value).toBe("1,000.00");
    expect(ok(run("compound-interest-calculator", { principal: "500", rate: "0", years: "5", freq: "12" })).headline.value).toBe("500.00");
    expect(ok(run("discount-calculator", { price: "100", d1: "0" })).headline.value).toBe("100.00");
    expect(ok(run("required-marks-calculator", { current: "95", weight: "20", target: "70" })).notes?.[0]).toMatch(/already secured/);
    expect(ok(run("required-marks-calculator", { current: "60", weight: "25", target: "90" })).notes?.[0]).toMatch(/more than 100%/);
  });

  it("dates: leap years, boundaries and reversed ranges", () => {
    const leap = ok(run("age-calculator", { dob: "2000-02-29", on: "2023-02-28" }));
    expect(leap.headline.value).toBe("23 years, 0 months, 0 days");
    expect(ok(run("days-between-dates-calculator", { start: "2024-02-28", end: "2024-03-01", includeEnd: "false" })).headline.value).toBe("2");
    expect(ok(run("days-between-dates-calculator", { start: "2023-02-28", end: "2023-03-01", includeEnd: "false" })).headline.value).toBe("1");
    expect(ok(run("days-between-dates-calculator", { start: "2023-12-31", end: "2024-01-01", includeEnd: "false" })).headline.value).toBe("1");
    const reversed = ok(run("date-difference-calculator", { start: "2026-12-25", end: "2026-01-01" }));
    expect(reversed.notes?.[0]).toMatch(/swapped/);
    expect(ok(run("days-between-dates-calculator", { start: "2026-05-05", end: "2026-05-05", includeEnd: "true" })).headline.value).toBe("1");
  });

  it("large values and precision", () => {
    expect(ok(run("percentage-calculator", { mode: "of", percent: "12.5", value: "1,000,000,000" })).headline.value).toBe("125,000,000");
    expect(ok(run("data-storage-converter", { value: "1", from: "PiB", to: "bit" })).headline.value).toBe("9.0072e+15 bit");
    expect(ok(run("percentage-calculator", { mode: "what", part: "1", whole: "3" })).headline.value).toBe("33.3333%");
    expect(ok(run("fraction-calculator", { n1: "1", d1: "3", op: "+", n2: "1", d2: "3" })).rows?.[1].value).toBe("0.66666667");
    expect(ok(run("unix-timestamp-converter", { mode: "toDate", ts: "1700000000000", unit: "auto" })).headline.value).toBe("2023-11-14 22:13:20 UTC");
    expect(ok(run("unix-timestamp-converter", { mode: "toTimestamp", date: "2038-01-19T03:14:07", zone: "utc" })).headline.value).toBe("2147483647");
  });

  it("CGPA: all-or-nothing credits", () => {
    const equal = ok(run("cgpa-calculator", { terms: [{ gpa: "3.0", credits: "" }, { gpa: "4.0", credits: "" }] }));
    expect(equal.headline.value).toBe("3.50");
    expect(equal.notes?.[0]).toMatch(/counts equally/);
    expect(errs(run("cgpa-calculator", { terms: [{ gpa: "3.0", credits: "15" }, { gpa: "4.0", credits: "" }] }))).toHaveProperty("terms.1.credits");
  });

  it("hidden fields aren't validated or shown", () => {
    const spec = calc("percentage-calculator").spec;
    expect(visibleFields(spec, { mode: "what" }).map((f) => f.key)).toEqual(["mode", "part", "whole"]);
    expect(ok(run("percentage-calculator", { mode: "what", part: "1", whole: "4", percent: "garbage" })).headline.value).toBe("25%");
  });
});

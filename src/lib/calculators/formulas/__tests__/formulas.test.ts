import { describe, expect, it } from "vitest";
import { addMonths, age, calendarDiff, dateDifference, daysBetween, isLeapYear, parseDate, weekday, type PlainDate } from "../dates";
import { applyPercent, FractionError, fractionOp, parseNumberList, percentChange, percentOf, simplifyRatio, solveProportion, stats, toMixed, whatPercent, wholeFromPercent } from "../math";
import { compoundInterest, discount, loanEmi, markupToMargin, marginToMarkup, priceFromMarkup, profitMargin, simpleInterest, tip } from "../finance";
import { attendance, examTotals, percentToGrade, requiredFinalScore, US_GRADE_POINTS, weightedAverage } from "../education";
import {
  areaSqFt,
  convertData,
  dateTimeToTimestamp,
  detectTimestampUnit,
  energyCost,
  formatDuration,
  fuelLitres,
  pricePerLitre,
  SQ_M_PER_SQ_FT,
  timestampToDate,
  transferSeconds,
} from "../units";

const d = (s: string) => parseDate(s) as PlainDate;

describe("dates", () => {
  it("parses strictly and knows leap years", () => {
    expect(parseDate("2024-02-29")).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseDate("2023-02-29")).toBeNull();
    expect(parseDate("2023-13-01")).toBeNull();
    expect(parseDate("23-1-1")).toBeNull();
    expect([1900, 2000, 2023, 2024].map(isLeapYear)).toEqual([false, true, false, true]);
  });

  it("knows weekdays (1 Jan 2024 was a Monday, 1 Jan 1970 a Thursday)", () => {
    expect(weekday(d("2024-01-01"))).toBe(1);
    expect(weekday(d("1970-01-01"))).toBe(4);
    expect(weekday(d("2000-02-29"))).toBe(2);
  });

  it("adds months with day clamping", () => {
    expect(addMonths(d("2023-01-31"), 1)).toEqual(d("2023-02-28"));
    expect(addMonths(d("2024-01-31"), 1)).toEqual(d("2024-02-29"));
    expect(addMonths(d("2023-11-15"), 3)).toEqual(d("2024-02-15"));
  });

  it("calendar differences", () => {
    expect(calendarDiff(d("2023-01-31"), d("2023-03-01"))).toEqual({ years: 0, months: 1, days: 1 });
    expect(calendarDiff(d("2020-05-15"), d("2024-05-14"))).toEqual({ years: 3, months: 11, days: 29 });
    expect(calendarDiff(d("2024-03-10"), d("2024-03-10"))).toEqual({ years: 0, months: 0, days: 0 });
  });

  it("calculates ages, including 29 February birthdays", () => {
    const a = age(d("1990-06-15"), d("2026-11-13"));
    expect([a.years, a.months, a.days]).toEqual([36, 4, 29]);
    expect(age(d("2000-01-01"), d("2024-01-01")).totalDays).toBe(8766);
    const leap = age(d("2000-02-29"), d("2023-02-27"));
    expect([leap.years, leap.months, leap.days]).toEqual([22, 11, 29]);
    expect(leap.nextBirthday).toEqual(d("2023-02-28"));
    expect(leap.daysToNextBirthday).toBe(1);
    const onLeapDay = age(d("2000-02-29"), d("2024-02-29"));
    expect([onLeapDay.years, onLeapDay.months, onLeapDay.days]).toEqual([24, 0, 0]);
    expect(onLeapDay.nextBirthday).toEqual(d("2025-02-28"));
    expect(onLeapDay.nextAge).toBe(25);
  });

  it("date differences, swapping reversed dates and optionally counting the end day", () => {
    const r = dateDifference(d("2024-03-01"), d("2023-01-31"));
    expect(r).toMatchObject({ years: 1, months: 1, days: 1, totalDays: 395, swapped: true });
    expect(dateDifference(d("2024-01-01"), d("2024-12-31"), true)).toMatchObject({ years: 1, months: 0, days: 0, totalDays: 366, weeks: 52, remainderDays: 2 });
  });

  it("counts days, weekdays and weekend days", () => {
    expect(daysBetween(d("2024-01-01"), d("2024-01-07"), true)).toEqual({ totalDays: 7, weekdays: 5, weekendDays: 2, swapped: false });
    expect(daysBetween(d("2024-01-01"), d("2024-01-07"), false)).toEqual({ totalDays: 6, weekdays: 5, weekendDays: 1, swapped: false });
    expect(daysBetween(d("2024-01-01"), d("2024-12-31"), true)).toMatchObject({ totalDays: 366, weekdays: 262 });
    expect(daysBetween(d("2024-05-05"), d("2024-05-05"), false).totalDays).toBe(0);
  });
});

describe("percentages and averages", () => {
  it("percent of, what percent, whole from percent", () => {
    expect(percentOf(15, 200)).toBe(30);
    expect(whatPercent(30, 120)).toBe(25);
    expect(wholeFromPercent(30, 15)).toBe(200);
    expect(percentOf(-10, 50)).toBe(-5);
  });

  it("percentage change relative to the starting value's size", () => {
    expect(percentChange(50, 75)).toBe(50);
    expect(percentChange(80, 60)).toBe(-25);
    expect(percentChange(-50, -25)).toBe(50);
    expect(applyPercent(200, 15, "increase")).toBeCloseTo(230, 10);
    expect(applyPercent(200, 15, "decrease")).toBeCloseTo(170, 10);
  });

  it("parses number lists and rejects junk", () => {
    expect(parseNumberList("1, 2.5\n-3; 4e2 .5")).toEqual({ numbers: [1, 2.5, -3, 400, 0.5], invalid: [] });
    expect(parseNumberList("1, two, 3").invalid).toEqual(["two"]);
    expect(parseNumberList("0x10 Infinity").invalid).toEqual(["0x10", "Infinity"]);
  });

  it("mean, median, mode and range", () => {
    expect(stats([2, 4, 4, 4, 5, 5, 7, 9])).toEqual({ count: 8, sum: 40, mean: 5, median: 4.5, modes: [4], min: 2, max: 9, range: 7 });
    expect(stats([3, 1, 2]).median).toBe(2);
    expect(stats([1, 2, 3]).modes).toEqual([]);
    expect(stats([1, 1, 2, 2]).modes).toEqual([]);
    expect(stats([1, 1, 2, 2, 3]).modes).toEqual([1, 2]);
    expect(stats([7, 7]).modes).toEqual([7]);
  });
});

describe("ratios and fractions", () => {
  it("simplifies ratios, including decimals", () => {
    expect(simplifyRatio(16, 24)).toEqual({ a: 2, b: 3 });
    expect(simplifyRatio(1.5, 2.25)).toEqual({ a: 2, b: 3 });
    expect(simplifyRatio(0, 5)).toEqual({ a: 0, b: 1 });
    expect(simplifyRatio(1920, 1080)).toEqual({ a: 16, b: 9 });
    expect(solveProportion(2, 3, 10)).toBe(15);
  });

  it("does fraction arithmetic in lowest terms", () => {
    expect(fractionOp({ n: 1, d: 2 }, { n: 1, d: 3 }, "+")).toEqual({ n: 5, d: 6 });
    expect(fractionOp({ n: 1, d: 2 }, { n: 3, d: 4 }, "-")).toEqual({ n: -1, d: 4 });
    expect(fractionOp({ n: 2, d: 3 }, { n: 9, d: 4 }, "×")).toEqual({ n: 3, d: 2 });
    expect(fractionOp({ n: 3, d: 4 }, { n: 3, d: 8 }, "÷")).toEqual({ n: 2, d: 1 });
    expect(fractionOp({ n: 1, d: -2 }, { n: 0, d: 5 }, "+")).toEqual({ n: -1, d: 2 });
    expect(toMixed({ n: 7, d: 3 })).toEqual({ whole: 2, n: 1, d: 3 });
    expect(toMixed({ n: -7, d: 3 })).toEqual({ whole: -2, n: 1, d: 3 });
  });

  it("rejects zero denominators and division by zero", () => {
    expect(() => fractionOp({ n: 1, d: 0 }, { n: 1, d: 2 }, "+")).toThrow(FractionError);
    expect(() => fractionOp({ n: 1, d: 2 }, { n: 0, d: 3 }, "÷")).toThrow(/divide by zero/);
    expect(() => fractionOp({ n: 2 ** 40, d: 3 }, { n: 2 ** 40, d: 7 }, "×")).toThrow(/too large/);
  });
});

describe("money", () => {
  it("stacked discounts", () => {
    const r = discount(200, 20, 10);
    expect(r.finalPrice).toBeCloseTo(144, 10);
    expect(r.saved).toBeCloseTo(56, 10);
    expect(r.effectivePct).toBeCloseTo(28, 10);
    expect(discount(0, 50).effectivePct).toBe(0);
  });

  it("tips, split and rounded up", () => {
    const r = tip(87.5, 15, 3, false);
    expect(r.tip).toBeCloseTo(13.125, 10);
    expect(r.perPerson).toBeCloseTo(33.541667, 5);
    expect(tip(87.5, 15, 3, true)).toEqual({ tip: 14.5, total: 102, perPerson: 34 });
    expect(tip(100, 0, 4, true)).toEqual({ tip: 0, total: 100, perPerson: 25 });
  });

  it("margin vs markup", () => {
    const m = profitMargin(60, 100);
    expect(m.profit).toBe(40);
    expect(m.marginPct).toBeCloseTo(40, 10);
    expect(m.markupPct).toBeCloseTo(66.666667, 5);
    expect(profitMargin(10, 0).marginPct).toBeNull();
    expect(profitMargin(0, 10).markupPct).toBeNull();
    const p = priceFromMarkup(50, 30);
    expect(p.price).toBeCloseTo(65, 10);
    expect(p.marginPct).toBeCloseTo(23.076923, 5);
    expect(markupToMargin(50)).toBeCloseTo(33.333333, 5);
    expect(marginToMarkup(20)).toBeCloseTo(25, 10);
  });

  it("simple interest", () => {
    expect(simpleInterest(5000, 4, 3)).toEqual({ interest: 600, total: 5600 });
    expect(simpleInterest(1000, 6, 0.5).interest).toBeCloseTo(30, 10);
  });

  it("compound interest matches the standard formula values", () => {
    expect(compoundInterest(1000, 5, 10, 1).total).toBeCloseTo(1628.894627, 5);
    expect(compoundInterest(1000, 5, 10, 12).total).toBeCloseTo(1647.009498, 5);
    expect(compoundInterest(1000, 5, 10, 365).total).toBeCloseTo(1648.664814, 5);
    expect(compoundInterest(1000, 5, 10, "continuous").total).toBeCloseTo(1648.721271, 5);
    expect(compoundInterest(1000, 12, 1, 12).effectiveAnnualPct).toBeCloseTo(12.682503, 5);
    const r = compoundInterest(1000, 10, 2.5, 1);
    expect(r.byYear.map((y) => y.year)).toEqual([1, 2, 3]);
    expect(r.byYear[2].balance).toBeCloseTo(r.total, 10);
    expect(compoundInterest(500, 0, 5, 12).total).toBe(500);
  });

  it("loan EMI matches published amortisation figures", () => {
    const a = loanEmi(100_000, 10, 12);
    expect(a.emi).toBeCloseTo(8791.59, 2);
    expect(a.totalInterest).toBeCloseTo(5499.06, 1);
    expect(loanEmi(500_000, 12, 60).emi).toBeCloseTo(11122.22, 2);
    const s = loanEmi(500_000, 12, 60).schedule;
    expect(s).toHaveLength(5);
    expect(s[4].balance).toBe(0);
    expect(s.reduce((t, y) => t + y.principalPaid, 0)).toBeCloseTo(500_000, 4);
    const zero = loanEmi(12_000, 0, 12);
    expect(zero.emi).toBe(1000);
    expect(zero.totalInterest).toBe(0);
    expect(loanEmi(1000, 5, 18).schedule.map((y) => y.year)).toEqual([1, 2]);
  });
});

describe("education", () => {
  const pts = (g: string) => US_GRADE_POINTS.find((x) => x.grade === g)!.points;
  it("credit-weighted GPA", () => {
    const r = weightedAverage([
      { value: pts("A"), weight: 3 },
      { value: pts("B+"), weight: 4 },
      { value: pts("C"), weight: 3 },
    ]);
    expect(r.average).toBeCloseTo(3.12, 10);
    expect(r.totalWeight).toBe(10);
  });

  it("maps percentages to grades on both scales", () => {
    expect(percentToGrade(85, "us")).toMatchObject({ grade: "B", points: 3 });
    expect(percentToGrade(92.5, "us").grade).toBe("A-");
    expect(percentToGrade(100, "us").grade).toBe("A+");
    expect(percentToGrade(59.99, "us").grade).toBe("F");
    expect(percentToGrade(60, "us").grade).toBe("D-");
    expect(percentToGrade(65, "uk").grade).toMatch(/2:1/);
    expect(percentToGrade(70, "uk").grade).toMatch(/First/);
    expect(percentToGrade(39.5, "uk").grade).toBe("Fail");
  });

  it("totals exam marks", () => {
    expect(examTotals([{ obtained: 78, total: 100 }, { obtained: 45, total: 50 }])).toEqual({ obtained: 123, total: 150, percentage: 82 });
  });

  it("required final score", () => {
    expect(requiredFinalScore(82, 30, 85)).toBeCloseTo(92, 10);
    expect(requiredFinalScore(95, 20, 80)).toBeCloseTo(20, 10);
    expect(requiredFinalScore(60, 25, 90)).toBeCloseTo(180, 10);
    expect(requiredFinalScore(70, 100, 85)).toBeCloseTo(85, 10);
  });

  it("attendance: classes to spare or to attend", () => {
    expect(attendance(36, 40, 75)).toEqual({ percentage: 90, meetsTarget: true, canMiss: 8, needToAttend: 0 });
    expect(attendance(30, 40, 75)).toMatchObject({ percentage: 75, meetsTarget: true, canMiss: 0 });
    expect(attendance(20, 40, 75)).toMatchObject({ meetsTarget: false, needToAttend: 40 });
    expect(attendance(29, 40, 75)).toMatchObject({ needToAttend: 4 });
    expect(attendance(9, 10, 100)).toMatchObject({ meetsTarget: false, needToAttend: null });
  });
});

describe("units", () => {
  it("converts data sizes (decimal and binary)", () => {
    expect(convertData(1, "GiB", "MB")).toBeCloseTo(1073.741824, 9);
    expect(convertData(1, "GB", "MiB")).toBeCloseTo(953.674316, 5);
    expect(convertData(1, "B", "bit")).toBe(8);
    expect(convertData(100, "Mbit", "MB")).toBe(12.5);
  });

  it("transfer time and duration formatting", () => {
    expect(transferSeconds(8e9, 100e6)).toBe(80);
    expect(transferSeconds(8e9, 100e6, 20)).toBe(100);
    expect(formatDuration(3725)).toBe("1 h 2 min 5 s");
    expect(formatDuration(90061)).toBe("1 d 1 h 1 min 1 s");
    expect(formatDuration(0.2)).toBe("less than 1 second");
    expect(formatDuration(60)).toBe("1 min");
  });

  it("Unix timestamps both ways", () => {
    expect(timestampToDate(1_700_000_000, "s")?.toISOString()).toBe("2023-11-14T22:13:20.000Z");
    expect(timestampToDate(0, "s")?.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    expect(timestampToDate(-86400, "s")?.toISOString()).toBe("1969-12-31T00:00:00.000Z");
    expect(timestampToDate(1e20, "ms")).toBeNull();
    expect(detectTimestampUnit(1_700_000_000)).toBe("s");
    expect(detectTimestampUnit(1_700_000_000_000)).toBe("ms");
    expect(dateTimeToTimestamp("2023-11-14T22:13:20", "utc")).toBe(1_700_000_000_000);
    expect(dateTimeToTimestamp("2038-01-19T03:14:07", "utc")).toBe(2_147_483_647_000);
    expect(dateTimeToTimestamp("2023-02-30T00:00", "utc")).toBeNull();
  });

  it("appliance energy cost", () => {
    expect(energyCost(100, 5, 30, 0.15)).toEqual({ kwhPerDay: 0.5, costPerDay: 0.075, kwh: 15, cost: 2.25 });
    expect(energyCost(1500, 2, 1, 10, 2).kwh).toBe(6);
  });

  it("fuel needed across efficiency units", () => {
    expect(fuelLitres(100, 8, "l_per_100km")).toBe(8);
    expect(fuelLitres(100, 20, "km_per_l")).toBe(5);
    expect(fuelLitres(160.9344, 30, "mpg_us")).toBeCloseTo(12.618039, 5);
    expect(fuelLitres(160.9344, 40, "mpg_uk")).toBeCloseTo(11.365225, 5);
    expect(pricePerLitre(3.785411784, "per_us_gal")).toBeCloseTo(1, 10);
  });

  it("areas in square feet", () => {
    expect(areaSqFt("rectangle", 12, 10, "ft")).toBe(120);
    expect(areaSqFt("rectangle", 4, 5, "m") * SQ_M_PER_SQ_FT).toBeCloseTo(20, 10);
    expect(areaSqFt("circle", 1, 0, "m") * SQ_M_PER_SQ_FT).toBeCloseTo(Math.PI, 10);
    expect(areaSqFt("triangle", 10, 6, "ft")).toBe(30);
    expect(areaSqFt("rectangle", 36, 36, "in")).toBeCloseTo(9, 10);
  });
});

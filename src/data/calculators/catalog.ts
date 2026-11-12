// ---------------------------------------------------------------------
// Calculator Hub catalogue — the ONLY calculator data in the shared
// bundle: names, one-line descriptions and search keywords for cards,
// menus, search and sitemaps. Each calculator's formulas and page copy
// live in its group module (./everyday.ts, ./finance.ts, …) and load only
// on its own page (see ./load.ts). Order here = order on the hub page.
// ---------------------------------------------------------------------

import type { ToolListing } from "../../types/tool";

export type CalculatorGroup = "everyday" | "finance" | "education" | "technology" | "home";

export const CALCULATOR_GROUP_LABELS: Record<CalculatorGroup, string> = {
  everyday: "Everyday Math",
  finance: "Finance & Money",
  education: "Education & Students",
  technology: "Developer & Technology",
  home: "Home & Construction",
};

export interface CalculatorListing extends ToolListing {
  group: CalculatorGroup;
  path: string;
}

const ADDED = "2026-11-13";

type Entry = [id: string, group: CalculatorGroup, name: string, shortName: string, icon: string, description: string, keywords: string[]];

const ENTRIES: Entry[] = [
  ["percentage-calculator", "everyday", "Percentage Calculator", "Percentage", "%", "Work out X% of a number, what percent one number is of another, or the whole from a part.", ["percentage", "percent of", "what percent"]],
  ["percentage-change-calculator", "everyday", "Percentage Increase/Decrease Calculator", "Percentage Change", "±%", "Find the percentage increase or decrease between two values, or add or subtract a percentage.", ["percentage increase", "percentage decrease", "percent change"]],
  ["average-calculator", "everyday", "Average Calculator", "Average", "x̄", "Mean, median, mode, sum and range of a list of numbers.", ["average", "mean", "median", "mode"]],
  ["ratio-calculator", "everyday", "Ratio Calculator", "Ratio", "a:b", "Simplify a ratio to its lowest terms or solve a proportion such as 2 : 3 = 10 : x.", ["ratio", "simplify ratio", "proportion", "aspect ratio"]],
  ["fraction-calculator", "everyday", "Fraction Calculator", "Fraction", "½", "Add, subtract, multiply and divide fractions, with the answer simplified and as a mixed number.", ["fraction", "add fractions", "simplify fraction"]],
  ["age-calculator", "everyday", "Age Calculator", "Age", "🎂", "Exact age in years, months and days from a date of birth, plus days until the next birthday.", ["age", "date of birth", "how old am i"]],
  ["date-difference-calculator", "everyday", "Date Difference Calculator", "Date Difference", "📅", "Time between two dates in years, months and days, and in total weeks and days.", ["date difference", "time between dates", "duration"]],
  ["days-between-dates-calculator", "everyday", "Days Between Dates Calculator", "Days Between Dates", "#d", "Count the days between two dates, including weekdays and weekend days.", ["days between dates", "count days", "working days"]],
  ["discount-calculator", "finance", "Discount Calculator", "Discount", "−%", "Sale price and savings after a percentage discount, including an extra discount on top.", ["discount", "sale price", "percent off"]],
  ["tip-calculator", "finance", "Tip Calculator", "Tip", "Tip", "Tip amount, total bill and each person's share, with optional rounding up.", ["tip", "gratuity", "split bill"]],
  ["profit-margin-calculator", "finance", "Profit Margin Calculator", "Profit Margin", "PM", "Profit, profit margin and markup from your cost and selling price.", ["profit margin", "gross margin", "profit"]],
  ["markup-calculator", "finance", "Markup Calculator", "Markup", "MU", "Selling price from cost and markup, or the markup from cost and price — with the matching margin.", ["markup", "selling price", "markup percentage"]],
  ["simple-interest-calculator", "finance", "Simple Interest Calculator", "Simple Interest", "SI", "Interest and total amount on a principal at a flat annual rate over months or years.", ["simple interest", "interest", "flat rate"]],
  ["compound-interest-calculator", "finance", "Compound Interest Calculator", "Compound Interest", "CI", "Future value and interest earned with yearly, monthly, daily or continuous compounding.", ["compound interest", "future value", "savings growth"]],
  ["loan-emi-calculator", "finance", "Loan EMI Calculator", "Loan EMI", "EMI", "Monthly instalment, total interest and a yearly repayment schedule for a loan.", ["emi", "loan calculator", "monthly payment", "mortgage"]],
  ["gpa-calculator", "education", "GPA Calculator", "GPA", "GPA", "Credit-weighted grade point average from letter grades or grade points.", ["gpa", "grade point average"]],
  ["cgpa-calculator", "education", "CGPA Calculator", "CGPA", "CG", "Cumulative GPA across semesters, weighted by credit hours.", ["cgpa", "cumulative gpa", "semester gpa"]],
  ["percentage-to-grade-calculator", "education", "Percentage to Grade Calculator", "Percentage to Grade", "A+", "Convert a percentage to a US letter grade or a UK degree classification.", ["percentage to grade", "letter grade", "degree classification"]],
  ["exam-marks-calculator", "education", "Exam Marks Calculator", "Exam Marks", "✎", "Total marks and overall percentage across subjects or papers.", ["marks percentage", "exam percentage", "total marks"]],
  ["required-marks-calculator", "education", "Required Marks Calculator", "Required Marks", "🎯", "The score you need on a final exam to reach your target grade.", ["final grade", "what do i need on my final", "required marks"]],
  ["attendance-percentage-calculator", "education", "Attendance Percentage Calculator", "Attendance", "✓", "Attendance percentage, classes you can miss, or classes needed to reach a minimum.", ["attendance percentage", "75 percent attendance", "bunk"]],
  ["download-time-calculator", "technology", "Download Time Calculator", "Download Time", "↓", "How long a file takes to download at a given internet speed.", ["download time", "download speed", "mbps"]],
  ["upload-time-calculator", "technology", "Upload Time Calculator", "Upload Time", "↑", "How long a file or backup takes to upload at your upload speed.", ["upload time", "upload speed", "backup time"]],
  ["data-storage-converter", "technology", "Data Storage Converter", "Data Storage", "GB", "Convert between bits, bytes, KB, MB, GB, TB and binary units such as MiB and GiB.", ["mb to gb", "data converter", "gib", "bytes"]],
  ["unix-timestamp-converter", "technology", "Unix Timestamp Converter", "Unix Timestamp", "⏱", "Convert Unix epoch timestamps to dates and dates to timestamps, in seconds or milliseconds.", ["unix timestamp", "epoch converter", "epoch time"]],
  ["electricity-cost-calculator", "home", "Electricity Appliance Cost Calculator", "Electricity Cost", "kWh", "Energy use and running cost of an appliance per day, month and year.", ["electricity cost", "appliance cost", "kwh", "power consumption"]],
  ["fuel-cost-calculator", "home", "Fuel Cost Calculator", "Fuel Cost", "⛽", "Fuel needed and trip cost from distance, fuel economy and fuel price.", ["fuel cost", "petrol cost", "trip cost", "mpg"]],
  ["square-feet-calculator", "home", "Square Feet Calculator", "Square Feet", "ft²", "Area of a room, plot or surface in square feet, square metres and square yards.", ["square feet", "area", "sq ft"]],
  ["marla-to-square-feet-converter", "home", "Marla to Square Feet Converter", "Marla to Sq Ft", "M", "Convert marla to square feet and back, using the marla standard you choose.", ["marla", "marla to square feet", "plot size"]],
  ["kanal-to-marla-converter", "home", "Kanal to Marla Converter", "Kanal to Marla", "K", "Convert kanal to marla and square feet, and marla back to kanal.", ["kanal", "kanal to marla", "kanal to square feet"]],
];

export const CALCULATOR_CATALOG: CalculatorListing[] = ENTRIES.map(([id, group, name, shortName, icon, description, keywords]) => ({
  id,
  slug: id,
  path: `/calculators/${id}`,
  group,
  name,
  shortName,
  icon,
  description,
  keywords,
  hub: "calculators",
  categoryLabel: CALCULATOR_GROUP_LABELS[group],
  addedOn: ADDED,
  lastModified: ADDED,
}));

export function getCalculatorListing(slug: string): CalculatorListing | undefined {
  return CALCULATOR_CATALOG.find((c) => c.slug === slug);
}

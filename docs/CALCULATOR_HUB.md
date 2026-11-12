# Calculator Hub — Release 3

Implementation, accuracy, testing and deployment. Status key: ✅ done · ⏸ deferred.

## 1. Summary

| Part | Status |
|---|---|
| Hub `/calculators` ("Calculators for Literally Everything."), intro, how-it-works, accuracy notes, FAQ, `sitemap-calculators.xml` | ✅ |
| Reusable engine: field schemas, validation, result model, formatting (`src/lib/calculators/`) | ✅ |
| One generic calculator UI and page template (`components/calculators/CalculatorWidget.tsx`, `pages/CalculatorPage.tsx`) | ✅ |
| The 30 calculators from the brief, each with formula, working, example, FAQ, related calculators, breadcrumbs and structured data | ✅ |
| Disclaimers: finance (estimates, no advice), education (grading conventions vary), property (marla standards vary) | ✅ |
| Categories without calculators yet (Health & Fitness, Business & E-commerce, Travel, Social Media & Creator, Agriculture, Weird & Wonderful) | ⏸ not shown — no empty sections or placeholders |

No new dependency, no server code, no external data. Exchange rates and prices are never hard-coded; money results have no currency symbol.

## 2. Architecture (ADR-11)

```
src/lib/calculators/
  formulas/   dates.ts · math.ts · finance.ts · education.ts · units.ts   ← pure, unit-tested functions
  engine.ts   Field types, Reader (validation), CalcResult, DISCLAIMERS
  format.ts   fmt / money / pct (float-noise-safe rounding)
src/data/calculators/
  catalog.ts  30 listings (name, description, icon, keywords, path)       ← the only part in the shared bundle
  everyday.ts finance.ts education.ts technology.ts home.ts                ← spec + page copy, one lazy chunk per group
  load.ts     group → dynamic import;  all.ts  static import for prerender/tests
```

- Route: `/calculators/:slug` (lazy `CalculatorPage`). Unknown slugs render the not-found page; the static host serves its 404.
- A calculator is data: `fields`, `defaults`, `example`, `calculate(values)`. `Reader` validates each field (required, number format incl. thousands separators, min/max, exclusive minimum, integers, valid calendar dates) and collects all errors at once; hidden fields aren't validated.
- Results: headline, detail rows, optional table (EMI schedule, compound growth, unit tables), the working with the visitor's numbers, and notes.
- UX: Calculate → results then update live; Reset; "Try the example" loads the worked example from the page; Copy result copies the answer and working.
- Discovery: listings appear in the hub page, header and mobile menus, search, `/tools?hub=calculators`, the homepage (hub section and "Recently added") and the sitemap. Prerendered HTML includes the full copy of every calculator page.

### Bundle

| Chunk | Size (gzip) |
|---|---|
| Shared `index` | 457 KB raw / 141 KB — no growth from Release 4 (466 KB / 144 KB) |
| `CalculatorPage` (engine + UI) | 6.2 KB |
| `everyday` / `finance` / `education` / `technology` / `home` | 10.3 / 8.4 / 7.7 / 5.3 / 6.5 KB |

## 3. Calculators and conventions

| Group | Calculators | Notes |
|---|---|---|
| Everyday Math | Percentage (3 question types) · Percentage Increase/Decrease (change or apply) · Average (mean, median, mode, range) · Ratio (simplify, proportion) · Fraction (+ − × ÷, lowest terms, mixed) · Age · Date Difference · Days Between Dates | % change is relative to \|original\|; change from 0 is rejected. Dates use UTC calendar arithmetic; months are counted with day clamping (31 Jan → 1 Mar = 1 month 1 day); 29 Feb birthdays complete a year on 28 Feb in non-leap years. Weekdays = Mon–Fri, no public holidays. |
| Finance & Money | Discount (stacked) · Tip (split, round up) · Profit Margin · Markup (both directions) · Simple Interest · Compound Interest (yearly → continuous, year table) · Loan EMI (reducing balance, yearly schedule) | 0% rates handled (EMI = P ÷ n). Days use a 365-day year. No fees, taxes or guaranteed returns implied. |
| Education & Students | GPA (US 4.0 letters, or points on any scale) · CGPA (credit-weighted, or equal weights if no credits) · Percentage to Grade (US +/− scale, UK degree class) · Exam Marks (aggregate + per subject) · Required Marks · Attendance (can miss / need to attend) | A+ capped at 4.0. Scales are common conventions; institution rules take precedence. |
| Developer & Technology | Download Time · Upload Time · Data Storage Converter (SI + IEC units) · Unix Timestamp Converter | Bits/bytes and decimal/binary units handled exactly. Timestamps ≥ 10¹¹ auto-detected as ms. |
| Home & Construction | Electricity Appliance Cost · Fuel Cost (L/100 km, km/L, US/UK MPG; per L or gallon) · Square Feet (rectangle, circle, triangle; 5 length units) · Marla ↔ Square Feet · Kanal ↔ Marla | **Marla standard is always chosen by the user** (272.25 / 250 / 225 sq ft), stated in the result, and compared across all three in a table. 1 kanal = 20 marla. |

Conversion constants are exact definitions: 1 ft = 0.3048 m, 1 mi = 1.609344 km, 1 US gal = 3.785411784 L, 1 UK gal = 4.54609 L, 1 acre = 43,560 sq ft.

## 4. Accuracy report

Expected values in the tests were computed independently of the code — published amortisation figures, closed-form identities, a 40-digit `decimal` calculation, and known calendar facts — never copied from the code's output. Two of my own reference values were wrong at first and the tests caught them (daily compounding 1,648.664814, not 1,648.664782; EMI total interest 167,333.43 computed from the unrounded EMI); both were confirmed with 40-digit arithmetic and corrected.

| Check | Reference |
|---|---|
| EMI 100,000 @ 10% × 12 months = 8,791.59; 500,000 @ 12% × 60 = 11,122.22 | standard EMI tables |
| Compound 1,000 @ 5% × 10 y: yearly 1,628.89, monthly 1,647.01, daily 1,648.66, continuous 1,648.72; 12% monthly EAR = 12.6825% | closed form, 40-digit check |
| Simple interest 5,000 @ 4% × 3 y = 600 | I = PRT/100 |
| 1 Jan 2024 = Monday; 2024 has 262 weekdays; 2000-01-01 → 2024-01-01 = 8,766 days | calendar |
| 1700000000 s = 2023-11-14 22:13:20 UTC; 2³¹−1 s = 2038-01-19 03:14:07 UTC | epoch definition |
| 1 GiB = 1,073.741824 MB; 1 GB = 953.674316 MiB | SI/IEC definitions |
| 100 mi @ 30 US MPG = 12.618 L | gallon definition |
| GPA (A×3, B+×4, C×3) = 3.12; attendance 36/40 @ 75% → can miss 8 (36/48 = 75%) | hand calculation |
| Float display: 87.5 × 1.15 shows 100.63 (not 100.62) | 15-significant-digit normalisation before rounding |

Edge cases covered: zero, negatives where meaningful (percentages, fractions, averages), invalid text, out-of-range values, non-integers where counts are required, division by zero (reported as a field error, never Infinity), leap years and month ends, reversed date ranges, very large values (scientific notation above 10¹⁵), unreachable targets (required marks > 100%, attendance target 100% after an absence).

## 5. Testing

| Suite | Result |
|---|---|
| Formula unit tests (`src/lib/calculators/formulas/__tests__`) | 31 ✅ |
| Calculator tests (`src/data/calculators/__tests__`) — catalogue ↔ definitions, content completeness/uniqueness/lengths, disclaimers, every example = the page copy (30), supporting figures, validation and edge cases | 44 ✅ |
| Whole suite | 462 / 462 ✅ (27 files) |
| `tsc -b`, `oxlint` | ✅ (no new warnings) |
| Build + prerender, `seo:validate` | ✅ 134 pages, 8 child sitemaps, 132 URLs, no problems |
| Browser (Playwright, desktop + 375 px): hub; all 30 calculators — empty input rejected, example → documented answer, all sections, reset, no overflow, no console errors; copy, live update, field errors, GPA rows, disclaimers, JSON-LD, canonical, search, directory filter, not-found | 35 / 35 ✅ (60 calculator page loads) |
| Full-site regression (every sitemap URL, desktop + mobile) | see §6 |

## 6. Deployment

| Item | Result |
|---|---|
| Commits | `a6ee2d6` (Release 3), merged to `main` as `0a9a15a` |
| Vercel | project `project-587l0`, Production deployment `project-587l0-6g09ifx32` — Ready; Hobby plan unchanged |
| Live URLs | `/calculators` + all 30 calculator pages → 200; `/`, `/link-studio`, `/pixel-playground`, `/tools`, `ads.txt`, `sitemap.xml` → 200 |
| `seo:validate --live` | 134 pages, 8 child sitemaps, 132 URLs, every URL live, no problems |
| Browser suite on production | 35 / 35 (all 30 calculators, desktop + 375 px) |
| Link Studio after release | unchanged (`auth/session` still fails closed until sign-in is configured) |

Rollback: Vercel → Deployments → promote the previous production deployment. Release 3 adds routes and data only; nothing server-side changed.
